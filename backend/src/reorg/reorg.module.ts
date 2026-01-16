import { Module } from '@nestjs/common';
import { ReorgService } from './reorg.service';
import { SharedModule } from '../shared/shared.module';
import { ChainAdaptersModule } from '../chain-adapters/chain-adapters.module';

@Module({
    imports: [SharedModule, ChainAdaptersModule],
    providers: [ReorgService],
    exports: [ReorgService],
})
export class ReorgModule { }
