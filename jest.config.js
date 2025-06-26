module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testMatch: ['**/__tests__/**/*.(ts|js)', '**/*.(test|spec).(ts|js)'],
  collectCoverageFrom: [
    'packages/*/src/**/*.{ts,tsx}',
    'apps/*/src/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/*.test.{ts,tsx}',
    '!**/__tests__/**',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/coverage/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'clover', 'json'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testTimeout: 30000,
  maxWorkers: '50%',
  verbose: true,
  clearMocks: true,
  restoreMocks: true,
  projects: [
    {
      displayName: 'core-agents',
      testMatch: ['<rootDir>/packages/core-agents/**/*.(test|spec).(ts|js)'],
      preset: 'ts-jest',
      testEnvironment: 'node',
      transform: {
        '^.+\\.tsx?$': 'ts-jest',
      },
      modulePathIgnorePatterns: ['<rootDir>/packages/core-agents/dist/'],
    },
    {
      displayName: 'data-model',
      testMatch: ['<rootDir>/packages/data-model/**/*.(test|spec).(ts|js)'],
      preset: 'ts-jest',
      testEnvironment: 'node',
      transform: {
        '^.+\\.tsx?$': 'ts-jest',
      },
    },
    {
      displayName: 'reasoning-engine',
      testMatch: ['<rootDir>/packages/reasoning-engine/**/*.(test|spec).(ts|js)'],
      preset: 'ts-jest',
      testEnvironment: 'node',
      transform: {
        '^.+\\.tsx?$': 'ts-jest',
      },
    },
    {
      displayName: 'utils',
      testMatch: ['<rootDir>/packages/utils/**/*.(test|spec).(ts|js)'],
      preset: 'ts-jest',
      testEnvironment: 'node',
      transform: {
        '^.+\\.tsx?$': 'ts-jest',
      },
    },
    {
      displayName: 'types',
      testMatch: ['<rootDir>/packages/types/**/*.(test|spec).(ts|js)'],
      preset: 'ts-jest',
      testEnvironment: 'node',
      transform: {
        '^.+\\.tsx?$': 'ts-jest',
      },
    },
  ],
  // Global settings that apply to all projects
  globalSetup: undefined,
  globalTeardown: undefined,
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/packages/$1/src',
    '^@neon/(.*)$': '<rootDir>/packages/$1/src',
  },
};
