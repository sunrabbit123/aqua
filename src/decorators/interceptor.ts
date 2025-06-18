import 'reflect-metadata';
import { InterceptorFunction, InterceptorMetadata } from '../types/interceptor';

const INTERCEPTOR_KEY = Symbol('interceptor');
const METHOD_INTERCEPTOR_KEY = Symbol('methodInterceptor');

export function Interceptors(...interceptors: InterceptorFunction[]): ClassDecorator & MethodDecorator {
  return function(target: any, propertyKey?: string | symbol, _descriptor?: PropertyDescriptor) {
    if (propertyKey) {
      // Method decorator
      const existingInterceptors = Reflect.getMetadata(METHOD_INTERCEPTOR_KEY, target, propertyKey) || [];
      Reflect.defineMetadata(
        METHOD_INTERCEPTOR_KEY,
        [...interceptors, ...existingInterceptors],
        target,
        propertyKey
      );
    } else {
      // Class decorator
      const existingInterceptors = Reflect.getMetadata(INTERCEPTOR_KEY, target) || [];
      Reflect.defineMetadata(
        INTERCEPTOR_KEY,
        [...interceptors, ...existingInterceptors],
        target
      );
    }
  };
}

export function getClassInterceptors(target: any): InterceptorFunction[] {
  return Reflect.getMetadata(INTERCEPTOR_KEY, target) || [];
}

export function getMethodInterceptors(target: any, propertyKey: string): InterceptorFunction[] {
  return Reflect.getMetadata(METHOD_INTERCEPTOR_KEY, target, propertyKey) || [];
}

export function getAllInterceptors(target: any, propertyKey: string): InterceptorFunction[] {
  const classInterceptors = getClassInterceptors(target);
  const methodInterceptors = getMethodInterceptors(target, propertyKey);
  return [...classInterceptors, ...methodInterceptors];
}