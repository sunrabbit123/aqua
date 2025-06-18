import { describe, it, expect, beforeEach } from 'vitest';
import { Router } from './router';
import { Request, Response } from '../types';

describe('Router', () => {
  let router: Router;

  beforeEach(() => {
    router = new Router();
  });

  describe('addRoute', () => {
    it('should add a route', () => {
      const handler = (_req: Request, _res: Response) => {};
      router.addRoute('GET', '/users', handler);

      const routes = router.getRoutes();
      expect(routes).toHaveLength(1);
      expect(routes[0].method).toBe('GET');
      expect(routes[0].path).toBe('/users');
      expect(routes[0].handler).toBe(handler);
    });

    it('should normalize paths', () => {
      const handler = (_req: Request, _res: Response) => {};
      router.addRoute('GET', '/users/', handler);

      const routes = router.getRoutes();
      expect(routes[0].path).toBe('/users');
    });

    it('should preserve root path', () => {
      const handler = (_req: Request, _res: Response) => {};
      router.addRoute('GET', '/', handler);

      const routes = router.getRoutes();
      expect(routes[0].path).toBe('/');
    });
  });

  describe('match', () => {
    beforeEach(() => {
      router.addRoute('GET', '/users', (_req, _res) => {});
      router.addRoute('POST', '/users', (_req, _res) => {});
      router.addRoute('GET', '/users/:id', (_req, _res) => {});
      router.addRoute('GET', '/posts/:postId/comments/:commentId', (_req, _res) => {});
    });

    it('should match exact paths', () => {
      const match = router.match('GET', '/users');
      expect(match).toBeTruthy();
      expect(match?.route.method).toBe('GET');
      expect(match?.route.path).toBe('/users');
      expect(match?.params).toEqual({});
    });

    it('should match methods case insensitively', () => {
      const match = router.match('get', '/users');
      expect(match).toBeTruthy();
      expect(match?.route.method).toBe('GET');
    });

    it('should not match wrong method', () => {
      const match = router.match('DELETE', '/users');
      expect(match).toBeNull();
    });

    it('should match parametrized routes', () => {
      const match = router.match('GET', '/users/123');
      expect(match).toBeTruthy();
      expect(match?.route.path).toBe('/users/:id');
      expect(match?.params).toEqual({ id: '123' });
    });

    it('should match multiple parameters', () => {
      const match = router.match('GET', '/posts/456/comments/789');
      expect(match).toBeTruthy();
      expect(match?.route.path).toBe('/posts/:postId/comments/:commentId');
      expect(match?.params).toEqual({ postId: '456', commentId: '789' });
    });

    it('should not match wrong path structure', () => {
      const match = router.match('GET', '/users/123/extra');
      expect(match).toBeNull();
    });

    it('should handle trailing slashes in matching', () => {
      const match = router.match('GET', '/users/');
      expect(match).toBeTruthy();
      expect(match?.route.path).toBe('/users');
    });
  });

  describe('middleware', () => {
    it('should add global middleware', () => {
      const middleware = (req: Request, res: Response, next: () => void) => next();
      router.use(middleware);

      const handler = (_req: Request, _res: Response) => {};
      router.addRoute('GET', '/users', handler);

      const routes = router.getRoutes();
      expect(routes[0].middleware).toContain(middleware);
    });

    it('should combine global and route-specific middleware', () => {
      const globalMiddleware = (req: Request, res: Response, next: () => void) => next();
      const routeMiddleware = (req: Request, res: Response, next: () => void) => next();
      
      router.use(globalMiddleware);

      const handler = (_req: Request, _res: Response) => {};
      router.addRoute('GET', '/users', handler, [routeMiddleware]);

      const routes = router.getRoutes();
      expect(routes[0].middleware).toEqual([globalMiddleware, routeMiddleware]);
    });
  });
});