/**
 * Test Configuration Manager
 *
 * This module provides configuration settings for the test suite,
 * including server connection details and test behavior options.
 */

/**
 * Default test configuration
 */
const defaultConfig = {
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
function getConfig() {
  return {
    ...defaultConfig,
    // Add any dynamic configuration here
  }
}

/**
 * Check if tests should be skipped in CI environment
 *
 * @param {string} testName Optional test name for logging
 * @returns {boolean} True if the test should be skipped
 */
function shouldSkipInCI(testName) {
  const config = getConfig()
  const shouldSkip = config.ci.enabled && config.ci.skipLongRunning

  if (shouldSkip && testName) {
    console.error(`Skipping test "${testName}" in CI environment`)
  }

  return shouldSkip
}

module.exports = {
  getConfig,
  shouldSkipInCI,
  defaultConfig,
}
