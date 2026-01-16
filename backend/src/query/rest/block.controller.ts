import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Block } from '../../shared/entities/block.entity';

@ApiTags('blocks')
@Controller('api/blocks')
export class BlockController {
    constructor(
        @InjectRepository(Block)
        private blockRepository: Repository<Block>,
    ) { }

    @Get()
    @ApiOperation({ summary: 'Get blocks with filters' })
    @ApiQuery({ name: 'chainId', required: false })
    @ApiQuery({ name: 'blockNumber', required: false })
    @ApiQuery({ name: 'blockHash', required: false })
    @ApiQuery({ name: 'search', required: false, description: 'Search by hash or number' })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'offset', required: false, type: Number })
    async getBlocks(
        @Query('chainId') chainId?: string,
        @Query('blockNumber') blockNumber?: string,
        @Query('blockHash') blockHash?: string,
        @Query('search') search?: string,
        @Query('limit') limit: number = 50,
        @Query('offset') offset: number = 0,
    ) {
        let where: any = { is_canonical: true };

        if (chainId) where.chain_id = chainId;

        if (search) {
            const s = search.toLowerCase();
            where = [
                { ...where, block_hash: s },
            ];
            if (!isNaN(Number(search))) {
                where.push({ ...where[0], block_number: search });
            }
        } else {
            if (blockNumber) where.block_number = blockNumber;
            if (blockHash) where.block_hash = blockHash.toLowerCase();
        }

        const safeLimit = isNaN(Number(limit)) ? 50 : Math.min(Number(limit), 100);
        const safeOffset = isNaN(Number(offset)) ? 0 : Number(offset);

        const [blocks, total] = await this.blockRepository.findAndCount({
            where,
            relations: ['chain'],
            take: safeLimit,
            skip: safeOffset,
            order: { block_number: 'DESC' },
        });

        return {
            data: blocks,
            pagination: {
                total,
                limit,
                offset,
                hasMore: offset + blocks.length < total,
            },
        };
    }

    @Get(':chainId/:blockNumber')
    @ApiOperation({ summary: 'Get block by chain and number' })
    async getBlock(
        @Param('chainId') chainId: string,
        @Param('blockNumber') blockNumber: string,
    ) {
        return this.blockRepository.findOne({
            where: { chain_id: chainId, block_number: blockNumber, is_canonical: true },
            relations: ['chain'],
        });
    }
}
