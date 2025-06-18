import { describe, it, expect } from 'vitest';
import 'reflect-metadata';
import { Interceptors, getClassInterceptors, getMethodInterceptors, getAllInterceptors } from './interceptor';
import { InterceptorFunction } from '../types';

describe('Interceptor Decorators', () => {
  const mockInterceptor1: InterceptorFunction = async (_context) => ({ proceed: true });
  const mockInterceptor2: InterceptorFunction = async (_context) => ({ proceed: true });
  const mockInterceptor3: InterceptorFunction = async (_context) => ({ proceed: true });

  describe('@Interceptors on class', () => {
    it('should register class-level interceptors', () => {
      @Interceptors(mockInterceptor1, mockInterceptor2)
      class TestController {}

      const interceptors = getClassInterceptors(TestController);
      expect(interceptors).toHaveLength(2);
      expect(interceptors).toContain(mockInterceptor1);
      expect(interceptors).toContain(mockInterceptor2);
    });

    it('should accumulate multiple @Interceptors on class', () => {
      @Interceptors(mockInterceptor1)
      @Interceptors(mockInterceptor2)
      class TestController {}

      const interceptors = getClassInterceptors(TestController);
      expect(interceptors).toHaveLength(2);
      expect(interceptors).toEqual([mockInterceptor1, mockInterceptor2]);
    });
  });

  describe('@Interceptors on method', () => {
    it('should register method-level interceptors', () => {
      class TestController {
        @Interceptors(mockInterceptor1, mockInterceptor2)
        static testMethod() {}
      }

      const interceptors = getMethodInterceptors(TestController, 'testMethod');
      expect(interceptors).toHaveLength(2);
      expect(interceptors).toContain(mockInterceptor1);
      expect(interceptors).toContain(mockInterceptor2);
    });

    it('should accumulate multiple @Interceptors on method', () => {
      class TestController {
        @Interceptors(mockInterceptor1)
        @Interceptors(mockInterceptor2)
        static testMethod() {}
      }

      const interceptors = getMethodInterceptors(TestController, 'testMethod');
      expect(interceptors).toHaveLength(2);
      expect(interceptors).toEqual([mockInterceptor1, mockInterceptor2]);
    });
  });

  describe('getAllInterceptors', () => {
    it('should combine class and method interceptors', () => {
      @Interceptors(mockInterceptor1)
      class TestController {
        @Interceptors(mockInterceptor2, mockInterceptor3)
        static testMethod() {}
      }

      const allInterceptors = getAllInterceptors(TestController, 'testMethod');
      expect(allInterceptors).toHaveLength(3);
      expect(allInterceptors).toEqual([mockInterceptor1, mockInterceptor2, mockInterceptor3]);
    });

    it('should return only class interceptors when no method interceptors', () => {
      @Interceptors(mockInterceptor1, mockInterceptor2)
      class TestController {
        static testMethod() {}
      }

      const allInterceptors = getAllInterceptors(TestController, 'testMethod');
      expect(allInterceptors).toHaveLength(2);
      expect(allInterceptors).toEqual([mockInterceptor1, mockInterceptor2]);
    });

    it('should return only method interceptors when no class interceptors', () => {
      class TestController {
        @Interceptors(mockInterceptor1, mockInterceptor2)
        static testMethod() {}
      }

      const allInterceptors = getAllInterceptors(TestController, 'testMethod');
      expect(allInterceptors).toHaveLength(2);
      expect(allInterceptors).toEqual([mockInterceptor1, mockInterceptor2]);
    });

    it('should return empty array when no interceptors', () => {
      class TestController {
        static testMethod() {}
      }

      const allInterceptors = getAllInterceptors(TestController, 'testMethod');
      expect(allInterceptors).toHaveLength(0);
    });
  });
});