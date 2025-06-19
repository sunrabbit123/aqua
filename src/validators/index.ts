import { ValidationResult, ValidationError } from '../types/validation';

export function createTypeValidator<T>(
  typeName: string,
  typeChecker: (value: unknown) => boolean,
  transform?: (value: unknown) => T
): (value: unknown) => ValidationResult<T> {
  return (value: unknown): ValidationResult<T> => {
    if (value === null || value === undefined) {
      return {
        success: false,
        errors: [{ field: 'root', message: `Expected ${typeName}, but got ${value}` }]
      };
    }

    if (!typeChecker(value)) {
      return {
        success: false,
        errors: [{ field: 'root', message: `Expected ${typeName}, but got ${typeof value}`, value }]
      };
    }

    const data = transform ? transform(value) : (value as T);
    return {
      success: true,
      data
    };
  };
}

// Basic type validators
export const stringValidator = createTypeValidator<string>(
  'string',
  (value): value is string => typeof value === 'string'
);

export const numberValidator = (value: unknown): ValidationResult<number> => {
  if (value === null || value === undefined) {
    return {
      success: false,
      errors: [{ field: 'root', message: `Expected number, but got ${value}` }]
    };
  }

  if (typeof value === 'number' && !isNaN(value)) {
    return {
      success: true,
      data: value
    };
  }

  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    if (!isNaN(parsed)) {
      return {
        success: true,
        data: parsed
      };
    }
  }

  return {
    success: false,
    errors: [{ field: 'root', message: `Expected number, but got ${typeof value}`, value }]
  };
};

export const booleanValidator = (value: unknown): ValidationResult<boolean> => {
  if (value === null || value === undefined) {
    return {
      success: false,
      errors: [{ field: 'root', message: `Expected boolean, but got ${value}` }]
    };
  }

  if (typeof value === 'boolean') {
    return {
      success: true,
      data: value
    };
  }

  if (typeof value === 'string') {
    const lower = value.toLowerCase();
    if (lower === 'true') {
      return {
        success: true,
        data: true
      };
    }
    if (lower === 'false') {
      return {
        success: true,
        data: false
      };
    }
  }

  return {
    success: false,
    errors: [{ field: 'root', message: `Expected boolean, but got ${typeof value}`, value }]
  };
};

export function objectValidator<T extends Record<string, unknown>>(
  schema: { [K in keyof T]: (value: unknown) => ValidationResult<T[K]> }
): (value: unknown) => ValidationResult<T> {
  return (value: unknown): ValidationResult<T> => {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return {
        success: false,
        errors: [{ field: 'root', message: 'Expected object', value }]
      };
    }

    const obj = value as Record<string, unknown>;
    const result: Partial<T> = {};
    const errors: ValidationError[] = [];

    for (const [key, validator] of Object.entries(schema)) {
      const fieldResult = validator(obj[key]);
      if (fieldResult.success) {
        result[key as keyof T] = fieldResult.data;
      } else {
        errors.push(
          ...(fieldResult.errors?.map((err: ValidationError) => ({
            ...err,
            field: key
          })) || [])
        );
      }
    }

    if (errors.length > 0) {
      return {
        success: false,
        errors
      };
    }

    return {
      success: true,
      data: result as T
    };
  };
}

export function arrayValidator<T>(
  itemValidator: (value: unknown) => ValidationResult<T>
): (value: unknown) => ValidationResult<T[]> {
  return (value: unknown): ValidationResult<T[]> => {
    if (!Array.isArray(value)) {
      return {
        success: false,
        errors: [{ field: 'root', message: 'Expected array', value }]
      };
    }

    const result: T[] = [];
    const errors: ValidationError[] = [];

    value.forEach((item, index) => {
      const itemResult = itemValidator(item);
      if (itemResult.success) {
        result.push(itemResult.data!);
      } else {
        errors.push(
          ...(itemResult.errors?.map((err: ValidationError) => ({
            ...err,
            field: `[${index}]${err.field !== 'root' ? '.' + err.field : ''}`
          })) || [])
        );
      }
    });

    if (errors.length > 0) {
      return {
        success: false,
        errors
      };
    }

    return {
      success: true,
      data: result
    };
  };
}

export function optionalValidator<T>(
  validator: (value: unknown) => ValidationResult<T>
): (value: unknown) => ValidationResult<T | undefined> {
  return (value: unknown): ValidationResult<T | undefined> => {
    if (value === null || value === undefined) {
      return {
        success: true,
        data: undefined
      };
    }
    
    return validator(value);
  };
}