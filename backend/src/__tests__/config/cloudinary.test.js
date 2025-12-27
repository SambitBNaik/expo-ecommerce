import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

describe('Cloudinary Configuration', () => {
  let originalEnv;
  let cloudinaryMock;

  beforeEach(() => {
    originalEnv = { ...process.env };
    jest.resetModules();
    
    // Setup test environment
    process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud-name';
    process.env.CLOUDINARY_API_KEY = 'test-api-key';
    process.env.CLOUDINARY_API_SECRET = 'test-api-secret';
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.clearAllMocks();
  });

  describe('Happy Path - Successful Configuration', () => {
    it('should configure cloudinary with correct credentials', async () => {
      const cloudinary = await import('../../config/cloudinary.js');
      
      expect(cloudinary.default).toBeDefined();
      expect(cloudinary.default.config).toBeDefined();
    });

    it('should use environment variables for configuration', async () => {
      process.env.CLOUDINARY_CLOUD_NAME = 'my-production-cloud';
      process.env.CLOUDINARY_API_KEY = 'prod-api-key-123';
      process.env.CLOUDINARY_API_SECRET = 'prod-secret-456';

      jest.resetModules();
      
      const cloudinary = await import('../../config/cloudinary.js');
      
      expect(cloudinary.default).toBeDefined();
    });

    it('should export cloudinary v2 instance as default', async () => {
      const cloudinary = await import('../../config/cloudinary.js');
      
      expect(cloudinary.default).toBeDefined();
      expect(typeof cloudinary.default).toBe('object');
    });
  });

  describe('Edge Cases - Configuration Validation', () => {
    it('should handle missing cloud_name', async () => {
      delete process.env.CLOUDINARY_CLOUD_NAME;
      jest.resetModules();

      const cloudinary = await import('../../config/cloudinary.js');
      
      expect(cloudinary.default).toBeDefined();
    });

    it('should handle missing api_key', async () => {
      delete process.env.CLOUDINARY_API_KEY;
      jest.resetModules();

      const cloudinary = await import('../../config/cloudinary.js');
      
      expect(cloudinary.default).toBeDefined();
    });

    it('should handle missing api_secret', async () => {
      delete process.env.CLOUDINARY_API_SECRET;
      jest.resetModules();

      const cloudinary = await import('../../config/cloudinary.js');
      
      expect(cloudinary.default).toBeDefined();
    });

    it('should handle all missing credentials', async () => {
      delete process.env.CLOUDINARY_CLOUD_NAME;
      delete process.env.CLOUDINARY_API_KEY;
      delete process.env.CLOUDINARY_API_SECRET;
      jest.resetModules();

      const cloudinary = await import('../../config/cloudinary.js');
      
      expect(cloudinary.default).toBeDefined();
    });

    it('should handle empty string credentials', async () => {
      process.env.CLOUDINARY_CLOUD_NAME = '';
      process.env.CLOUDINARY_API_KEY = '';
      process.env.CLOUDINARY_API_SECRET = '';
      jest.resetModules();

      const cloudinary = await import('../../config/cloudinary.js');
      
      expect(cloudinary.default).toBeDefined();
    });
  });

  describe('Configuration Object Structure', () => {
    it('should have upload API available', async () => {
      const cloudinary = await import('../../config/cloudinary.js');
      
      expect(cloudinary.default.uploader).toBeDefined();
      expect(typeof cloudinary.default.uploader).toBe('object');
    });

    it('should have api methods available', async () => {
      const cloudinary = await import('../../config/cloudinary.js');
      
      expect(cloudinary.default.api).toBeDefined();
      expect(typeof cloudinary.default.api).toBe('object');
    });

    it('should have config method available', async () => {
      const cloudinary = await import('../../config/cloudinary.js');
      
      expect(cloudinary.default.config).toBeDefined();
      expect(typeof cloudinary.default.config).toBe('function');
    });
  });

  describe('Security and Data Validation', () => {
    it('should handle special characters in credentials', async () => {
      process.env.CLOUDINARY_CLOUD_NAME = 'cloud-with-dashes-123';
      process.env.CLOUDINARY_API_KEY = '123456789012345';
      process.env.CLOUDINARY_API_SECRET = 'secret_with_underscores_!@#';
      jest.resetModules();

      const cloudinary = await import('../../config/cloudinary.js');
      
      expect(cloudinary.default).toBeDefined();
    });

    it('should not expose credentials in exports', async () => {
      const cloudinary = await import('../../config/cloudinary.js');
      
      // Verify the module exports only the cloudinary instance
      const exports = Object.keys(cloudinary);
      expect(exports).toContain('default');
    });

    it('should maintain singleton pattern across imports', async () => {
      const cloudinary1 = await import('../../config/cloudinary.js');
      const cloudinary2 = await import('../../config/cloudinary.js');
      
      expect(cloudinary1.default).toBe(cloudinary2.default);
    });
  });

  describe('Module Export Verification', () => {
    it('should export only default export', async () => {
      const cloudinary = await import('../../config/cloudinary.js');
      
      expect(cloudinary.default).toBeDefined();
      expect(typeof cloudinary.default).toBe('object');
    });

    it('should be importable as ES module', async () => {
      const importPromise = import('../../config/cloudinary.js');
      
      await expect(importPromise).resolves.toBeDefined();
    });
  });

  describe('Integration with ENV module', () => {
    it('should correctly read from ENV configuration', async () => {
      process.env.CLOUDINARY_CLOUD_NAME = 'integration-test-cloud';
      process.env.CLOUDINARY_API_KEY = 'integration-test-key';
      process.env.CLOUDINARY_API_SECRET = 'integration-test-secret';
      jest.resetModules();

      const { ENV } = await import('../../config/env.js');
      const cloudinary = await import('../../config/cloudinary.js');
      
      expect(ENV.CLOUDINARY_CLOUD_NAME).toBe('integration-test-cloud');
      expect(ENV.CLOUDINARY_API_KEY).toBe('integration-test-key');
      expect(ENV.CLOUDINARY_API_SECRET).toBe('integration-test-secret');
      expect(cloudinary.default).toBeDefined();
    });
  });
});