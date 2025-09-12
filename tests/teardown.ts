/**
 * Jest Global Teardown
 *
 * This file is executed once after all tests are run.
 * It's used to clean up the global test environment.
 */

export default async function globalTeardown() {
  console.error(`\n${'='.repeat(80)}`)
  console.error(`\x1b[1m\x1b[36m  TEST SUITE COMPLETED\x1b[0m`)
  console.error(`${'='.repeat(80)}\n`)

  // Add any global teardown logic here
  // For example:
  // - Stop test database
  // - Clean up test environment variables
  // - Remove test data

  // Return value is not used
  return
}
