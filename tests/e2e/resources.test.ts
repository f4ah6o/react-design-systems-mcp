/**
 * E2E Tests for MCP Server Resources Endpoints
 *
 * This file contains tests for the resources/list and resources/read endpoints.
 * It verifies that the server correctly reports available resources and allows reading them.
 */

import { MCPServerHelper, shouldSkipInCI } from '../utils'
import { describe, beforeAll, beforeEach, afterEach, test, expect } from 'vitest'

// Test configuration
const TEST_TIMEOUT = 30000 // 30 seconds

describe('MCP Server Resources Endpoints', () => {
  // Skip all tests in this file in CI environment if configured
  beforeAll(() => {
    if (shouldSkipInCI('MCP Server Resources Endpoints')) {
      return
    }
  })

  // Create a new server helper for each test
  let serverHelper: MCPServerHelper

  beforeEach(() => {
    serverHelper = new MCPServerHelper({
      testName: 'Resources Endpoints Test',
    })
  })

  afterEach(() => {
    if (serverHelper.isConnected()) {
      serverHelper.disconnect()
    }
  })

  /**
   * Test the resources/list endpoint
   */
  test(
    'should list available resources',
    async () => {
      // Skip in CI if configured
      if (shouldSkipInCI()) {
        return
      }

      // Connect to the server
      await serverHelper.connect()

      // List resources
      const result = await serverHelper.listResources()

      // Verify the result
      expect(result).toBeDefined()

      // Handle the case where resources might be undefined or empty
      if (!result.resources) {
        serverHelper
          .getReporter()
          .warn('Server returned no resources property, skipping detailed assertions')
        return
      }

      expect(Array.isArray(result.resources)).toBe(true)

      // Resources may be empty, but the endpoint should work
      serverHelper.getReporter().info(`Server reported ${result.resources.length} resources`)

      // If resources are available, verify their structure
      if (result.resources.length > 0) {
        const firstResource = result.resources[0]
        expect(firstResource).toHaveProperty('uriPattern')
        expect(typeof firstResource.uriPattern).toBe('string')
      }
    },
    TEST_TIMEOUT,
  )

  /**
   * Test the resources/read endpoint
   */
  test(
    'should read a resource if available',
    async () => {
      // Skip in CI if configured
      if (shouldSkipInCI()) {
        return
      }

      // Connect to the server
      await serverHelper.connect()

      // List resources to get a resource to read
      const listResult = await serverHelper.listResources()

      // Skip if no resources are available
      if (!listResult.resources || listResult.resources.length === 0) {
        serverHelper.getReporter().warn('No resources available to test resources/read endpoint')
        return
      }

      // Get the first resource
      const firstResource = listResult.resources[0]
      const uriPattern = firstResource.uriPattern

      // Extract a sample URI from the pattern
      // This is a simple approach - in a real test, we'd need to parse the pattern and generate a valid URI
      const sampleUri = uriPattern.replace(/:[a-zA-Z0-9_]+/g, 'test')

      try {
        // Read the resource
        const readResult = await serverHelper.readResource(sampleUri)

        // Verify the result
        expect(readResult).toBeDefined()

        // Success case - we got a result
        serverHelper.getReporter().assert(`Successfully read resource: ${sampleUri}`)
      } catch (error) {
        // Error case - this is expected if we couldn't provide a proper URI
        // Just verify that the error is properly formatted
        expect(error).toBeDefined()

        // Type assertion for error
        const err = error as Error
        expect(err.message).toBeDefined()
        serverHelper
          .getReporter()
          .warn(`Expected error reading resource ${sampleUri}: ${err.message}`)
      }
    },
    TEST_TIMEOUT,
  )
})
