import { Resolver, Query, Args } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chain } from '../../shared/entities/chain.entity';

@Resolver(() => Chain)
export class ChainResolver {
    constructor(
        @InjectRepository(Chain)
        private chainRepository: Repository<Chain>,
    ) { }

    @Query(() => [Chain])
    async chains() {
        return this.chainRepository.find({ where: { is_active: true } });
    }

    @Query(() => Chain, { nullable: true })
    async chain(@Args('chainId') chainId: string) {
        return this.chainRepository.findOne({ where: { chain_id: chainId } });
    }
}
