import 'reflect-metadata';
import { 
  createApp, 
  Controller, 
  Get, 
  Post, 
  Request, 
  Response, 
  Interceptors,
  InterceptorFunction 
} from '../../src/index';

// Test interceptors
const loggingInterceptor: InterceptorFunction = async (context) => {
  console.log(`[INTERCEPTOR] ${context.request.method} ${context.request.path}`);
  return { proceed: true };
};

const authInterceptor: InterceptorFunction = async (context) => {
  const authHeader = context.request.headers['authorization'];
  if (!authHeader) {
    context.response.status(401).json({ error: 'Unauthorized' });
    return { proceed: false };
  }
  return { proceed: true };
};

const timingInterceptor: InterceptorFunction = async (context) => {
  const start = Date.now();
  const result = { proceed: true };
  
  // This would be called after the handler in a real implementation
  // For demo purposes, we just log the start time
  console.log(`[TIMING] Request started at ${start}`);
  
  return result;
};

// Test service
const testService = {
  getUsers: () => [
    { id: 1, name: 'John', email: 'john@example.com' },
    { id: 2, name: 'Jane', email: 'jane@example.com' }
  ],
  
  createUser: (userData: { name: string; email: string }) => ({
    id: Date.now(),
    ...userData,
    createdAt: new Date().toISOString()
  }),

  getUserById: (id: string) => ({
    id: parseInt(id),
    name: `User ${id}`,
    email: `user${id}@example.com`
  })
};

// Test controller with class-level interceptor
@Controller('/api')
@Interceptors(loggingInterceptor)
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
    const body = req.body as { name?: string; email?: string };
    if (!body.name || !body.email) {
      res.status(400);
      return { error: 'Name and email are required' };
    }
    
    const user = testService.createUser({ name: body.name, email: body.email });
    res.status(201);
    return { user };
  }

  @Get('/health')
  @Interceptors(timingInterceptor)
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

// Auth test controller with interceptor
@Controller('/auth')
@Interceptors(authInterceptor)
class AuthController {
  @Get('/profile')
  static async getProfile() {
    return { user: { id: 1, name: 'Authorized User' } };
  }

}

// Public routes controller (no auth interceptor)
@Controller('/auth')
class PublicController {
  @Get('/public')
  static async publicRoute() {
    return { message: 'This is public' };
  }
}

export function createTestServer(port: number = 0) {
  const app = createApp({ port });
  
  // Add global middleware
  app.use((req, res, next) => {
    next();
  });

  // Add global interceptor
  app.useInterceptor(timingInterceptor);

  // Register controllers
  app.registerController(TestController);
  app.registerController(MiddlewareController);
  app.registerController(AuthController);
  app.registerController(PublicController);

  return app;
}