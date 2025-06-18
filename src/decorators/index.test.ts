import { describe, it, expect } from 'vitest';
import 'reflect-metadata';
import { Controller, Get, Post, Put, Delete, getControllerMetadata, getRouteMetadata } from './index';

describe('Decorators', () => {
  describe('@Controller', () => {
    it('should define controller metadata with prefix', () => {
      @Controller('/api')
      class TestController {}

      const metadata = getControllerMetadata(TestController);
      expect(metadata).toBeDefined();
      expect(metadata?.prefix).toBe('/api');
    });

    it('should define controller metadata without prefix', () => {
      @Controller()
      class TestController {}

      const metadata = getControllerMetadata(TestController);
      expect(metadata).toBeDefined();
      expect(metadata?.prefix).toBeUndefined();
    });
  });

  describe('HTTP Method Decorators', () => {
    it('should register GET route', () => {
      class TestController {
        @Get('/users')
        static getUsers() {}
      }

      const routes = getRouteMetadata(TestController);
      expect(routes).toHaveLength(1);
      expect(routes[0]).toEqual({
        method: 'GET',
        path: '/users',
        handler: 'getUsers',
        middleware: undefined
      });
    });

    it('should register POST route', () => {
      class TestController {
        @Post('/users')
        static createUser() {}
      }

      const routes = getRouteMetadata(TestController);
      expect(routes).toHaveLength(1);
      expect(routes[0].method).toBe('POST');
      expect(routes[0].path).toBe('/users');
      expect(routes[0].handler).toBe('createUser');
    });

    it('should register multiple routes', () => {
      class TestController {
        @Get('/users')
        static getUsers() {}

        @Post('/users')
        static createUser() {}

        @Put('/users/:id')
        static updateUser() {}

        @Delete('/users/:id')
        static deleteUser() {}
      }

      const routes = getRouteMetadata(TestController);
      expect(routes).toHaveLength(4);
      
      const methods = routes.map(r => r.method);
      expect(methods).toContain('GET');
      expect(methods).toContain('POST');
      expect(methods).toContain('PUT');
      expect(methods).toContain('DELETE');
    });

    it('should handle routes with middleware', () => {
      const middleware = (req: any, res: any, next: any) => next();

      class TestController {
        @Get('/protected', [middleware])
        static protectedRoute() {}
      }

      const routes = getRouteMetadata(TestController);
      expect(routes[0].middleware).toEqual([middleware]);
    });
  });

  describe('Controller with routes', () => {
    it('should combine controller and route metadata', () => {
      @Controller('/api')
      class TestController {
        @Get('/users')
        static getUsers() {}

        @Post('/users')
        static createUser() {}
      }

      const controllerMetadata = getControllerMetadata(TestController);
      const routes = getRouteMetadata(TestController);

      expect(controllerMetadata?.prefix).toBe('/api');
      expect(routes).toHaveLength(2);
      expect(routes.map(r => r.path)).toEqual(['/users', '/users']);
    });
  });
});