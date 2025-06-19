import 'reflect-metadata';
import {
  createApp,
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  stringValidator,
  numberValidator,
  objectValidator,
  optionalValidator
} from '../../src/index';

// Custom validators for testing
const userValidator = objectValidator({
  name: stringValidator,
  age: numberValidator,
  email: optionalValidator(stringValidator)
});

const positiveNumberValidator = (value: unknown) => {
  const result = numberValidator(value);
  if (!result.success) return result;
  
  if (result.data! <= 0) {
    return {
      success: false,
      errors: [{ field: 'root', message: 'Number must be positive', value }]
    };
  }
  
  return result;
};

// Test controller with validation
@Controller('/api/validation')
class ValidationController {
  @Get('/users/:id')
  static async getUser(@Param('id') id: string) {
    return {
      user: {
        id,
        name: `User ${id}`,
        email: `user${id}@example.com`
      }
    };
  }

  @Post('/users')
  static async createUser(@Body(userValidator) userData: { name: string; age: number; email?: string }) {
    return {
      success: true,
      user: {
        id: Date.now(),
        ...userData,
        createdAt: new Date().toISOString()
      }
    };
  }

  @Get('/users')
  static async getUsers(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10'
  ) {
    return {
      users: [
        { id: 1, name: 'John', age: 30 },
        { id: 2, name: 'Jane', age: 25 }
      ],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: 2
      }
    };
  }

  @Post('/calculate')
  static async calculate(
    @Body(positiveNumberValidator) number: number,
    @Query('operation') operation: string = 'square'
  ) {
    let result: number;
    
    switch (operation) {
      case 'square':
        result = number * number;
        break;
      case 'double':
        result = number * 2;
        break;
      default:
        result = number;
    }
    
    return {
      input: number,
      operation,
      result
    };
  }

  @Get('/search')
  static async search(@Query() query: Record<string, string | string[]>) {
    return {
      query,
      results: []
    };
  }

  @Get('/user/:userId/posts/:postId')
  static async getUserPost(
    @Param('userId') userId: string,
    @Param('postId') postId: string
  ) {
    return {
      userId,
      postId,
      post: {
        id: postId,
        title: `Post ${postId} by User ${userId}`,
        content: 'Lorem ipsum...'
      }
    };
  }
}

export function createValidationTestServer(port: number = 0) {
  const app = createApp({ port });
  
  // Register the validation controller
  app.registerController(ValidationController);
  
  return app;
}