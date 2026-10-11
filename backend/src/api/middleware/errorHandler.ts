import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { logger } from '../../utils/logger.js';

export function errorHandler(error: FastifyError, request: FastifyRequest, reply: FastifyReply) {
  logger.error({ error, url: request.raw.url }, 'API Request Error');

  const statusCode = error.statusCode || 500;
  reply.status(statusCode).send({
    success: false,
    error: {
      code: error.code || 'INTERNAL_SERVER_ERROR',
      message: error.message || 'An unexpected error occurred',
    },
    timestamp: Date.now(),
  });
}
