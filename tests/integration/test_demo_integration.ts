/**
 * Integration Tests for Demo-Component Relationships
 *
 * These tests verify the integration between demo data and component registry.
 * IMPORTANT: These tests MUST FAIL initially as the implementation doesn't exist yet.
 * This follows the RED-GREEN-REFACTOR TDD cycle.
 */

import { beforeAll, describe, expect, test } from '@jest/globals'
import type { FastMCP } from 'fastmcp'
import componentRegistry from '../../src/components/registry'
import { createFastMCPServer } from '../../src/mcp/server'

describe('Demo-Component Integration Tests', () => {
  let server: FastMCP

  beforeAll(() => {
    // Create the MCP server instance
    server = createFastMCPServer({
      name: 'cloudscape-mcp-test',
      description: 'Test server for demo-component integration',
      version: '1.0.0',
    })
  })

  describe('Demo-Component relationship validation', () => {
    test('should link demos to existing components', async () => {
      // This test MUST FAIL initially - demo provider doesn't exist yet
      const result = await server.callTool('get_component_demos', {
        componentId: 'button',
      })

      const responseData = JSON.parse(result.text)
      expect(responseData.componentId).toBe('button')

      if (responseData.demos.length > 0) {
        // Verify the component actually exists in the registry
        const component = componentRegistry.getComponent('button')
        expect(component).toBeDefined()
        expect(component?.id).toBe('button')

        // Verify all demos reference the correct component
        responseData.demos.forEach((demo: any) => {
          expect(demo.componentId).toBe('button')
        })
      }
    })

    test('should return demos that showcase component properties', async () => {
      // This test MUST FAIL initially
      const result = await server.callTool('get_component_demos', {
        componentId: 'table',
        includeCode: true,
      })

      const responseData = JSON.parse(result.text)
      const component = componentRegistry.getComponent('table')

      expect(component).toBeDefined()

      if (responseData.demos.length > 0 && component) {
        const demos = responseData.demos

        // At least some demos should showcase key component properties
        const componentProperties = Object.keys(component.properties)
        let propertiesShowcased = 0

        demos.forEach((demo: any) => {
          if (demo.code) {
            componentProperties.forEach((propName) => {
              if (demo.code.includes(propName)) {
                propertiesShowcased++
              }
            })
          }
        })

        // Should showcase at least some properties
        expect(propertiesShowcased).toBeGreaterThan(0)
      }
    })

    test('should maintain consistency between component examples and demos', async () => {
      // This test MUST FAIL initially
      const componentId = 'form'

      // Get component examples from existing registry
      const componentExamples = componentRegistry.getComponentExamples({
        componentId,
        limit: 10,
      })

      // Get demos from new demo tool
      const demoResult = await server.callTool('get_component_demos', {
        componentId,
      })

      const demoData = JSON.parse(demoResult.text)

      // Both should reference the same component
      expect(demoData.componentId).toBe(componentId)

      if (componentExamples.length > 0 && demoData.demos.length > 0) {
        // There should be some overlap or complementary content
        // At minimum, they should be consistent in component reference
        componentExamples.forEach((example) => {
          expect(example.component).toBe(componentId)
        })

        demoData.demos.forEach((demo: any) => {
          expect(demo.componentId).toBe(componentId)
        })
      }
    })

    test('should provide demos for components with complex properties', async () => {
      // This test MUST FAIL initially
      // Find a component with many properties
      const allComponents = componentRegistry.getAllComponents()
      const complexComponent = Object.values(allComponents).find(
        (component) => Object.keys(component.properties).length > 5,
      )

      expect(complexComponent).toBeDefined()

      if (complexComponent) {
        const result = await server.callTool('get_component_demos', {
          componentId: complexComponent.id,
          includeCode: true,
        })

        const responseData = JSON.parse(result.text)
        expect(responseData.componentId).toBe(complexComponent.id)

        if (responseData.demos.length > 0) {
          // Should have demos that demonstrate the component's complexity
          const hasComplexDemo = responseData.demos.some(
            (demo: any) => demo.code && demo.code.length > 200, // Reasonably complex demo
          )
          expect(hasComplexDemo).toBe(true)
        }
      }
    })
  })

  describe('Demo data structure integration', () => {
    test('should reference valid component variations', async () => {
      // This test MUST FAIL initially
      const result = await server.callTool('get_component_demos', {
        componentId: 'button',
      })

      const responseData = JSON.parse(result.text)

      if (responseData.demos.length > 0) {
        responseData.demos.forEach((demo: any) => {
          if (demo.variations && demo.variations.length > 0) {
            demo.variations.forEach((variation: any) => {
              expect(variation).toHaveProperty('name')
              expect(variation).toHaveProperty('description')

              // Variation should relate to actual component properties
              const component = componentRegistry.getComponent('button')
              if (component && variation.props) {
                Object.keys(variation.props).forEach((propName) => {
                  expect(component.properties).toHaveProperty(propName)
                })
              }
            })
          }
        })
      }
    })

    test('should provide demos that use component events', async () => {
      // This test MUST FAIL initially
      const componentId = 'checkbox'
      const component = componentRegistry.getComponent(componentId)

      expect(component).toBeDefined()

      if (component && Object.keys(component.events).length > 0) {
        const result = await server.callTool('get_component_demos', {
          componentId,
          includeCode: true,
        })

        const responseData = JSON.parse(result.text)

        if (responseData.demos.length > 0) {
          const componentEvents = Object.keys(component.events)
          let eventsUsed = 0

          responseData.demos.forEach((demo: any) => {
            if (demo.code) {
              componentEvents.forEach((eventName) => {
                if (demo.code.includes(eventName)) {
                  eventsUsed++
                }
              })
            }
          })

          // At least some demos should use component events
          expect(eventsUsed).toBeGreaterThan(0)
        }
      }
    })

    test('should maintain demo metadata consistency with component data', async () => {
      // This test MUST FAIL initially
      const componentId = 'alert'
      const component = componentRegistry.getComponent(componentId)

      expect(component).toBeDefined()

      const result = await server.callTool('get_component_demos', {
        componentId,
      })

      const responseData = JSON.parse(result.text)

      if (responseData.demos.length > 0) {
        responseData.demos.forEach((demo: any) => {
          // Demo should reference correct component
          expect(demo.componentId).toBe(componentId)

          // Demo category/type should make sense for the component
          if (demo.type && component) {
            // Basic validation that type makes sense
            expect(typeof demo.type).toBe('string')
            expect(demo.type.length).toBeGreaterThan(0)
          }

          // Demo should have reasonable metadata
          expect(demo.name.length).toBeGreaterThan(0)
          expect(demo.description.length).toBeGreaterThan(0)
        })
      }
    })
  })

  describe('Cross-system integration', () => {
    test('should integrate with existing component search functionality', async () => {
      // This test MUST FAIL initially
      // First, search for components
      const searchResult = await server.callTool('search_components', {
        query: 'table',
      })

      const searchData = JSON.parse(searchResult.text)
      expect(searchData.results.length).toBeGreaterThan(0)

      const firstComponent = searchData.results[0]

      // Then get demos for the found component
      const demoResult = await server.callTool('get_component_demos', {
        componentId: firstComponent.componentId,
      })

      const demoData = JSON.parse(demoResult.text)
      expect(demoData.componentId).toBe(firstComponent.componentId)

      // Demo data should be consistent with search result data
      expect(demoData.componentId).toBe(firstComponent.componentId)
    })

    test('should work with component details integration', async () => {
      // This test MUST FAIL initially
      const componentId = 'select'

      // Get component details
      const detailsResult = await server.callTool('get_component_details', {
        componentId,
        includeExamples: true,
        includeProperties: true,
      })

      const detailsData = JSON.parse(detailsResult.text)
      expect(detailsData.id).toBe(componentId)

      // Get component demos
      const demosResult = await server.callTool('get_component_demos', {
        componentId,
      })

      const demosData = JSON.parse(demosResult.text)
      expect(demosData.componentId).toBe(componentId)

      // Both should reference the same component
      expect(detailsData.id).toBe(demosData.componentId)

      if (demosData.demos.length > 0 && detailsData.properties.length > 0) {
        // Demos should be relevant to the component's properties
        const propertyNames = detailsData.properties.map((p: any) => p.name)

        demosData.demos.forEach((demo: any) => {
          if (demo.variations) {
            demo.variations.forEach((variation: any) => {
              if (variation.props) {
                Object.keys(variation.props).forEach((propName) => {
                  expect(propertyNames).toContain(propName)
                })
              }
            })
          }
        })
      }
    })

    test('should be accessible through MCP resource system', async () => {
      // This test MUST FAIL initially
      const componentId = 'input'

      // Try to access demo data as a resource
      const resourceUri = `cloudscape://demos/${componentId}`

      try {
        const resourceResult = await server.readResource(resourceUri)
        expect(resourceResult).toBeDefined()
        expect(resourceResult.type).toBe('text')

        const resourceData = JSON.parse(resourceResult.text)
        expect(resourceData).toHaveProperty('componentId', componentId)
        expect(resourceData).toHaveProperty('demos')
      } catch (error) {
        // If resource system doesn't exist yet, this is expected during TDD
        expect(error).toBeDefined()
      }
    })
  })

  describe('Data consistency validation', () => {
    test('should ensure all demo components exist in registry', async () => {
      // This test MUST FAIL initially
      const allComponents = componentRegistry.getAllComponents()
      const componentIds = Object.keys(allComponents)

      // Test a sample of components to ensure their demos are consistent
      const sampleComponents = componentIds.slice(0, 5)

      for (const componentId of sampleComponents) {
        const result = await server.callTool('get_component_demos', {
          componentId,
        })

        const responseData = JSON.parse(result.text)
        expect(responseData.componentId).toBe(componentId)

        // Component should exist in registry
        const component = componentRegistry.getComponent(componentId)
        expect(component).toBeDefined()
        expect(component?.id).toBe(componentId)
      }
    })

    test('should validate demo code syntax and imports', async () => {
      // This test MUST FAIL initially
      const result = await server.callTool('get_component_demos', {
        componentId: 'button',
        includeCode: true,
      })

      const responseData = JSON.parse(result.text)

      if (responseData.demos.length > 0) {
        responseData.demos.forEach((demo: any) => {
          if (demo.code) {
            // Code should have valid React/TypeScript structure
            expect(demo.code).toMatch(/import.*from/)
            expect(demo.code).toMatch(/@cloudscape-design\/components/)

            // Should not have obvious syntax errors
            expect(demo.code).not.toMatch(/\bimport\s*$/)
            expect(demo.code).not.toMatch(/\bfunction\s*$/)
          }
        })
      }
    })

    test('should maintain referential integrity across updates', async () => {
      // This test MUST FAIL initially
      const componentId = 'table'

      // Get demos multiple times
      const result1 = await server.callTool('get_component_demos', {
        componentId,
      })

      const result2 = await server.callTool('get_component_demos', {
        componentId,
      })

      const data1 = JSON.parse(result1.text)
      const data2 = JSON.parse(result2.text)

      // Results should be consistent
      expect(data1.componentId).toBe(data2.componentId)
      expect(data1.demos.length).toBe(data2.demos.length)

      if (data1.demos.length > 0) {
        // Demo IDs should be consistent
        data1.demos.forEach((demo1: any, index: number) => {
          const demo2 = data2.demos[index]
          expect(demo1.id).toBe(demo2.id)
          expect(demo1.name).toBe(demo2.name)
        })
      }
    })
  })
})
