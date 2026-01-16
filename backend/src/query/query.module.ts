import { Module } from '@nestjs/common';
import { EventResolver } from './graphql/event.resolver';
import { BlockResolver } from './graphql/block.resolver';
import { ChainResolver } from './graphql/chain.resolver';
import { TransactionResolver } from './graphql/transaction.resolver';
import { EventController } from './rest/event.controller';
import { BlockController } from './rest/block.controller';
import { ChainController } from './rest/chain.controller';
import { TransactionController } from './rest/transaction.controller';
import { SharedModule } from '../shared/shared.module';

@Module({
    imports: [SharedModule],
    providers: [EventResolver, BlockResolver, ChainResolver, TransactionResolver],
    controllers: [EventController, BlockController, ChainController, TransactionController],
})
export class QueryModule { }
