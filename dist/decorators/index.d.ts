import 'reflect-metadata';
import { ControllerMetadata, RouteMetadata, MiddlewareFunction } from '../types';
export declare function Controller(prefix?: string): ClassDecorator;
export declare const Get: (path: string, middleware?: MiddlewareFunction[]) => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
export declare const Post: (path: string, middleware?: MiddlewareFunction[]) => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
export declare const Put: (path: string, middleware?: MiddlewareFunction[]) => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
export declare const Delete: (path: string, middleware?: MiddlewareFunction[]) => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
export declare const Patch: (path: string, middleware?: MiddlewareFunction[]) => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
export declare const Options: (path: string, middleware?: MiddlewareFunction[]) => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
export declare const Head: (path: string, middleware?: MiddlewareFunction[]) => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
export declare function getControllerMetadata(target: any): ControllerMetadata | undefined;
export declare function getRouteMetadata(target: any): RouteMetadata[];
//# sourceMappingURL=index.d.ts.map