/**
 * FastMCP Server Implementation
 *
 * This is a TypeScript implementation of the MCP server for the Cloudscape component library
 * using the FastMCP framework.
 */

import { FastMCP } from 'fastmcp';
import { z } from 'zod'; // Using Zod for schema validation
import * as fs from 'fs';
import * as path from 'path';

// Import other modules
import componentRegistry from '../components/registry';
import searchEngine from '../search/engine';
import codeGenerator from '../code-generator/generator';
import documentationProvider from '../documentation/provider';
import propertyExplorer from '../property-explorer';
import exampleProvider from '../example-provider';

/**
 * Create a FastMCP server instance
 * @param options - Server options
 * @returns FastMCP server instance
 */
export function createFastMCPServer(options: {
  name: string;
  description: string;
  version: string;
  port?: number;
  bind?: string;
}) {
  // Create a new FastMCP server
  const server = new FastMCP({
    name: options.name,
    version: options.version as `${number}.${number}.${number}`,
  });

  // Note: port and bind options are used when calling server.start()

  // Register tools
  registerTools(server);

  // Register resources
  registerResources(server);

  return server;
}

/**
 * Register tools with the FastMCP server
 * @param server - FastMCP server instance
 */
function registerTools(server: FastMCP) {
  // Tool: search_components
  server.addTool({
    name: 'search_components',
    description: 'Search for Cloudscape components with advanced options',
    parameters: z.object({
      query: z.string().describe('Search query'),
      category: z.string().optional().describe('Component category'),
      tags: z.array(z.string()).optional().describe('Tags to filter by'),
      limit: z.number().optional().describe('Maximum number of results to return'),
      offset: z.number().optional().describe('Offset for pagination'),
      fuzzyMatch: z.boolean().optional().describe('Whether to use fuzzy matching'),
      fuzzyThreshold: z.number().optional().describe('Threshold for fuzzy matching (0-1)'),
      filters: z.record(z.any()).optional().describe('Additional filters'),
      sortBy: z.string().optional().describe('Field to sort by'),
      sortOrder: z.string().optional().describe('Sort order (asc or desc)'),
    }),
    execute: async (args) => {
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
        sortOrder
      } = args;
      
      // Search for components with advanced options
      const searchResult = searchEngine.searchComponents({
        query,
        category,
        tags,
        limit,
        offset,
        fuzzyMatch,
        fuzzyThreshold,
        filters,
        sortBy,
        sortOrder: sortOrder as "asc" | "desc" | undefined
      });
      
      return {
        type: 'text',
        text: JSON.stringify({
          results: searchResult.results.map(result => ({
            componentId: result.id,
            name: result.name,
            category: result.category,
            description: result.description,
            relevance: result.relevance,
            matchedFields: result.matchedFields,
            tags: result.tags,
            importPath: result.importPath,
            version: result.version,
            isExperimental: result.isExperimental,
          })),
          totalResults: searchResult.totalResults,
          query: searchResult.query,
          category: searchResult.category,
          tags: searchResult.tags,
          limit: searchResult.limit,
          offset: searchResult.offset
        })
      };
    },
  });

  // Tool: get_component_details
  server.addTool({
    name: 'get_component_details',
    description: 'Get detailed information about a component',
    parameters: z.object({
      componentId: z.string().describe('Component ID'),
      includeExamples: z.boolean().optional().describe('Whether to include examples'),
      includeRelatedComponents: z.boolean().optional().describe('Whether to include related components'),
      includeProperties: z.boolean().optional().describe('Whether to include properties'),
    }),
    execute: async (args) => {
      const {
        componentId,
        includeExamples = true,
        includeRelatedComponents = true,
        includeProperties = true
      } = args;
      
      // Get component details
      const component = componentRegistry.getComponent(componentId);
      
      if (!component) {
        throw new Error(`Component ${componentId} not found`);
      }
      
      // Build component details
      const componentDetails: any = {
        id: component.id,
        name: component.name,
        category: component.category,
        description: component.description,
        importPath: component.importPath,
        version: component.version,
        isExperimental: component.isExperimental,
        tags: component.tags,
      };
      
      // Include related components if requested
      if (includeRelatedComponents) {
        componentDetails.relatedComponents = (component.relatedComponents || []).map(id => {
          const relatedComponent = componentRegistry.getComponent(id);
          return {
            id,
            name: relatedComponent ? relatedComponent.name : id,
            category: relatedComponent ? relatedComponent.category : null,
            description: relatedComponent ? relatedComponent.description : null,
          };
        });
      }
      
      // Include properties if requested
      if (includeProperties) {
        componentDetails.properties = Object.values(component.properties).map(property => ({
          name: property.name,
          type: property.type,
          description: property.description,
          defaultValue: property.defaultValue,
          required: property.required,
          acceptedValues: property.acceptedValues,
          isDeprecated: property.isDeprecated,
          examples: property.examples || [],
        }));
      }
      
      // Include examples if requested
      if (includeExamples) {
        componentDetails.examples = componentRegistry.getComponentExamples({
          componentId,
          limit: 5,
        }).map(example => ({
          id: example.id,
          name: example.name,
          description: example.description,
          type: example.type,
        }));
      }
      
      // Format the response as a TextContent object
      return {
        type: 'text',
        text: JSON.stringify(componentDetails, null, 2)
      };
    },
  });

  // Tool: generate_component_code
  server.addTool({
    name: 'generate_component_code',
    description: 'Generate code for a component with advanced customization options',
    parameters: z.object({
      componentId: z.string().describe('Component ID'),
      props: z.record(z.any()).optional().describe('Component props'),
      children: z.string().optional().describe('Component children'),
      eventHandlers: z.record(z.any()).optional().describe('Component event handlers'),
      typescript: z.boolean().optional().describe('Whether to generate TypeScript code'),
      style: z.string().optional().describe('Code style (compact or expanded)'),
      includeImports: z.boolean().optional().describe('Whether to include imports in the code'),
    }),
    execute: async (args) => {
      const {
        componentId,
        props = {},
        children = '',
        eventHandlers = {},
        typescript = true,
        style = 'expanded',
        includeImports = true
      } = args;
      
      // Get component details
      const component = componentRegistry.getComponent(componentId);
      
      if (!component) {
        throw new Error(`Component ${componentId} not found`);
      }
      
      // Generate code
      const codeResult = codeGenerator.generateComponentCode({
        componentId,
        props,
        children,
        eventHandlers,
        typescript,
        style: style as 'compact' | 'expanded',
        includeImports
      });
      
      return {
        type: 'text',
        text: codeResult.code
      };
    },
  });

  // Tool: generate_pattern_code
  server.addTool({
    name: 'generate_pattern_code',
    description: 'Generate code for a common pattern with advanced customization options',
    parameters: z.object({
      patternId: z.string().describe('Pattern ID'),
      customizations: z.record(z.any()).optional().describe('Pattern customizations'),
      typescript: z.boolean().optional().describe('Whether to generate TypeScript code'),
      style: z.string().optional().describe('Code style (compact or expanded)'),
      includeImports: z.boolean().optional().describe('Whether to include imports in the code'),
    }),
    execute: async (args) => {
      const {
        patternId,
        customizations = {},
        typescript = true,
        style = 'expanded',
        includeImports = true
      } = args;
      
      // Get pattern details
      const pattern = componentRegistry.getPattern(patternId);
      
      if (!pattern) {
        throw new Error(`Pattern ${patternId} not found`);
      }
      
      // Generate code
      const codeResult = codeGenerator.generatePatternCode({
        patternId,
        customizations,
        typescript,
        style: style as 'compact' | 'expanded',
        includeImports
      });
      
      return {
        type: 'text',
        text: codeResult.code
      };
    },
  });

  // Tool: search_documentation
  server.addTool({
    name: 'search_documentation',
    description: 'Search within component documentation',
    parameters: z.object({
      query: z.string().describe('Search query'),
      scope: z.string().optional().describe('Search scope (components, categories, patterns, all)'),
      limit: z.number().optional().describe('Maximum number of results to return'),
    }),
    execute: async (args) => {
      const {
        query,
        scope = 'all',
        limit = 10
      } = args;
      
      // Search documentation
      const results = documentationProvider.searchDocumentation({
        query,
        scope: scope as 'components' | 'categories' | 'patterns' | 'all',
        limit
      });
      
      return {
        type: 'text',
        text: JSON.stringify(results)
      };
    },
  });

  // Tool: get_component_properties
  server.addTool({
    name: 'get_component_properties',
    description: 'Retrieve detailed property information for a specific component',
    parameters: z.object({
      componentId: z.string().describe('Component ID'),
      filter: z.object({
        required: z.boolean().optional().describe('Filter by required status'),
        deprecated: z.boolean().optional().describe('Filter by deprecated status'),
        type: z.string().optional().describe('Filter by property type'),
        namePattern: z.string().optional().describe('Filter by name pattern (regex)'),
      }).optional().describe('Property filters'),
    }),
    execute: async (args) => {
      const {
        componentId,
        filter = {}
      } = args;
      
      // Get component properties
      const properties = propertyExplorer.getComponentProperties({
        componentId,
        filter
      });
      
      return {
        type: 'text',
        text: JSON.stringify(properties)
      };
    },
  });

  // Tool: get_component_examples
  server.addTool({
    name: 'get_component_examples',
    description: 'Get usage examples for a specific component, or a specific example by ID',
    parameters: z.object({
      componentId: z.string().describe('Component ID'),
      exampleId: z.string().optional().describe('Specific example ID to retrieve (format: componentId-exampleName)'),
      type: z.string().optional().describe('Example type (ignored if exampleId is provided)'),
      limit: z.number().optional().describe('Maximum number of examples to return (ignored if exampleId is provided)'),
      tags: z.array(z.string()).optional().describe('Tags to filter by (ignored if exampleId is provided)'),
    }),
    execute: async (args) => {
      const {
        componentId,
        exampleId,
        type,
        limit = 5,
        tags = []
      } = args;
      
      // If exampleId is provided, get that specific example
      if (exampleId) {
        const example = componentRegistry.getExampleById(exampleId);
        
        if (!example) {
          throw new Error(`Example ${exampleId} not found`);
        }
        
        // Verify the example belongs to the specified component
        if (example.component !== componentId) {
          throw new Error(`Example ${exampleId} does not belong to component ${componentId}`);
        }
        
        return {
          type: 'text',
          text: JSON.stringify({
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
              code: example.code
            }
          }, null, 2)
        };
      }
      
      // Otherwise, get multiple examples using the existing logic
      const examplesResponse = exampleProvider.getExamples({
        componentId,
        type,
        limit,
        tags
      });
      
      return {
        type: 'text',
        text: JSON.stringify({
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
            // Include code for examples but truncate if very long
            code: example.code && example.code.length > 1000 ? example.code.substring(0, 1000) + '...' : example.code
          }))
        }, null, 2)
      };
    },
  });

  // Additional tools
  server.addTool({
    name: 'validate_component_props',
    description: 'Validate if provided props are valid for a component',
    parameters: z.object({
      componentId: z.string().describe('Component ID'),
      props: z.record(z.any()).describe('Component props to validate'),
    }),
    execute: async (args) => {
      const { componentId, props } = args;
      
      // Get component properties for validation
      const properties = propertyExplorer.getComponentProperties({
        componentId
      });
      
      // Validate props against component properties
      const validationResult = {
        isValid: true,
        errors: [] as string[],
        warnings: [] as string[]
      };
      
      // Simple validation logic
      if (properties) {
        Object.entries(props).forEach(([key, value]) => {
          const property = properties[key];
          if (!property) {
            validationResult.warnings.push(`Unknown property: ${key}`);
          } else if (property.required && (value === undefined || value === null)) {
            validationResult.errors.push(`Required property ${key} is missing`);
            validationResult.isValid = false;
          } else if (value !== undefined && !isValueTypeValid(value, property.type)) {
            validationResult.errors.push(`Property ${key} has invalid type`);
            validationResult.isValid = false;
          }
        });
        
        // Check for missing required properties
        Object.entries(properties).forEach(([key, property]) => {
          if (property.required && !(key in props)) {
            validationResult.errors.push(`Required property ${key} is missing`);
            validationResult.isValid = false;
          }
        });
      }
      
      return {
        type: 'text',
        text: JSON.stringify(validationResult)
      };
    },
  });

  server.addTool({
    name: 'get_component_patterns',
    description: 'Get common usage patterns for a component',
    parameters: z.object({
      componentId: z.string().describe('Component ID'),
      limit: z.number().optional().describe('Maximum number of patterns to return'),
    }),
    execute: async (args) => {
      const { componentId, limit = 5 } = args;
      
      // Get component patterns
      const patterns = Object.values(componentRegistry.getAllPatterns())
        .filter(pattern => pattern.components.includes(componentId))
        .slice(0, limit);
      
      return {
        type: 'text',
        text: JSON.stringify(patterns)
      };
    },
  });
  // Tool: get_component_accessibility
  server.addTool({
    name: 'get_component_accessibility',
    description: 'Get accessibility information and best practices for a component',
    parameters: z.object({
      componentId: z.string().describe('Component ID'),
    }),
    execute: async (args) => {
      const { componentId } = args;
      
      // Get component details
      const component = componentRegistry.getComponent(componentId);
      
      if (!component) {
        throw new Error(`Component ${componentId} not found`);
      }
      
      // Generate accessibility information
      const accessibilityInfo = {
        name: component.name,
        ariaRoles: getComponentAriaRoles(component),
        keyboardNavigation: getComponentKeyboardNavigation(component),
        screenReaderSupport: getComponentScreenReaderSupport(component),
        bestPractices: getComponentAccessibilityBestPractices(component),
        commonIssues: getComponentAccessibilityCommonIssues(component),
      };
      
      return {
        type: 'text',
        text: JSON.stringify(accessibilityInfo, null, 2)
      };
    },
  });
  
  // Tool: get_component_events
  server.addTool({
    name: 'get_component_events',
    description: 'Get information about events emitted by a component and event handler properties',
    parameters: z.object({
      componentId: z.string().describe('Component ID'),
    }),
    execute: async (args) => {
      const { componentId } = args;
      
      // Get component details
      const component = componentRegistry.getComponent(componentId);
      
      if (!component) {
        throw new Error(`Component ${componentId} not found`);
      }
      
      // Get events from the enhanced component metadata
      const events = Object.values(component.events || {}).map(event => ({
        name: event.name,
        description: event.description,
        cancelable: event.cancelable,
        detailType: event.detailType,
        detailProperties: event.detailProperties
      }));
      
      // Also get event handler properties for backward compatibility
      const eventHandlers = Object.values(component.properties)
        .filter(prop => prop.name.startsWith('on') && (prop.type === 'function' || prop.type.includes('function')))
        .map(prop => ({
          name: prop.name,
          description: prop.description,
          type: prop.type,
          isRequired: prop.required,
          isDeprecated: prop.isDeprecated,
          examples: prop.examples || []
        }));
      
      return {
        type: 'text',
        text: JSON.stringify({
          componentId,
          componentName: component.name,
          events,
          eventHandlers,
          totalEvents: events.length,
          totalEventHandlers: eventHandlers.length
        }, null, 2)
      };
    },
  });
  
  // Tool: get_component_versions
  server.addTool({
    name: 'get_component_versions',
    description: 'Get version history and changes for a component',
    parameters: z.object({
      componentId: z.string().describe('Component ID'),
    }),
    execute: async (args) => {
      const { componentId } = args;
      
      // Get component details
      const component = componentRegistry.getComponent(componentId);
      
      if (!component) {
        throw new Error(`Component ${componentId} not found`);
      }
      
      // Generate version history (mock data for now)
      const versionHistory = [
        {
          version: component.version,
          date: '2025-05-01',
          changes: [
            'Initial release',
            'Added basic functionality'
          ]
        },
        {
          version: '1.0.0',
          date: '2025-04-15',
          changes: [
            'Beta release',
            'Fixed accessibility issues'
          ]
        }
      ];
      
      return {
        type: 'text',
        text: JSON.stringify({
          componentId,
          componentName: component.name,
          currentVersion: component.version,
          versionHistory
        }, null, 2)
      };
    },
  });
  
  // Tool: compare_components
  server.addTool({
    name: 'compare_components',
    description: 'Compare features and properties of multiple components',
    parameters: z.object({
      componentIds: z.array(z.string()).describe('Component IDs to compare'),
    }),
    execute: async (args) => {
      const { componentIds } = args;
      
      // Get component details
      const components = componentIds.map(id => componentRegistry.getComponent(id)).filter(Boolean);
      
      if (components.length === 0) {
        throw new Error('No valid components found to compare');
      }
      
      // Compare components
      const comparison = {
        components: components.map(component => ({
          id: component?.id || 'unknown',
          name: component?.name || 'Unknown Component',
          category: component?.category || 'unknown',
          description: component?.description || '',
          version: component?.version || '0.0.0',
          isExperimental: component?.isExperimental || false,
          propertyCount: Object.keys(component?.properties || {}).length,
          requiredPropertyCount: Object.values(component?.properties || {}).filter(p => p?.required).length
        })),
        commonProperties: findCommonProperties(components),
        uniqueProperties: findUniqueProperties(components)
      };
      
      return {
        type: 'text',
        text: JSON.stringify(comparison, null, 2)
      };
    },
  });
  
  // Tool: get_component_alternatives
  server.addTool({
    name: 'get_component_alternatives',
    description: 'Get alternative components that could be used instead',
    parameters: z.object({
      componentId: z.string().describe('Component ID'),
      limit: z.number().optional().describe('Maximum number of alternatives to return'),
    }),
    execute: async (args) => {
      const { componentId, limit = 3 } = args;
      
      // Get component details
      const component = componentRegistry.getComponent(componentId);
      
      if (!component) {
        throw new Error(`Component ${componentId} not found`);
      }
      
      // Find alternative components in the same category
      const alternatives = Object.values(componentRegistry.getAllComponents())
        .filter(c => c.id !== componentId && c.category === component.category)
        .slice(0, limit)
        .map(c => ({
          id: c.id,
          name: c.name,
          description: c.description,
          similarities: getSimilarities(component, c),
          differences: getDifferences(component, c)
        }));
      
      return {
        type: 'text',
        text: JSON.stringify({
          componentId,
          componentName: component.name,
          alternatives
        }, null, 2)
      };
    },
  });
  
  // Tool: get_component_dependencies
  server.addTool({
    name: 'get_component_dependencies',
    description: 'Get dependencies required by a component',
    parameters: z.object({
      componentId: z.string().describe('Component ID'),
    }),
    execute: async (args) => {
      const { componentId } = args;
      
      // Get component details
      const component = componentRegistry.getComponent(componentId);
      
      if (!component) {
        throw new Error(`Component ${componentId} not found`);
      }
      
      // Generate dependencies (mock data for now)
      const dependencies = {
        required: [
          {
            name: '@cloudscape-design/components',
            version: '^3.0.0'
          }
        ],
        optional: [
          {
            name: '@cloudscape-design/global-styles',
            version: '^1.0.0',
            purpose: 'For consistent styling across components'
          }
        ],
        peerDependencies: [
          {
            name: 'react',
            version: '^17.0.0 || ^18.0.0'
          },
          {
            name: 'react-dom',
            version: '^17.0.0 || ^18.0.0'
          }
        ]
      };
      
      return {
        type: 'text',
        text: JSON.stringify({
          componentId,
          componentName: component.name,
          dependencies
        }, null, 2)
      };
    },
  });

  // Tool: search_component_properties
  server.addTool({
    name: 'search_component_properties',
    description: 'Search for specific properties across components',
    parameters: z.object({
      query: z.string().optional().describe('Search query for property name or description'),
      type: z.string().optional().describe('Property type to filter by'),
      required: z.boolean().optional().describe('Filter by required status'),
      deprecated: z.boolean().optional().describe('Filter by deprecated status'),
      componentId: z.string().optional().describe('Limit search to specific component'),
    }),
    execute: async (args) => {
      const results = componentRegistry.searchProperties(args);
      
      return {
        type: 'text',
        text: JSON.stringify({
          query: args,
          totalResults: results.length,
          results: results.map(r => ({
            componentId: r.componentId,
            componentName: r.componentName,
            property: {
              name: r.property.name,
              type: r.property.type,
              description: r.property.description,
              required: r.property.required,
              deprecated: r.property.isDeprecated,
              defaultValue: r.property.defaultValue,
              acceptedValues: r.property.acceptedValues
            }
          }))
        }, null, 2)
      };
    },
  });

  // Tool: search_component_events  
  server.addTool({
    name: 'search_component_events',
    description: 'Search for events across components',
    parameters: z.object({
      query: z.string().optional().describe('Search query for event name or description'),
      cancelable: z.boolean().optional().describe('Filter by cancelable status'),
      componentId: z.string().optional().describe('Limit search to specific component'),
    }),
    execute: async (args) => {
      const results = componentRegistry.searchEvents(args);
      
      return {
        type: 'text',
        text: JSON.stringify({
          query: args,
          totalResults: results.length,
          results: results.map(r => ({
            componentId: r.componentId,
            componentName: r.componentName,
            event: {
              name: r.event.name,
              description: r.event.description,
              cancelable: r.event.cancelable,
              detailType: r.event.detailType,
              detailProperties: r.event.detailProperties
            }
          }))
        }, null, 2)
      };
    },
  });

  // Tool: search_component_functions
  server.addTool({
    name: 'search_component_functions',
    description: 'Search for functions/methods across components',
    parameters: z.object({
      query: z.string().optional().describe('Search query for function name or description'),
      returnType: z.string().optional().describe('Filter by return type'),
      componentId: z.string().optional().describe('Limit search to specific component'),
    }),
    execute: async (args) => {
      const results = componentRegistry.searchFunctions(args);
      
      return {
        type: 'text',
        text: JSON.stringify({
          query: args,
          totalResults: results.length,
          results: results.map(r => ({
            componentId: r.componentId,
            componentName: r.componentName,
            function: {
              name: r.function.name,
              description: r.function.description,
              returnType: r.function.returnType,
              parameters: r.function.parameters
            }
          }))
        }, null, 2)
      };
    },
  });

  // Tool: get_example_code
  server.addTool({
    name: 'get_example_code',
    description: 'Get the full code for a specific example',
    parameters: z.object({
      exampleId: z.string().describe('Example ID (format: componentId-exampleName)'),
    }),
    execute: async (args) => {
      const { exampleId } = args;
      
      const example = componentRegistry.getExampleById(exampleId);
      
      if (!example) {
        throw new Error(`Example ${exampleId} not found`);
      }
      
      return {
        type: 'text',
        text: JSON.stringify({
          id: example.id,
          name: example.name,
          description: example.description,
          component: example.component,
          type: example.type,
          tags: example.tags,
          code: example.code
        }, null, 2)
      };
    },
  });

  // Tool: search_patterns
  server.addTool({
    name: 'search_patterns',
    description: 'Search for design patterns and common component combinations',
    parameters: z.object({
      query: z.string().optional().describe('Search query for pattern name or description'),
      component: z.string().optional().describe('Filter patterns that use a specific component'),
      tags: z.array(z.string()).optional().describe('Filter patterns by component tags (searches within pattern components)'),
    }),
    execute: async (args) => {
      const results = componentRegistry.searchPatterns(args);
      
      return {
        type: 'text',
        text: JSON.stringify({
          query: args,
          totalResults: results.length,
          patterns: results.map(pattern => ({
            id: pattern.id,
            name: pattern.name,
            description: pattern.description,
            components: pattern.components,
            customizationOptions: Object.keys(pattern.customizationOptions || {}),
            // Include code but truncate if very long
            code: pattern.code && pattern.code.length > 2000 
              ? pattern.code.substring(0, 2000) + '...\n\n// Code truncated. Use get_pattern_code for full code.'
              : pattern.code
          }))
        }, null, 2)
      };
    },
  });

  // Tool: get_pattern_code
  server.addTool({
    name: 'get_pattern_code',
    description: 'Get the full code for a specific design pattern',
    parameters: z.object({
      patternId: z.string().describe('Pattern ID (e.g., "data-table", "form-layout")'),
    }),
    execute: async (args) => {
      const { patternId } = args;
      
      const pattern = componentRegistry.getPattern(patternId);
      
      if (!pattern) {
        throw new Error(`Pattern ${patternId} not found`);
      }
      
      return {
        type: 'text',
        text: JSON.stringify({
          id: pattern.id,
          name: pattern.name,
          description: pattern.description,
          components: pattern.components,
          customizationOptions: pattern.customizationOptions,
          code: pattern.code
        }, null, 2)
      };
    },
  });

  // Tool: get_component_usage
  server.addTool({
    name: 'get_component_usage',
    description: 'Get usage guidelines for a component with optional section filtering',
    parameters: z.object({
      componentId: z.string().describe('Component ID'),
      section: z.string().optional().describe('Specific section to extract (e.g., "General guidelines", "Features")'),
      format: z.enum(['markdown', 'text', 'json']).optional().describe('Output format (default: markdown)'),
    }),
    execute: async (args) => {
      const { componentId, section, format = 'markdown' } = args;
      
      const usageContent = componentRegistry.getComponentUsage(componentId);
      
      if (!usageContent) {
        throw new Error(`Usage guidelines for component ${componentId} not found`);
      }
      
      let content = usageContent;
      
      // Extract specific section if requested
      if (section) {
        const lines = usageContent.split('\n');
        const sectionStart = lines.findIndex(line => 
          line.toLowerCase().includes(section.toLowerCase()) && 
          (line.startsWith('##') || line.startsWith('###'))
        );
        
        if (sectionStart === -1) {
          throw new Error(`Section "${section}" not found in usage guidelines for ${componentId}`);
        }
        
        // Find the end of the section (next section or end of content)
        let sectionEnd = lines.length;
        for (let i = sectionStart + 1; i < lines.length; i++) {
          if (lines[i].startsWith('## ')) {
            sectionEnd = i;
            break;
          }
        }
        
        content = lines.slice(sectionStart, sectionEnd).join('\n').trim();
      }
      
      // Format the content based on requested format
      let formattedContent = content;
      if (format === 'text') {
        // Strip markdown formatting for plain text
        formattedContent = content
          .replace(/#{1,6}\s+/g, '') // Remove headers
          .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
          .replace(/(?<!\s)\*([^*\n]+)\*(?!\s)/g, '$1') // Remove italic (single asterisks not preceded/followed by whitespace)
          .replace(/`(.*?)`/g, '$1') // Remove inline code
          .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links, keep text
          .replace(/^\s*\*\s+/gm, '• ') // Convert markdown bullets to unicode bullets
          .trim();
      } else if (format === 'json') {
        // Parse into structured format
        const parsedSections = parseMarkdownSections(content);
        formattedContent = JSON.stringify({
          componentId,
          requestedSection: section,
          sections: parsedSections
        }, null, 2);
      }
      
      return {
        type: 'text',
        text: format === 'json' ? formattedContent : formattedContent
      };
    },
  });

  // Tool: search_usage_guidelines
  server.addTool({
    name: 'search_usage_guidelines',
    description: 'Search usage guidelines across all components',
    parameters: z.object({
      query: z.string().optional().describe('Search query to find in usage content'),
      section: z.string().optional().describe('Filter by specific section name'),
      componentId: z.string().optional().describe('Limit search to specific component'),
      limit: z.number().optional().describe('Maximum number of results to return'),
    }),
    execute: async (args) => {
      const { query, section, componentId, limit } = args;
      
      if (!query && !section && !componentId) {
        throw new Error('At least one search parameter (query, section, or componentId) must be provided');
      }
      
      const results = componentRegistry.searchUsageGuidelines({
        query,
        section,
        componentId
      });
      
      // Apply limit if specified
      const limitedResults = limit ? results.slice(0, limit) : results;
      
      return {
        type: 'text',
        text: JSON.stringify({
          searchParams: { query, section, componentId, limit },
          totalResults: results.length,
          returnedResults: limitedResults.length,
          results: limitedResults.map(result => ({
            componentId: result.componentId,
            componentName: result.componentName,
            matchedSections: result.matchedSections,
            // Truncate content for search results, full content available via resource
            contentPreview: result.content.length > 500 
              ? result.content.substring(0, 500) + '...\n\n[Content truncated. Access full content via cloudscape://usage/' + result.componentId + ']'
              : result.content
          }))
        }, null, 2)
      };
    },
  });

  // Tool: get_component_demos
  server.addTool({
    name: 'get_component_demos',
    description: 'Get demos for a specific component with filtering options',
    parameters: z.object({
      componentId: z.string().describe('Component ID to get demos for'),
      demoType: z.string().optional().describe('Filter by demo type (basic, interactive, form, data-display, etc.)'),
      includeCode: z.boolean().optional().describe('Whether to include demo code in response'),
      includeVariations: z.boolean().optional().describe('Whether to include demo variations'),
      tags: z.array(z.string()).optional().describe('Filter by tags'),
      complexity: z.enum(['basic', 'intermediate', 'advanced']).optional().describe('Filter by complexity level'),
      limit: z.number().optional().describe('Maximum number of demos to return'),
      offset: z.number().optional().describe('Offset for pagination')
    }),
    execute: async (args) => {
      // Validate required parameters
      if (typeof args.componentId !== 'string') {
        throw new Error('componentId is required and must be a string');
      }

      // Validate optional boolean parameters
      if (args.includeCode !== undefined && typeof args.includeCode !== 'boolean') {
        throw new Error('includeCode must be a boolean value');
      }
      
      if (args.includeVariations !== undefined && typeof args.includeVariations !== 'boolean') {
        throw new Error('includeVariations must be a boolean value');
      }

      // Validate demoType if provided
      if (args.demoType !== undefined && typeof args.demoType !== 'string') {
        throw new Error('demoType must be a string');
      }

      // Validate limit and offset
      if (args.limit !== undefined && (typeof args.limit !== 'number' || args.limit < 0)) {
        throw new Error('limit must be a non-negative number');
      }
      
      if (args.offset !== undefined && (typeof args.offset !== 'number' || args.offset < 0)) {
        throw new Error('offset must be a non-negative number');
      }

      const result = componentRegistry.getComponentDemos(args.componentId, {
        demoType: args.demoType,
        includeCode: args.includeCode ?? true,
        includeVariations: args.includeVariations ?? true,
        tags: args.tags,
        complexity: args.complexity,
        limit: args.limit,
        offset: args.offset
      });

      return {
        type: 'text',
        text: JSON.stringify(result, null, 2)
      };
    }
  });

  // Tool: search_patterns
  server.addTool({
    name: 'search_patterns',
    description: 'Search for design patterns with various filters and options',
    parameters: z.object({
      query: z.string().optional().describe('Search query for pattern name, description, or tags'),
      category: z.string().optional().describe('Filter by pattern category (general, generative-ai, resource-management, layout)'),
      component: z.string().optional().describe('Filter by patterns that use a specific component'),
      tags: z.array(z.string()).optional().describe('Filter by tags'),
      limit: z.number().optional().describe('Maximum number of patterns to return (max 100, default 20)'),
      offset: z.number().optional().describe('Offset for pagination')
    }),
    execute: async (args) => {
      // Validate query parameter
      if (args.query !== undefined && typeof args.query !== 'string') {
        throw new Error('query must be a string');
      }

      // Validate category parameter
      if (args.category !== undefined && typeof args.category !== 'string') {
        throw new Error('category must be a string');
      }

      // Validate component parameter  
      if (args.component !== undefined && typeof args.component !== 'string') {
        throw new Error('component must be a string');
      }

      // Validate limit and offset
      if (args.limit !== undefined && (typeof args.limit !== 'number' || args.limit < 0)) {
        throw new Error('limit must be a non-negative number');
      }
      
      if (args.offset !== undefined && (typeof args.offset !== 'number' || args.offset < 0)) {
        throw new Error('offset must be a non-negative number');
      }

      const result = componentRegistry.searchPatternsByProvider({
        query: args.query,
        category: args.category,
        component: args.component,
        tags: args.tags,
        limit: args.limit,
        offset: args.offset
      });

      return {
        type: 'text',
        text: JSON.stringify(result, null, 2)
      };
    }
  });

  // Tool: get_pattern_details
  server.addTool({
    name: 'get_pattern_details',
    description: 'Get detailed information about a specific design pattern',
    parameters: z.object({
      patternId: z.string().describe('Pattern ID to get details for'),
      includeExamples: z.boolean().optional().describe('Whether to include pattern examples'),
      includeCode: z.boolean().optional().describe('Whether to include pattern code example'),
      includeUsageGuidelines: z.boolean().optional().describe('Whether to include usage guidelines'),
      includeRelatedPatterns: z.boolean().optional().describe('Whether to include related patterns')
    }),
    execute: async (args) => {
      // Validate required parameters
      if (!args.patternId || typeof args.patternId !== 'string') {
        throw new Error('patternId is required and must be a string');
      }

      // Validate optional boolean parameters
      if (args.includeExamples !== undefined && typeof args.includeExamples !== 'boolean') {
        throw new Error('includeExamples must be a boolean value');
      }
      
      if (args.includeCode !== undefined && typeof args.includeCode !== 'boolean') {
        throw new Error('includeCode must be a boolean value');
      }
      
      if (args.includeUsageGuidelines !== undefined && typeof args.includeUsageGuidelines !== 'boolean') {
        throw new Error('includeUsageGuidelines must be a boolean value');
      }
      
      if (args.includeRelatedPatterns !== undefined && typeof args.includeRelatedPatterns !== 'boolean') {
        throw new Error('includeRelatedPatterns must be a boolean value');
      }

      try {
        const result = componentRegistry.getPatternDetails({
          patternId: args.patternId,
          includeExamples: args.includeExamples ?? true,
          includeCode: args.includeCode ?? true,
          includeUsageGuidelines: args.includeUsageGuidelines ?? true,
          includeRelatedPatterns: args.includeRelatedPatterns ?? true
        });

        return {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        };
      } catch (error) {
        if (error instanceof Error && error.message.includes('not found')) {
          throw new Error(`Pattern with ID '${args.patternId}' not found`);
        }
        throw error;
      }
    }
  });

  // Tool: get_pattern_categories
  server.addTool({
    name: 'get_pattern_categories',
    description: 'Get all pattern categories with optional details about patterns in each category',
    parameters: z.object({
      includePatternCount: z.boolean().optional().describe('Whether to include pattern count for each category'),
      includePatternList: z.boolean().optional().describe('Whether to include list of patterns in each category')
    }),
    execute: async (args) => {
      // Validate optional boolean parameters
      if (args.includePatternCount !== undefined && typeof args.includePatternCount !== 'boolean') {
        throw new Error('includePatternCount must be a boolean value');
      }
      
      if (args.includePatternList !== undefined && typeof args.includePatternList !== 'boolean') {
        throw new Error('includePatternList must be a boolean value');
      }

      try {
        const result = componentRegistry.getPatternCategories({
          includePatternCount: args.includePatternCount ?? true,
          includePatternList: args.includePatternList ?? true
        });

        return {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        };
      } catch (error) {
        // Handle any system errors gracefully
        return {
          type: 'text',
          text: JSON.stringify({
            categories: [],
            error: error instanceof Error ? error.message : 'Unknown error occurred'
          }, null, 2)
        };
      }
    }
  });

  // Tool: get_link_resource
  server.addTool({
    name: 'get_link_resource',
    description: 'Resolve links from usage.md files to appropriate backend resources',
    parameters: z.object({
      link: z.string().describe('The link to resolve (e.g., "/components/button/?example=primary-button")'),
    }),
    execute: async (args) => {
      const { link } = args;
      
      const linkResult = parseLinkToResource(link);
      
      if (!linkResult.success) {
        throw new Error(`Unable to resolve link: ${link}. ${linkResult.error}`);
      }
      
      // Execute the appropriate backend call based on the parsed link
      switch (linkResult.type) {
        case 'component_example':
          if (!linkResult.exampleId) {
            throw new Error('Example ID is required for component_example type');
          }
          const example = componentRegistry.getExampleById(linkResult.exampleId);
          if (!example) {
            throw new Error(`Example ${linkResult.exampleId} not found`);
          }
          return {
            type: 'text',
            text: JSON.stringify({
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
                  code: example.code
                }
              }
            }, null, 2)
          };
          
        case 'component_details':
          if (!linkResult.componentId) {
            throw new Error('Component ID is required for component_details type');
          }
          const component = componentRegistry.getComponent(linkResult.componentId);
          if (!component) {
            throw new Error(`Component ${linkResult.componentId} not found`);
          }
          
          // Build response based on tabId
          let componentData: any = {
            id: component.id,
            name: component.name,
            category: component.category,
            description: component.description,
            importPath: component.importPath,
            version: component.version,
            isExperimental: component.isExperimental,
            tags: component.tags,
          };
          
          if (linkResult.tabId === 'api' || !linkResult.tabId) {
            componentData.properties = Object.values(component.properties).map(property => ({
              name: property.name,
              type: property.type,
              description: property.description,
              defaultValue: property.defaultValue,
              required: property.required,
              acceptedValues: property.acceptedValues,
              isDeprecated: property.isDeprecated,
              examples: property.examples || [],
            }));
          }
          
          if (linkResult.tabId === 'usage' || !linkResult.tabId) {
            const usageContent = componentRegistry.getComponentUsage(linkResult.componentId);
            if (usageContent) {
              componentData.usage = usageContent;
            }
          }
          
          return {
            type: 'text',
            text: JSON.stringify({
              linkType: 'component_details',
              originalLink: link,
              resolvedTo: {
                componentId: linkResult.componentId,
                tabId: linkResult.tabId,
                component: componentData
              }
            }, null, 2)
          };
          
        case 'pattern':
          if (!linkResult.patternId) {
            throw new Error('Pattern ID is required for pattern type');
          }
          const pattern = componentRegistry.getPattern(linkResult.patternId);
          if (!pattern) {
            throw new Error(`Pattern ${linkResult.patternId} not found`);
          }
          return {
            type: 'text',
            text: JSON.stringify({
              linkType: 'pattern',
              originalLink: link,
              resolvedTo: {
                patternId: linkResult.patternId,
                pattern: {
                  id: pattern.id,
                  name: pattern.name,
                  description: pattern.description,
                  components: pattern.components,
                  customizationOptions: pattern.customizationOptions,
                  code: pattern.code
                }
              }
            }, null, 2)
          };
          
        case 'foundation':
          return {
            type: 'text',
            text: JSON.stringify({
              linkType: 'foundation',
              originalLink: link,
              resolvedTo: {
                topic: linkResult.topic,
                category: linkResult.category,
                message: `Foundation resource for ${linkResult.category}/${linkResult.topic}`,
                note: 'Foundation resources are informational references to design principles and guidelines'
              }
            }, null, 2)
          };
          
        case 'external':
          return {
            type: 'text',
            text: JSON.stringify({
              linkType: 'external',
              originalLink: link,
              resolvedTo: {
                url: linkResult.url,
                message: 'External link - no backend resource available',
                note: 'This is an external reference that should be accessed directly'
              }
            }, null, 2)
          };
          
        default:
          throw new Error(`Unsupported link type: ${linkResult.type}`);
      }
    },
  });
}

