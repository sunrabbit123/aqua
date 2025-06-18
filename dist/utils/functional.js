"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createService = createService;
exports.createDomain = createDomain;
exports.compose = compose;
exports.pipe = pipe;
exports.asyncPipe = asyncPipe;
exports.curry = curry;
exports.memoize = memoize;
function createService(fn) {
    return fn;
}
function createDomain(fn) {
    return fn;
}
function compose(...fns) {
    return (arg) => fns.reduceRight((result, fn) => fn(result), arg);
}
function pipe(...fns) {
    return (arg) => fns.reduce((result, fn) => fn(result), arg);
}
async function asyncPipe(...fns) {
    return async (arg) => {
        let result = arg;
        for (const fn of fns) {
            result = await fn(result);
        }
        return result;
    };
}
function curry(fn) {
    return function curried(...args) {
        if (args.length >= fn.length) {
            return fn(...args);
        }
        return (...nextArgs) => curried(...args, ...nextArgs);
    };
}
function memoize(fn) {
    const cache = new Map();
    return (...args) => {
        const key = JSON.stringify(args);
        if (cache.has(key)) {
            return cache.get(key);
        }
        const result = fn(...args);
        cache.set(key, result);
        return result;
    };
}
//# sourceMappingURL=functional.js.map