
export interface RetryOptions {
    maxRetries: number;
    initialDelayMs: number;
    maxDelayMs: number;
    backoffFactor: number;
    retryableStatusCodes: number[];
}

const defaultOptions: RetryOptions = {
    maxRetries: 5,
    initialDelayMs: 1000,
    maxDelayMs: 10000,
    backoffFactor: 2,
    retryableStatusCodes: [429, 503, 504, 502],
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

            const isRetryable =
                opts.retryableStatusCodes.some(code =>
                    error.message?.includes(code.toString()) ||
                    error.status === code ||
                    error.code === code ||
                    (error.info?.responseStatus && error.info.responseStatus.includes(code.toString()))
                ) ||
                error.message?.toLowerCase().includes('rate limit') ||
                error.message?.toLowerCase().includes('timeout') ||
                error.message?.toLowerCase().includes('service unavailable') ||
                error.message?.toLowerCase().includes('unable to complete request');

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
