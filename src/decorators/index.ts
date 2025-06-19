import 'reflect-metadata';
import { ControllerMetadata, RouteMetadata, MiddlewareFunction } from '../types';

const CONTROLLER_KEY = Symbol('controller');
const ROUTES_KEY = Symbol('routes');

export function Controller(prefix?: string): ClassDecorator {
  return function(target: Function) {
    const existingRoutes = Reflect.getMetadata(ROUTES_KEY, target) || [];
    const controllerMetadata: ControllerMetadata = {
      prefix,
      routes: existingRoutes
    };
    Reflect.defineMetadata(CONTROLLER_KEY, controllerMetadata, target);
  };
}

function createMethodDecorator(method: string) {
  return function(path: string, middleware?: MiddlewareFunction[]) {
    return function(target: object, propertyKey: string, _descriptor?: PropertyDescriptor) {
      const existingRoutes = Reflect.getMetadata(ROUTES_KEY, target) || [];
      const route: RouteMetadata = {
        method: method.toUpperCase(),
        path,
        handler: propertyKey,
        middleware
      };
      existingRoutes.push(route);
      Reflect.defineMetadata(ROUTES_KEY, existingRoutes, target);
    };
  };
}

export const Get = createMethodDecorator('get');
export const Post = createMethodDecorator('post');
export const Put = createMethodDecorator('put');
export const Delete = createMethodDecorator('delete');
export const Patch = createMethodDecorator('patch');
export const Options = createMethodDecorator('options');
export const Head = createMethodDecorator('head');

export function getControllerMetadata(target: Function): ControllerMetadata | undefined {
  return Reflect.getMetadata(CONTROLLER_KEY, target);
}

export function getRouteMetadata(target: Function): RouteMetadata[] {
  return Reflect.getMetadata(ROUTES_KEY, target) || [];
}

export * from './interceptor';