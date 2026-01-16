import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chain } from './entities/chain.entity';
import { Block } from './entities/block.entity';
import { Contract } from './entities/contract.entity';
import { RawEvent } from './entities/raw-event.entity';
import { IndexedEvent } from './entities/indexed-event.entity';
import { TokenTransfer } from './entities/token-transfer.entity';
import { Transaction } from './entities/transaction.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Chain,
            Block,
            Contract,
            RawEvent,
            IndexedEvent,
            TokenTransfer,
            Transaction,
        ]),
    ],
    exports: [TypeOrmModule],
})
export class SharedModule { }
