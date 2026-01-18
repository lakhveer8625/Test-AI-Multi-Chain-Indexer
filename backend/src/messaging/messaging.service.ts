import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqp-connection-manager';
import { AmqpConnectionManager } from 'amqp-connection-manager';

@Injectable()
export class MessagingService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(MessagingService.name);
    private connection: AmqpConnectionManager;
    private channelWrapper: any;

    constructor(private configService: ConfigService) { }

    async onModuleInit() {
        const url = this.configService.get<string>('RABBITMQ_URL');
        if (!url) {
            this.logger.warn('RABBITMQ_URL not defined. Messaging service disabled.');
            return;
        }

        try {
            this.connection = amqp.connect([url]);
            this.connection.on('connect', () => this.logger.log('Successfully connected to RabbitMQ'));
            this.connection.on('disconnect', (err) => this.logger.error('RabbitMQ connection disconnected', err.err.stack));

            this.channelWrapper = this.connection.createChannel({
                setup: (channel) => {
                    const exchange = this.configService.get<string>('RABBITMQ_EXCHANGE', 'indexer-exchange');
                    const queue = this.configService.get<string>('RABBITMQ_QUEUE', 'indexer-queue');

                    return Promise.all([
                        channel.assertExchange(exchange, 'direct', { durable: true }),
                        channel.assertQueue(queue, { durable: true }),
                        channel.bindQueue(queue, exchange, ''),
                    ]);
                },
            });

            await this.channelWrapper.waitForConnect();
        } catch (error) {
            this.logger.error('Failed to initialize RabbitMQ connection', error.stack);
        }
    }

    async publish(exchange: string, routingKey: string, message: any) {
        if (!this.channelWrapper) {
            this.logger.warn('Cannot publish message: RabbitMQ channel not initialized');
            return;
        }

        try {
            await this.channelWrapper.publish(exchange, routingKey, Buffer.from(JSON.stringify(message)), {
                persistent: true,
            });
            this.logger.debug(`Message published to exchange ${exchange} with key ${routingKey}`);
        } catch (error) {
            this.logger.error(`Failed to publish message: ${error.message}`);
            throw error;
        }
    }

    async onModuleDestroy() {
        if (this.connection) {
            await this.connection.close();
        }
    }
}
