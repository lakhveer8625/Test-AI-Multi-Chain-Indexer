import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ChainAdapterService } from './chain-adapter.service';
import { SharedModule } from '../shared/shared.module';

@Module({
    imports: [ConfigModule, SharedModule],
    providers: [ChainAdapterService],
    exports: [ChainAdapterService],
})
export class ChainAdaptersModule { }
