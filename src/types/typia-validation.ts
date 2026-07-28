import typia from 'typia';

export interface TypiaValidationError {
  path: string;
  expected: string;
  value: unknown;
}

export interface TypiaValidationResult<T = unknown> {
  success: boolean;
  data?: T;
  errors?: TypiaValidationError[];
}

export type TypiaValidator<T = unknown> = (input: unknown) => TypiaValidationResult<T>;

export interface ParameterMetadata {
  parameterIndex: number;
  type: 'body' | 'param' | 'query';
  propertyKey?: string;
  validator?: TypiaValidator;
}

export interface ValidationMetadata {
  parameters: ParameterMetadata[];
}

// Utility type to create typia validators at compile time
export function createTypiaValidator<T>(): TypiaValidator<T> {
  // This will be transformed by typia at compile time
  const validate = (typia as any).createValidate();
  
  return (input: unknown): TypiaValidationResult<T> => {
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
}

// Utility for string to type conversion for URL params and query strings
export function createStringValidator<T>(): TypiaValidator<T> {
  const validate = (typia as any).createValidate();
  
  return (input: unknown): TypiaValidationResult<T> => {
    // First try to parse if it's a string that might need conversion
    let processedInput = input;
    
    if (typeof input === 'string') {
      // Try to parse as JSON for complex types
      try {
        processedInput = JSON.parse(input);
      } catch {
        // If JSON parse fails, keep as string
        processedInput = input;
      }
    }
    
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
}