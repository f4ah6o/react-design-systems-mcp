const { createFastMCPServer } = require('./dist/mcp/server')
const port = 3039

// Create a server instance
const server = createFastMCPServer({
  name: 'cloudscape-assistant',
  description: 'MCP server for Cloudscape components',
  version: '1.0.0',
  port: port,
})

// Start the server
server
  .start({
    transportType: 'sse',
    sse: {
      endpoint: '/sse',
      port: port,
    },
  })
  .then(() => {
    console.log(`Server started on port ${port}`)
  })
  .catch((err) => {
    console.error('Failed to start server:', err)
  })
