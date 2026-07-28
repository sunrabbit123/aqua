import 'reflect-metadata';
import {
  createApp,
  Controller,
  Get,
  Post,
  TypiaBody as Body,
  TypiaParam as Param,
  TypiaQuery as Query
} from '../../src/index';

// TypeScript interfaces that will be validated by typia
interface User {
  name: string;
  age: number;
  email?: string;
}

interface CreateUserDto {
  name: string;
  age: number;
  email?: string;
  isActive?: boolean;
}

interface SearchQuery {
  q: string;
  page?: number;
  limit?: number;
}

// Test controller with typia-based validation
@Controller('/api/typia')
class TypiaValidationController {
  @Get('/users/:id')
  static async getUser(@Param('id') id: number) {
    return {
      user: {
        id,
        name: `User ${id}`,
        email: `user${id}@example.com`
      }
    };
  }

  @Post('/users')
  static async createUser(@Body() userData: CreateUserDto) {
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
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    return {
      users: [
        { id: 1, name: 'John', age: 30 },
        { id: 2, name: 'Jane', age: 25 }
      ],
      pagination: {
        page,
        limit,
        total: 2
      }
    };
  }

  @Post('/calculate')
  static async calculate(
    @Body() number: number,
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
  static async search(@Query() query: SearchQuery) {
    return {
      query,
      results: []
    };
  }

  @Get('/user/:userId/posts/:postId')
  static async getUserPost(
    @Param('userId') userId: number,
    @Param('postId') postId: number
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

  @Post('/complex')
  static async complexValidation(
    @Body() 
    data: { user: User; metadata: { tags: string[]; priority: number } }
  ) {
    return {
      success: true,
      processed: data
    };
  }
}

export function createTypiaValidationTestServer(port: number = 0) {
  const app = createApp({ port });
  
  // Register the typia validation controller
  app.registerController(TypiaValidationController);
  
  return app;
}