#!/usr/bin/env node

/**
 * MCP Server (SDK-based)
 *
 * Minimal SDK server bootstrap to run alongside the existing FastMCP server
 * for iterative migration. Registers a small subset of tools/resources using
 * the same business logic modules (registry, providers, etc.).
 */

import { Server } from '@modelcontextprotocol/sdk/server'
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import componentRegistry from '../components/registry'
import exampleProvider from '../example-provider'
import { parseLinkToResource } from './link-parser'
import searchEngine from '../search/engine'
import documentationProvider from '../documentation/provider'
import { getServerConfig } from '../utils/config'
import codeGenerator from '../code-generator/generator'
import propertyExplorer from '../property-explorer'

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
              category: { type: 'string' },
              component: { type: 'string' },
              tags: { type: 'array', items: { type: 'string' } },
              limit: { type: 'number' },
              offset: { type: 'number' },
            },
          },
        },
        {
          name: 'generate_component_code',
          description: 'Generate code for a component with customization options',
          inputSchema: {
            type: 'object',
            properties: {
              componentId: { type: 'string' },
              props: { type: 'object' },
              children: { type: 'string' },
              eventHandlers: { type: 'object' },
              typescript: { type: 'boolean' },
              style: { type: 'string' },
              includeImports: { type: 'boolean' },
            },
            required: ['componentId'],
          },
        },
        {
          name: 'generate_pattern_code',
          description: 'Generate code for a design pattern with customization options',
          inputSchema: {
            type: 'object',
            properties: {
              patternId: { type: 'string' },
              customizations: { type: 'object' },
              typescript: { type: 'boolean' },
              style: { type: 'string' },
              includeImports: { type: 'boolean' },
            },
            required: ['patternId'],
          },
        },
        {
          name: 'get_pattern_code',
          description: 'Get the full code for a specific design pattern',
          inputSchema: {
            type: 'object',
            properties: {
              patternId: { type: 'string' },
            },
            required: ['patternId'],
          },
        },
        {
          name: 'get_pattern_details',
          description: 'Get detailed information about a design pattern',
          inputSchema: {
            type: 'object',
            properties: {
              patternId: { type: 'string' },
              includeExamples: { type: 'boolean' },
              includeCode: { type: 'boolean' },
              includeUsageGuidelines: { type: 'boolean' },
              includeRelatedPatterns: { type: 'boolean' },
            },
            required: ['patternId'],
          },
        },
        {
          name: 'get_component_usage',
          description: 'Get usage guidelines for a component',
          inputSchema: {
            type: 'object',
            properties: {
              componentId: { type: 'string' },
              section: { type: 'string' },
              format: { type: 'string', enum: ['markdown', 'text', 'json'] },
            },
            required: ['componentId'],
          },
        },
        {
          name: 'validate_component_props',
          description: 'Validate provided props against component definitions',
          inputSchema: {
            type: 'object',
            properties: {
              componentId: { type: 'string' },
              props: { type: 'object' },
            },
            required: ['componentId', 'props'],
          },
        },
        {
          name: 'get_component_events',
          description: 'Get events and event handler properties for a component',
          inputSchema: {
            type: 'object',
            properties: {
              componentId: { type: 'string' },
            },
            required: ['componentId'],
          },
        },
        {
          name: 'get_component_accessibility',
          description: 'Get accessibility information for a component',
          inputSchema: {
            type: 'object',
            properties: {
              componentId: { type: 'string' },
            },
            required: ['componentId'],
          },
        },
        {
          name: 'get_component_versions',
          description: 'Get version history for a component',
          inputSchema: {
            type: 'object',
            properties: {
              componentId: { type: 'string' },
            },
            required: ['componentId'],
          },
        },
        {
          name: 'get_example_code',
          description: 'Get the full code for a specific usage example',
          inputSchema: {
            type: 'object',
            properties: {
              exampleId: { type: 'string' },
            },
            required: ['exampleId'],
          },
        },
        {
          name: 'get_component_patterns',
          description: 'Get patterns that include a component',
          inputSchema: {
            type: 'object',
            properties: {
              componentId: { type: 'string' },
              limit: { type: 'number' },
            },
            required: ['componentId'],
          },
        },
        {
          name: 'get_component_properties',
          description: 'Retrieve detailed property information for a specific component',
          inputSchema: {
            type: 'object',
            properties: {
              componentId: { type: 'string' },
              filter: {
                type: 'object',
                properties: {
                  required: { type: 'boolean' },
                  deprecated: { type: 'boolean' },
                  type: { type: 'string' },
                  namePattern: { type: 'string' },
                },
              },
            },
            required: ['componentId'],
          },
        },
        {
          name: 'get_component_examples',
          description: 'Get usage examples for a component or a specific example',
          inputSchema: {
            type: 'object',
            properties: {
              componentId: { type: 'string' },
              exampleId: { type: 'string' },
              type: { type: 'string' },
              limit: { type: 'number' },
              tags: { type: 'array', items: { type: 'string' } },
            },
            required: ['componentId'],
          },
        },
        {
          name: 'get_component_demos',
          description: 'Get demos for a component with filtering options',
          inputSchema: {
            type: 'object',
            properties: {
              componentId: { type: 'string' },
              demoType: { type: 'string' },
              includeCode: { type: 'boolean' },
              includeVariations: { type: 'boolean' },
              tags: { type: 'array', items: { type: 'string' } },
              complexity: { type: 'string', enum: ['basic', 'intermediate', 'advanced'] },
              limit: { type: 'number' },
              offset: { type: 'number' },
            },
            required: ['componentId'],
          },
        },
        {
          name: 'get_component_dependencies',
          description: 'Get dependencies required by a component',
          inputSchema: {
            type: 'object',
            properties: {
              componentId: { type: 'string' },
            },
            required: ['componentId'],
          },
        },
        {
          name: 'get_component_alternatives',
          description: 'Get alternative components for a given component',
          inputSchema: {
            type: 'object',
            properties: {
              componentId: { type: 'string' },
              limit: { type: 'number' },
            },
            required: ['componentId'],
          },
        },
        {
          name: 'compare_components',
          description: 'Compare multiple components',
          inputSchema: {
            type: 'object',
            properties: {
              componentIds: { type: 'array', items: { type: 'string' } },
            },
            required: ['componentIds'],
          },
        },
        {
          name: 'search_usage_guidelines',
          description: 'Search usage guidelines across components',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string' },
              section: { type: 'string' },
              componentId: { type: 'string' },
              limit: { type: 'number' },
            },
          },
        },
        {
          name: 'search_component_functions',
          description: 'Search for functions across component APIs',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string' },
              returnType: { type: 'string' },
              componentId: { type: 'string' },
            },
          },
        },
        {
          name: 'search_component_events',
          description: 'Search for events across component APIs',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string' },
              cancelable: { type: 'boolean' },
              componentId: { type: 'string' },
            },
          },
        },
        {
          name: 'search_component_properties',
          description: 'Search for component properties with filters',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string' },
              type: { type: 'string' },
              required: { type: 'boolean' },
              deprecated: { type: 'boolean' },
              componentId: { type: 'string' },
            },
          },
        },
      ],
    }
  })

  // tools/call
  server.setRequestHandler('tools/call', async (req: any) => {
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
      const { query, category, component, tags, limit, offset } = args || {}

      if (query !== undefined && typeof query !== 'string') {
        throw new Error('query must be a string')
      }
      if (category !== undefined && typeof category !== 'string') {
        throw new Error('category must be a string')
      }
      if (component !== undefined && typeof component !== 'string') {
        throw new Error('component must be a string')
      }
      if (limit !== undefined && (typeof limit !== 'number' || limit < 0)) {
        throw new Error('limit must be a non-negative number')
      }
      if (offset !== undefined && (typeof offset !== 'number' || offset < 0)) {
        throw new Error('offset must be a non-negative number')
      }

      const result = componentRegistry.searchPatternsByProvider({
        query,
        category,
        component,
        tags,
        limit,
        offset,
      })

      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
    }

    if (name === 'generate_component_code') {
      const {
        componentId,
        props = {},
        children = '',
        eventHandlers = {},
        typescript = true,
        style = 'expanded',
        includeImports = true,
      } = args || {}

      if (!componentId) throw new Error('componentId is required')

      const component = componentRegistry.getComponent(componentId)
      if (!component) throw new Error(`Component ${componentId} not found`)

      const codeResult = codeGenerator.generateComponentCode({
        componentId,
        props,
        children,
        eventHandlers,
        typescript,
        style: style as 'compact' | 'expanded',
        includeImports,
      })

      return { content: [{ type: 'text', text: codeResult.code }] }
    }

    if (name === 'generate_pattern_code') {
      const {
        patternId,
        customizations = {},
        typescript = true,
        style = 'expanded',
        includeImports = true,
      } = args || {}

      if (!patternId) throw new Error('patternId is required')

      const pattern = componentRegistry.getPattern(patternId)
      if (!pattern) throw new Error(`Pattern ${patternId} not found`)

      const codeResult = codeGenerator.generatePatternCode({
        patternId,
        customizations,
        typescript,
        style: style as 'compact' | 'expanded',
        includeImports,
      })

      return { content: [{ type: 'text', text: codeResult.code }] }
    }

    if (name === 'get_pattern_code') {
      const { patternId } = args || {}
      if (!patternId) throw new Error('patternId is required')

      const pattern = componentRegistry.getPattern(patternId)
      if (!pattern) throw new Error(`Pattern ${patternId} not found`)

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                id: pattern.id,
                name: pattern.name,
                description: pattern.description,
                components: pattern.components,
                customizationOptions: (pattern as any).customizationOptions,
                code: (pattern as any).code,
              },
              null,
              2,
            ),
          },
        ],
      }
    }

    if (name === 'get_pattern_details') {
      const {
        patternId,
        includeExamples,
        includeCode,
        includeUsageGuidelines,
        includeRelatedPatterns,
      } = args || {}

      if (!patternId || typeof patternId !== 'string') {
        throw new Error('patternId is required and must be a string')
      }

      if (includeExamples !== undefined && typeof includeExamples !== 'boolean') {
        throw new Error('includeExamples must be a boolean value')
      }
      if (includeCode !== undefined && typeof includeCode !== 'boolean') {
        throw new Error('includeCode must be a boolean value')
      }
      if (includeUsageGuidelines !== undefined && typeof includeUsageGuidelines !== 'boolean') {
        throw new Error('includeUsageGuidelines must be a boolean value')
      }
      if (includeRelatedPatterns !== undefined && typeof includeRelatedPatterns !== 'boolean') {
        throw new Error('includeRelatedPatterns must be a boolean value')
      }

      try {
        const result = componentRegistry.getPatternDetails({
          patternId,
          includeExamples: includeExamples ?? true,
          includeCode: includeCode ?? true,
          includeUsageGuidelines: includeUsageGuidelines ?? true,
          includeRelatedPatterns: includeRelatedPatterns ?? true,
        })

        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
      } catch (error) {
        if (error instanceof Error && error.message.includes('not found')) {
          throw new Error(`Pattern with ID '${patternId}' not found`)
        }
        throw error
      }
    }

    if (name === 'get_component_usage') {
      const { componentId, section, format = 'markdown' } = args || {}

      if (!componentId || typeof componentId !== 'string') {
        throw new Error('componentId is required and must be a string')
      }

      const usageContent = componentRegistry.getComponentUsage(componentId)
      if (!usageContent) {
        throw new Error(`Usage guidelines for component ${componentId} not found`)
      }

      let content = usageContent

      if (section) {
        const lines = usageContent.split('\n')
        const sectionStart = lines.findIndex(
          (line) =>
            line.toLowerCase().includes(section.toLowerCase()) &&
            (line.startsWith('##') || line.startsWith('###')),
        )

        if (sectionStart === -1) {
          throw new Error(`Section "${section}" not found in usage guidelines for ${componentId}`)
        }

        let sectionEnd = lines.length
        for (let i = sectionStart + 1; i < lines.length; i++) {
          if (lines[i].startsWith('## ')) {
            sectionEnd = i
            break
          }
        }

        content = lines.slice(sectionStart, sectionEnd).join('\n').trim()
      }

      let formattedContent = content
      if (format === 'text') {
        formattedContent = content
          .replace(/#{1,6}\s+/g, '')
          .replace(/\*\*(.*?)\*\*/g, '$1')
          .replace(/(?<!\s)\*([^*\n]+)\*(?!\s)/g, '$1')
          .replace(/`(.*?)`/g, '$1')
          .replace(/\[(.*?)\]\(.*?\)/g, '$1')
          .replace(/^\s*\*\s+/gm, '• ')
          .trim()
      } else if (format === 'json') {
        formattedContent = JSON.stringify(
          {
            componentId,
            requestedSection: section,
            sections: parseMarkdownSections(content),
          },
          null,
          2,
        )
      } else if (format !== 'markdown') {
        throw new Error(`Unsupported format: ${format}`)
      }

      return { content: [{ type: 'text', text: formattedContent }] }
    }

    if (name === 'validate_component_props') {
      const { componentId, props } = args || {}

      if (!componentId || typeof componentId !== 'string') {
        throw new Error('componentId is required and must be a string')
      }
      if (!props || typeof props !== 'object') {
        throw new Error('props is required and must be an object')
      }

      const properties = propertyExplorer.getComponentProperties({ componentId })

      const validationResult = {
        isValid: true,
        errors: [] as string[],
        warnings: [] as string[],
      }

      if (properties) {
        Object.entries(props).forEach(([key, value]) => {
          const property = (properties as Record<string, any>)[key]
          if (!property) {
            validationResult.warnings.push(`Unknown property: ${key}`)
          } else if (property.required && (value === undefined || value === null)) {
            validationResult.errors.push(`Required property ${key} is missing`)
            validationResult.isValid = false
          } else if (value !== undefined && !isValueTypeValid(value, property.type)) {
            validationResult.errors.push(`Property ${key} has invalid type`)
            validationResult.isValid = false
          }
        })

        Object.entries(properties).forEach(([key, property]: [string, any]) => {
          if (property.required && !(key in props)) {
            validationResult.errors.push(`Required property ${key} is missing`)
            validationResult.isValid = false
          }
        })
      }

      return { content: [{ type: 'text', text: JSON.stringify(validationResult) }] }
    }

    if (name === 'get_component_events') {
      const { componentId } = args || {}
      if (!componentId || typeof componentId !== 'string') {
        throw new Error('componentId is required and must be a string')
      }

      const component = componentRegistry.getComponent(componentId)
      if (!component) throw new Error(`Component ${componentId} not found`)

      const events = Object.values((component as any).events || {}).map((event: any) => ({
        name: event.name,
        description: event.description,
        cancelable: event.cancelable,
        detailType: event.detailType,
        detailProperties: event.detailProperties,
      }))

      const eventHandlers = Object.values(component.properties)
        .filter(
          (prop: any) =>
            prop.name.startsWith('on') &&
            (prop.type === 'function' || (typeof prop.type === 'string' && prop.type.includes('function'))),
        )
        .map((prop: any) => ({
          name: prop.name,
          description: prop.description,
          type: prop.type,
          isRequired: prop.required,
          isDeprecated: prop.isDeprecated,
          examples: prop.examples || [],
        }))

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                componentId,
                componentName: component.name,
                events,
                eventHandlers,
                totalEvents: events.length,
                totalEventHandlers: eventHandlers.length,
              },
              null,
              2,
            ),
          },
        ],
      }
    }

    if (name === 'get_component_accessibility') {
      const { componentId } = args || {}
      if (!componentId || typeof componentId !== 'string') {
        throw new Error('componentId is required and must be a string')
      }

      const component = componentRegistry.getComponent(componentId)
      if (!component) throw new Error(`Component ${componentId} not found`)

      const accessibilityInfo = {
        name: component.name,
        ariaRoles: getComponentAriaRoles(component),
        keyboardNavigation: getComponentKeyboardNavigation(component),
        screenReaderSupport: getComponentScreenReaderSupport(component),
        bestPractices: getComponentAccessibilityBestPractices(component),
        commonIssues: getComponentAccessibilityCommonIssues(component),
      }

      return { content: [{ type: 'text', text: JSON.stringify(accessibilityInfo, null, 2) }] }
    }

    if (name === 'get_component_versions') {
      const { componentId } = args || {}
      if (!componentId || typeof componentId !== 'string') {
        throw new Error('componentId is required and must be a string')
      }

      const component = componentRegistry.getComponent(componentId)
      if (!component) throw new Error(`Component ${componentId} not found`)

      const versionHistory = [
        {
          version: component.version,
          date: '2025-05-01',
          changes: ['Initial release', 'Added basic functionality'],
        },
        {
          version: '1.0.0',
          date: '2025-04-15',
          changes: ['Beta release', 'Fixed accessibility issues'],
        },
      ]

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                componentId,
                componentName: component.name,
                currentVersion: component.version,
                versionHistory,
              },
              null,
              2,
            ),
          },
        ],
      }
    }

    if (name === 'get_example_code') {
      const { exampleId } = args || {}
      if (!exampleId || typeof exampleId !== 'string') {
        throw new Error('exampleId is required and must be a string')
      }

      const example = componentRegistry.getExampleById(exampleId)
      if (!example) throw new Error(`Example ${exampleId} not found`)

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                id: example.id,
                name: example.name,
                description: example.description,
                component: example.component,
                type: example.type,
                tags: example.tags,
                code: example.code,
              },
              null,
              2,
            ),
          },
        ],
      }
    }

    if (name === 'get_component_patterns') {
      const { componentId, limit = 5 } = args || {}
      if (!componentId || typeof componentId !== 'string') {
        throw new Error('componentId is required and must be a string')
      }

      const patterns = Object.values(componentRegistry.getAllPatterns())
        .filter((pattern: any) => pattern.components.includes(componentId))
        .slice(0, limit)

      return { content: [{ type: 'text', text: JSON.stringify(patterns) }] }
    }

    if (name === 'get_component_properties') {
      const { componentId, filter = {} } = args || {}
      if (!componentId || typeof componentId !== 'string') {
        throw new Error('componentId is required and must be a string')
      }

      const properties = propertyExplorer.getComponentProperties({
        componentId,
        filter,
      })

      return { content: [{ type: 'text', text: JSON.stringify(properties) }] }
    }

    if (name === 'get_component_examples') {
      const { componentId, exampleId, type, limit = 5, tags = [] } = args || {}

      if (!componentId || typeof componentId !== 'string') {
        throw new Error('componentId is required and must be a string')
      }

      if (exampleId) {
        const example = componentRegistry.getExampleById(exampleId)
        if (!example) {
          throw new Error(`Example ${exampleId} not found`)
        }
        if (example.component !== componentId) {
          throw new Error(`Example ${exampleId} does not belong to component ${componentId}`)
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  requestType: 'single_example',
                  componentId,
                  exampleId,
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
                null,
                2,
              ),
            },
          ],
        }
      }

      const examplesResponse = exampleProvider.getExamples({
        componentId,
        type,
        limit,
        tags,
      })

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                requestType: 'multiple_examples',
                componentId,
                filters: { type, limit, tags },
                totalResults: examplesResponse.totalExamples,
                examples: examplesResponse.examples.map((example: any) => ({
                  id: example.id,
                  name: example.name,
                  description: example.description,
                  type: example.type,
                  tags: example.tags,
                  code:
                    example.code && example.code.length > 1000
                      ? `${example.code.substring(0, 1000)}...`
                      : example.code,
                })),
              },
              null,
              2,
            ),
          },
        ],
      }
    }

    if (name === 'get_component_demos') {
      const {
        componentId,
        demoType,
        includeCode,
        includeVariations,
        tags,
        complexity,
        limit,
        offset,
      } = args || {}

      if (typeof componentId !== 'string') {
        throw new Error('componentId is required and must be a string')
      }
      if (includeCode !== undefined && typeof includeCode !== 'boolean') {
        throw new Error('includeCode must be a boolean value')
      }
      if (includeVariations !== undefined && typeof includeVariations !== 'boolean') {
        throw new Error('includeVariations must be a boolean value')
      }
      if (demoType !== undefined && typeof demoType !== 'string') {
        throw new Error('demoType must be a string')
      }
      if (limit !== undefined && (typeof limit !== 'number' || limit < 0)) {
        throw new Error('limit must be a non-negative number')
      }
      if (offset !== undefined && (typeof offset !== 'number' || offset < 0)) {
        throw new Error('offset must be a non-negative number')
      }

      const result = componentRegistry.getComponentDemos(componentId, {
        demoType,
        includeCode: includeCode ?? true,
        includeVariations: includeVariations ?? true,
        tags,
        complexity,
        limit,
        offset,
      })

      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
    }

    if (name === 'get_component_dependencies') {
      const { componentId } = args || {}
      if (!componentId || typeof componentId !== 'string') {
        throw new Error('componentId is required and must be a string')
      }

      const component = componentRegistry.getComponent(componentId)
      if (!component) throw new Error(`Component ${componentId} not found`)

      const dependencies = {
        required: [
          {
            name: '@cloudscape-design/components',
            version: '^3.0.0',
          },
        ],
        optional: [
          {
            name: '@cloudscape-design/global-styles',
            version: '^1.0.0',
            purpose: 'For consistent styling across components',
          },
        ],
        peerDependencies: [
          {
            name: 'react',
            version: '^17.0.0 || ^18.0.0',
          },
          {
            name: 'react-dom',
            version: '^17.0.0 || ^18.0.0',
          },
        ],
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                componentId,
                componentName: component.name,
                dependencies,
              },
              null,
              2,
            ),
          },
        ],
      }
    }

    if (name === 'get_component_alternatives') {
      const { componentId, limit = 3 } = args || {}
      if (!componentId || typeof componentId !== 'string') {
        throw new Error('componentId is required and must be a string')
      }

      const component = componentRegistry.getComponent(componentId)
      if (!component) throw new Error(`Component ${componentId} not found`)

      const alternatives = Object.values(componentRegistry.getAllComponents())
        .filter((c: any) => c.id !== componentId && c.category === component.category)
        .slice(0, limit)
        .map((c: any) => ({
          id: c.id,
          name: c.name,
          description: c.description,
          similarities: getSimilarities(component, c),
          differences: getDifferences(component, c),
        }))

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                componentId,
                componentName: component.name,
                alternatives,
              },
              null,
              2,
            ),
          },
        ],
      }
    }

    if (name === 'compare_components') {
      const { componentIds } = args || {}
      if (!Array.isArray(componentIds) || componentIds.length === 0) {
        throw new Error('componentIds must be a non-empty array of strings')
      }

      const components = componentIds
        .map((id) => componentRegistry.getComponent(id))
        .filter((component): component is any => Boolean(component))

      if (components.length === 0) {
        throw new Error('No valid components found to compare')
      }

      const comparison = {
        components: components.map((component: any) => ({
          id: component.id,
          name: component.name,
          category: component.category,
          description: component.description,
          version: component.version,
          isExperimental: component.isExperimental,
          propertyCount: Object.keys(component.properties || {}).length,
          requiredPropertyCount: Object.values(component.properties || {}).filter(
            (p: any) => p?.required,
          ).length,
        })),
        commonProperties: findCommonProperties(components),
        uniqueProperties: findUniqueProperties(components),
      }

      return { content: [{ type: 'text', text: JSON.stringify(comparison, null, 2) }] }
    }

    if (name === 'search_usage_guidelines') {
      const { query, section, componentId, limit } = args || {}

      if (!query && !section && !componentId) {
        throw new Error(
          'At least one search parameter (query, section, or componentId) must be provided',
        )
      }

      const results = componentRegistry.searchUsageGuidelines({
        query,
        section,
        componentId,
      })

      const limitedResults = limit ? results.slice(0, limit) : results

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                searchParams: { query, section, componentId, limit },
                totalResults: results.length,
                returnedResults: limitedResults.length,
                results: limitedResults.map((result: any) => ({
                  componentId: result.componentId,
                  componentName: result.componentName,
                  matchedSections: result.matchedSections,
                  contentPreview:
                    result.content.length > 500
                      ? `${result.content.substring(0, 500)}...\n\n[Content truncated. Access full content via cloudscape://usage/${result.componentId}]`
                      : result.content,
                })),
              },
              null,
              2,
            ),
          },
        ],
      }
    }

    if (name === 'search_component_functions') {
      const { query, returnType, componentId } = args || {}
      const results = componentRegistry.searchFunctions({ query, returnType, componentId })

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                query: args || {},
                totalResults: results.length,
                results: results.map((r: any) => ({
                  componentId: r.componentId,
                  componentName: r.componentName,
                  function: {
                    name: r.function.name,
                    description: r.function.description,
                    returnType: r.function.returnType,
                    parameters: r.function.parameters,
                  },
                })),
              },
              null,
              2,
            ),
          },
        ],
      }
    }

    if (name === 'search_component_events') {
      const { query, cancelable, componentId } = args || {}
      const results = componentRegistry.searchEvents({ query, cancelable, componentId })

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                query: args || {},
                totalResults: results.length,
                results: results.map((r: any) => ({
                  componentId: r.componentId,
                  componentName: r.componentName,
                  event: {
                    name: r.event.name,
                    description: r.event.description,
                    cancelable: r.event.cancelable,
                    detailType: r.event.detailType,
                    detailProperties: r.event.detailProperties,
                  },
                })),
              },
              null,
              2,
            ),
          },
        ],
      }
    }

    if (name === 'search_component_properties') {
      const { query, type, required, deprecated, componentId } = args || {}
      const results = componentRegistry.searchProperties({
        query,
        type,
        required,
        deprecated,
        componentId,
      })

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                query: args || {},
                totalResults: results.length,
                results: results.map((r: any) => ({
                  componentId: r.componentId,
                  componentName: r.componentName,
                  property: {
                    name: r.property.name,
                    type: r.property.type,
                    description: r.property.description,
                    required: r.property.required,
                    deprecated: r.property.isDeprecated,
                    defaultValue: r.property.defaultValue,
                    acceptedValues: r.property.acceptedValues,
                  },
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
  server.setRequestHandler('resources/read', async (req: any) => {
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

function parseMarkdownSections(
  content: string,
): Array<{ title: string; level: number; content: string }> {
  const lines = content.split('\n')
  const sections: Array<{ title: string; level: number; content: string }> = []
  let currentSection: { title: string; level: number; content: string } | null = null

  lines.forEach((line) => {
    const headerMatch = line.match(/^(#{1,6})\s+(.+)$/)

    if (headerMatch) {
      if (currentSection) {
        sections.push(currentSection)
      }

      currentSection = {
        title: headerMatch[2],
        level: headerMatch[1].length,
        content: '',
      }
    } else if (currentSection) {
      currentSection.content += (currentSection.content ? '\n' : '') + line
    }
  })

  if (currentSection) {
    sections.push(currentSection)
  }

  return sections.map((section) => ({
    ...section,
    content: section.content.trim(),
  }))
}

function getComponentAriaRoles(component: any): string[] {
  const rolesByComponent: Record<string, string[]> = {
    button: ['button'],
    link: ['link'],
    checkbox: ['checkbox'],
    table: ['table', 'grid'],
    form: ['form'],
    alert: ['alert'],
    modal: ['dialog'],
    tabs: ['tablist', 'tab', 'tabpanel'],
    menu: ['menu', 'menuitem'],
    select: ['listbox', 'option'],
  }

  return rolesByComponent[component.id] || ['none']
}

function getComponentKeyboardNavigation(component: any): Record<string, string> {
  const navigationByComponent: Record<string, Record<string, string>> = {
    button: {
      'Enter/Space': 'Activates the button',
    },
    link: {
      Enter: 'Activates the link',
    },
    checkbox: {
      Space: 'Toggles the checkbox',
    },
    table: {
      Tab: 'Moves focus to the next focusable element',
      'Arrow keys': 'Navigates between cells',
      'Home/End': 'Moves to the first/last cell in a row',
    },
    tabs: {
      Tab: 'Moves focus to the next tab',
      'Arrow keys': 'Moves between tabs',
      'Enter/Space': 'Activates the focused tab',
    },
  }

  return navigationByComponent[component.id] || {}
}

function getComponentScreenReaderSupport(component: any): string[] {
  const supportByComponent: Record<string, string[]> = {
    button: ['Announces button text', 'Announces button state (disabled, pressed)'],
    link: ['Announces link text', 'Announces if link opens in a new window'],
    checkbox: [
      'Announces checkbox label',
      'Announces checkbox state (checked, unchecked, indeterminate)',
    ],
    table: [
      'Announces table caption',
      'Announces row and column headers',
      'Announces cell content with context',
    ],
  }

  return supportByComponent[component.id] || ['Standard screen reader support']
}

function getComponentAccessibilityBestPractices(component: any): string[] {
  const bestPracticesByComponent: Record<string, string[]> = {
    button: [
      'Use clear and concise button text',
      'Avoid generic text like "Click here"',
      'Ensure sufficient color contrast',
    ],
    link: [
      'Use descriptive link text',
      'Avoid generic text like "Click here"',
      'Indicate if links open in a new window',
    ],
    checkbox: ['Use clear and concise labels', 'Group related checkboxes with fieldset and legend'],
    table: [
      'Use proper table headers',
      'Include a caption or summary',
      'Keep tables simple and avoid complex nesting',
    ],
  }

  return (
    bestPracticesByComponent[component.id] || [
      'Follow WCAG 2.1 AA guidelines',
      'Ensure keyboard accessibility',
      'Provide text alternatives for non-text content',
      'Ensure sufficient color contrast',
    ]
  )
}

function getComponentAccessibilityCommonIssues(component: any): string[] {
  const issuesByComponent: Record<string, string[]> = {
    button: ['Missing accessible name', 'Insufficient color contrast', 'Not keyboard accessible'],
    link: [
      'Generic link text',
      'Missing indication for links opening in new windows',
      'Links that look like buttons',
    ],
    checkbox: [
      'Missing or unclear labels',
      'Not keyboard accessible',
      'Missing state changes announcement',
    ],
    table: [
      'Missing table headers',
      'Complex tables without proper structure',
      'Missing caption or summary',
    ],
  }

  return (
    issuesByComponent[component.id] || [
      'Insufficient color contrast',
      'Missing keyboard accessibility',
      'Missing text alternatives',
      'Missing ARIA attributes',
    ]
  )
}

function findCommonProperties(components: any[]): string[] {
  if (components.length === 0) {
    return []
  }

  const firstComponentProps = Object.keys(components[0].properties || {})
  return firstComponentProps.filter((propName) =>
    components.every((component) => component.properties?.[propName]),
  )
}

function findUniqueProperties(components: any[]): Record<string, string[]> {
  const result: Record<string, string[]> = {}

  components.forEach((component) => {
    const componentProps = Object.keys(component?.properties || {})
    const uniqueProps = componentProps.filter((propName) =>
      components
        .filter((c) => c !== component)
        .every((c) => !c?.properties || !c.properties[propName]),
    )

    if (component?.id) {
      result[component.id] = uniqueProps
    }
  })

  return result
}

function getSimilarities(component1: any, component2: any): string[] {
  const similarities: string[] = []

  if (component1.category === component2.category) {
    similarities.push(`Both are ${component1.category} components`)
  }

  const commonProps = findCommonProperties([component1, component2])
  if (commonProps.length > 0) {
    similarities.push(`Share ${commonProps.length} common properties`)
  }

  return similarities.length > 0 ? similarities : ['No significant similarities found']
}

function getDifferences(component1: any, component2: any): string[] {
  const differences: string[] = []

  const props1Count = Object.keys(component1.properties || {}).length
  const props2Count = Object.keys(component2.properties || {}).length
  if (props1Count !== props2Count) {
    differences.push(
      `${component1.name} has ${props1Count} properties, while ${component2.name} has ${props2Count}`,
    )
  }

  if (component1.isExperimental !== component2.isExperimental) {
    if (component1.isExperimental) {
      differences.push(`${component1.name} is experimental, while ${component2.name} is stable`)
    } else {
      differences.push(`${component1.name} is stable, while ${component2.name} is experimental`)
    }
  }

  return differences.length > 0 ? differences : ['No significant differences found']
}

function isValueTypeValid(_value: any, _expectedType: string): boolean {
  return true
}

main().catch((err) => {
  console.error('SDK server error:', err)
  process.exit(1)
})
