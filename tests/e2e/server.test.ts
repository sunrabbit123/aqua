import { createTestServer } from './test-server';
import { HttpClient } from './http-client';
import { TestRunner, assert, assertEqual, getRandomPort, waitForServer } from './test-utils';

async function runE2ETests() {
  const runner = new TestRunner();
  const port = getRandomPort();
  const client = new HttpClient('localhost', port);
  let server: any;

  // Setup
  runner.test('Server Setup', async () => {
    server = createTestServer(port);
    
    server.listen();
    const isReady = await waitForServer('localhost', port);
    assert(isReady, 'Server should start successfully');
  });

  // Health check test
  runner.test('GET /api/health - Health check', async () => {
    const response = await client.get('/api/health');
    
    assertEqual(response.statusCode, 200, 'Should return 200 status');
    
    const data = response.json();
    assert(data.status === 'ok', 'Should return ok status');
    assert(typeof data.timestamp === 'string', 'Should return timestamp');
  });

  // Get users test
  runner.test('GET /api/users - Get all users', async () => {
    const response = await client.get('/api/users');
    
    assertEqual(response.statusCode, 200, 'Should return 200 status');
    
    const data = response.json();
    assert(Array.isArray(data.users), 'Should return users array');
    assertEqual(data.users.length, 2, 'Should return 2 users');
    
    const firstUser = data.users[0];
    assert(firstUser.id === 1, 'First user should have id 1');
    assert(firstUser.name === 'John', 'First user should be John');
    assert(firstUser.email === 'john@example.com', 'First user should have correct email');
  });

  // Get user by ID test
  runner.test('GET /api/users/:id - Get user by ID', async () => {
    const response = await client.get('/api/users/123');
    
    assertEqual(response.statusCode, 200, 'Should return 200 status');
    
    const data = response.json();
    assert(data.user.id === 123, 'Should return user with correct ID');
    assert(data.user.name === 'User 123', 'Should return user with correct name');
    assert(data.user.email === 'user123@example.com', 'Should return user with correct email');
  });

  // Create user - success test
  runner.test('POST /api/users - Create user (success)', async () => {
    const userData = {
      name: 'Alice',
      email: 'alice@example.com'
    };
    
    const response = await client.post('/api/users', userData);
    
    assertEqual(response.statusCode, 201, 'Should return 201 status');
    
    const data = response.json();
    assert(data.user.name === 'Alice', 'Should create user with correct name');
    assert(data.user.email === 'alice@example.com', 'Should create user with correct email');
    assert(typeof data.user.id === 'number', 'Should assign numeric ID');
    assert(typeof data.user.createdAt === 'string', 'Should add createdAt timestamp');
  });

  // Create user - validation error test
  runner.test('POST /api/users - Create user (validation error)', async () => {
    const userData = {
      name: 'Bob'
      // missing email
    };
    
    const response = await client.post('/api/users', userData);
    
    assertEqual(response.statusCode, 400, 'Should return 400 status');
    
    const data = response.json();
    assert(data.error === 'Name and email are required', 'Should return validation error');
  });

  // 404 test
  runner.test('GET /nonexistent - 404 handling', async () => {
    const response = await client.get('/nonexistent');
    
    assertEqual(response.statusCode, 404, 'Should return 404 status');
    
    const data = response.json();
    assert(data.error === 'Not Found', 'Should return not found error');
  });

  // Middleware test
  runner.test('GET /middleware/protected - Middleware functionality', async () => {
    const response = await client.get('/middleware/protected', {
      'x-user-id': 'user123'
    });
    
    assertEqual(response.statusCode, 200, 'Should return 200 status');
    
    const data = response.json();
    assert(data.message === 'Access granted', 'Should return access granted message');
    assert(data.user === 'user123', 'Should pass header through middleware');
  });

  // Method not allowed test
  runner.test('DELETE /api/users - Method not allowed', async () => {
    const response = await client.delete('/api/users');
    
    assertEqual(response.statusCode, 404, 'Should return 404 for unhandled method');
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

// Run the tests
runE2ETests().catch((error) => {
  console.error('E2E tests failed:', error);
  process.exit(1);
});