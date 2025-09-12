/**
 * React Design Systems
 *
 * A Model Context Protocol (MCP) server that provides comprehensive information about design systems
 * created for React. The current version focuses exclusively on the AWS Cloudscape Design System
 * components, along with code generation capabilities for common patterns.
 */

import { initializeRooIntegration } from './integration/roo-integration'
import { createFastMCPServer } from './mcp/server'
import { applyPerformanceOptimizations } from './optimization/performance'
import { applySecurityEnhancements } from './security/index'
import { getServerConfig } from './utils/config'

/**
 * Creates a configured React Design Systems MCP server
 * @param options Configuration options for the server
 * @returns Configured MCP server instance
 */
export function createReactDesignSystemsServer(options: any = {}) {
  // Apply performance optimizations
  applyPerformanceOptimizations()

  // Get server configuration
  const config = getServerConfig()

  // Create a new FastMCP server
  let server = createFastMCPServer({
    name: 'react-design-systems',
    description:
      'React Design Systems - comprehensive information about design systems created for React',
    version: '1.0.0',
    port: options.port || config.port,
    bind: options.bind || config.bind,
    ...options,
  })

  // Apply security enhancements
  server = applySecurityEnhancements(server)

  // Initialize Roo integration
  server = initializeRooIntegration(server)

  return server
}

// Export the main function as default
export default createReactDesignSystemsServer

// Legacy export for backward compatibility (deprecated)
export const createCloudscapeAssistant = createReactDesignSystemsServer

// Re-export key components for advanced usage
export { createFastMCPServer } from './mcp/server'
export { getServerConfig } from './utils/config'
