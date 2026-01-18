import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
    Injectable,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorLogService } from '../services/error-log.service';

@Catch()
@Injectable()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    constructor(private readonly errorLogService: ErrorLogService) { }

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        const message =
            exception instanceof Error ? exception.message : 'Internal server error';

        const stack = exception instanceof Error ? exception.stack : undefined;

        // Log the error to console
        this.logger.error(
            `${request.method} ${request.url} - Status: ${status} - Error: ${message}`,
            stack
        );

        // Save error to database (fire and forget to not delay response too much, 
        // though await is safer to ensure it's captured if process crashes immediately)
        this.errorLogService.logError(
            'error',
            'AllExceptionsFilter',
            `HTTP ${status} - ${message}`,
            stack,
            {
                path: request.url,
                method: request.method,
                body: request.body,
                query: request.query,
                params: request.params,
                ip: request.ip,
                userAgent: request.get('user-agent'),
            }
        ).catch(err => {
            this.logger.error('Failed to log error to DB from filter', err);
        });

        // Send graceful response instead of crashing
        response.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            message: message,
        });
    }
}
