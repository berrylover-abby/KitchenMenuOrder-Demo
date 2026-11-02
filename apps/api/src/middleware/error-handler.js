import { ValidationError } from '../shared/validation-error.js';
import { NotFoundError } from '../shared/not-found-error.js';

export function errorHandler(error, _request, response, _next) {
  if (error instanceof NotFoundError) {
    return response.status(404).json({ error: { code: error.code, message: error.message } });
  }
  if (error instanceof ValidationError) {
    return response.status(400).json({ error: { code: error.code, message: error.message } });
  }
  if (error.type === 'entity.parse.failed') {
    return response.status(400).json({
      error: { code: 'INVALID_JSON', message: 'Request body must be valid JSON.' },
    });
  }
  if (error.type === 'entity.too.large') {
    return response.status(413).json({
      error: { code: 'BODY_TOO_LARGE', message: 'Request body is too large.' },
    });
  }
  console.error(error);
  response.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Something went wrong. Please try again.' },
  });
}
