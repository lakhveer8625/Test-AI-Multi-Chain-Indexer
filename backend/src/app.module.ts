import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ScheduleModule } from '@nestjs/schedule';
import { join } from 'path';

// Import modules
import { ChainAdaptersModule } from './chain-adapters/chain-adapters.module';
import { IngestionModule } from './ingestion/ingestion.module';
import { IndexerModule } from './indexer/indexer.module';
import { ReorgModule } from './reorg/reorg.module';
import { QueryModule } from './query/query.module';
import { AuthModule } from './auth/auth.module';
import { RateLimitModule } from './rate-limit/rate-limit.module';
import { SharedModule } from './shared/shared.module';

@Module({
    imports: [
        // Configuration
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),

        // Database
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                type: 'mysql',
                host: configService.get('DB_HOST'),
                port: configService.get('DB_PORT'),
                username: configService.get('DB_USERNAME'),
                password: configService.get('DB_PASSWORD'),
                database: configService.get('DB_DATABASE'),
                entities: [__dirname + '/**/*.entity{.ts,.js}'],
                synchronize: process.env.NODE_ENV === 'development', // Disable in production
                logging: process.env.NODE_ENV === 'development',
                timezone: 'Z',
                charset: 'utf8mb4',
            }),
            inject: [ConfigService],
        }),

        // GraphQL
        GraphQLModule.forRoot<ApolloDriverConfig>({
            driver: ApolloDriver,
            autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
            sortSchema: true,
            playground: true,
            context: ({ req }) => ({ req }),
        }),

        // Scheduling for workers
        ScheduleModule.forRoot(),

        // Application modules
        SharedModule,
        ChainAdaptersModule,
        IngestionModule,
        IndexerModule,
        ReorgModule,
        QueryModule,
        AuthModule,
        RateLimitModule,
    ],
})
export class AppModule { }
