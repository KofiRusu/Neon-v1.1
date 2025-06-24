// Jest setup for Neon v1.1 autonomous testing

// Set CI environment
process.env.CI = 'true';
process.env.NODE_ENV = 'test';

// Mock environment variables for testing
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.NEXTAUTH_SECRET = 'test-secret';
process.env.NEXTAUTH_URL = 'http://localhost:3000';

// Increase timeout for slower operations
jest.setTimeout(30000);

// Global test configuration
global.console = {
  ...console,
  // Suppress console.log during tests but keep errors
  log: jest.fn(),
  warn: jest.fn(),
  error: console.error,
};

// Mock external services
jest.mock('@sendgrid/mail', () => ({
  setApiKey: jest.fn(),
  send: jest.fn().mockResolvedValue([{ statusCode: 202 }]),
}));

jest.mock('twilio', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({ sid: 'test-sid' }),
    },
  })),
}));

// Mock Prisma client
jest.mock('@neon/data-model', () => ({
  prisma: {
    user: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
      delete: jest.fn().mockResolvedValue({}),
    },
    campaign: {
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
    },
    aIEventLog: {
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn().mockResolvedValue({}),
    },
  },
}));

// Global test utilities
global.testUtils = {
  // Add common test utilities here
  delay: ms => new Promise(resolve => setTimeout(resolve, ms)),

  // Mock async function
  mockAsync: (returnValue, delay = 0) =>
    jest
      .fn()
      .mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(returnValue), delay))
      ),
};

// Setup for specific test environments
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
});

afterEach(() => {
  // Cleanup after each test
  jest.restoreAllMocks();
});
