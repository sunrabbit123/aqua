import { Request, Response } from '../types';
import { ParameterValidationMetadata, ValidationError as IValidationError } from '../types/validation';
import { getMethodValidationMetadata } from '../decorators/validation';

export class ValidationError extends Error {
  constructor(
    public field: string,
    message: string,
    public value?: unknown
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class RequestValidationError extends Error {
  constructor(public errors: ValidationError[]) {
    super(`Validation failed: ${errors.map(e => `${e.field}: ${e.message}`).join(', ')}`);
    this.name = 'RequestValidationError';
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
  const errors: IValidationError[] = [];

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
      if (error instanceof ValidationError) {
        errors.push({
          field: error.field,
          message: error.message,
          value: error.value
        });
        args[param.parameterIndex] = undefined;
      } else {
        throw error;
      }
    }
  }

  if (errors.length > 0) {
    throw new RequestValidationError(errors.map(e => new ValidationError(e.field, e.message, e.value)));
  }

  return args;
}

function extractParameterValue(param: ParameterValidationMetadata, req: Request): unknown {
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
      throw new ValidationError('parameter', `Unknown parameter type: ${param.type}`);
  }
}

export function handleValidationError(error: RequestValidationError, res: Response): void {
  res.status(400).json({
    error: 'Validation Error',
    message: error.message,
    details: error.errors.map(e => ({
      field: e.field,
      message: e.message,
      value: e.value
    }))
  });
}