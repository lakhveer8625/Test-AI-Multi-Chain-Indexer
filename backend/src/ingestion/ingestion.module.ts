import { Module } from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { BlockTrackerService } from './block-tracker.service';
import { DeduplicatorService } from './deduplicator.service';
import { SharedModule } from '../shared/shared.module';
import { ChainAdaptersModule } from '../chain-adapters/chain-adapters.module';

@Module({
    imports: [SharedModule, ChainAdaptersModule],
    providers: [IngestionService, BlockTrackerService, DeduplicatorService],
    exports: [IngestionService, BlockTrackerService],
})
export class IngestionModule { }
