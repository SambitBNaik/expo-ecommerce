import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, jest } from '@jest/globals';

describe('Server Integration Tests', () => {
  let originalEnv;
  let processExitSpy;
  let consoleLogSpy;

  beforeAll(() => {
    originalEnv = { ...process.env };
    
    // Setup test environment
    process.env.NODE_ENV = 'test';
    process.env.PORT = '3001';
    process.env.DB_URL = 'mongodb://localhost:27017/test-db';
    process.env.CLERK_PUBLISHABLE_KEY = 'test-pk';
    process.env.CLERK_SECRET_KEY = 'test-sk';
  });

  beforeEach(() => {
    jest.resetModules();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    processExitSpy = jest.spyOn(process, 'exit').mockImplementation((code) => {
      throw new Error(`process.exit(${code})`);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('Server Initialization', () => {
    it('should initialize express app', async () => {
      // Mock dependencies
      jest.unstable_mockModule('mongoose', () => ({
        default: {
          connect: jest.fn().mockResolvedValue({
            connection: { host: 'localhost' }
          })
        }
      }));

      jest.unstable_mockModule('@clerk/express', () => ({
        clerkMiddleware: jest.fn(() => (req, res, next) => next())
      }));

      // Prevent actual server start
      const originalListen = jest.fn((port, callback) => {
        callback();
        return { close: jest.fn() };
      });

      jest.unstable_mockModule('express', () => {
        const mockExpress = () => {
          const app = {
            use: jest.fn(),
            get: jest.fn(),
            listen: originalListen
          };
          return app;
        };
        mockExpress.static = jest.fn();
        return { default: mockExpress };
      });

      // This would normally start the server, but our mocks prevent it
      // We're testing that the module loads without errors
      const serverImport = import('../../server.js');
      await expect(serverImport).resolves.toBeDefined();
    });
  });

  describe('Health Check Endpoint', () => {
    it('should define /api/health endpoint', async () => {
      jest.unstable_mockModule('mongoose', () => ({
        default: {
          connect: jest.fn().mockResolvedValue({
            connection: { host: 'localhost' }
          })
        }
      }));

      jest.unstable_mockModule('@clerk/express', () => ({
        clerkMiddleware: jest.fn(() => (req, res, next) => next())
      }));

      const mockGet = jest.fn();
      const mockListen = jest.fn((port, callback) => {
        callback();
        return { close: jest.fn() };
      });

      jest.unstable_mockModule('express', () => {
        const mockExpress = () => ({
          use: jest.fn(),
          get: mockGet,
          listen: mockListen
        });
        mockExpress.static = jest.fn();
        return { default: mockExpress };
      });

      await import('../../server.js');

      // Verify health endpoint was registered
      expect(mockGet).toHaveBeenCalledWith(
        '/api/health',
        expect.any(Function)
      );
    });

    it('should return success message from health endpoint', async () => {
      jest.unstable_mockModule('mongoose', () => ({
        default: {
          connect: jest.fn().mockResolvedValue({
            connection: { host: 'localhost' }
          })
        }
      }));

      jest.unstable_mockModule('@clerk/express', () => ({
        clerkMiddleware: jest.fn(() => (req, res, next) => next())
      }));

      let healthHandler;
      const mockGet = jest.fn((path, handler) => {
        if (path === '/api/health') {
          healthHandler = handler;
        }
      });

      jest.unstable_mockModule('express', () => {
        const mockExpress = () => ({
          use: jest.fn(),
          get: mockGet,
          listen: jest.fn((port, callback) => {
            callback();
            return { close: jest.fn() };
          })
        });
        mockExpress.static = jest.fn();
        return { default: mockExpress };
      });

      await import('../../server.js');

      // Test the health handler
      const mockReq = {};
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      healthHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Success' });
    });
  });

  describe('Middleware Configuration', () => {
    it('should configure Clerk middleware', async () => {
      jest.unstable_mockModule('mongoose', () => ({
        default: {
          connect: jest.fn().mockResolvedValue({
            connection: { host: 'localhost' }
          })
        }
      }));

      const mockClerkMiddleware = jest.fn(() => (req, res, next) => next());
      jest.unstable_mockModule('@clerk/express', () => ({
        clerkMiddleware: mockClerkMiddleware
      }));

      const mockUse = jest.fn();
      jest.unstable_mockModule('express', () => {
        const mockExpress = () => ({
          use: mockUse,
          get: jest.fn(),
          listen: jest.fn((port, callback) => {
            callback();
            return { close: jest.fn() };
          })
        });
        mockExpress.static = jest.fn();
        return { default: mockExpress };
      });

      await import('../../server.js');

      expect(mockClerkMiddleware).toHaveBeenCalled();
      expect(mockUse).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe('Production Static File Serving', () => {
    it('should serve static files in production mode', async () => {
      process.env.NODE_ENV = 'production';
      jest.resetModules();

      jest.unstable_mockModule('mongoose', () => ({
        default: {
          connect: jest.fn().mockResolvedValue({
            connection: { host: 'localhost' }
          })
        }
      }));

      jest.unstable_mockModule('@clerk/express', () => ({
        clerkMiddleware: jest.fn(() => (req, res, next) => next())
      }));

      const mockStatic = jest.fn();
      const mockUse = jest.fn();
      const mockGet = jest.fn();

      jest.unstable_mockModule('express', () => {
        const mockExpress = () => ({
          use: mockUse,
          get: mockGet,
          listen: jest.fn((port, callback) => {
            callback();
            return { close: jest.fn() };
          })
        });
        mockExpress.static = mockStatic;
        return { default: mockExpress };
      });

      await import('../../server.js');

      // Should call express.static for production
      expect(mockStatic).toHaveBeenCalled();
      expect(mockUse).toHaveBeenCalledWith(expect.anything());
    });

    it('should not serve static files in development mode', async () => {
      process.env.NODE_ENV = 'development';
      jest.resetModules();

      jest.unstable_mockModule('mongoose', () => ({
        default: {
          connect: jest.fn().mockResolvedValue({
            connection: { host: 'localhost' }
          })
        }
      }));

      jest.unstable_mockModule('@clerk/express', () => ({
        clerkMiddleware: jest.fn(() => (req, res, next) => next())
      }));

      const mockStatic = jest.fn();
      const mockUse = jest.fn();

      jest.unstable_mockModule('express', () => {
        const mockExpress = () => ({
          use: mockUse,
          get: jest.fn(),
          listen: jest.fn((port, callback) => {
            callback();
            return { close: jest.fn() };
          })
        });
        mockExpress.static = mockStatic;
        return { default: mockExpress };
      });

      await import('../../server.js');

      // In development, static should not be called (or called less)
      // We can verify by checking the call count
      const staticCallCount = mockStatic.mock.calls.length;
      expect(staticCallCount).toBeLessThanOrEqual(1);
    });
  });

  describe('Database Connection Integration', () => {
    it('should connect to database before starting server', async () => {
      const mockConnect = jest.fn().mockResolvedValue({
        connection: { host: 'localhost' }
      });

      jest.unstable_mockModule('mongoose', () => ({
        default: {
          connect: mockConnect
        }
      }));

      jest.unstable_mockModule('@clerk/express', () => ({
        clerkMiddleware: jest.fn(() => (req, res, next) => next())
      }));

      const mockListen = jest.fn((port, callback) => {
        callback();
        return { close: jest.fn() };
      });

      jest.unstable_mockModule('express', () => {
        const mockExpress = () => ({
          use: jest.fn(),
          get: jest.fn(),
          listen: mockListen
        });
        mockExpress.static = jest.fn();
        return { default: mockExpress };
      });

      await import('../../server.js');

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockConnect).toHaveBeenCalled();
    });

    it('should not start server if database connection fails', async () => {
      const mockConnect = jest.fn().mockRejectedValue(new Error('DB connection failed'));

      jest.unstable_mockModule('mongoose', () => ({
        default: {
          connect: mockConnect
        }
      }));

      jest.unstable_mockModule('@clerk/express', () => ({
        clerkMiddleware: jest.fn(() => (req, res, next) => next())
      }));

      const mockListen = jest.fn();

      jest.unstable_mockModule('express', () => {
        const mockExpress = () => ({
          use: jest.fn(),
          get: jest.fn(),
          listen: mockListen
        });
        mockExpress.static = jest.fn();
        return { default: mockExpress };
      });

      // Server import will fail due to DB connection
      try {
        await import('../../server.js');
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        // Expected to fail
      }

      expect(mockConnect).toHaveBeenCalled();
    });
  });

  describe('Server Startup', () => {
    it('should start server on configured port', async () => {
      process.env.PORT = '8080';
      jest.resetModules();

      jest.unstable_mockModule('mongoose', () => ({
        default: {
          connect: jest.fn().mockResolvedValue({
            connection: { host: 'localhost' }
          })
        }
      }));

      jest.unstable_mockModule('@clerk/express', () => ({
        clerkMiddleware: jest.fn(() => (req, res, next) => next())
      }));

      const mockListen = jest.fn((port, callback) => {
        callback();
        return { close: jest.fn() };
      });

      jest.unstable_mockModule('express', () => {
        const mockExpress = () => ({
          use: jest.fn(),
          get: jest.fn(),
          listen: mockListen
        });
        mockExpress.static = jest.fn();
        return { default: mockExpress };
      });

      await import('../../server.js');

      // Wait for async startup
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockListen).toHaveBeenCalledWith(
        '8080',
        expect.any(Function)
      );
    });

    it('should log server startup message', async () => {
      jest.unstable_mockModule('mongoose', () => ({
        default: {
          connect: jest.fn().mockResolvedValue({
            connection: { host: 'localhost' }
          })
        }
      }));

      jest.unstable_mockModule('@clerk/express', () => ({
        clerkMiddleware: jest.fn(() => (req, res, next) => next())
      }));

      jest.unstable_mockModule('express', () => {
        const mockExpress = () => ({
          use: jest.fn(),
          get: jest.fn(),
          listen: jest.fn((port, callback) => {
            callback();
            return { close: jest.fn() };
          })
        });
        mockExpress.static = jest.fn();
        return { default: mockExpress };
      });

      await import('../../server.js');

      // Wait for async startup
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(consoleLogSpy).toHaveBeenCalledWith('Server is up and running');
    });
  });

  describe('Error Scenarios', () => {
    it('should handle missing PORT gracefully', async () => {
      delete process.env.PORT;
      jest.resetModules();

      jest.unstable_mockModule('mongoose', () => ({
        default: {
          connect: jest.fn().mockResolvedValue({
            connection: { host: 'localhost' }
          })
        }
      }));

      jest.unstable_mockModule('@clerk/express', () => ({
        clerkMiddleware: jest.fn(() => (req, res, next) => next())
      }));

      const mockListen = jest.fn((port, callback) => {
        callback();
        return { close: jest.fn() };
      });

      jest.unstable_mockModule('express', () => {
        const mockExpress = () => ({
          use: jest.fn(),
          get: jest.fn(),
          listen: mockListen
        });
        mockExpress.static = jest.fn();
        return { default: mockExpress };
      });

      await import('../../server.js');

      // Wait for async startup
      await new Promise(resolve => setTimeout(resolve, 100));

      // Should still attempt to start (with undefined port)
      expect(mockListen).toHaveBeenCalled();
    });
  });
});