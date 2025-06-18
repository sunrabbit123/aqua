import { createApp, Controller, Get, Post, Request, Response } from '../src';

// Domain layer - pure functions
const validateUser = (userData: any) => {
  if (!userData.name || !userData.email) {
    throw new Error('Name and email are required');
  }
  return userData;
};

const createUserEntity = (userData: any) => ({
  id: Date.now(),
  name: userData.name,
  email: userData.email,
  createdAt: new Date()
});

// Service layer - business logic functions
const userService = {
  getAll: () => {
    return [
      { id: 1, name: 'John', email: 'john@example.com' },
      { id: 2, name: 'Jane', email: 'jane@example.com' }
    ];
  },

  create: (userData: any) => {
    const validatedData = validateUser(userData);
    const user = createUserEntity(validatedData);
    return user;
  }
};

// Controller with static methods and decorators
@Controller('/api/users')
class UserController {
  @Get('/')
  static async getUsers(req: Request, res: Response) {
    const users = await userService.getAll();
    return { users };
  }

  @Get('/:id')
  static async getUser(req: Request, res: Response) {
    const { id } = req.params;
    return { user: { id: parseInt(id), name: 'User ' + id } };
  }

  @Post('/')
  static async createUser(req: Request, res: Response) {
    try {
      const user = await userService.create(req.body);
      return { user };
    } catch (error) {
      res.status(400);
      return { error: (error as Error).message };
    }
  }
}

// Create and configure the app
const app = createApp({ port: 3000 });

// Register controllers
app.registerController(UserController);

// Start server
app.listen(() => {
  console.log('Server running on http://localhost:3000');
  console.log('Try:');
  console.log('  GET  http://localhost:3000/api/users');
  console.log('  GET  http://localhost:3000/api/users/123');
  console.log('  POST http://localhost:3000/api/users');
});

export default app;