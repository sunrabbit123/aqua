import { describe, it, expect, beforeEach } from 'vitest';
import { AquaServer } from './server';
import { Controller, Get, Post } from '../decorators';

describe('AquaServer', () => {
  let server: AquaServer;

  beforeEach(() => {
    server = new AquaServer({ port: 0 }); // Use port 0 for testing
  });

  describe('registerController', () => {
    it('should register a controller with routes', () => {
      @Controller('/api')
      class TestController {
        @Get('/users')
        static getUsers() {
          return { users: [] };
        }

        @Post('/users')
        static createUser() {
          return { user: { id: 1 } };
        }
      }

      expect(() => {
        server.registerController(TestController);
      }).not.toThrow();
    });

    it('should throw error for non-decorated controller', () => {
      class TestController {
        @Get('/users')
        static getUsers() {}
      }

      expect(() => {
        server.registerController(TestController);
      }).toThrow('Controller TestController is not decorated with @Controller');
    });

    it('should throw error for missing handler', () => {
      @Controller('/api')
      class TestController {}

      // Mock metadata to simulate missing handler
      const originalGetMetadata = Reflect.getMetadata;
      Reflect.getMetadata = (key: any, target: any) => {
        if (key.toString().includes('routes')) {
          return [{ method: 'GET', path: '/test', handler: 'nonexistentMethod' }];
        }
        return originalGetMetadata(key, target);
      };

      expect(() => {
        server.registerController(TestController);
      }).toThrow('Handler nonexistentMethod not found in controller TestController');

      // Restore original function
      Reflect.getMetadata = originalGetMetadata;
    });
  });

  describe('middleware', () => {
    it('should add global middleware', () => {
      const middleware = (req: any, res: any, next: any) => next();
      
      expect(() => {
        server.use(middleware);
      }).not.toThrow();
    });
  });

  describe('server lifecycle', () => {
    it('should start and stop server', () => {
      return new Promise<void>((resolve) => {
        server.listen(() => {
          server.close(() => {
            resolve();
          });
        });
      });
    });
  });
});