import { createValidationTestServer } from './validation-test-server';
import { HttpClient } from './http-client';
import { TestRunner, assert, assertEqual, getRandomPort, waitForServer } from './test-utils';

async function runValidationE2ETests() {
  const runner = new TestRunner();
  const port = getRandomPort();
  const client = new HttpClient('localhost', port);
  let server: any;

  // Setup
  runner.test('Validation Server Setup', async () => {
    server = createValidationTestServer(port);
    
    server.listen();
    const isReady = await waitForServer('localhost', port);
    assert(isReady, 'Validation server should start successfully');
  });

  // Basic parameter validation tests
  runner.test('GET /api/validation/users/:id - Param validation', async () => {
    const response = await client.get('/api/validation/users/123');
    
    assertEqual(response.statusCode, 200, 'Should return 200 status');
    
    const data = response.json();
    assert(data.user.id === '123', 'Should return correct user ID');
    assert(data.user.name === 'User 123', 'Should return correct user name');
  });

  // Query parameter validation tests
  runner.test('GET /api/validation/users - Query validation', async () => {
    const response = await client.get('/api/validation/users?page=2&limit=5');
    
    assertEqual(response.statusCode, 200, 'Should return 200 status');
    
    const data = response.json();
    assert(data.pagination.page === 2, 'Should parse page query parameter');
    assert(data.pagination.limit === 5, 'Should parse limit query parameter');
  });

  // Valid body validation tests
  runner.test('POST /api/validation/users - Valid body validation', async () => {
    const userData = {
      name: 'Alice',
      age: 28,
      email: 'alice@example.com'
    };
    
    const response = await client.post('/api/validation/users', userData);
    
    assertEqual(response.statusCode, 200, 'Should return 200 status');
    
    const data = response.json();
    assert(data.success === true, 'Should create user successfully');
    assert(data.user.name === 'Alice', 'Should save correct name');
    assert(data.user.age === 28, 'Should save correct age');
    assert(data.user.email === 'alice@example.com', 'Should save correct email');
    assert(typeof data.user.id === 'number', 'Should assign numeric ID');
  });

  // Optional field validation tests
  runner.test('POST /api/validation/users - Optional field validation', async () => {
    const userData = {
      name: 'Bob',
      age: 35
      // email is optional
    };
    
    const response = await client.post('/api/validation/users', userData);
    
    assertEqual(response.statusCode, 200, 'Should return 200 status');
    
    const data = response.json();
    assert(data.success === true, 'Should create user successfully without email');
    assert(data.user.name === 'Bob', 'Should save correct name');
    assert(data.user.age === 35, 'Should save correct age');
  });

  // Body validation error tests
  runner.test('POST /api/validation/users - Invalid body validation', async () => {
    const invalidUserData = {
      name: 123, // Should be string
      age: 'invalid', // Should be number
      email: 'alice@example.com'
    };
    
    const response = await client.post('/api/validation/users', invalidUserData);
    
    assertEqual(response.statusCode, 400, 'Should return 400 status for validation error');
    
    const data = response.json();
    assert(data.error === 'Validation Error', 'Should return validation error');
    assert(Array.isArray(data.details), 'Should return error details');
    assert(data.details.length >= 2, 'Should have multiple validation errors');
  });

  // Missing required field tests
  runner.test('POST /api/validation/users - Missing required fields', async () => {
    const incompleteData = {
      name: 'John'
      // missing required age field
    };
    
    const response = await client.post('/api/validation/users', incompleteData);
    
    assertEqual(response.statusCode, 400, 'Should return 400 status for missing fields');
    
    const data = response.json();
    assert(data.error === 'Validation Error', 'Should return validation error');
  });

  // Custom validator tests
  runner.test('POST /api/validation/calculate - Custom validator (valid)', async () => {
    const response = await client.post('/api/validation/calculate?operation=square', 5);
    
    assertEqual(response.statusCode, 200, 'Should return 200 status');
    
    const data = response.json();
    assert(data.input === 5, 'Should receive correct input');
    assert(data.operation === 'square', 'Should receive correct operation');
    assert(data.result === 25, 'Should calculate correct result');
  });

  // Custom validator error tests
  runner.test('POST /api/validation/calculate - Custom validator (invalid)', async () => {
    const response = await client.post('/api/validation/calculate', -5);
    
    assertEqual(response.statusCode, 400, 'Should return 400 status for negative number');
    
    const data = response.json();
    assert(data.error === 'Validation Error', 'Should return validation error');
    assert(data.details.some((detail: any) => detail.message.includes('positive')), 'Should mention positive number requirement');
  });

  // Number transformation tests
  runner.test('POST /api/validation/calculate - Number transformation', async () => {
    const response = await client.post('/api/validation/calculate', '42'); // String that should be converted to number
    
    assertEqual(response.statusCode, 200, 'Should return 200 status');
    
    const data = response.json();
    assert(data.input === 42, 'Should transform string to number');
    assert(typeof data.input === 'number', 'Should be actual number type');
  });

  // All query parameters tests
  runner.test('GET /api/validation/search - All query parameters', async () => {
    const response = await client.get('/api/validation/search?q=test&category=tech&sort=date');
    
    assertEqual(response.statusCode, 200, 'Should return 200 status');
    
    const data = response.json();
    assert(data.query.q === 'test', 'Should capture query parameter');
    assert(data.query.category === 'tech', 'Should capture category parameter');
    assert(data.query.sort === 'date', 'Should capture sort parameter');
  });

  // Multiple parameters tests
  runner.test('GET /api/validation/user/:userId/posts/:postId - Multiple params', async () => {
    const response = await client.get('/api/validation/user/123/posts/456');
    
    assertEqual(response.statusCode, 200, 'Should return 200 status');
    
    const data = response.json();
    assert(data.userId === '123', 'Should extract userId parameter');
    assert(data.postId === '456', 'Should extract postId parameter');
    assert(data.post.id === '456', 'Should use postId in response');
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

// Run the validation tests
runValidationE2ETests().catch((error) => {
  console.error('Validation E2E tests failed:', error);
  process.exit(1);
});