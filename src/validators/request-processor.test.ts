import { describe, it, expect, beforeEach } from 'vitest';
import { processRequestParameters, RequestValidationError } from './request-processor';
import { Body, Param, Query } from '../decorators/validation';
import { stringValidator, numberValidator } from './index';
import { Request } from '../types';

describe('Request Processor', () => {
  let mockRequest: Request;

  beforeEach(() => {
    mockRequest = {
      method: 'POST',
      url: '/test',
      path: '/test',
      query: { page: '1', filter: 'active' },
      params: { id: '123', userId: '456' },
      body: { name: 'John', age: 30 },
      headers: {}
    };
  });

  describe('processRequestParameters', () => {
    it('should process request without validation decorators', () => {
      class TestController {
        static testMethod(req: Request) {
          return req;
        }
      }

      const args = processRequestParameters(TestController, 'testMethod', mockRequest);
      expect(args).toEqual([mockRequest]);
    });

    it('should process body parameter with validation', () => {
      class TestController {
        static testMethod(@Body(stringValidator) body: string) {
          return body;
        }
      }

      mockRequest.body = 'test string';
      const args = processRequestParameters(TestController, 'testMethod', mockRequest);
      expect(args).toEqual(['test string']);
    });

    it('should process param parameter', () => {
      class TestController {
        static testMethod(@Param('id') id: string) {
          return id;
        }
      }

      const args = processRequestParameters(TestController, 'testMethod', mockRequest);
      expect(args).toEqual(['123']);
    });

    it('should process query parameter', () => {
      class TestController {
        static testMethod(@Query('page') page: string) {
          return page;
        }
      }

      const args = processRequestParameters(TestController, 'testMethod', mockRequest);
      expect(args).toEqual(['1']);
    });

    it('should process multiple parameters in correct order', () => {
      class TestController {
        static testMethod(
          @Body(stringValidator) body: string,
          @Param('id') id: string,
          @Query('page') page: string
        ) {
          return { body, id, page };
        }
      }

      mockRequest.body = 'test body';
      const args = processRequestParameters(TestController, 'testMethod', mockRequest);
      expect(args).toEqual(['test body', '123', '1']);
    });

    it('should process all params when no specific param name provided', () => {
      class TestController {
        static testMethod(@Param() params: Record<string, string>) {
          return params;
        }
      }

      const args = processRequestParameters(TestController, 'testMethod', mockRequest);
      expect(args).toEqual([{ id: '123', userId: '456' }]);
    });

    it('should process all query when no specific query name provided', () => {
      class TestController {
        static testMethod(@Query() query: Record<string, string>) {
          return query;
        }
      }

      const args = processRequestParameters(TestController, 'testMethod', mockRequest);
      expect(args).toEqual([{ page: '1', filter: 'active' }]);
    });

    it('should throw RequestValidationError on validation failure', () => {
      class TestController {
        static testMethod(@Body(numberValidator) body: number) {
          return body;
        }
      }

      mockRequest.body = 'not a number';
      
      expect(() => {
        processRequestParameters(TestController, 'testMethod', mockRequest);
      }).toThrow(RequestValidationError);
    });

    it('should collect multiple validation errors', () => {
      class TestController {
        static testMethod(
          @Body(numberValidator) body: number,
          @Param('nonexistent') param: string
        ) {
          return { body, param };
        }
      }

      mockRequest.body = 'not a number';
      
      try {
        processRequestParameters(TestController, 'testMethod', mockRequest);
        expect.fail('Should have thrown RequestValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(RequestValidationError);
        const validationError = error as RequestValidationError;
        expect(validationError.errors.length).toBeGreaterThan(0);
      }
    });

    it('should handle successful validation with transformation', () => {
      class TestController {
        static testMethod(@Body(numberValidator) body: number) {
          return body;
        }
      }

      mockRequest.body = '42'; // String that should be transformed to number
      const args = processRequestParameters(TestController, 'testMethod', mockRequest);
      expect(args).toEqual([42]);
      expect(typeof args[0]).toBe('number');
    });

    it('should maintain parameter indices correctly', () => {
      class TestController {
        static testMethod(
          @Param('id') id: string,
          @Body(stringValidator) body: string,
          @Query('page') page: string
        ) {
          return { id, body, page };
        }
      }

      mockRequest.body = 'test body';
      const args = processRequestParameters(TestController, 'testMethod', mockRequest);
      
      // Should maintain order: id (0), body (1), page (2)
      expect(args[0]).toBe('123'); // id
      expect(args[1]).toBe('test body'); // body
      expect(args[2]).toBe('1'); // page
    });
  });

  describe('RequestValidationError', () => {
    it('should format error message correctly', () => {
      const errors = [
        { field: 'body', message: 'Expected number', value: 'invalid' },
        { field: 'param', message: 'Required field missing' }
      ];
      
      const error = new RequestValidationError(errors);
      expect(error.message).toContain('body: Expected number');
      expect(error.message).toContain('param: Required field missing');
      expect(error.errors).toEqual(errors);
    });

    it('should be an instance of Error', () => {
      const error = new RequestValidationError([]);
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('RequestValidationError');
    });
  });
});