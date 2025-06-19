import 'reflect-metadata';
import typia from 'typia';
import { ParameterMetadata, ValidationMetadata, TypiaValidator, TypiaValidationResult } from '../types/typia-validation';

const VALIDATION_KEY = Symbol('typia-validation');

function getValidationMetadata(target: object, propertyKey?: string | symbol): ValidationMetadata {
  if (propertyKey) {
    return Reflect.getMetadata(VALIDATION_KEY, target, propertyKey) || { parameters: [] };
  }
  return Reflect.getMetadata(VALIDATION_KEY, target) || { parameters: [] };
}

function setValidationMetadata(target: object, metadata: ValidationMetadata, propertyKey?: string | symbol): void {
  if (propertyKey) {
    Reflect.defineMetadata(VALIDATION_KEY, metadata, target, propertyKey);
  } else {
    Reflect.defineMetadata(VALIDATION_KEY, metadata, target);
  }
}

// Body decorator - uses typia to validate the entire request body
export function Body<T = unknown>(): ParameterDecorator {
  return function(target: object, propertyKey: string | symbol | undefined, parameterIndex: number) {
    if (!propertyKey) return;
    
    const metadata = getValidationMetadata(target, propertyKey);
    
    // Create typia validator at compile time based on parameter type
    const validator: TypiaValidator<T> = (input: unknown): TypiaValidationResult<T> => {
      // This will be transformed by typia transformer to use the actual parameter type
      const validate = (typia as any).createValidate();
      const result = validate(input);
      
      if (result.success) {
        return {
          success: true,
          data: result.data
        };
      } else {
        return {
          success: false,
          errors: result.errors.map((error: any) => ({
            path: error.path,
            expected: error.expected,
            value: error.value
          }))
        };
      }
    };
    
    const paramMetadata: ParameterMetadata = {
      parameterIndex,
      type: 'body',
      validator
    };

    metadata.parameters.push(paramMetadata);
    setValidationMetadata(target, metadata, propertyKey);
  };
}

// Param decorator - validates URL parameters with typia
export function Param<T = string>(name?: string): ParameterDecorator {
  return function(target: object, propertyKey: string | symbol | undefined, parameterIndex: number) {
    if (!propertyKey) return;
    
    const metadata = getValidationMetadata(target, propertyKey);
    
    // Create typia validator for string conversion
    const validator: TypiaValidator<T> = (input: unknown): TypiaValidationResult<T> => {
      let processedInput = input;
      
      // For URL params, we might need to convert string to target type
      if (typeof input === 'string') {
        // Try to convert common types
        if (input === 'true') processedInput = true;
        else if (input === 'false') processedInput = false;
        else if (!isNaN(Number(input)) && input !== '') processedInput = Number(input);
      }
      
      const validate = (typia as any).createValidate();
      const result = validate(processedInput);
      
      if (result.success) {
        return {
          success: true,
          data: result.data
        };
      } else {
        return {
          success: false,
          errors: result.errors.map((error: any) => ({
            path: error.path,
            expected: error.expected,
            value: error.value
          }))
        };
      }
    };
    
    const paramMetadata: ParameterMetadata = {
      parameterIndex,
      type: 'param',
      propertyKey: name,
      validator
    };

    metadata.parameters.push(paramMetadata);
    setValidationMetadata(target, metadata, propertyKey);
  };
}

// Query decorator - validates query parameters with typia
export function Query<T = string>(name?: string): ParameterDecorator {
  return function(target: object, propertyKey: string | symbol | undefined, parameterIndex: number) {
    if (!propertyKey) return;
    
    const metadata = getValidationMetadata(target, propertyKey);
    
    // Create typia validator for query params
    const validator: TypiaValidator<T> = (input: unknown): TypiaValidationResult<T> => {
      let processedInput = input;
      
      // Query params come as strings or string arrays
      if (typeof input === 'string') {
        // Try to convert common types
        if (input === 'true') processedInput = true;
        else if (input === 'false') processedInput = false;
        else if (!isNaN(Number(input)) && input !== '') processedInput = Number(input);
      }
      
      const validate = (typia as any).createValidate();
      const result = validate(processedInput);
      
      if (result.success) {
        return {
          success: true,
          data: result.data
        };
      } else {
        return {
          success: false,
          errors: result.errors.map((error: any) => ({
            path: error.path,
            expected: error.expected,
            value: error.value
          }))
        };
      }
    };
    
    const paramMetadata: ParameterMetadata = {
      parameterIndex,
      type: 'query',
      propertyKey: name,
      validator
    };

    metadata.parameters.push(paramMetadata);
    setValidationMetadata(target, metadata, propertyKey);
  };
}

// Get validation metadata for a method
export function getMethodValidationMetadata(target: object, propertyKey: string): ValidationMetadata | undefined {
  return Reflect.getMetadata(VALIDATION_KEY, target, propertyKey);
}

// Clear validation metadata (useful for testing)
export function clearValidationMetadata(target: object, propertyKey?: string): void {
  if (propertyKey) {
    Reflect.deleteMetadata(VALIDATION_KEY, target, propertyKey);
  } else {
    Reflect.deleteMetadata(VALIDATION_KEY, target);
  }
}