/**
 * Parse a link from usage.md files to determine the appropriate backend resource
 * @param link - The link to parse
 * @returns Parsed link information
 */
function parseLinkToResource(link: string): {
  success: boolean;
  type?: string;
  componentId?: string;
  exampleId?: string;
  tabId?: string;
  patternId?: string;
  topic?: string;
  category?: string;
  url?: string;
  error?: string;
} {
  try {
    // Handle external links
    if (link.startsWith('http://') || link.startsWith('https://')) {
      return {
        success: true,
        type: 'external',
        url: link
      };
    }

    // Remove leading slash if present
    const cleanLink = link.startsWith('/') ? link.substring(1) : link;

    // Parse component links: components/{component-name}/?param=value
    const componentMatch = cleanLink.match(/^components\/([^/?]+)(?:\/)?(?:\?(.+))?$/);
    if (componentMatch) {
      const componentId = componentMatch[1];
      const queryString = componentMatch[2];
      
      let tabId: string | undefined;
      let exampleName: string | undefined;
      
      // Parse query parameters
      if (queryString) {
        const params = new URLSearchParams(queryString);
        tabId = params.get('tabId') || undefined;
        exampleName = params.get('example') || undefined;
      }
      
      // If example is specified, return component_example type
      if (exampleName) {
        const exampleId = `${componentId}-${exampleName.replace(/_/g, '-')}`;
        return {
          success: true,
          type: 'component_example',
          componentId,
          exampleId,
          tabId
        };
      }
      
      // Otherwise return component_details type
      return {
        success: true,
        type: 'component_details',
        componentId,
        tabId
      };
    }

    // Parse pattern links: patterns/{category}/{subcategory}/{pattern-name}/
    const patternMatch = cleanLink.match(/^patterns\/([^/]+)\/([^/]+)\/([^/]+)(?:\/)?$/);
    if (patternMatch) {
      const [, category, subcategory, patternName] = patternMatch;
      const patternId = `${category}-${subcategory}-${patternName}`.replace(/\//g, '-');
      
      return {
        success: true,
        type: 'pattern',
        patternId
      };
    }

    // Parse simple pattern links: patterns/{category}/{pattern-name}/
    const simplePatternMatch = cleanLink.match(/^patterns\/([^/]+)\/([^/]+)(?:\/)?$/);
    if (simplePatternMatch) {
      const [, category, patternName] = simplePatternMatch;
      const patternId = `${category}-${patternName}`.replace(/\//g, '-');
      
      return {
        success: true,
        type: 'pattern',
        patternId
      };
    }

    // Parse foundation links: foundation/{category}/{topic}/
    const foundationMatch = cleanLink.match(/^foundation\/([^/]+)\/([^/#]+)(?:\/)?(?:#(.+))?$/);
    if (foundationMatch) {
      const [, category, topic, anchor] = foundationMatch;
      
      return {
        success: true,
        type: 'foundation',
        category,
        topic: anchor ? `${topic}#${anchor}` : topic
      };
    }

    // Parse example/demo links: examples/{type}/{demo-name}.html
    const exampleMatch = cleanLink.match(/^examples\/([^/]+)\/([^.]+)\.html$/);
    if (exampleMatch) {
      const [, type, demoName] = exampleMatch;
      
      // For demo links, we'll treat them as external references since they're HTML files
      return {
        success: true,
        type: 'external',
        url: link
      };
    }

    // If no patterns match, return an error
    return {
      success: false,
      error: `Unrecognized link pattern: ${link}`
    };

  } catch (error) {
    return {
      success: false,
      error: `Error parsing link: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Parse markdown content into structured sections
 * @param content - Markdown content
 * @returns Parsed sections
 */
function parseMarkdownSections(content: string): Array<{ title: string; level: number; content: string }> {
  const lines = content.split('\n');
  const sections: Array<{ title: string; level: number; content: string }> = [];
  let currentSection: { title: string; level: number; content: string } | null = null;
  
  lines.forEach(line => {
    const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
    
    if (headerMatch) {
      // Save previous section if exists
      if (currentSection) {
        sections.push(currentSection);
      }
      
      // Start new section
      currentSection = {
        title: headerMatch[2],
        level: headerMatch[1].length,
        content: ''
      };
    } else if (currentSection) {
      // Add content to current section
      currentSection.content += (currentSection.content ? '\n' : '') + line;
    }
  });
  
  // Add the last section
  if (currentSection) {
    sections.push(currentSection);
  }
  
  return sections.map(section => ({
    ...section,
    content: section.content.trim()
  }));
}

/**
 * Get ARIA roles for a component
 * @param component - Component to get ARIA roles for
 * @returns ARIA roles
 */
function getComponentAriaRoles(component: any): string[] {
  // Mock implementation - in a real system, this would be based on component data
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
    select: ['listbox', 'option']
  };
  
  return rolesByComponent[component.id] || ['none'];
}

/**
 * Get keyboard navigation information for a component
 * @param component - Component to get keyboard navigation for
 * @returns Keyboard navigation information
 */
function getComponentKeyboardNavigation(component: any): Record<string, string> {
  // Mock implementation - in a real system, this would be based on component data
  const navigationByComponent: Record<string, Record<string, string>> = {
    button: {
      'Enter/Space': 'Activates the button'
    },
    link: {
      'Enter': 'Activates the link'
    },
    checkbox: {
      'Space': 'Toggles the checkbox'
    },
    table: {
      'Tab': 'Moves focus to the next focusable element',
      'Arrow keys': 'Navigates between cells',
      'Home/End': 'Moves to the first/last cell in a row'
    },
    tabs: {
      'Tab': 'Moves focus to the next tab',
      'Arrow keys': 'Moves between tabs',
      'Enter/Space': 'Activates the focused tab'
    }
  };
  
  return navigationByComponent[component.id] || {};
}

/**
 * Get screen reader support information for a component
 * @param component - Component to get screen reader support for
 * @returns Screen reader support information
 */
function getComponentScreenReaderSupport(component: any): string[] {
  // Mock implementation - in a real system, this would be based on component data
  const supportByComponent: Record<string, string[]> = {
    button: [
      'Announces button text',
      'Announces button state (disabled, pressed)'
    ],
    link: [
      'Announces link text',
      'Announces if link opens in a new window'
    ],
    checkbox: [
      'Announces checkbox label',
      'Announces checkbox state (checked, unchecked, indeterminate)'
    ],
    table: [
      'Announces table caption',
      'Announces row and column headers',
      'Announces cell content with context'
    ]
  };
  
  return supportByComponent[component.id] || ['Standard screen reader support'];
}

/**
 * Get accessibility best practices for a component
 * @param component - Component to get accessibility best practices for
 * @returns Accessibility best practices
 */
function getComponentAccessibilityBestPractices(component: any): string[] {
  // Mock implementation - in a real system, this would be based on component data
  const bestPracticesByComponent: Record<string, string[]> = {
    button: [
      'Use clear and concise button text',
      'Avoid generic text like "Click here"',
      'Ensure sufficient color contrast'
    ],
    link: [
      'Use descriptive link text',
      'Avoid generic text like "Click here"',
      'Indicate if links open in a new window'
    ],
    checkbox: [
      'Use clear and concise labels',
      'Group related checkboxes with fieldset and legend'
    ],
    table: [
      'Use proper table headers',
      'Include a caption or summary',
      'Keep tables simple and avoid complex nesting'
    ]
  };
  
  return bestPracticesByComponent[component.id] || [
    'Follow WCAG 2.1 AA guidelines',
    'Ensure keyboard accessibility',
    'Provide text alternatives for non-text content',
    'Ensure sufficient color contrast'
  ];
}

/**
 * Get common accessibility issues for a component
 * @param component - Component to get common accessibility issues for
 * @returns Common accessibility issues
 */
function getComponentAccessibilityCommonIssues(component: any): string[] {
  // Mock implementation - in a real system, this would be based on component data
  const issuesByComponent: Record<string, string[]> = {
    button: [
      'Missing accessible name',
      'Insufficient color contrast',
      'Not keyboard accessible'
    ],
    link: [
      'Generic link text',
      'Missing indication for links opening in new windows',
      'Links that look like buttons'
    ],
    checkbox: [
      'Missing or unclear labels',
      'Not keyboard accessible',
      'Missing state changes announcement'
    ],
    table: [
      'Missing table headers',
      'Complex tables without proper structure',
      'Missing caption or summary'
    ]
  };
  
  return issuesByComponent[component.id] || [
    'Insufficient color contrast',
    'Missing keyboard accessibility',
    'Missing text alternatives',
    'Missing ARIA attributes'
  ];
}

/**
 * Find common properties between components
 * @param components - Components to compare
 * @returns Common properties
 */
function findCommonProperties(components: any[]): string[] {
  if (components.length === 0) {
    return [];
  }
  
  // Get property names from the first component
  const firstComponentProps = Object.keys(components[0].properties);
  
  // Filter for properties that exist in all components
  return firstComponentProps.filter(propName =>
    components.every(component =>
      component.properties && component.properties[propName]
    )
  );
}

/**
 * Find unique properties for each component
 * @param components - Components to compare
 * @returns Unique properties by component
 */
function findUniqueProperties(components: any[]): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  
  // For each component
  components.forEach(component => {
    // Get all property names from this component
    const componentProps = Object.keys(component.properties || {});
    
    // Find properties that don't exist in other components
    const uniqueProps = componentProps.filter(propName =>
      components
        .filter(c => c.id !== component.id) // Exclude the current component
        .every(c => !c.properties || !c.properties[propName]) // Property doesn't exist in other components
    );
    
    result[component.id] = uniqueProps;
  });
  
  return result;
}

/**
 * Get similarities between two components
 * @param component1 - First component
 * @param component2 - Second component
 * @returns Similarities
 */
function getSimilarities(component1: any, component2: any): string[] {
  // Mock implementation - in a real system, this would do a more sophisticated comparison
  const similarities = [];
  
  // Check if they're in the same category
  if (component1.category === component2.category) {
    similarities.push(`Both are ${component1.category} components`);
  }
  
  // Find common properties
  const commonProps = findCommonProperties([component1, component2]);
  if (commonProps.length > 0) {
    similarities.push(`Share ${commonProps.length} common properties`);
  }
  
  return similarities.length > 0 ? similarities : ['No significant similarities found'];
}

/**
 * Get differences between two components
 * @param component1 - First component
 * @param component2 - Second component
 * @returns Differences
 */
function getDifferences(component1: any, component2: any): string[] {
  // Mock implementation - in a real system, this would do a more sophisticated comparison
  const differences = [];
  
  // Compare property counts
  const props1Count = Object.keys(component1.properties || {}).length;
  const props2Count = Object.keys(component2.properties || {}).length;
  if (props1Count !== props2Count) {
    differences.push(`${component1.name} has ${props1Count} properties, while ${component2.name} has ${props2Count}`);
  }
  
  // Compare experimental status
  if (component1.isExperimental !== component2.isExperimental) {
    if (component1.isExperimental) {
      differences.push(`${component1.name} is experimental, while ${component2.name} is stable`);
    } else {
      differences.push(`${component1.name} is stable, while ${component2.name} is experimental`);
    }
  }
  
  return differences.length > 0 ? differences : ['No significant differences found'];
}

/**
 * Register resources with the FastMCP server
 * @param server - FastMCP server instance
 */
function registerResources(server: FastMCP) {
  // Register component details resource
  (server.addResourceTemplate as any)({
    uriTemplate: 'cloudscape://components/{componentId}',
    name: 'Component Details',
    parameters: [
      {
        name: 'componentId',
        description: 'Component ID',
      }
    ],
    handler: async (params: { componentId: string }) => {
      const { componentId } = params;
      const component = componentRegistry.getComponent(componentId);
      
      if (!component) {
        throw new Error(`Component ${componentId} not found`);
      }
      
      return {
        type: 'text',
        text: JSON.stringify(component, null, 2),
      };
    },
  });

  // Register category details resource
  (server.addResourceTemplate as any)({
    uriTemplate: 'cloudscape://categories/{categoryId}',
    name: 'Category Details',
    parameters: [
      {
        name: 'categoryId',
        description: 'Category ID',
      }
    ],
    handler: async (params: { categoryId: string }) => {
      const { categoryId } = params;
      const category = componentRegistry.getCategory(categoryId);
      
      if (!category) {
        throw new Error(`Category ${categoryId} not found`);
      }
      
      return {
        type: 'text',
        text: JSON.stringify(category, null, 2),
      };
    },
  });

  // Register pattern details resource
  (server.addResourceTemplate as any)({
    uriTemplate: 'cloudscape://patterns/{patternId}',
    name: 'Pattern Details',
    parameters: [
      {
        name: 'patternId',
        description: 'Pattern ID',
      }
    ],
    handler: async (params: { patternId: string }) => {
      const { patternId } = params;
      const pattern = componentRegistry.getPattern(patternId);
      
      if (!pattern) {
        throw new Error(`Pattern ${patternId} not found`);
      }
      
      return {
        type: 'text',
        text: JSON.stringify(pattern, null, 2),
      };
    },
  });

  // Register example details resource
  (server.addResourceTemplate as any)({
    uriTemplate: 'cloudscape://examples/{exampleId}',
    name: 'Example Details',
    parameters: [
      {
        name: 'exampleId',
        description: 'Example ID',
      }
    ],
    handler: async (params: { exampleId: string }) => {
      const { exampleId } = params;
      const example = exampleProvider.getExample(exampleId);
      
      if (!example) {
        throw new Error(`Example ${exampleId} not found`);
      }
      
      return {
        type: 'text',
        text: JSON.stringify(example, null, 2),
      };
    },
  });

  // Register component usage guidelines resource
  (server.addResourceTemplate as any)({
    uriTemplate: 'cloudscape://usage/{componentId}',
    name: 'Component Usage Guidelines',
    parameters: [
      {
        name: 'componentId',
        description: 'Component ID',
      }
    ],
    handler: async (params: { componentId: string }) => {
      const { componentId } = params;
      const usageContent = componentRegistry.getComponentUsage(componentId);
      
      if (!usageContent) {
        throw new Error(`Usage guidelines for component ${componentId} not found`);
      }
      
      return {
        type: 'text',
        text: usageContent,
      };
    },
  });

  // Register demos resource
  (server.addResourceTemplate as any)({
    uriTemplate: 'cloudscape://demos/{componentId}',
    name: 'Component Demos',
    parameters: [
      {
        name: 'componentId',
        description: 'Component ID to get demos for',
      }
    ],
    handler: async (params: { componentId: string }) => {
      const { componentId } = params;
      
      try {
        const demos = componentRegistry.getComponentDemos(componentId, {
          includeCode: true,
          includeVariations: true
        });
        
        if (demos.demos.length === 0) {
          throw new Error(`No demos found for component ${componentId}`);
        }
        
        return {
          type: 'text',
          text: JSON.stringify(demos, null, 2),
        };
      } catch (error) {
        throw new Error(`Demos for component ${componentId} not found: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
  });

  // Register pattern category resource
  (server.addResourceTemplate as any)({
    uriTemplate: 'cloudscape://pattern-categories/{categoryId}',
    name: 'Pattern Category Details',
    parameters: [
      {
        name: 'categoryId',
        description: 'Pattern category ID (general, generative-ai, resource-management, layout)',
      }
    ],
    handler: async (params: { categoryId: string }) => {
      const { categoryId } = params;
      
      try {
        const categories = componentRegistry.getPatternCategories({
          includePatternCount: true,
          includePatternList: true
        });
        
        const category = categories.categories.find(cat => cat.id === categoryId);
        
        if (!category) {
          throw new Error(`Pattern category ${categoryId} not found`);
        }
        
        return {
          type: 'text',
          text: JSON.stringify(category, null, 2),
        };
      } catch (error) {
        throw new Error(`Pattern category ${categoryId} not found: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
  });

  // Register direct resources
  (server.addResource as any)({
    uri: 'cloudscape://best-practices',
    name: 'Cloudscape Best Practices',
    handler: async () => {
      // Create a simple best practices guide
      const bestPractices = `
# Cloudscape Design System Best Practices

## General Guidelines
- Follow accessibility best practices
- Use consistent spacing and alignment
- Maintain visual hierarchy
- Test with different screen sizes

## Component Usage
- Keep content concise and focused
- Use clear and descriptive labels
- Provide feedback for user interactions
- Follow component-specific guidelines
`;
      
      return {
        type: 'text',
        text: bestPractices,
      };
    },
  });

  (server.addResource as any)({
    uri: 'cloudscape://components-overview',
    name: 'Cloudscape Components Overview',
    handler: async () => {
      // Generate an overview of all components
      const components = componentRegistry.getAllComponents();
      const categories = componentRegistry.getAllCategories();
      
      let overview = `# Cloudscape Components Overview\n\n`;
      
      // Group components by category
      Object.values(categories).forEach(category => {
        overview += `## ${category.name}\n\n`;
        overview += `${category.description}\n\n`;
        
        // List components in this category
        const categoryComponents = Object.values(components)
          .filter(component => component.category === category.id);
        
        categoryComponents.forEach(component => {
          overview += `### ${component.name}\n\n`;
          overview += `${component.description}\n\n`;
        });
        
        overview += '\n';
      });
      
      return {
        type: 'text',
        text: overview,
      };
    },
  });

  (server.addResource as any)({
    uri: 'cloudscape://frontend-code-setup',
    name: 'Frontend Code Setup Instructions',
    handler: async () => {
      // Create frontend code setup instructions
      const setupInstructions = `
# Frontend Code Setup Instructions

## Installation

Install the Cloudscape Design System packages:

\`\`\`bash
npm install @cloudscape-design/components @cloudscape-design/global-styles
\`\`\`

## Basic Setup

1. Import the global styles in your application's entry point:

\`\`\`jsx
import '@cloudscape-design/global-styles/index.css';
\`\`\`

2. Import and use components:

\`\`\`jsx
import Button from '@cloudscape-design/components/button';

function MyComponent() {
  return <Button variant="primary">Click me</Button>;
}
\`\`\`

## TypeScript Setup

If you're using TypeScript, make sure to include the following in your tsconfig.json:

\`\`\`json
{
  "compilerOptions": {
    "esModuleInterop": true,
    "jsx": "react",
    "lib": ["DOM", "ES2019"]
  }
}
\`\`\`
`;
      
      return {
        type: 'text',
        text: setupInstructions,
      };
    },
  });
}

/**
 * Check if a value is of the expected type
 * @param value - Value to check
 * @param expectedType - Expected type
 * @returns Whether the value is of the expected type
 */
function isValueTypeValid(value: any, expectedType: string): boolean {
  // Implementation of type validation
  // (The type validation implementation would go here)
  return true;
}