import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../lib/error-handling';

/**
 * Middleware factory to validate request body against a Zod schema
 */
export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body against schema
      const validated = schema.parse(req.body);
      
      // Replace request body with validated data
      req.body = validated;
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod errors
        const validationErrors: Record<string, string[]> = {};
        
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          if (!validationErrors[path]) {
            validationErrors[path] = [];
          }
          validationErrors[path].push(err.message);
        });
        
        next(new ValidationError('Validation failed', validationErrors));
      } else {
        next(error);
      }
    }
  };
};

/**
 * Middleware factory to validate query params against a Zod schema
 */
export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate query params against schema
      const validated = schema.parse(req.query);
      
      // Replace query params with validated data
      req.query = validated;
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod errors
        const validationErrors: Record<string, string[]> = {};
        
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          if (!validationErrors[path]) {
            validationErrors[path] = [];
          }
          validationErrors[path].push(err.message);
        });
        
        next(new ValidationError('Query validation failed', validationErrors));
      } else {
        next(error);
      }
    }
  };
};

/**
 * Middleware factory to validate URL params against a Zod schema
 */
export const validateParams = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate URL params against schema
      const validated = schema.parse(req.params);
      
      // Replace URL params with validated data
      req.params = validated;
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod errors
        const validationErrors: Record<string, string[]> = {};
        
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          if (!validationErrors[path]) {
            validationErrors[path] = [];
          }
          validationErrors[path].push(err.message);
        });
        
        next(new ValidationError('Path parameters validation failed', validationErrors));
      } else {
        next(error);
      }
    }
  };
}; 