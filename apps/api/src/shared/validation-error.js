// Domain error: HTTP status mapping belongs to the middleware layer.
export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.code = 'INVALID_ORDER';
  }
}
