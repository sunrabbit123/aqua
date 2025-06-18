# Aqua Framework

A TypeScript API server framework featuring decorator-based static method controllers and functional service/domain layers.

## Features

- **Static Method Controllers**: Use decorators with static methods for clean, lightweight controllers
- **Functional Service/Domain Layers**: Pure functions instead of classes for business logic
- **TypeScript First**: Full TypeScript support with type safety
- **Decorator-Based Routing**: Intuitive routing with `@Get`, `@Post`, etc.
- **Middleware Support**: Flexible middleware system
- **Minimal Dependencies**: Lightweight with only essential dependencies

## Installation

```bash
pnpm install aqua-framework
```

## Quick Start

```typescript
import { createApp, Controller, Get, Post, createService, createDomain } from 'aqua-framework';

// Domain functions
const validateUser = createDomain((userData: any) => {
  if (!userData.name) throw new Error('Name required');
  return userData;
});

// Service functions
const userService = {
  getAll: createService(() => [{ id: 1, name: 'John' }]),
  create: createService((data: any) => validateUser(data))
};

// Controller with static methods
@Controller('/api/users')
class UserController {
  @Get('/')
  static async getUsers() {
    return userService.getAll();
  }

  @Post('/')
  static async createUser(req: Request) {
    return userService.create(req.body);
  }
}

// Create app
const app = createApp({ port: 3000 });
app.registerController(UserController);
app.listen(() => console.log('Server running'));
```

## Development

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build project
pnpm build

# Run tests
pnpm test

# Run all tests
pnpm test:all
```

## Architecture

- **Controllers**: Static methods with decorators
- **Services**: Pure functions for business logic
- **Domain**: Pure functions for domain validation/transformation
- **No Classes**: Minimal class usage, functional approach preferred

## Available Decorators

- `@Controller(prefix?)` - Class decorator for route prefix
- `@Get(path)` - GET route
- `@Post(path)` - POST route
- `@Put(path)` - PUT route
- `@Delete(path)` - DELETE route
- `@Patch(path)` - PATCH route

## Functional Utilities

- `createService()` - Service function wrapper
- `createDomain()` - Domain function wrapper
- `compose()` - Function composition
- `pipe()` - Pipeline operations
- `curry()` - Function currying
- `memoize()` - Function memoization