import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { IndexerService } from './indexer.service';
import { RawEvent } from '../shared/entities/raw-event.entity';
import { IndexedEvent } from '../shared/entities/indexed-event.entity';
import { EventNormalizerService } from './event-normalizer.service';
import { EventEnricherService } from './event-enricher.service';
import { MessagingService } from '../messaging/messaging.service';
import { Repository } from 'typeorm';

describe('IndexerService', () => {
    let service: IndexerService;
    let rawEventRepository: Repository<RawEvent>;
    let indexedEventRepository: Repository<IndexedEvent>;
    let normalizerService: EventNormalizerService;
    let enricherService: EventEnricherService;
    let messagingService: MessagingService;

    const mockRawEvent = {
        id: '1',
        chain_id: '1',
        block_number: '100',
        tx_hash: '0x123',
        is_processed: false,
        is_canonical: true,
    } as RawEvent;

    const mockNormalizedEvent = {
        event_type: 'Transfer',
        chain_id: '1',
    };

    const mockSavedEvent = {
        id: 'uuid-1',
        ...mockNormalizedEvent,
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                IndexerService,
                {
                    provide: getRepositoryToken(RawEvent),
                    useValue: {
                        find: jest.fn(),
                        update: jest.fn(),
                    },
                },
                {
                    provide: getRepositoryToken(IndexedEvent),
                    useValue: {
                        save: jest.fn().mockResolvedValue(mockSavedEvent),
                    },
                },
                {
                    provide: EventNormalizerService,
                    useValue: {
                        normalize: jest.fn().mockResolvedValue(mockNormalizedEvent),
                    },
                },
                {
                    provide: EventEnricherService,
                    useValue: {
                        enrich: jest.fn().mockResolvedValue(mockNormalizedEvent),
                    },
                },
                {
                    provide: MessagingService,
                    useValue: {
                        publish: jest.fn().mockResolvedValue(true),
                    },
                },
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn().mockReturnValue('test-exchange'),
                    },
                },
            ],
        }).compile();

        service = module.get<IndexerService>(IndexerService);
        rawEventRepository = module.get<Repository<RawEvent>>(getRepositoryToken(RawEvent));
        indexedEventRepository = module.get<Repository<IndexedEvent>>(getRepositoryToken(IndexedEvent));
        normalizerService = module.get<EventNormalizerService>(EventNormalizerService);
        enricherService = module.get<EventEnricherService>(EventEnricherService);
        messagingService = module.get<MessagingService>(MessagingService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('processEvents', () => {
        it('should process raw events and publish them', async () => {
            jest.spyOn(rawEventRepository, 'find').mockResolvedValue([mockRawEvent]);

            await service.processEvents();

            expect(rawEventRepository.find).toHaveBeenCalled();
            expect(normalizerService.normalize).toHaveBeenCalledWith(mockRawEvent);
            expect(enricherService.enrich).toHaveBeenCalled();
            expect(indexedEventRepository.save).toHaveBeenCalled();
            expect(messagingService.publish).toHaveBeenCalledWith(
                'test-exchange',
                'event.transfer',
                mockSavedEvent
            );
            expect(rawEventRepository.update).toHaveBeenCalledWith(
                { id: '1' },
                { is_processed: true }
            );
        });

        it('should handle normalization returning null', async () => {
            jest.spyOn(rawEventRepository, 'find').mockResolvedValue([mockRawEvent]);
            jest.spyOn(normalizerService, 'normalize').mockResolvedValue(null);

            await service.processEvents();

            expect(indexedEventRepository.save).not.toHaveBeenCalled();
            expect(messagingService.publish).not.toHaveBeenCalled();
            expect(rawEventRepository.update).toHaveBeenCalledWith(
                { id: '1' },
                { is_processed: true }
            );
        });

        it('should handle errors per event', async () => {
            jest.spyOn(rawEventRepository, 'find').mockResolvedValue([mockRawEvent]);
            jest.spyOn(normalizerService, 'normalize').mockRejectedValue(new Error('Test error'));
            const loggerSpy = jest.spyOn(service['logger'], 'error');

            await service.processEvents();

            expect(loggerSpy).toHaveBeenCalledWith(expect.stringContaining('Failed to process event 1'), expect.any(String));
            expect(service['isProcessing']).toBe(false);
        });
    });
});
