import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IndexedEvent } from '../../shared/entities/indexed-event.entity';

@ApiTags('events')
@Controller('api/events')
export class EventController {
    constructor(
        @InjectRepository(IndexedEvent)
        private eventRepository: Repository<IndexedEvent>,
    ) { }

    @Get()
    @ApiOperation({ summary: 'Get events with filters' })
    @ApiQuery({ name: 'chainId', required: false })
    @ApiQuery({ name: 'eventType', required: false })
    @ApiQuery({ name: 'contractAddress', required: false })
    @ApiQuery({ name: 'fromAddress', required: false })
    @ApiQuery({ name: 'toAddress', required: false })
    @ApiQuery({ name: 'blockNumber', required: false })
    @ApiQuery({ name: 'txHash', required: false })
    @ApiQuery({ name: 'search', required: false, description: 'Search by hash, address or block' })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'offset', required: false, type: Number })
    async getEvents(
        @Query('chainId') chainId?: string,
        @Query('eventType') eventType?: string,
        @Query('contractAddress') contractAddress?: string,
        @Query('fromAddress') fromAddress?: string,
        @Query('toAddress') toAddress?: string,
        @Query('blockNumber') blockNumber?: string,
        @Query('txHash') txHash?: string,
        @Query('search') search?: string,
        @Query('limit') limit: number = 50,
        @Query('offset') offset: number = 0,
    ) {
        let where: any = { is_canonical: true };

        if (chainId) where.chain_id = chainId;

        if (search) {
            const s = search.toLowerCase();
            where = [
                { ...where, tx_hash: s },
                { ...where, contract_address: s },
                { ...where, from_address: s },
                { ...where, to_address: s },
            ];
            if (!isNaN(Number(search))) {
                where.push({ ...where[0], block_number: search });
            }
        } else {
            if (eventType) where.event_type = eventType;
            if (contractAddress) where.contract_address = contractAddress.toLowerCase();
            if (fromAddress) where.from_address = fromAddress.toLowerCase();
            if (toAddress) where.to_address = toAddress.toLowerCase();
            if (blockNumber) where.block_number = blockNumber;
            if (txHash) where.tx_hash = txHash.toLowerCase();
        }

        const safeLimit = isNaN(Number(limit)) ? 50 : Math.min(Number(limit), 100);
        const safeOffset = isNaN(Number(offset)) ? 0 : Number(offset);

        const [events, total] = await this.eventRepository.findAndCount({
            where,
            relations: ['chain'],
            take: safeLimit,
            skip: safeOffset,
            order: { timestamp: 'DESC' },
        });

        return {
            data: events,
            pagination: {
                total,
                limit,
                offset,
                hasMore: offset + events.length < total,
            },
        };
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get event by ID' })
    async getEvent(@Param('id') id: string) {
        return this.eventRepository.findOne({
            where: { id },
            relations: ['chain']
        });
    }
}
