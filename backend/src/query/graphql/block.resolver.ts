import { Resolver, Query, Args, Int, ObjectType, Field } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Block } from '../../shared/entities/block.entity';

@ObjectType()
class BlockResponse {
    @Field(() => [Block])
    blocks: Block[];

    @Field(() => Int)
    total: number;

    @Field(() => Int)
    limit: number;

    @Field(() => Int)
    offset: number;
}

@Resolver(() => Block)
export class BlockResolver {
    constructor(
        @InjectRepository(Block)
        private blockRepository: Repository<Block>,
    ) { }

    @Query(() => BlockResponse)
    async blocks(
        @Args('chainId', { nullable: true }) chainId?: string,
        @Args('limit', { type: () => Int, defaultValue: 50 }) limit?: number,
        @Args('offset', { type: () => Int, defaultValue: 0 }) offset?: number,
    ) {
        const where: any = { is_canonical: true };

        if (chainId) where.chain_id = chainId;

        const [blocks, total] = await this.blockRepository.findAndCount({
            where,
            take: Math.min(limit ?? 50, 100),
            skip: offset,
            order: { block_number: 'DESC' },
        });

        return {
            blocks,
            total,
            limit: limit ?? 50,
            offset,
        };
    }

    @Query(() => Block, { nullable: true })
    async block(
        @Args('chainId') chainId: string,
        @Args('blockNumber') blockNumber: string,
    ) {
        return this.blockRepository.findOne({
            where: { chain_id: chainId, block_number: blockNumber, is_canonical: true },
        });
    }
}
