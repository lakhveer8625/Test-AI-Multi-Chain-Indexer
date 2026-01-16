import { Module } from '@nestjs/common';
import { IndexerService } from './indexer.service';
import { EventNormalizerService } from './event-normalizer.service';
import { EventEnricherService } from './event-enricher.service';
import { SharedModule } from '../shared/shared.module';

@Module({
    imports: [SharedModule],
    providers: [IndexerService, EventNormalizerService, EventEnricherService],
    exports: [IndexerService],
})
export class IndexerModule { }
