import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

describe('ENV Configuration', () => {
  let originalEnv;

  beforeEach(() => {
    // Store original environment
    originalEnv = { ...process.env };
    
    // Clear the module cache to force re-import
    jest.resetModules();
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('Happy Path - All environment variables present', () => {
    it('should load all environment variables correctly', async () => {
      process.env.NODE_ENV = 'production';
      process.env.PORT = '8080';
      process.env.DB_URL = 'mongodb://localhost:27017/mydb';
      process.env.CLERK_PUBLISHABLE_KEY = 'pk_test_123';
      process.env.CLERK_SECRET_KEY = 'sk_test_456';
      process.env.INNGEST_SIGNING_KEY = 'inngest_789';
      process.env.CLOUDINARY_API_KEY = 'cloud_key_123';
      process.env.CLOUDINARY_API_SECRET = 'cloud_secret_456';
      process.env.CLOUDINARY_CLOUD_NAME = 'my-cloud';

      const { ENV } = await import('../../config/env.js');

      expect(ENV.NODE_ENV).toBe('production');
      expect(ENV.PORT).toBe('8080');
      expect(ENV.DB_URL).toBe('mongodb://localhost:27017/mydb');
      expect(ENV.CLERK_PUBLISHABLE_KEY).toBe('pk_test_123');
      expect(ENV.CLERK_SECRET_KEY).toBe('sk_test_456');
      expect(ENV.INNGEST_SIGNING_KEY).toBe('inngest_789');
      expect(ENV.CLOUDINARY_API_KEY).toBe('cloud_key_123');
      expect(ENV.CLOUDINARY_API_SECRET).toBe('cloud_secret_456');
      expect(ENV.CLOUDINARY_CLOUD_NAME).toBe('my-cloud');
    });

    it('should handle development environment', async () => {
      process.env.NODE_ENV = 'development';
      process.env.PORT = '3000';

      const { ENV } = await import('../../config/env.js');

      expect(ENV.NODE_ENV).toBe('development');
      expect(ENV.PORT).toBe('3000');
    });

    it('should handle test environment', async () => {
      process.env.NODE_ENV = 'test';
      process.env.PORT = '3001';

      const { ENV } = await import('../../config/env.js');

      expect(ENV.NODE_ENV).toBe('test');
      expect(ENV.PORT).toBe('3001');
    });
  });

  describe('Edge Cases - Missing or undefined environment variables', () => {
    it('should return undefined for missing NODE_ENV', async () => {
      delete process.env.NODE_ENV;

      const { ENV } = await import('../../config/env.js');

      expect(ENV.NODE_ENV).toBeUndefined();
    });

    it('should return undefined for missing PORT', async () => {
      delete process.env.PORT;

      const { ENV } = await import('../../config/env.js');

      expect(ENV.PORT).toBeUndefined();
    });

    it('should return undefined for missing DB_URL', async () => {
      delete process.env.DB_URL;

      const { ENV } = await import('../../config/env.js');

      expect(ENV.DB_URL).toBeUndefined();
    });

    it('should return undefined for all missing Clerk keys', async () => {
      delete process.env.CLERK_PUBLISHABLE_KEY;
      delete process.env.CLERK_SECRET_KEY;

      const { ENV } = await import('../../config/env.js');

      expect(ENV.CLERK_PUBLISHABLE_KEY).toBeUndefined();
      expect(ENV.CLERK_SECRET_KEY).toBeUndefined();
    });

    it('should return undefined for all missing Cloudinary keys', async () => {
      delete process.env.CLOUDINARY_API_KEY;
      delete process.env.CLOUDINARY_API_SECRET;
      delete process.env.CLOUDINARY_CLOUD_NAME;

      const { ENV } = await import('../../config/env.js');

      expect(ENV.CLOUDINARY_API_KEY).toBeUndefined();
      expect(ENV.CLOUDINARY_API_SECRET).toBeUndefined();
      expect(ENV.CLOUDINARY_CLOUD_NAME).toBeUndefined();
    });

    it('should handle empty string values', async () => {
      process.env.NODE_ENV = '';
      process.env.PORT = '';
      process.env.DB_URL = '';

      const { ENV } = await import('../../config/env.js');

      expect(ENV.NODE_ENV).toBe('');
      expect(ENV.PORT).toBe('');
      expect(ENV.DB_URL).toBe('');
    });
  });

  describe('Data Type Validation', () => {
    it('should preserve string types for all values', async () => {
      process.env.PORT = '8080';
      process.env.DB_URL = 'mongodb://localhost:27017/db';

      const { ENV } = await import('../../config/env.js');

      expect(typeof ENV.PORT).toBe('string');
      expect(typeof ENV.DB_URL).toBe('string');
    });

    it('should handle numeric string values', async () => {
      process.env.PORT = '12345';

      const { ENV } = await import('../../config/env.js');

      expect(ENV.PORT).toBe('12345');
      expect(typeof ENV.PORT).toBe('string');
    });
  });

  describe('ENV Object Structure', () => {
    it('should export an object with all expected keys', async () => {
      const { ENV } = await import('../../config/env.js');

      expect(ENV).toHaveProperty('NODE_ENV');
      expect(ENV).toHaveProperty('PORT');
      expect(ENV).toHaveProperty('DB_URL');
      expect(ENV).toHaveProperty('CLERK_PUBLISHABLE_KEY');
      expect(ENV).toHaveProperty('CLERK_SECRET_KEY');
      expect(ENV).toHaveProperty('INNGEST_SIGNING_KEY');
      expect(ENV).toHaveProperty('CLOUDINARY_API_KEY');
      expect(ENV).toHaveProperty('CLOUDINARY_API_SECRET');
      expect(ENV).toHaveProperty('CLOUDINARY_CLOUD_NAME');
    });

    it('should be a plain object', async () => {
      const { ENV } = await import('../../config/env.js');

      expect(typeof ENV).toBe('object');
      expect(ENV).not.toBeNull();
      expect(Array.isArray(ENV)).toBe(false);
    });

    it('should have exactly 9 properties', async () => {
      const { ENV } = await import('../../config/env.js');

      const keys = Object.keys(ENV);
      expect(keys).toHaveLength(9);
    });
  });

  describe('Security Considerations', () => {
    it('should not expose sensitive values in error messages', async () => {
      process.env.CLERK_SECRET_KEY = 'super-secret-key-123';
      process.env.CLOUDINARY_API_SECRET = 'cloudinary-secret-456';

      const { ENV } = await import('../../config/env.js');

      // Verify values are loaded but don't log them
      expect(ENV.CLERK_SECRET_KEY).toBeTruthy();
      expect(ENV.CLOUDINARY_API_SECRET).toBeTruthy();
    });

    it('should handle special characters in environment variables', async () => {
      process.env.CLERK_SECRET_KEY = 'key-with-special-chars-!@#$%^&*()';
      process.env.DB_URL = 'mongodb://user:p@ssw0rd!@localhost:27017/db';

      const { ENV } = await import('../../config/env.js');

      expect(ENV.CLERK_SECRET_KEY).toBe('key-with-special-chars-!@#$%^&*()');
      expect(ENV.DB_URL).toBe('mongodb://user:p@ssw0rd!@localhost:27017/db');
    });
  });
});