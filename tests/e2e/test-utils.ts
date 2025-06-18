export function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

export function assertEqual<T>(actual: T, expected: T, message?: string): void {
  const actualStr = JSON.stringify(actual);
  const expectedStr = JSON.stringify(expected);
  
  if (actualStr !== expectedStr) {
    const msg = message ? `${message}: ` : '';
    throw new Error(`${msg}Expected ${expectedStr}, but got ${actualStr}`);
  }
}

export function assertNotEqual<T>(actual: T, expected: T, message?: string): void {
  const actualStr = JSON.stringify(actual);
  const expectedStr = JSON.stringify(expected);
  
  if (actualStr === expectedStr) {
    const msg = message ? `${message}: ` : '';
    throw new Error(`${msg}Expected values to be different, but both were ${actualStr}`);
  }
}

export function assertContains(container: string, value: string, message?: string): void {
  if (!container.includes(value)) {
    const msg = message ? `${message}: ` : '';
    throw new Error(`${msg}Expected "${container}" to contain "${value}"`);
  }
}

export async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function getRandomPort(): number {
  return Math.floor(Math.random() * (65535 - 1024) + 1024);
}

export async function waitForServer(host: string, port: number, timeout: number = 5000): Promise<boolean> {
  const start = Date.now();
  
  while (Date.now() - start < timeout) {
    try {
      const http = await import('http');
      await new Promise<void>((resolve, reject) => {
        const req = http.request({ host, port, path: '/', timeout: 1000 }, (_res) => {
          resolve();
        });
        req.on('error', reject);
        req.end();
      });
      return true;
    } catch {
      await sleep(100);
    }
  }
  
  return false;
}

export interface TestResult {
  name: string;
  passed: boolean;
  error?: Error;
  duration: number;
}

export class TestRunner {
  private tests: Array<{ name: string; fn: () => Promise<void> | void }> = [];

  test(name: string, fn: () => Promise<void> | void): void {
    this.tests.push({ name, fn });
  }

  async run(): Promise<TestResult[]> {
    const results: TestResult[] = [];
    
    console.log(`Running ${this.tests.length} tests...\n`);
    
    for (const test of this.tests) {
      const start = Date.now();
      let passed = false;
      let error: Error | undefined;
      
      try {
        await test.fn();
        passed = true;
        console.log(`✅ ${test.name}`);
      } catch (err) {
        error = err as Error;
        console.log(`❌ ${test.name}: ${error.message}`);
      }
      
      const duration = Date.now() - start;
      results.push({ name: test.name, passed, error, duration });
    }
    
    const passedCount = results.filter(r => r.passed).length;
    const failedCount = results.length - passedCount;
    
    console.log(`\nResults: ${passedCount} passed, ${failedCount} failed`);
    
    if (failedCount > 0) {
      console.log('\nFailed tests:');
      results
        .filter(r => !r.passed)
        .forEach(r => console.log(`  - ${r.name}: ${r.error?.message}`));
    }
    
    return results;
  }
}