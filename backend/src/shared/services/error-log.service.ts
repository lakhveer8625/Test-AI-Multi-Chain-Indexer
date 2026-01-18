import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ErrorLog } from '../entities/error-log.entity';

@Injectable()
export class ErrorLogService {
    private readonly logger = new Logger(ErrorLogService.name);

    constructor(
        @InjectRepository(ErrorLog)
        private readonly errorLogRepository: Repository<ErrorLog>,
    ) { }

    /**
     * Log an error to the database.
     * Falls back to console logger if DB save fails to prevent infinite loops/crashes in error handling.
     */
    async logError(
        level: string,
        source: string,
        message: string,
        stack?: string,
        metadata?: any,
    ): Promise<void> {
        // Always log to console first (via standard logger) - this ensures we see it in stdout/logs
        // The caller might have already logged it, but double logging is better than missing it if DB fails.
        // However, usually the caller (ExceptionFilter) logs it. Let's assume this service is for persistence.

        try {
            const errorLog = this.errorLogRepository.create({
                level,
                source,
                message,
                stack_trace: stack,
                metadata,
            });

            await this.errorLogRepository.save(errorLog);
        } catch (dbError) {
            this.logger.error(
                `Failed to save error log to database. Original error: ${message}`,
                dbError instanceof Error ? dbError.stack : String(dbError),
            );
        }
    }

    // Helper for structured error objects
    async logException(exception: any, source: string, metadata?: any): Promise<void> {
        const message = exception instanceof Error ? exception.message : String(exception);
        const stack = exception instanceof Error ? exception.stack : undefined;
        await this.logError('error', source, message, stack, metadata);
    }
}
