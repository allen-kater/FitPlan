import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { createError } from './errorHandler.js';

export function validate(schema: ZodSchema, target: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const data = req[target];
      const result = schema.safeParse(data);
      if (!result.success) {
        const errors = result.error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        const error = createError(400, `参数校验失败: ${errors.map((e) => `${e.field}: ${e.message}`).join('; ')}`);
        next(error);
        return;
      }
      req[target] = result.data;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const err = createError(400, `参数校验失败: ${error.errors.map((e) => e.message).join('; ')}`);
        next(err);
        return;
      }
      next(error);
    }
  };
}
