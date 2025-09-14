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
import exampleProvider from '../example-provider'
import { parseLinkToResource } from './link-parser'
import searchEngine from '../search/engine'
import documentationProvider from '../documentation/provider'
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
        {
          name: 'search_components',
          description: 'Search for Cloudscape components with advanced options',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string' },
              category: { type: 'string' },
              tags: { type: 'array', items: { type: 'string' } },
              limit: { type: 'number' },
              offset: { type: 'number' },
              fuzzyMatch: { type: 'boolean' },
              fuzzyThreshold: { type: 'number' },
              filters: { type: 'object' },
              sortBy: { type: 'string' },
              sortOrder: { type: 'string' },
            },
          },
        },
        {
          name: 'search_documentation',
          description: 'Search within component documentation',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string' },
              scope: { type: 'string' },
              limit: { type: 'number' },
            },
            required: ['query'],
          },
        },
        {
          name: 'get_pattern_categories',
          description: 'Get all pattern categories with optional details about patterns',
          inputSchema: {
            type: 'object',
            properties: {
              includePatternCount: { type: 'boolean' },
              includePatternList: { type: 'boolean' },
            },
          },
        },
        {
          name: 'search_patterns',
          description: 'Search for design patterns and common component combinations',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string' },
              component: { type: 'string' },
              tags: { type: 'array', items: { type: 'string' } },
            },
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

    if (name === 'search_components') {
      const {
        query,
        category,
        tags,
        limit,
        offset,
        fuzzyMatch,
        fuzzyThreshold,
        filters,
        sortBy,
        sortOrder,
      } = args || {}

      const res = searchEngine.searchComponents({
        query,
        category,
        tags,
        limit,
        offset,
        fuzzyMatch,
        fuzzyThreshold,
        filters,
        sortBy,
        sortOrder,
      })

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                results: res.results.map((r) => ({
                  componentId: r.id,
                  name: r.name,
                  category: r.category,
                  description: r.description,
                  relevance: r.relevance,
                  matchedFields: r.matchedFields,
                  tags: r.tags,
                  importPath: r.importPath,
                  version: r.version,
                  isExperimental: r.isExperimental,
                })),
                totalResults: res.totalResults,
                query: res.query,
                category: res.category,
                tags: res.tags,
                limit: res.limit,
                offset: res.offset,
              },
              null,
              2,
            ),
          },
        ],
      }
    }

    if (name === 'search_documentation') {
      const { query, scope = 'all', limit = 10 } = args || {}
      if (!query) throw new Error('Search query is required')
      const results = documentationProvider.searchDocumentation({
        query,
        scope,
        limit,
      })
      return { content: [{ type: 'text', text: JSON.stringify(results) }] }
    }

    if (name === 'get_pattern_categories') {
      const { includePatternCount = true, includePatternList = true } = args || {}
      const result = componentRegistry.getPatternCategories({
        includePatternCount,
        includePatternList,
      })
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
    }

    if (name === 'search_patterns') {
      const { query, component, tags } = args || {}
      const results = componentRegistry.searchPatterns({ query, component, tags })
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                query: args || {},
                totalResults: results.length,
                patterns: results.map((pattern) => ({
                  id: pattern.id,
                  name: pattern.name,
                  description: pattern.description,
                  components: pattern.components,
                  customizationOptions: Object.keys((pattern as any).customizationOptions || {}),
                  code:
                    (pattern as any).code && (pattern as any).code.length > 2000
                      ? (pattern as any).code.substring(0, 2000) +
                        '\n\n// Code truncated. Use get_pattern_code for full code.'
                      : (pattern as any).code,
                })),
              },
              null,
              2,
            ),
          },
        ],
      }
    }

    if (name === 'get_link_resource') {
      const { link } = args || {}
      if (!link) throw new Error('link is required')

      const linkResult = parseLinkToResource(link)

      if (!linkResult.success) {
        throw new Error(`Unable to resolve link: ${link}. ${linkResult.error}`)
      }

      switch (linkResult.type) {
        case 'component_example': {
          if (!linkResult.exampleId || !linkResult.componentId) {
            throw new Error('Example ID and componentId are required for component_example type')
          }
          const example = componentRegistry.getExampleById(linkResult.exampleId)
          if (!example) {
            throw new Error(`Example ${linkResult.exampleId} not found`)
          }
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    linkType: 'component_example',
                    originalLink: link,
                    resolvedTo: {
                      componentId: linkResult.componentId,
                      exampleId: linkResult.exampleId,
                      tabId: linkResult.tabId,
                      example: {
                        id: example.id,
                        name: example.name,
                        description: example.description,
                        component: example.component,
                        type: example.type,
                        tags: example.tags,
                        code: example.code,
                      },
                    },
                  },
                  null,
                  2,
                ),
              },
            ],
          }
        }
        case 'component_details': {
          if (!linkResult.componentId) throw new Error('Component ID is required')
          const component = componentRegistry.getComponent(linkResult.componentId)
          if (!component) throw new Error(`Component ${linkResult.componentId} not found`)

          const componentData: any = {
            id: component.id,
            name: component.name,
            category: component.category,
            description: component.description,
            importPath: component.importPath,
            version: component.version,
            isExperimental: component.isExperimental,
            tags: component.tags,
          }

          if (linkResult.tabId === 'api' || !linkResult.tabId) {
            componentData.properties = Object.values(component.properties).map((property) => ({
              name: property.name,
              type: property.type,
              description: property.description,
              defaultValue: property.defaultValue,
              required: property.required,
              acceptedValues: property.acceptedValues,
              isDeprecated: property.isDeprecated,
              examples: property.examples || [],
            }))
          }
          if (linkResult.tabId === 'usage' || !linkResult.tabId) {
            const usageContent = componentRegistry.getComponentUsage(linkResult.componentId)
            if (usageContent) {
              componentData.usage = usageContent
            }
          }

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    linkType: 'component_details',
                    originalLink: link,
                    resolvedTo: {
                      componentId: linkResult.componentId,
                      tabId: linkResult.tabId,
                      component: componentData,
                    },
                  },
                  null,
                  2,
                ),
              },
            ],
          }
        }
        case 'pattern': {
          if (!linkResult.patternId) throw new Error('Pattern ID is required')
          const pattern = componentRegistry.getPattern(linkResult.patternId)
          if (!pattern) throw new Error(`Pattern ${linkResult.patternId} not found`)
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    linkType: 'pattern',
                    originalLink: link,
                    resolvedTo: {
                      patternId: linkResult.patternId,
                      pattern: {
                        id: pattern.id,
                        name: pattern.name,
                        description: pattern.description,
                        components: pattern.components,
                        customizationOptions: (pattern as any).customizationOptions,
                        code: (pattern as any).code,
                      },
                    },
                  },
                  null,
                  2,
                ),
              },
            ],
          }
        }
        case 'foundation': {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    linkType: 'foundation',
                    originalLink: link,
                    resolvedTo: {
                      topic: linkResult.topic,
                      category: linkResult.category,
                      message: `Foundation resource for ${linkResult.category}/${linkResult.topic}`,
                      note: 'Foundation resources are informational references to design principles and guidelines',
                    },
                  },
                  null,
                  2,
                ),
              },
            ],
          }
        }
        case 'external': {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    linkType: 'external',
                    originalLink: link,
                    resolvedTo: {
                      url: linkResult.url,
                      message: 'External link - no backend resource available',
                      note: 'This is an external reference that should be accessed directly',
                    },
                  },
                  null,
                  2,
                ),
              },
            ],
          }
        }
      }
    }

    throw new Error(`Unknown tool: ${name}`)
  })

  // resources/list: expose templates roughly matching FastMCP
  server.setRequestHandler('resources/list', async () => {
    const templates = [
      'cloudscape://components/{componentId}',
      'cloudscape://categories/{categoryId}',
      'cloudscape://patterns/{patternId}',
      'cloudscape://examples/{exampleId}',
      'cloudscape://usage/{componentId}',
      'cloudscape://demos/{componentId}',
      'cloudscape://pattern-categories/{categoryId}',
      // direct resources
      'cloudscape://best-practices',
      'cloudscape://components-overview',
      'cloudscape://frontend-code-setup',
    ]
    return { resources: templates.map((t) => ({ uriPattern: t })) }
  })

  // resources/read: minimal handlers for common URIs
  server.setRequestHandler('resources/read', async (req) => {
    const { uri } = req.params as any
    if (!uri || typeof uri !== 'string') throw new Error('Invalid uri')

    const prefix = 'cloudscape://'
    if (!uri.startsWith(prefix)) throw new Error('Unsupported uri')
    const rest = uri.slice(prefix.length)

    const [head, ...parts] = rest.split('/')
    switch (head) {
      case 'components': {
        const componentId = parts[0]
        const component = componentRegistry.getComponent(componentId)
        if (!component) throw new Error(`Component ${componentId} not found`)
        return { content: [{ type: 'text', text: JSON.stringify(component, null, 2) }] }
      }
      case 'categories': {
        const categoryId = parts[0]
        const category = componentRegistry.getCategory(categoryId)
        if (!category) throw new Error(`Category ${categoryId} not found`)
        return { content: [{ type: 'text', text: JSON.stringify(category, null, 2) }] }
      }
      case 'patterns': {
        const patternId = parts[0]
        const pattern = componentRegistry.getPattern(patternId)
        if (!pattern) throw new Error(`Pattern ${patternId} not found`)
        return { content: [{ type: 'text', text: JSON.stringify(pattern, null, 2) }] }
      }
      case 'examples': {
        const exampleId = parts[0]
        const example = exampleProvider.getExample(exampleId)
        if (!example) throw new Error(`Example ${exampleId} not found`)
        return { content: [{ type: 'text', text: JSON.stringify(example, null, 2) }] }
      }
      case 'usage': {
        const componentId = parts[0]
        const usageContent = componentRegistry.getComponentUsage(componentId)
        if (!usageContent) throw new Error(`Usage guidelines for component ${componentId} not found`)
        return { content: [{ type: 'text', text: usageContent }] }
      }
      case 'demos': {
        const componentId = parts[0]
        const demos = componentRegistry.getComponentDemos(componentId, {
          includeCode: true,
          includeVariations: true,
        })
        if (demos.demos.length === 0) throw new Error(`No demos found for component ${componentId}`)
        return { content: [{ type: 'text', text: JSON.stringify(demos, null, 2) }] }
      }
      case 'pattern-categories': {
        const categoryId = parts[0]
        const categories = componentRegistry.getPatternCategories({
          includePatternCount: true,
          includePatternList: true,
        })
        const category = categories.categories.find((cat) => cat.id === categoryId)
        if (!category) throw new Error(`Pattern category ${categoryId} not found`)
        return { content: [{ type: 'text', text: JSON.stringify(category, null, 2) }] }
      }
      case 'best-practices': {
        return {
          content: [
            {
              type: 'text',
              text: '# Cloudscape Design System Best Practices\n\n- Follow accessibility best practices',
            },
          ],
        }
      }
      case 'components-overview': {
        const components = componentRegistry.getAllComponents()
        return { content: [{ type: 'text', text: JSON.stringify(Object.keys(components)) }] }
      }
      case 'frontend-code-setup': {
        return {
          content: [
            {
              type: 'text',
              text: '# Frontend Code Setup Instructions',
            },
          ],
        }
      }
    }
    throw new Error('Unsupported uri')
  })

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
