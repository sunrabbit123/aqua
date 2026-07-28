import { Request, Response } from '../types';
import { ParameterMetadata, TypiaValidationError as ITypiaValidationError } from '../types/typia-validation';
import { getMethodValidationMetadata } from '../decorators/typia-validation';

export class TypiaValidationError extends Error {
  constructor(
    public path: string,
    message: string,
    public value?: unknown,
    public expected: string = 'validation failed'
  ) {
    super(message);
    this.name = 'TypiaValidationError';
  }
}

export class TypiaRequestValidationError extends Error {
  constructor(public errors: TypiaValidationError[]) {
    super(`Validation failed: ${errors.map(e => `${e.path}: ${e.message}`).join(', ')}`);
    this.name = 'TypiaRequestValidationError';
  }
}

export function processRequestParameters(
  target: Function,
  propertyKey: string,
  req: Request
): unknown[] {
  const metadata = getMethodValidationMetadata(target, propertyKey);
  
  if (!metadata || metadata.parameters.length === 0) {
    // No validation metadata, return basic request
    return [req];
  }

  const args: unknown[] = [];
  const errors: ITypiaValidationError[] = [];

  // Sort parameters by index to ensure correct order
  const sortedParams = metadata.parameters.sort((a, b) => a.parameterIndex - b.parameterIndex);

  for (const param of sortedParams) {
    try {
      const value = extractParameterValue(param, req);
      
      if (param.validator) {
        const result = param.validator(value);
        if (!result.success) {
          errors.push(...(result.errors || []));
          args[param.parameterIndex] = undefined;
        } else {
          args[param.parameterIndex] = result.data;
        }
      } else {
        args[param.parameterIndex] = value;
      }
    } catch (error) {
      if (error instanceof TypiaValidationError) {
        errors.push({
          path: error.path,
          expected: error.expected,
          value: error.value
        });
        args[param.parameterIndex] = undefined;
      } else {
        throw error;
      }
    }
  }

  if (errors.length > 0) {
    throw new TypiaRequestValidationError(errors.map(e => new TypiaValidationError(e.path, e.expected || 'validation failed', e.value, e.expected)));
  }

  return args;
}

function extractParameterValue(param: ParameterMetadata, req: Request): unknown {
  switch (param.type) {
    case 'body':
      return req.body;
      
    case 'param':
      if (param.propertyKey) {
        return req.params[param.propertyKey];
      }
      return req.params;
      
    case 'query':
      if (param.propertyKey) {
        return req.query[param.propertyKey];
      }
      return req.query;
      
    default:
      throw new TypiaValidationError('parameter', `Unknown parameter type: ${param.type}`);
  }
}

export function handleValidationError(error: TypiaRequestValidationError, res: Response): void {
  res.status(400).json({
    error: 'Validation Error',
    message: error.message,
    details: error.errors.map(e => ({
      path: e.path,
      message: e.message,
      value: e.value
    }))
  });
}