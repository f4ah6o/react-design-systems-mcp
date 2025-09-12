/**
 * MCP Cloudscape Assistant
 *
 * A Model Context Protocol (MCP) server that provides comprehensive information
 * about AWS Cloudscape Design System components, along with code generation capabilities
 * for common Cloudscape patterns.
 */
/**
 * Creates a configured Cloudscape Assistant MCP server
 * @param options Configuration options for the server
 * @returns Configured MCP server instance
 */
export declare function createCloudscapeAssistant(
  options?: any,
): import('fastmcp').FastMCP<undefined>
export default createCloudscapeAssistant
export { createFastMCPServer } from './src/mcp/server'
export { getServerConfig } from './src/utils/config'
//# sourceMappingURL=index.d.ts.map
