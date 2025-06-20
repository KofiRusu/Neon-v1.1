// Jest setup file for global test configuration

// Set test timeout
jest.setTimeout(10000);

// Mock console methods in tests to keep output clean
global.console = {
  ...console,
  // Uncomment to ignore specific console methods in tests
  // log: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

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
