module.exports = {
  // Specify the test environment
  testEnvironment: 'node',

  // Specify file extensions to be treated as test files
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],

  // Specify file extensions to be treated as modules
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],

  // Configure module resolution
  moduleDirectories: ['node_modules', '.'],

  // Transform TypeScript files using Babel
  transform: {
    '^.+\\.(ts|tsx)$': 'babel-jest',
  },

  // Handle TypeScript paths
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  // Indicates whether the coverage information should be collected
  collectCoverage: true,

  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',

  // Indicates which files should be tested for coverage
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/types/**/*.ts'],

  // Set timeout for tests (30 seconds)
  testTimeout: 30000,

  // Set verbose output
  verbose: true,

  // Set up global setup/teardown
  globalSetup: './tests/setup.js',
  globalTeardown: './tests/teardown.js',

  // Set up test groups
  projects: [
    {
      displayName: 'unit',
      testMatch: ['<rootDir>/tests/unit/**/*.test.ts'],
    },
    {
      displayName: 'e2e',
      testMatch: ['<rootDir>/tests/e2e/**/*.test.ts'],
    },
  ],

  // Skip tests in CI environment if specified
  testPathIgnorePatterns:
    process.env.CI === 'true' && process.env.SKIP_LONG_RUNNING_TESTS === 'true'
      ? ['<rootDir>/tests/e2e/']
      : [],
}
