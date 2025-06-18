import { describe, it, expect } from 'vitest';
import { compose, pipe, curry, memoize } from './functional';

describe('Functional Utils', () => {
  describe('compose', () => {
    it('should compose functions right to left', () => {
      const add1 = (x: number) => x + 1;
      const multiply2 = (x: number) => x * 2;
      const composed = compose(add1, multiply2);

      expect(composed(5)).toBe(11); // (5 * 2) + 1
    });

    it('should handle single function', () => {
      const add1 = (x: number) => x + 1;
      const composed = compose(add1);

      expect(composed(5)).toBe(6);
    });
  });

  describe('pipe', () => {
    it('should pipe functions left to right', () => {
      const add1 = (x: number) => x + 1;
      const multiply2 = (x: number) => x * 2;
      const piped = pipe(add1, multiply2);

      expect(piped(5)).toBe(12); // (5 + 1) * 2
    });

    it('should handle multiple operations', () => {
      const add1 = (x: number) => x + 1;
      const multiply2 = (x: number) => x * 2;
      const subtract3 = (x: number) => x - 3;
      const piped = pipe(add1, multiply2, subtract3);

      expect(piped(5)).toBe(9); // ((5 + 1) * 2) - 3 = 9
    });
  });

  describe('curry', () => {
    it('should curry function with multiple arguments', () => {
      const add = (a: number, b: number, c: number) => a + b + c;
      const curriedAdd = curry(add);

      expect(curriedAdd(1)(2)(3)).toBe(6);
      expect(curriedAdd(1, 2)(3)).toBe(6);
      expect(curriedAdd(1)(2, 3)).toBe(6);
      expect(curriedAdd(1, 2, 3)).toBe(6);
    });

    it('should curry function with two arguments', () => {
      const multiply = (a: number, b: number) => a * b;
      const curriedMultiply = curry(multiply);

      expect(curriedMultiply(2)(3)).toBe(6);
      expect(curriedMultiply(2, 3)).toBe(6);
    });
  });

  describe('memoize', () => {
    it('should memoize function results', () => {
      let callCount = 0;
      const expensiveFunction = (x: number) => {
        callCount++;
        return x * x;
      };

      const memoized = memoize(expensiveFunction);

      expect(memoized(5)).toBe(25);
      expect(callCount).toBe(1);

      expect(memoized(5)).toBe(25);
      expect(callCount).toBe(1); // Should not increment

      expect(memoized(6)).toBe(36);
      expect(callCount).toBe(2); // Should increment for new input
    });

    it('should handle multiple arguments', () => {
      let callCount = 0;
      const add = (a: number, b: number) => {
        callCount++;
        return a + b;
      };

      const memoized = memoize(add);

      expect(memoized(1, 2)).toBe(3);
      expect(callCount).toBe(1);

      expect(memoized(1, 2)).toBe(3);
      expect(callCount).toBe(1); // Should not increment

      expect(memoized(2, 3)).toBe(5);
      expect(callCount).toBe(2); // Should increment for new arguments
    });
  });
});