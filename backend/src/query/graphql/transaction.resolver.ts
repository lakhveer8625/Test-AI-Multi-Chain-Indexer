import { Resolver, Query, Args, Int, ObjectType, Field } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../../shared/entities/transaction.entity';

@ObjectType()
class TransactionResponse {
    @Field(() => [Transaction])
    transactions: Transaction[];

    @Field(() => Int)
    total: number;

    @Field(() => Int)
    limit: number;

    @Field(() => Int)
    offset: number;
}

@Resolver(() => Transaction)
export class TransactionResolver {
    constructor(
        @InjectRepository(Transaction)
        private transactionRepository: Repository<Transaction>,
    ) { }

    @Query(() => TransactionResponse)
    async transactions(
        @Args('chainId', { nullable: true }) chainId?: string,
        @Args('fromAddress', { nullable: true }) fromAddress?: string,
        @Args('toAddress', { nullable: true }) toAddress?: string,
        @Args('limit', { type: () => Int, defaultValue: 50 }) limit?: number,
        @Args('offset', { type: () => Int, defaultValue: 0 }) offset?: number,
    ) {
        const where: any = { is_canonical: true };

        if (chainId) where.chain_id = chainId;
        if (fromAddress) where.from_address = fromAddress.toLowerCase();
        if (toAddress) where.to_address = toAddress.toLowerCase();

        const [transactions, total] = await this.transactionRepository.findAndCount({
            where,
            take: Math.min(limit ?? 50, 100),
            skip: offset,
            order: { timestamp: 'DESC' },
        });

        return {
            transactions,
            total,
            limit: limit ?? 50,
            offset,
        };
    }

    @Query(() => Transaction, { nullable: true })
    async transaction(@Args('id') id: string) {
        return this.transactionRepository.findOne({ where: { id } });
    }
}
