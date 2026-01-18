import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MessagingService } from './messaging.service';
import * as amqp from 'amqp-connection-manager';

jest.mock('amqp-connection-manager');

describe('MessagingService', () => {
    let service: MessagingService;
    let configService: ConfigService;
    let mockConnection: any;
    let mockChannelWrapper: any;

    beforeEach(async () => {
        mockChannelWrapper = {
            publish: jest.fn().mockResolvedValue(true),
            waitForConnect: jest.fn().mockResolvedValue(true),
        };

        mockConnection = {
            on: jest.fn(),
            createChannel: jest.fn().mockReturnValue(mockChannelWrapper),
            close: jest.fn().mockResolvedValue(true),
        };

        (amqp.connect as jest.Mock).mockReturnValue(mockConnection);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MessagingService,
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn((key: string, defaultValue?: any) => {
                            if (key === 'RABBITMQ_URL') return 'amqp://localhost:5672';
                            if (key === 'RABBITMQ_EXCHANGE') return 'test-exchange';
                            if (key === 'RABBITMQ_QUEUE') return 'test-queue';
                            return defaultValue;
                        }),
                    },
                },
            ],
        }).compile();

        service = module.get<MessagingService>(MessagingService);
        configService = module.get<ConfigService>(ConfigService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('onModuleInit', () => {
        it('should initialize connection and channel', async () => {
            await service.onModuleInit();
            expect(amqp.connect).toHaveBeenCalledWith(['amqp://localhost:5672']);
            expect(mockConnection.createChannel).toHaveBeenCalled();
            expect(mockChannelWrapper.waitForConnect).toHaveBeenCalled();
        });

        it('should warn if RABBITMQ_URL is missing', async () => {
            jest.spyOn(configService, 'get').mockReturnValue(null);
            const loggerSpy = jest.spyOn(service['logger'], 'warn');

            await service.onModuleInit();

            expect(loggerSpy).toHaveBeenCalledWith(expect.stringContaining('RABBITMQ_URL not defined'));
        });
    });

    describe('publish', () => {
        it('should publish a message', async () => {
            await service.onModuleInit();
            const message = { data: 'test' };
            await service.publish('test-exchange', 'test-key', message);

            expect(mockChannelWrapper.publish).toHaveBeenCalledWith(
                'test-exchange',
                'test-key',
                Buffer.from(JSON.stringify(message)),
                expect.any(Object)
            );
        });

        it('should log warning if channel is not initialized', async () => {
            const loggerSpy = jest.spyOn(service['logger'], 'warn');
            await service.publish('ex', 'key', {});
            expect(loggerSpy).toHaveBeenCalledWith(expect.stringContaining('RabbitMQ channel not initialized'));
        });
    });

    describe('onModuleDestroy', () => {
        it('should close connection', async () => {
            await service.onModuleInit();
            await service.onModuleDestroy();
            expect(mockConnection.close).toHaveBeenCalled();
        });
    });
});
