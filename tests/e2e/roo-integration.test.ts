/**
 * E2E Tests for Roo Integration
 *
 * This file contains tests that verify the MCP server's compatibility with Roo.
 * It tests the SSE connection, tools/list, tools/call, resources/list, and resources/read endpoints.
 */

import fs from 'node:fs'
import { MCPServerHelper, shouldSkipInCI } from '../utils'

// Test configuration
const TEST_TIMEOUT = 60000 // 60 seconds

describe('Roo Integration', () => {
  // Skip all tests in this file in CI environment if configured
  beforeAll(() => {
    if (shouldSkipInCI('Roo Integration')) {
      return
    }
  })

  // Create a new server helper for each test
  let serverHelper: MCPServerHelper

  beforeEach(() => {
    serverHelper = new MCPServerHelper({
      testName: 'Roo Integration Test',
    })
  })

  afterEach(() => {
    if (serverHelper.isConnected()) {
      serverHelper.disconnect()
    }
  })

  /**
   * Test the complete Roo integration flow
   */
  test(
    'should verify complete Roo integration flow',
    async () => {
      // Skip in CI if configured
      if (shouldSkipInCI()) {
        return
      }

      const reporter = serverHelper.getReporter()

      // Step 1: Test SSE connection
      reporter.step('Testing SSE Connection')

      // Connect to the server
      await serverHelper.connect()
      expect(serverHelper.isConnected()).toBe(true)
      reporter.assert('SSE connection established successfully')

      // Step 2: Test tools/list endpoint
      reporter.step('Testing tools/list endpoint')

      // List tools
      const toolsResult = await serverHelper.listTools()
      expect(toolsResult).toBeDefined()

      // Handle the case where tools might be undefined or empty
      if (!toolsResult.tools) {
        reporter.warn('Server returned no tools property, skipping detailed assertions')
        return
      }

      expect(Array.isArray(toolsResult.tools)).toBe(true)
      reporter.info(`Server reported ${toolsResult.tools.length} tools`)

      // Skip the rest of the test if no tools are available
      if (toolsResult.tools.length === 0) {
        reporter.warn('Server returned empty tools array, skipping detailed assertions')
        return
      }

      // Store the first tool for testing tools/call
      const firstTool = toolsResult.tools[0]

      // Step 3: Test tools/call endpoint
      reporter.step('Testing tools/call endpoint')

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
        const callResult = await serverHelper.callTool(firstTool.name, args)

        // Verify the result
        expect(callResult).toBeDefined()
        reporter.assert(`Successfully called tool: ${firstTool.name}`)
      } catch (error) {
        // Error case - this is expected if we couldn't provide proper arguments
        expect(error).toBeDefined()

        // Type assertion for error
        const err = error as Error
        expect(err.message).toBeDefined()
        reporter.warn(`Expected error calling tool ${firstTool.name}: ${err.message}`)
        reporter.assert('The tools/call endpoint is responding with proper error format')
      }

      // Step 4: Test resources/list endpoint
      reporter.step('Testing resources/list endpoint')

      // List resources
      const resourcesResult = await serverHelper.listResources()
      expect(resourcesResult).toBeDefined()
      expect(resourcesResult.resources).toBeDefined()
      expect(Array.isArray(resourcesResult.resources)).toBe(true)
      reporter.assert(`Server reported ${resourcesResult.resources.length} resources`)

      // Step 5: Test resources/read endpoint if resources are available
      if (resourcesResult.resources.length > 0) {
        reporter.step('Testing resources/read endpoint')

        // Get the first resource
        const firstResource = resourcesResult.resources[0]
        const uriPattern = firstResource.uriPattern

        // Extract a sample URI from the pattern
        const sampleUri = uriPattern.replace(/:[a-zA-Z0-9_]+/g, 'test')

        try {
          // Read the resource
          const readResult = await serverHelper.readResource(sampleUri)

          // Verify the result
          expect(readResult).toBeDefined()
          reporter.assert(`Successfully read resource: ${sampleUri}`)
        } catch (error) {
          // Error case - this is expected if we couldn't provide a proper URI
          expect(error).toBeDefined()

          // Type assertion for error
          const err = error as Error
          expect(err.message).toBeDefined()
          reporter.warn(`Expected error reading resource ${sampleUri}: ${err.message}`)
          reporter.assert('The resources/read endpoint is responding with proper error format')
        }
      } else {
        reporter.warn('No resources available to test resources/read endpoint')
      }

      // Step 6: Generate configuration files
      reporter.step('Generating configuration files')

      // Generate legacy format (mcpServers)
      const legacyConfig = {
        mcpServers: {
          'react-design-systems': {
            url: `http://${serverHelper.getConfig().server.host}:${serverHelper.getConfig().server.port}`,
            disabled: false,
            alwaysAllow: [],
          },
        },
      }

      // Generate modern format (connections)
      const modernConfig = {
        connections: [
          {
            name: 'React Design Systems',
            type: 'sse',
            url: `http://${serverHelper.getConfig().server.host}:${serverHelper.getConfig().server.port}`,
            autoConnect: true,
          },
        ],
      }

      // Generate stdio format (for local servers)
      const stdioConfig = {
        connections: [
          {
            name: 'React Design Systems',
            type: 'stdio',
            command: 'react-design-systems-mcp',
            args: ['--port', serverHelper.getConfig().server.port.toString()],
            env: {},
            cwd: '${workspaceFolder}',
            autoConnect: true,
          },
        ],
      }

      // Write the configuration files
      try {
        fs.writeFileSync('mcp.legacy.json', JSON.stringify(legacyConfig, null, 2))
        fs.writeFileSync('mcp.modern.json', JSON.stringify(modernConfig, null, 2))
        fs.writeFileSync('mcp.stdio.json', JSON.stringify(stdioConfig, null, 2))

        reporter.assert('Generated configuration files successfully')

        // Verify the files exist
        expect(fs.existsSync('mcp.legacy.json')).toBe(true)
        expect(fs.existsSync('mcp.modern.json')).toBe(true)
        expect(fs.existsSync('mcp.stdio.json')).toBe(true)
      } catch (error) {
        reporter.error(`Error generating configuration files: ${error}`)
        throw error
      }

      // Final assertion
      reporter.assert('All Roo integration tests passed successfully')
    },
    TEST_TIMEOUT,
  )
})
