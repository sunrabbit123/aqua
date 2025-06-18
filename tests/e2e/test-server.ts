import 'reflect-metadata';
import { createApp, Controller, Get, Post, Request, Response, createService } from '../../src/index';

// Test service
const testService = {
  getUsers: createService(() => [
    { id: 1, name: 'John', email: 'john@example.com' },
    { id: 2, name: 'Jane', email: 'jane@example.com' }
  ]),
  
  createUser: createService((userData: any) => ({
    id: Date.now(),
    ...userData,
    createdAt: new Date().toISOString()
  })),

  getUserById: createService((id: string) => ({
    id: parseInt(id),
    name: `User ${id}`,
    email: `user${id}@example.com`
  }))
};

// Test controller
@Controller('/api')
class TestController {
  @Get('/users')
  static async getUsers() {
    return { users: testService.getUsers() };
  }

  @Get('/users/:id')
  static async getUser(req: Request) {
    const user = testService.getUserById(req.params.id);
    return { user };
  }

  @Post('/users')
  static async createUser(req: Request, res: Response) {
    if (!req.body.name || !req.body.email) {
      res.status(400);
      return { error: 'Name and email are required' };
    }
    
    const user = testService.createUser(req.body);
    res.status(201);
    return { user };
  }

  @Get('/health')
  static async healthCheck() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}

// Middleware test controller
@Controller('/middleware')
class MiddlewareController {
  @Get('/protected')
  static async protectedRoute(req: Request) {
    return { message: 'Access granted', user: req.headers['x-user-id'] };
  }
}

export function createTestServer(port: number = 0) {
  const app = createApp({ port });
  
  // Add global middleware
  app.use((req, res, next) => {
    next();
  });

  // Register controllers
  app.registerController(TestController);
  app.registerController(MiddlewareController);

  return app;
}