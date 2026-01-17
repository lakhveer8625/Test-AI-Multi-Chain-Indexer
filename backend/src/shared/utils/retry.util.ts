
export interface RetryOptions {
    maxRetries: number;
    initialDelayMs: number;
    maxDelayMs: number;
    backoffFactor: number;
    retryableStatusCodes: number[];
}

const defaultOptions: RetryOptions = {
    maxRetries: 7,
    initialDelayMs: 1000,
    maxDelayMs: 30000,
    backoffFactor: 2,
    retryableStatusCodes: [429, 503, 504, 502, -32005, -32000, -32603],
};

export async function withRetry<T>(
    fn: () => Promise<T>,
    options: Partial<RetryOptions> = {},
    logger?: { warn: (msg: string) => void; error: (msg: string) => void }
): Promise<T> {
    const opts = { ...defaultOptions, ...options };
    let lastError: any;
    let delay = opts.initialDelayMs;

    for (let attempt = 1; attempt <= opts.maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error: any) {
            lastError = error;

            const isNonRetryable =
                error.message?.toLowerCase().includes('skipped') ||
                error.message?.toLowerCase().includes('missing in long-term storage') ||
                error.message?.toLowerCase().includes('not found');

            const errorMessage = (error.message || '').toLowerCase();
            const infoMessage = error.info ? String(error.info).toLowerCase() : '';

            const isRetryable = !isNonRetryable && (
                opts.retryableStatusCodes.some(code =>
                    errorMessage.includes(code.toString()) ||
                    infoMessage.includes(code.toString()) ||
                    error.status === code ||
                    error.code === code ||
                    (error.info && error.info.responseStatus && String(error.info.responseStatus).includes(code.toString()))
                ) ||
                errorMessage.includes('rate limit') ||
                infoMessage.includes('rate limit') ||
                errorMessage.includes('timeout') ||
                infoMessage.includes('timeout') ||
                errorMessage.includes('service unavailable') ||
                errorMessage.includes('unable to complete request') ||
                errorMessage.includes('too many requests')
            );

            if (!isRetryable || attempt === opts.maxRetries) {
                throw error;
            }

            const msg = `Attempt ${attempt} failed: ${error.message}. Retrying in ${delay}ms...`;
            if (logger) {
                logger.warn(msg);
            } else {
                console.warn(msg);
            }

            await new Promise(resolve => setTimeout(resolve, delay));
            delay = Math.min(delay * opts.backoffFactor, opts.maxDelayMs);
        }
    }

    throw lastError;
}
