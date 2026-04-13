import { RequestHandler } from 'express';
import { ZodSchema } from 'zod';

/**
 * Reusable validation middleware factory.
 * Parses `req.body` against the given Zod schema.
 * On failure, the thrown ZodError is caught by the global errorHandler.
 *
 * @example
 *   router.post('/', validateBody(mySchema), controller.create);
 */
export function validateBody(schema: ZodSchema): RequestHandler {
  return (req, _res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      next(err);
    }
  };
}

/**
 * Parses `req.query` against the given Zod schema.
 * Useful for validating filter/pagination query parameters.
 */
export function validateQuery(schema: ZodSchema): RequestHandler {
  return (req, _res, next) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (err) {
      next(err);
    }
  };
}
