module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapping: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      useESM: true,
      tsconfig: {
        module: 'esnext',
      },
    }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testMatch: [
    '**/__tests__/**/*.(ts|js)',
    '**/*.(test|spec).(ts|js)'
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/__tests__/**',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testTimeout: 30000,
  maxWorkers: 1,
  verbose: true,
  projects: [
    {
      displayName: 'core-agents',
      testMatch: ['<rootDir>/packages/core-agents/**/*.(test|spec).(ts|js)'],
      preset: 'ts-jest',
      testEnvironment: 'node',
      extensionsToTreatAsEsm: ['.ts'],
      moduleNameMapping: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
      },
      transform: {
        '^.+\\.tsx?$': ['ts-jest', {
          useESM: true,
          tsconfig: {
            module: 'esnext',
          },
        }],
      },
    },
    {
      displayName: 'reasoning-engine',
      testMatch: ['<rootDir>/packages/reasoning-engine/**/*.(test|spec).(ts|js)'],
      preset: 'ts-jest',
      testEnvironment: 'node',
    },
    {
      displayName: 'utils',
      testMatch: ['<rootDir>/packages/utils/**/*.(test|spec).(ts|js)'],
      preset: 'ts-jest',
      testEnvironment: 'node',
    },
  ],
};
