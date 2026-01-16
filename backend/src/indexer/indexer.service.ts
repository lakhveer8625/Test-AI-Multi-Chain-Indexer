import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RawEvent } from '../shared/entities/raw-event.entity';
import { IndexedEvent } from '../shared/entities/indexed-event.entity';
import { EventNormalizerService } from './event-normalizer.service';
import { EventEnricherService } from './event-enricher.service';

@Injectable()
export class IndexerService {
    private readonly logger = new Logger(IndexerService.name);
    private isProcessing = false;

    constructor(
        private normalizerService: EventNormalizerService,
        private enricherService: EventEnricherService,
        @InjectRepository(RawEvent)
        private rawEventRepository: Repository<RawEvent>,
        @InjectRepository(IndexedEvent)
        private indexedEventRepository: Repository<IndexedEvent>,
    ) { }

    @Cron(CronExpression.EVERY_5_SECONDS)
    async processEvents() {
        if (this.isProcessing) {
            return;
        }

        this.isProcessing = true;

        try {
            // Fetch unprocessed events
            const batchSize = 500;
            const rawEvents = await this.rawEventRepository.find({
                where: { is_processed: false, is_canonical: true },
                take: batchSize,
                order: { block_number: 'ASC', log_index: 'ASC' },
            });

            if (rawEvents.length === 0) {
                return;
            }

            this.logger.log(`Processing ${rawEvents.length} raw events`);
            let processedCount = 0;

            for (const rawEvent of rawEvents) {
                try {
                    // Normalize event
                    const normalized = await this.normalizerService.normalize(rawEvent);

                    if (normalized) {
                        // Enrich event
                        const enriched = await this.enricherService.enrich(normalized);

                        // Save indexed event
                        await this.indexedEventRepository.save(enriched);
                    }

                    // Mark as processed regardless of whether it was normalized (to avoid retry loops on invalid data)
                    await this.rawEventRepository.update(
                        { id: rawEvent.id },
                        { is_processed: true }
                    );
                    processedCount++;
                } catch (error) {
                    this.logger.error(`Failed to process event ${rawEvent.id}: ${error.message}`);
                }
            }

            this.logger.log(`Successfully indexed ${processedCount} events`);
        } finally {
            this.isProcessing = false;
        }
    }
}
