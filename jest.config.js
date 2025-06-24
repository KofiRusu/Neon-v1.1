module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  bail: false,
  maxWorkers: 1,
  roots: ['<rootDir>/packages/', '<rootDir>/apps/', '<rootDir>/tests/'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'packages/**/*.ts',
    'apps/**/*.ts',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/*.test.ts',
    '!**/*.spec.ts'
  ],
  moduleNameMapping: {
    '^@neon/(.*)$': '<rootDir>/packages/$1/src',
    '^@/(.*)$': '<rootDir>/packages/$1/src'
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testTimeout: 30000,
  verbose: true,
  detectOpenHandles: true,
  forceExit: true,
  clearMocks: true,
  restoreMocks: true
};
