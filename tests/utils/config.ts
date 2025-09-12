/**
 * Test Configuration Manager
 *
 * This module provides configuration settings for the test suite,
 * including server connection details and test behavior options.
 */

export interface TestConfig {
  server: {
    host: string
    port: number
    url: string
  }
  timeouts: {
    connection: number
    response: number
    test: number
  }
  ci: {
    enabled: boolean
    skipLongRunning: boolean
  }
}

/**
 * Default test configuration
 */
export const defaultConfig: TestConfig = {
  server: {
    host: process.env.HOST || 'localhost',
    port: parseInt(process.env.PORT || '3001', 10),
    get url() {
      return `http://${this.host}:${this.port}`
    },
  },
  timeouts: {
    connection: 5000, // 5 seconds
    response: 10000, // 10 seconds
    test: 30000, // 30 seconds
  },
  ci: {
    enabled: process.env.CI === 'true',
    skipLongRunning: process.env.SKIP_LONG_RUNNING_TESTS === 'true',
  },
}

/**
 * Get the test configuration
 *
 * @returns The test configuration
 */
export function getConfig(): TestConfig {
  return {
    ...defaultConfig,
    // Add any dynamic configuration here
  }
}

/**
 * Check if tests should be skipped in CI environment
 *
 * @param testName Optional test name for logging
 * @returns True if the test should be skipped
 */
export function shouldSkipInCI(testName?: string): boolean {
  const config = getConfig()
  const shouldSkip = config.ci.enabled && config.ci.skipLongRunning

  if (shouldSkip && testName) {
    console.error(`Skipping test "${testName}" in CI environment`)
  }

  return shouldSkip
}
