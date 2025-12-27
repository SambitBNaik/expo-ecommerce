import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

describe('Database Configuration', () => {
  let originalEnv;
  let mongooseMock;
  let consoleErrorSpy;
  let consoleLogSpy;
  let processExitSpy;

  beforeEach(() => {
    originalEnv = { ...process.env };
    jest.resetModules();
    
    // Setup test environment
    process.env.DB_URL = 'mongodb://localhost:27017/test-db';
    
    // Spy on console methods
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    
    // Mock process.exit
    processExitSpy = jest.spyOn(process, 'exit').mockImplementation((code) => {
      throw new Error(`process.exit(${code})`);
    });
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('Happy Path - Successful Connection', () => {
    it('should successfully connect to MongoDB with valid URL', async () => {
      // Mock mongoose.connect to succeed
      const mockConnection = {
        connection: {
          host: 'localhost:27017'
        }
      };

      jest.unstable_mockModule('mongoose', () => ({
        default: {
          connect: jest.fn().mockResolvedValue(mockConnection)
        }
      }));

      const { connectDB } = await import('../../config/db.js');
      
      await connectDB();
      
      const mongoose = (await import('mongoose')).default;
      expect(mongoose.connect).toHaveBeenCalledWith('mongodb://localhost:27017/test-db');
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Connected to MONGODB:localhost:27017')
      );
    });

    it('should log connection host on successful connection', async () => {
      const mockConnection = {
        connection: {
          host: 'production-db.example.com:27017'
        }
      };

      jest.unstable_mockModule('mongoose', () => ({
        default: {
          connect: jest.fn().mockResolvedValue(mockConnection)
        }
      }));

      const { connectDB } = await import('../../config/db.js');
      
      await connectDB();
      
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('production-db.example.com:27017')
      );
    });

    it('should use DB_URL from environment', async () => {
      process.env.DB_URL = 'mongodb://custom-host:27017/custom-db';
      jest.resetModules();

      const mockConnection = {
        connection: {
          host: 'custom-host:27017'
        }
      };

      jest.unstable_mockModule('mongoose', () => ({
        default: {
          connect: jest.fn().mockResolvedValue(mockConnection)
        }
      }));

      const { connectDB } = await import('../../config/db.js');
      
      await connectDB();
      
      const mongoose = (await import('mongoose')).default;
      expect(mongoose.connect).toHaveBeenCalledWith('mongodb://custom-host:27017/custom-db');
    });
  });

  describe('Error Handling - Connection Failures', () => {
    it('should handle connection errors and exit process', async () => {
      const connectionError = new Error('Connection refused');

      jest.unstable_mockModule('mongoose', () => ({
        default: {
          connect: jest.fn().mockRejectedValue(connectionError)
        }
      }));

      const { connectDB } = await import('../../config/db.js');
      
      await expect(connectDB()).rejects.toThrow('process.exit(1)');
      expect(consoleErrorSpy).toHaveBeenCalledWith('💥 MONGODB connection error');
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should exit with code 1 on authentication failure', async () => {
      const authError = new Error('Authentication failed');

      jest.unstable_mockModule('mongoose', () => ({
        default: {
          connect: jest.fn().mockRejectedValue(authError)
        }
      }));

      const { connectDB } = await import('../../config/db.js');
      
      await expect(connectDB()).rejects.toThrow('process.exit(1)');
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should handle network timeout errors', async () => {
      const timeoutError = new Error('Connection timeout');
      timeoutError.name = 'MongoTimeoutError';

      jest.unstable_mockModule('mongoose', () => ({
        default: {
          connect: jest.fn().mockRejectedValue(timeoutError)
        }
      }));

      const { connectDB } = await import('../../config/db.js');
      
      await expect(connectDB()).rejects.toThrow('process.exit(1)');
      expect(consoleErrorSpy).toHaveBeenCalledWith('💥 MONGODB connection error');
    });

    it('should handle invalid connection string', async () => {
      const invalidUrlError = new Error('Invalid connection string');

      jest.unstable_mockModule('mongoose', () => ({
        default: {
          connect: jest.fn().mockRejectedValue(invalidUrlError)
        }
      }));

      const { connectDB } = await import('../../config/db.js');
      
      await expect(connectDB()).rejects.toThrow('process.exit(1)');
    });

    it('should handle missing DB_URL', async () => {
      delete process.env.DB_URL;
      jest.resetModules();

      jest.unstable_mockModule('mongoose', () => ({
        default: {
          connect: jest.fn().mockRejectedValue(new Error('No connection string'))
        }
      }));

      const { connectDB } = await import('../../config/db.js');
      
      await expect(connectDB()).rejects.toThrow('process.exit(1)');
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined DB_URL gracefully', async () => {
      delete process.env.DB_URL;
      jest.resetModules();

      jest.unstable_mockModule('mongoose', () => ({
        default: {
          connect: jest.fn().mockRejectedValue(new Error('undefined connection string'))
        }
      }));

      const { connectDB } = await import('../../config/db.js');
      
      await expect(connectDB()).rejects.toThrow('process.exit(1)');
    });

    it('should handle empty string DB_URL', async () => {
      process.env.DB_URL = '';
      jest.resetModules();

      jest.unstable_mockModule('mongoose', () => ({
        default: {
          connect: jest.fn().mockRejectedValue(new Error('empty connection string'))
        }
      }));

      const { connectDB } = await import('../../config/db.js');
      
      await expect(connectDB()).rejects.toThrow('process.exit(1)');
    });

    it('should handle connection with special characters in credentials', async () => {
      process.env.DB_URL = 'mongodb://user:p@ssw0rd!@localhost:27017/db';
      jest.resetModules();

      const mockConnection = {
        connection: {
          host: 'localhost:27017'
        }
      };

      jest.unstable_mockModule('mongoose', () => ({
        default: {
          connect: jest.fn().mockResolvedValue(mockConnection)
        }
      }));

      const { connectDB } = await import('../../config/db.js');
      
      await connectDB();
      
      const mongoose = (await import('mongoose')).default;
      expect(mongoose.connect).toHaveBeenCalledWith('mongodb://user:p@ssw0rd!@localhost:27017/db');
    });

    it('should handle MongoDB Atlas connection strings', async () => {
      process.env.DB_URL = 'mongodb+srv://user:pass@cluster.mongodb.net/db?retryWrites=true&w=majority';
      jest.resetModules();

      const mockConnection = {
        connection: {
          host: 'cluster.mongodb.net'
        }
      };

      jest.unstable_mockModule('mongoose', () => ({
        default: {
          connect: jest.fn().mockResolvedValue(mockConnection)
        }
      }));

      const { connectDB } = await import('../../config/db.js');
      
      await connectDB();
      
      const mongoose = (await import('mongoose')).default;
      expect(mongoose.connect).toHaveBeenCalledWith(
        'mongodb+srv://user:pass@cluster.mongodb.net/db?retryWrites=true&w=majority'
      );
    });
  });

  describe('Function Properties', () => {
    it('should export connectDB as a named export', async () => {
      jest.unstable_mockModule('mongoose', () => ({
        default: {
          connect: jest.fn().mockResolvedValue({
            connection: { host: 'localhost' }
          })
        }
      }));

      const dbModule = await import('../../config/db.js');
      
      expect(dbModule.connectDB).toBeDefined();
      expect(typeof dbModule.connectDB).toBe('function');
    });

    it('should be an async function', async () => {
      jest.unstable_mockModule('mongoose', () => ({
        default: {
          connect: jest.fn().mockResolvedValue({
            connection: { host: 'localhost' }
          })
        }
      }));

      const { connectDB } = await import('../../config/db.js');
      
      const result = connectDB();
      expect(result).toBeInstanceOf(Promise);
      await result;
    });

    it('should return undefined on success', async () => {
      jest.unstable_mockModule('mongoose', () => ({
        default: {
          connect: jest.fn().mockResolvedValue({
            connection: { host: 'localhost' }
          })
        }
      }));

      const { connectDB } = await import('../../config/db.js');
      
      const result = await connectDB();
      expect(result).toBeUndefined();
    });
  });

  describe('Integration with ENV module', () => {
    it('should read DB_URL from ENV configuration', async () => {
      process.env.DB_URL = 'mongodb://localhost:27017/integration-test';
      jest.resetModules();

      const mockConnection = {
        connection: {
          host: 'localhost:27017'
        }
      };

      jest.unstable_mockModule('mongoose', () => ({
        default: {
          connect: jest.fn().mockResolvedValue(mockConnection)
        }
      }));

      const { ENV } = await import('../../config/env.js');
      const { connectDB } = await import('../../config/db.js');
      
      expect(ENV.DB_URL).toBe('mongodb://localhost:27017/integration-test');
      await connectDB();
      
      const mongoose = (await import('mongoose')).default;
      expect(mongoose.connect).toHaveBeenCalledWith('mongodb://localhost:27017/integration-test');
    });
  });
});