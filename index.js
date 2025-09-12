/**
 * MCP Cloudscape Assistant
 *
 * A Model Context Protocol (MCP) server that provides comprehensive information
 * about AWS Cloudscape Design System components, along with code generation capabilities
 * for common Cloudscape patterns.
 */
Object.defineProperty(exports, '__esModule', { value: true })
exports.getServerConfig = exports.createFastMCPServer = void 0
exports.createCloudscapeAssistant = createCloudscapeAssistant
const server_1 = require('./src/mcp/server')
const config_1 = require('./src/utils/config')
const index_1 = require('./src/security/index')
const roo_integration_1 = require('./src/integration/roo-integration')
const performance_1 = require('./src/optimization/performance')
/**
 * Creates a configured Cloudscape Assistant MCP server
 * @param options Configuration options for the server
 * @returns Configured MCP server instance
 */
function createCloudscapeAssistant(options = {}) {
  // Apply performance optimizations
  ;(0, performance_1.applyPerformanceOptimizations)()
  // Get server configuration
  const config = (0, config_1.getServerConfig)()
  // Create a new FastMCP server
  let server = (0, server_1.createFastMCPServer)({
    name: 'cloudscape-assistant',
    description: 'Cloudscape Design System component information and code generation',
    version: '1.0.0',
    port: options.port || config.port,
    bind: options.bind || config.bind,
    ...options,
  })
  // Apply security enhancements
  server = (0, index_1.applySecurityEnhancements)(server)
  // Initialize Roo integration
  server = (0, roo_integration_1.initializeRooIntegration)(server)
  return server
}
// Export the main function as default
exports.default = createCloudscapeAssistant
// Re-export key components for advanced usage
var server_2 = require('./src/mcp/server')
Object.defineProperty(exports, 'createFastMCPServer', {
  enumerable: true,
  get: () => server_2.createFastMCPServer,
})
var config_2 = require('./src/utils/config')
Object.defineProperty(exports, 'getServerConfig', {
  enumerable: true,
  get: () => config_2.getServerConfig,
})
//# sourceMappingURL=index.js.map
