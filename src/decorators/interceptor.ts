import 'reflect-metadata';
import { InterceptorFunction, InterceptorMetadata } from '../types/interceptor';

const INTERCEPTOR_KEY = Symbol('interceptor');
const METHOD_INTERCEPTOR_KEY = Symbol('methodInterceptor');

export function Interceptors(...interceptors: InterceptorFunction[]): ClassDecorator & MethodDecorator {
  return function(target: Function | object, propertyKey?: string | symbol, _descriptor?: PropertyDescriptor) {
    if (propertyKey) {
      // Method decorator - for static methods, target is the constructor function
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

export function getClassInterceptors(target: Function): InterceptorFunction[] {
  return Reflect.getMetadata(INTERCEPTOR_KEY, target) || [];
}

export function getMethodInterceptors(target: Function, propertyKey: string): InterceptorFunction[] {
  return Reflect.getMetadata(METHOD_INTERCEPTOR_KEY, target, propertyKey) || [];
}

export function getAllInterceptors(target: Function, propertyKey: string): InterceptorFunction[] {
  const classInterceptors = getClassInterceptors(target);
  const methodInterceptors = getMethodInterceptors(target, propertyKey);
  return [...classInterceptors, ...methodInterceptors];
}