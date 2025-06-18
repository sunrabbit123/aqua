import { ServiceFunction, DomainFunction } from '../types';
export declare function createService<T extends any[], R>(fn: ServiceFunction<T, R>): ServiceFunction<T, R>;
export declare function createDomain<T extends any[], R>(fn: DomainFunction<T, R>): DomainFunction<T, R>;
export declare function compose<T>(...fns: Array<(arg: T) => T>): (arg: T) => T;
export declare function pipe<T, R>(...fns: Array<(arg: any) => any>): (arg: T) => R;
export declare function asyncPipe<T, R>(...fns: Array<(arg: any) => any | Promise<any>>): Promise<(arg: T) => Promise<R>>;
export declare function curry<T extends any[], R>(fn: (...args: T) => R): any;
export declare function memoize<T extends any[], R>(fn: (...args: T) => R): (...args: T) => R;
//# sourceMappingURL=functional.d.ts.map