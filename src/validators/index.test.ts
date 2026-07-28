import { describe, it, expect } from 'vitest';
import {
  stringValidator,
  numberValidator,
  booleanValidator,
  objectValidator,
  arrayValidator,
  optionalValidator,
  createTypeValidator
} from './index';

describe('Validators', () => {
  describe('stringValidator', () => {
    it('should validate string values', () => {
      const result = stringValidator('hello');
      expect(result.success).toBe(true);
      expect(result.data).toBe('hello');
    });

    it('should reject non-string values', () => {
      const result = stringValidator(123);
      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors![0].message).toContain('Expected string');
    });

    it('should reject null and undefined', () => {
      const nullResult = stringValidator(null);
      expect(nullResult.success).toBe(false);
      
      const undefinedResult = stringValidator(undefined);
      expect(undefinedResult.success).toBe(false);
    });
  });

  describe('numberValidator', () => {
    it('should validate number values', () => {
      const result = numberValidator(42);
      expect(result.success).toBe(true);
      expect(result.data).toBe(42);
    });

    it('should transform string numbers', () => {
      const result = numberValidator('42.5');
      expect(result.success).toBe(true);
      expect(result.data).toBe(42.5);
    });

    it('should reject invalid number strings', () => {
      const result = numberValidator('not-a-number');
      expect(result.success).toBe(false);
    });

    it('should reject NaN', () => {
      const result = numberValidator(NaN);
      expect(result.success).toBe(false);
    });
  });

  describe('booleanValidator', () => {
    it('should validate boolean values', () => {
      const trueResult = booleanValidator(true);
      expect(trueResult.success).toBe(true);
      expect(trueResult.data).toBe(true);

      const falseResult = booleanValidator(false);
      expect(falseResult.success).toBe(true);
      expect(falseResult.data).toBe(false);
    });

    it('should transform string booleans', () => {
      const trueResult = booleanValidator('true');
      expect(trueResult.success).toBe(true);
      expect(trueResult.data).toBe(true);

      const falseResult = booleanValidator('false');
      expect(falseResult.success).toBe(true);
      expect(falseResult.data).toBe(false);
    });

    it('should be case insensitive for string transformation', () => {
      const result = booleanValidator('TRUE');
      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
    });

    it('should reject invalid boolean strings', () => {
      const result = booleanValidator('maybe');
      expect(result.success).toBe(false);
    });
  });

  describe('objectValidator', () => {
    it('should validate objects with schema', () => {
      const schema = {
        name: stringValidator,
        age: numberValidator
      };

      const validator = objectValidator(schema);
      const result = validator({ name: 'John', age: 30 });

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ name: 'John', age: 30 });
    });

    it('should handle nested validation errors', () => {
      const schema = {
        name: stringValidator,
        age: numberValidator
      };

      const validator = objectValidator(schema);
      const result = validator({ name: 123, age: 'invalid' });

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors!.find(e => e.field === 'name')).toBeDefined();
      expect(result.errors!.find(e => e.field === 'age')).toBeDefined();
    });

    it('should reject non-objects', () => {
      const schema = { name: stringValidator };
      const validator = objectValidator(schema);

      const arrayResult = validator([]);
      expect(arrayResult.success).toBe(false);

      const stringResult = validator('not-object');
      expect(stringResult.success).toBe(false);

      const nullResult = validator(null);
      expect(nullResult.success).toBe(false);
    });
  });

  describe('arrayValidator', () => {
    it('should validate arrays with item validator', () => {
      const validator = arrayValidator(stringValidator);
      const result = validator(['a', 'b', 'c']);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(['a', 'b', 'c']);
    });

    it('should handle item validation errors', () => {
      const validator = arrayValidator(numberValidator);
      const result = validator([1, 'invalid', 3]);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors![0].field).toBe('[1]');
    });

    it('should reject non-arrays', () => {
      const validator = arrayValidator(stringValidator);
      const result = validator('not-array');

      expect(result.success).toBe(false);
      expect(result.errors![0].message).toContain('Expected array');
    });
  });

  describe('optionalValidator', () => {
    it('should allow undefined and null values', () => {
      const validator = optionalValidator(stringValidator);
      
      const undefinedResult = validator(undefined);
      expect(undefinedResult.success).toBe(true);
      expect(undefinedResult.data).toBeUndefined();

      const nullResult = validator(null);
      expect(nullResult.success).toBe(true);
      expect(nullResult.data).toBeUndefined();
    });

    it('should validate non-null values with wrapped validator', () => {
      const validator = optionalValidator(stringValidator);
      
      const validResult = validator('hello');
      expect(validResult.success).toBe(true);
      expect(validResult.data).toBe('hello');

      const invalidResult = validator(123);
      expect(invalidResult.success).toBe(false);
    });
  });

  describe('createTypeValidator', () => {
    it('should create custom validators', () => {
      const emailValidator = createTypeValidator<string>(
        'email',
        (value): value is string => {
          return typeof value === 'string' && value.includes('@');
        }
      );

      const validResult = emailValidator('test@example.com');
      expect(validResult.success).toBe(true);
      expect(validResult.data).toBe('test@example.com');

      const invalidResult = emailValidator('not-email');
      expect(invalidResult.success).toBe(false);
      expect(invalidResult.errors![0].message).toContain('Expected email');
    });

    it('should support transformation function', () => {
      const upperCaseValidator = createTypeValidator<string>(
        'uppercaseString',
        (value): value is string => typeof value === 'string',
        (value) => (value as string).toUpperCase()
      );

      const result = upperCaseValidator('hello');
      expect(result.success).toBe(true);
      expect(result.data).toBe('HELLO');
    });
  });
});