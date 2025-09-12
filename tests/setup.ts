/**
 * Jest Global Setup
 *
 * This file is executed once before all tests are run.
 * It's used to set up global test environment.
 */

import { getConfig } from '../tests/utils/config'

export default async function globalSetup() {
  const config = getConfig()

  console.error(`\n${'='.repeat(80)}`)
  console.error(`\x1b[1m\x1b[36m  STARTING TEST SUITE\x1b[0m`)
  console.error(`\x1b[36m  Server URL: ${config.server.url}\x1b[0m`)
  console.error(`\x1b[36m  CI Mode: ${config.ci.enabled ? 'Enabled' : 'Disabled'}\x1b[0m`)
  console.error(
    `\x1b[36m  Skip Long Running Tests: ${config.ci.skipLongRunning ? 'Yes' : 'No'}\x1b[0m`,
  )
  console.error(`${'='.repeat(80)}\n`)

  // Add any global setup logic here
  // For example:
  // - Start test database
  // - Set up test environment variables
  // - Create test data

  // Return value is not used
  return
}
