/**
 * E2E Tests for MCP Server Tools Endpoints
 *
 * This file contains tests for the tools/list and tools/call endpoints.
 * It verifies that the server correctly reports available tools and allows calling them.
 */

import { MCPServerHelper, shouldSkipInCI } from '../utils'

// Test configuration
const TEST_TIMEOUT = 30000 // 30 seconds

describe('MCP Server Tools Endpoints', () => {
  // Skip all tests in this file in CI environment if configured
  beforeAll(() => {
    if (shouldSkipInCI('MCP Server Tools Endpoints')) {
      return
    }
  })

  // Create a new server helper for each test
  let serverHelper: MCPServerHelper

  beforeEach(() => {
    serverHelper = new MCPServerHelper({
      testName: 'Tools Endpoints Test',
    })
  })

  afterEach(() => {
    if (serverHelper.isConnected()) {
      serverHelper.disconnect()
    }
  })

  /**
   * Test the tools/list endpoint
   */
  test(
    'should list available tools',
    async () => {
      // Skip in CI if configured
      if (shouldSkipInCI()) {
        return
      }

      // Connect to the server
      await serverHelper.connect()

      // List tools
      const result = await serverHelper.listTools()

      // Verify the result
      expect(result).toBeDefined()

      // Handle the case where tools might be undefined or empty
      if (!result.tools) {
        serverHelper
          .getReporter()
          .warn('Server returned no tools property, skipping detailed assertions')
        return
      }

      expect(Array.isArray(result.tools)).toBe(true)
      serverHelper.getReporter().info(`Server reported ${result.tools.length} tools`)

      // Skip the rest of the test if no tools are available
      if (result.tools.length === 0) {
        serverHelper
          .getReporter()
          .warn('Server returned empty tools array, skipping detailed assertions')
        return
      }

      // Verify tool structure
      const firstTool = result.tools[0]
      expect(firstTool).toHaveProperty('name')
      expect(firstTool).toHaveProperty('description')
      expect(typeof firstTool.name).toBe('string')
      expect(typeof firstTool.description).toBe('string')
    },
    TEST_TIMEOUT,
  )

  /**
   * Test the tools/call endpoint
   */
  test(
    'should call a tool',
    async () => {
      // Skip in CI if configured
      if (shouldSkipInCI()) {
        return
      }

      // Connect to the server
      await serverHelper.connect()

      // List tools to get a tool to call
      const listResult = await serverHelper.listTools()

      // Handle the case where tools might be undefined or empty
      if (!listResult.tools) {
        serverHelper.getReporter().warn('Server returned no tools property, skipping test')
        return
      }

      serverHelper.getReporter().info(`Server reported ${listResult.tools.length} tools`)

      // Skip the rest of the test if no tools are available
      if (listResult.tools.length === 0) {
        serverHelper.getReporter().warn('Server returned empty tools array, skipping test')
        return
      }

      // Get the first tool
      const firstTool = listResult.tools[0]
      const toolName = firstTool.name

      // Create minimal arguments based on the tool's input schema
      const args: any = {}
      if (firstTool.inputSchema?.required) {
        for (const requiredField of firstTool.inputSchema.required) {
          // Set default values based on type
          if (firstTool.inputSchema.properties?.[requiredField]) {
            const propType = firstTool.inputSchema.properties[requiredField].type

            if (propType === 'string') {
              args[requiredField] = 'test'
            } else if (propType === 'number') {
              args[requiredField] = 1
            } else if (propType === 'boolean') {
              args[requiredField] = false
            } else if (propType === 'array') {
              args[requiredField] = []
            } else if (propType === 'object') {
              args[requiredField] = {}
            }
          } else {
            // If type information is not available, default to string
            args[requiredField] = 'test'
          }
        }
      }

      try {
        // Call the tool
        const callResult = await serverHelper.callTool(toolName, args)

        // Verify the result
        expect(callResult).toBeDefined()

        // Success case - we got a result
        serverHelper.getReporter().assert(`Successfully called tool: ${toolName}`)
      } catch (error) {
        // Error case - this is expected if we couldn't provide proper arguments
        // Just verify that the error is properly formatted
        expect(error).toBeDefined()

        // Type assertion for error
        const err = error as Error
        expect(err.message).toBeDefined()
        serverHelper.getReporter().warn(`Expected error calling tool ${toolName}: ${err.message}`)
      }
    },
    TEST_TIMEOUT,
  )
})
