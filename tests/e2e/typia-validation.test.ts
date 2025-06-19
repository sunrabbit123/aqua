import { createTypiaValidationTestServer } from './typia-validation-test-server';
import { HttpClient } from './http-client';
import { TestRunner, assert, assertEqual, getRandomPort, waitForServer } from './test-utils';

async function runTypiaValidationE2ETests() {
  const runner = new TestRunner();
  const port = getRandomPort();
  const client = new HttpClient('localhost', port);
  let server: any;

  // Setup
  runner.test('Typia Validation Server Setup', async () => {
    server = createTypiaValidationTestServer(port);
    
    server.listen();
    const isReady = await waitForServer('localhost', port);
    assert(isReady, 'Typia validation server should start successfully');
  });

  // Number parameter validation tests
  runner.test('GET /api/typia/users/:id - Number param validation', async () => {
    const response = await client.get('/api/typia/users/123');
    
    assertEqual(response.statusCode, 200, 'Should return 200 status');
    
    const data = response.json();
    assert(data.user.id === 123, 'Should convert string param to number');
    assert(typeof data.user.id === 'number', 'Should be actual number type');
  });

  // Query parameter type conversion tests
  runner.test('GET /api/typia/users - Query type conversion', async () => {
    const response = await client.get('/api/typia/users?page=2&limit=5');
    
    assertEqual(response.statusCode, 200, 'Should return 200 status');
    
    const data = response.json();
    assert(data.pagination.page === 2, 'Should convert page string to number');
    assert(data.pagination.limit === 5, 'Should convert limit string to number');
    assert(typeof data.pagination.page === 'number', 'Page should be number type');
    assert(typeof data.pagination.limit === 'number', 'Limit should be number type');
  });

  // Valid body validation with interface
  runner.test('POST /api/typia/users - Valid interface validation', async () => {
    const userData = {
      name: 'Alice',
      age: 28,
      email: 'alice@example.com',
      isActive: true
    };
    
    const response = await client.post('/api/typia/users', userData);
    
    assertEqual(response.statusCode, 200, 'Should return 200 status');
    
    const data = response.json();
    assert(data.success === true, 'Should create user successfully');
    assert(data.user.name === 'Alice', 'Should save correct name');
    assert(data.user.age === 28, 'Should save correct age');
    assert(data.user.email === 'alice@example.com', 'Should save correct email');
    assert(data.user.isActive === true, 'Should save correct isActive');
  });

  // Optional field validation
  runner.test('POST /api/typia/users - Optional field handling', async () => {
    const userData = {
      name: 'Bob',
      age: 35
      // email and isActive are optional
    };
    
    const response = await client.post('/api/typia/users', userData);
    
    assertEqual(response.statusCode, 200, 'Should return 200 status');
    
    const data = response.json();
    assert(data.success === true, 'Should create user successfully without optional fields');
    assert(data.user.name === 'Bob', 'Should save correct name');
    assert(data.user.age === 35, 'Should save correct age');
  });

  // Type validation error tests
  runner.test('POST /api/typia/users - Type validation errors', async () => {
    const invalidUserData = {
      name: 123, // Should be string
      age: 'invalid', // Should be number
      email: true // Should be string
    };
    
    const response = await client.post('/api/typia/users', invalidUserData);
    
    assertEqual(response.statusCode, 400, 'Should return 400 status for type errors');
    
    const data = response.json();
    assert(data.error === 'Validation Error', 'Should return validation error');
    assert(Array.isArray(data.details), 'Should return error details');
  });

  // Missing required field tests
  runner.test('POST /api/typia/users - Missing required fields', async () => {
    const incompleteData = {
      name: 'John'
      // missing required age field
    };
    
    const response = await client.post('/api/typia/users', incompleteData);
    
    assertEqual(response.statusCode, 400, 'Should return 400 status for missing fields');
    
    const data = response.json();
    assert(data.error === 'Validation Error', 'Should return validation error');
  });

  // Primitive type body validation
  runner.test('POST /api/typia/calculate - Primitive type validation', async () => {
    const response = await client.post('/api/typia/calculate?operation=square', 5);
    
    assertEqual(response.statusCode, 200, 'Should return 200 status');
    
    const data = response.json();
    assert(data.input === 5, 'Should receive correct input');
    assert(data.operation === 'square', 'Should receive correct operation');
    assert(data.result === 25, 'Should calculate correct result');
  });

  // String to number conversion for body
  runner.test('POST /api/typia/calculate - String to number conversion', async () => {
    const response = await client.post('/api/typia/calculate', '42');
    
    assertEqual(response.statusCode, 200, 'Should return 200 status');
    
    const data = response.json();
    assert(data.input === 42, 'Should convert string to number');
    assert(typeof data.input === 'number', 'Should be actual number type');
  });

  // Complex object validation
  runner.test('POST /api/typia/complex - Complex object validation', async () => {
    const complexData = {
      user: {
        name: 'Charlie',
        age: 30,
        email: 'charlie@example.com'
      },
      metadata: {
        tags: ['important', 'user'],
        priority: 1
      }
    };
    
    const response = await client.post('/api/typia/complex', complexData);
    
    assertEqual(response.statusCode, 200, 'Should return 200 status');
    
    const data = response.json();
    assert(data.success === true, 'Should process complex object successfully');
    assert(data.processed.user.name === 'Charlie', 'Should preserve nested user data');
    assert(Array.isArray(data.processed.metadata.tags), 'Should preserve array data');
    assert(data.processed.metadata.priority === 1, 'Should preserve number data');
  });

  // Multiple parameters with different types
  runner.test('GET /api/typia/user/:userId/posts/:postId - Multiple typed params', async () => {
    const response = await client.get('/api/typia/user/123/posts/456');
    
    assertEqual(response.statusCode, 200, 'Should return 200 status');
    
    const data = response.json();
    assert(data.userId === 123, 'Should convert userId to number');
    assert(data.postId === 456, 'Should convert postId to number');
    assert(typeof data.userId === 'number', 'UserId should be number type');
    assert(typeof data.postId === 'number', 'PostId should be number type');
  });

  // Complex query object validation
  runner.test('GET /api/typia/search - Complex query validation', async () => {
    const response = await client.get('/api/typia/search?q=test&page=2&limit=10');
    
    assertEqual(response.statusCode, 200, 'Should return 200 status');
    
    const data = response.json();
    assert(data.query.q === 'test', 'Should capture query string');
    assert(data.query.page === 2, 'Should convert page to number');
    assert(data.query.limit === 10, 'Should convert limit to number');
    assert(typeof data.query.page === 'number', 'Page should be number type');
    assert(typeof data.query.limit === 'number', 'Limit should be number type');
  });

  // Run all tests
  const results = await runner.run();
  
  // Cleanup
  if (server) {
    server.close();
  }

  // Exit with proper code
  const failedCount = results.filter(r => !r.passed).length;
  process.exit(failedCount > 0 ? 1 : 0);
}

// Run the typia validation tests
runTypiaValidationE2ETests().catch((error) => {
  console.error('Typia validation E2E tests failed:', error);
  process.exit(1);
});