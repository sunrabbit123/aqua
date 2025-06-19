export function compose<T>(...fns: Array<(arg: T) => T>): (arg: T) => T {
  return (arg: T) => fns.reduceRight((result, fn) => fn(result), arg);
}

export function pipe<T, R>(...fns: Array<(arg: unknown) => unknown>): (arg: T) => R {
  return (arg: T) => fns.reduce((result, fn) => fn(result), arg as unknown) as unknown as R;
}

export async function asyncPipe<T, R>(...fns: Array<(arg: unknown) => unknown | Promise<unknown>>): Promise<(arg: T) => Promise<R>> {
  return async (arg: T) => {
    let result: unknown = arg;
    for (const fn of fns) {
      result = await fn(result);
    }
    return result as unknown as R;
  };
}

export function curry<T extends unknown[], R>(fn: (...args: T) => R): (...args: unknown[]) => unknown {
  return function curried(...args: unknown[]): unknown {
    if (args.length >= fn.length) {
      return fn(...args as T);
    }
    return (...nextArgs: unknown[]) => curried(...args, ...nextArgs);
  };
}

export function memoize<T extends unknown[], R>(fn: (...args: T) => R): (...args: T) => R {
  const cache = new Map();
  return (...args: T): R => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}