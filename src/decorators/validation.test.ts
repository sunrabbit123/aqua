import { describe, it, expect } from 'vitest';
import { getMethodValidationMetadata } from './validation';

describe('Validation Decorators', () => {
  describe('getMethodValidationMetadata', () => {
    it('should return undefined for methods without validation', () => {
      class TestController {
        noValidationMethod(body: any) {
          return body;
        }
      }

      const metadata = getMethodValidationMetadata(TestController.prototype, 'noValidationMethod');
      expect(metadata).toBeUndefined();
    });

    it('should return undefined for non-existent methods', () => {
      class TestController {
        someMethod() {
          return 'test';
        }
      }

      const metadata = getMethodValidationMetadata(TestController.prototype, 'nonExistentMethod');
      expect(metadata).toBeUndefined();
    });
  });
});