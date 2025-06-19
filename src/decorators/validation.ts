import 'reflect-metadata';
import { ValidatorFunction, ParameterValidationMetadata, ValidationMetadata } from '../types/validation';

const VALIDATION_KEY = Symbol('validation');

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

function createParameterDecorator(type: 'body' | 'param' | 'query', paramName?: string) {
  return function(validator?: ValidatorFunction): ParameterDecorator {
    return function(target: object, propertyKey: string | symbol | undefined, parameterIndex: number) {
      if (!propertyKey) return;
      
      const metadata = getValidationMetadata(target, propertyKey);
      
      const paramMetadata: ParameterValidationMetadata = {
        parameterIndex,
        type,
        validator,
        propertyKey: paramName || (type === 'param' ? undefined : type)
      };

      metadata.parameters.push(paramMetadata);
      setValidationMetadata(target, metadata, propertyKey);
    };
  };
}

// Body decorator - validates the entire request body
export function Body<T = unknown>(validator?: ValidatorFunction<T>): ParameterDecorator {
  return createParameterDecorator('body')(validator);
}

// Param decorator - validates URL parameters
export function Param(name?: string): ParameterDecorator {
  return function(target: object, propertyKey: string | symbol | undefined, parameterIndex: number) {
    if (!propertyKey) return;
    
    const metadata = getValidationMetadata(target, propertyKey);
    
    const paramMetadata: ParameterValidationMetadata = {
      parameterIndex,
      type: 'param',
      propertyKey: name
    };

    metadata.parameters.push(paramMetadata);
    setValidationMetadata(target, metadata, propertyKey);
  };
}

// Query decorator - validates query parameters
export function Query(name?: string): ParameterDecorator {
  return function(target: object, propertyKey: string | symbol | undefined, parameterIndex: number) {
    if (!propertyKey) return;
    
    const metadata = getValidationMetadata(target, propertyKey);
    
    const paramMetadata: ParameterValidationMetadata = {
      parameterIndex,
      type: 'query',
      propertyKey: name
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