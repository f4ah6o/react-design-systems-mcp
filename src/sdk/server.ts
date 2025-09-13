#!/usr/bin/env node

/**
 * MCP Server (SDK-based)
 *
 * Minimal SDK server bootstrap to run alongside the existing FastMCP server
 * for iterative migration. Registers a small subset of tools/resources using
 * the same business logic modules (registry, providers, etc.).
 */

import { Server } from '@modelcontextprotocol/sdk/server'
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/transports/sse'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/transports/stdio'
import componentRegistry from '../components/registry'
import { getServerConfig } from '../utils/config'

// Server metadata
const name = 'react-design-systems-sdk'
const version = '1.0.0'

async function main() {
  const config = getServerConfig()

  const server = new Server({
    name,
    version: version as `${number}.${number}.${number}`,
  })

  // tools/list
  server.setRequestHandler('tools/list', async () => {
    // Minimal list until full parity; enumerate a subset we implement via tools/call
    return {
      tools: [
        {
          name: 'get_component_details',
          description: 'Get detailed information about a component',
          inputSchema: {
            type: 'object',
            properties: {
              componentId: { type: 'string' },
              includeExamples: { type: 'boolean' },
              includeRelatedComponents: { type: 'boolean' },
              includeProperties: { type: 'boolean' },
            },
            required: ['componentId'],
          },
        },
        {
          name: 'get_link_resource',
          description: 'Resolve links from usage.md files to backend resources',
          inputSchema: {
            type: 'object',
            properties: { link: { type: 'string' } },
            required: ['link'],
          },
        },
      ],
    }
  })

  // tools/call
  server.setRequestHandler('tools/call', async (req) => {
    const { name, arguments: args } = req.params as any

    if (name === 'get_component_details') {
      const {
        componentId,
        includeExamples = true,
        includeRelatedComponents = true,
        includeProperties = true,
      } = args || {}

      const component = componentRegistry.getComponent(componentId)
      if (!component) throw new Error(`Component ${componentId} not found`)

      const details: any = {
        id: component.id,
        name: component.name,
        category: component.category,
        description: component.description,
        importPath: component.importPath,
        version: component.version,
        isExperimental: component.isExperimental,
        tags: component.tags,
      }

      if (includeRelatedComponents) {
        details.relatedComponents = (component.relatedComponents || []).map((id) => {
          const related = componentRegistry.getComponent(id)
          return {
            id,
            name: related ? related.name : id,
            category: related ? related.category : null,
            description: related ? related.description : null,
          }
        })
      }

      if (includeProperties) {
        details.properties = Object.values(component.properties).map((p) => ({
          name: p.name,
          type: p.type,
          description: p.description,
          defaultValue: p.defaultValue,
          required: p.required,
          acceptedValues: p.acceptedValues,
          isDeprecated: p.isDeprecated,
          examples: p.examples || [],
        }))
      }

      if (includeExamples) {
        details.examples = componentRegistry
          .getComponentExamples({ componentId, limit: 5 })
          .map((ex) => ({
            id: ex.id,
            name: ex.name,
            description: ex.description,
            type: ex.type,
          }))
      }

      return { content: [{ type: 'text', text: JSON.stringify(details, null, 2) }] }
    }

    if (name === 'get_link_resource') {
      // For now, implement a simple echo to validate wiring; full parity will reuse
      // existing parse-and-dispatch logic from FastMCP server in the next step.
      const { link } = args || {}
      if (!link) throw new Error('link is required')
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                linkType: 'echo',
                originalLink: link,
                resolvedTo: { message: 'SDK server wiring OK' },
              },
              null,
              2,
            ),
          },
        ],
      }
    }

    throw new Error(`Unknown tool: ${name}`)
  })

  // resources/list (no-op baseline)
  server.setRequestHandler('resources/list', async () => ({ resources: [] }))

  // resources/read (no-op baseline)
  server.setRequestHandler('resources/read', async () => ({ success: false }))

  // Start transport
  if (config.transportType === 'sse') {
    const transport = new SSEServerTransport({
      path: '/sse',
      port: config.port,
      heartbeatIntervalMs: 15000,
      keepAliveTimeoutMs: 30000,
    })
    console.log(`SDK server: SSE on :${config.port}/sse`)
    await server.connect(transport)
  } else {
    const transport = new StdioServerTransport()
    console.log('SDK server: stdio transport')
    await server.connect(transport)
  }
}

main().catch((err) => {
  console.error('SDK server error:', err)
  process.exit(1)
})

