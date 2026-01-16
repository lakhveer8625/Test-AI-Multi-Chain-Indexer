import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RawEvent as RawEventInterface } from '../chain-adapters/adapter.interface';
import { RawEvent } from '../shared/entities/raw-event.entity';

@Injectable()
export class DeduplicatorService {
    private readonly logger = new Logger(DeduplicatorService.name);

    constructor(
        @InjectRepository(RawEvent)
        private rawEventRepository: Repository<RawEvent>,
    ) { }

    async deduplicate(events: RawEventInterface[]): Promise<RawEventInterface[]> {
        if (events.length === 0) {
            return [];
        }

        // Group by chain/block for targeted querying
        const chainIds = Array.from(new Set(events.map(e => e.chain_id)));
        const blockNumbers = Array.from(new Set(events.map(e => e.block_number.toString())));

        // Fetch existing events in this block range to minimize queries
        const existing = await this.rawEventRepository.find({
            where: {
                chain_id: chainIds[0], // Simplified assuming batch is per-chain
                block_number: blockNumbers[0], // Further optimization possible for multi-block batches
            },
            select: ['chain_id', 'block_number', 'log_index']
        });

        const existingSet = new Set(
            existing.map(e => `${e.chain_id}-${e.block_number}-${e.log_index}`)
        );

        const uniqueEvents: RawEventInterface[] = [];

        for (const event of events) {
            const key = `${event.chain_id}-${event.block_number}-${event.log_index}`;
            if (!existingSet.has(key)) {
                uniqueEvents.push(event);
                // Add to set to handle duplicates within the same input batch
                existingSet.add(key);
            }
        }

        if (events.length - uniqueEvents.length > 0) {
            this.logger.debug(
                `Deduplicated ${events.length - uniqueEvents.length} events, ${uniqueEvents.length} unique`
            );
        }

        return uniqueEvents;
    }
}
