/**
 * Raised when an external dependency (price feed, order book, signer) cannot supply
 * a trustworthy value. The API maps it to HTTP 503 so callers never act on invented data.
 * Spec section 14: "Validate every external number ... reject NaN, zero and stale values."
 */
export class ServiceUnavailableError extends Error {
  public readonly statusCode = 503;
  public readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'ServiceUnavailableError';
    this.code = code;
  }
}
