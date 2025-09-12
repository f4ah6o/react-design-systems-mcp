#!/usr/bin/env node
/**
 * Cloudscape MCP Server
 *
 * This is a Model Context Protocol (MCP) server that provides comprehensive information
 * about AWS Cloudscape Design System components, along with code generation capabilities
 * for common Cloudscape patterns.
 *
 * Version 1.0.0
 * - Enhanced with FastMCP framework
 * - Improved error handling and logging
 * - Performance optimizations
 * - Security enhancements
 */
Object.defineProperty(exports, '__esModule', { value: true })
// Import from TypeScript files
const server_1 = require('./src/mcp/server')
const config_1 = require('./src/utils/config')
const index_1 = require('./src/security/index')
const roo_integration_1 = require('./src/integration/roo-integration')
const performance_1 = require('./src/optimization/performance')
// Get server configuration
const config = (0, config_1.getServerConfig)()
// Apply performance optimizations
;(0, performance_1.applyPerformanceOptimizations)()
// Create a new FastMCP server
let server = (0, server_1.createFastMCPServer)({
  name: 'cloudscape-assistant',
  description: 'Cloudscape Design System component information and code generation',
  version: '1.0.0',
  port: config.port,
  bind: config.bind,
})
// Apply security enhancements
server = (0, index_1.applySecurityEnhancements)(server)
// Initialize Roo integration
server = (0, roo_integration_1.initializeRooIntegration)(server)
// Start the server with the specified transport type
if (config.transportType === 'sse') {
  console.log(`Starting server with SSE transport on port ${config.port}...`)
  server.start({
    transportType: 'sse',
    sse: {
      endpoint: '/sse',
      port: config.port,
    },
  })
} else {
  console.log('Starting server with stdio transport...')
  server.start({
    transportType: 'stdio',
  })
}
// Handle process signals for graceful shutdown
process.on('SIGINT', () => {
  console.error(`\n${'='.repeat(80)}`)
  console.error('\x1b[1m\x1b[33m  RECEIVED SIGINT SIGNAL\x1b[0m')
  console.error('='.repeat(80))
  console.error('\x1b[33mShutting down server gracefully...\x1b[0m')
  process.exit(0)
})
process.on('SIGTERM', () => {
  console.error(`\n${'='.repeat(80)}`)
  console.error('\x1b[1m\x1b[33m  RECEIVED SIGTERM SIGNAL\x1b[0m')
  console.error('='.repeat(80))
  console.error('\x1b[33mShutting down server gracefully...\x1b[0m')
  process.exit(0)
})
// Log uncaught exceptions for better debugging
process.on('uncaughtException', (error) => {
  console.error(`\n${'='.repeat(80)}`)
  console.error('\x1b[1m\x1b[31m  UNCAUGHT EXCEPTION\x1b[0m')
  console.error('='.repeat(80))
  console.error('\x1b[31mUncaught Exception:\x1b[0m', error)
  console.error('\x1b[31mServer will now exit\x1b[0m')
  process.exit(1)
})
// Log unhandled promise rejections
process.on('unhandledRejection', (reason, _promise) => {
  console.error(`\n${'='.repeat(80)}`)
  console.error('\x1b[1m\x1b[31m  UNHANDLED PROMISE REJECTION\x1b[0m')
  console.error('='.repeat(80))
  console.error('\x1b[31mUnhandled Promise Rejection:\x1b[0m', reason)
  // We don't exit here to allow the server to continue running
})
// Export the server for testing
exports.default = server
//# sourceMappingURL=server.js.map
