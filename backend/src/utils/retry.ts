export interface RetryOptions {
  retries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  factor?: number;
  shouldRetry?: (error: any) => boolean;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    retries = 3,
    initialDelayMs = 200,
    maxDelayMs = 2000,
    factor = 2,
    shouldRetry = () => true,
  } = options;

  let delay = initialDelayMs;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      if (attempt === retries || !shouldRetry(err)) {
        throw err;
      }
      const jitter = Math.random() * 0.2 * delay;
      await new Promise((resolve) => setTimeout(resolve, delay + jitter));
      delay = Math.min(delay * factor, maxDelayMs);
    }
  }

  throw new Error('Retry limit exceeded');
}
