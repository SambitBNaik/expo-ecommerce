// Global test setup and teardown
import { jest } from '@jest/globals';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
};

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.DB_URL = 'mongodb://localhost:27017/test-db';
process.env.CLERK_PUBLISHABLE_KEY = 'test-publishable-key';
process.env.CLERK_SECRET_KEY = 'test-secret-key';
process.env.INNGEST_SIGNING_KEY = 'test-inngest-key';
process.env.CLOUDINARY_API_KEY = 'test-cloudinary-key';
process.env.CLOUDINARY_API_SECRET = 'test-cloudinary-secret';
process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud-name';

// Global test timeout
jest.setTimeout(10000);

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});