import { Resolver, Query, Args, Int, ObjectType, Field } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IndexedEvent } from '../../shared/entities/indexed-event.entity';

@ObjectType()
class EventResponse {
    @Field(() => [IndexedEvent])
    events: IndexedEvent[];

    @Field(() => Int)
    total: number;

    @Field(() => Int)
    limit: number;

    @Field(() => Int)
    offset: number;
}

@Resolver(() => IndexedEvent)
export class EventResolver {
    constructor(
        @InjectRepository(IndexedEvent)
        private eventRepository: Repository<IndexedEvent>,
    ) { }

    @Query(() => EventResponse)
    async events(
        @Args('chainId', { nullable: true }) chainId?: string,
        @Args('eventType', { nullable: true }) eventType?: string,
        @Args('contractAddress', { nullable: true }) contractAddress?: string,
        @Args('fromAddress', { nullable: true }) fromAddress?: string,
        @Args('toAddress', { nullable: true }) toAddress?: string,
        @Args('limit', { type: () => Int, defaultValue: 50 }) limit?: number,
        @Args('offset', { type: () => Int, defaultValue: 0 }) offset?: number,
    ) {
        const where: any = { is_canonical: true };

        if (chainId) where.chain_id = chainId;
        if (eventType) where.event_type = eventType;
        if (contractAddress) where.contract_address = contractAddress.toLowerCase();
        if (fromAddress) where.from_address = fromAddress.toLowerCase();
        if (toAddress) where.to_address = toAddress.toLowerCase();

        const [events, total] = await this.eventRepository.findAndCount({
            where,
            take: Math.min(limit ?? 50, 100),
            skip: offset,
            order: { timestamp: 'DESC' },
        });

        return {
            events,
            total,
            limit: limit ?? 50,
            offset,
        };
    }

    @Query(() => IndexedEvent, { nullable: true })
    async event(@Args('id') id: string) {
        return this.eventRepository.findOne({ where: { id } });
    }
}
