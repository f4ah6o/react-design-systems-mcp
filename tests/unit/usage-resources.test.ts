/**
 * Unit Tests for Usage Guidelines MCP Resources
 *
 * This file contains tests for the MCP resource functionality for usage guidelines.
 */

import componentRegistry from '../../src/components/registry'

// Mock MCP resource handler for testing
class MockMCPResources {
  // Simulate the cloudscape://usage/{componentId} resource handler
  static async getUsageResource(params: { componentId: string }) {
    const { componentId } = params
    const usageContent = componentRegistry.getComponentUsage(componentId)

    if (!usageContent) {
      throw new Error(`Usage guidelines for component ${componentId} not found`)
    }

    return {
      type: 'text',
      text: usageContent,
    }
  }
}

describe('Usage Guidelines MCP Resources', () => {
  describe('cloudscape://usage/{componentId} resource', () => {
    it('should return usage content for existing component', async () => {
      const result = await MockMCPResources.getUsageResource({
        componentId: 'button',
      })

      expect(result.type).toBe('text')
      expect(result.text).toBeDefined()
      expect(typeof result.text).toBe('string')
      expect(result.text.length).toBeGreaterThan(0)
    })

    it('should return markdown formatted content', async () => {
      const result = await MockMCPResources.getUsageResource({
        componentId: 'button',
      })

      // Should contain markdown formatting
      expect(result.text).toContain('##')
      expect(result.text).toContain('###')
      expect(result.text).toMatch(/## General guidelines/)
    })

    it('should return complete usage guidelines', async () => {
      const result = await MockMCPResources.getUsageResource({
        componentId: 'alert',
      })

      // Should contain typical sections
      expect(result.text).toContain('## General guidelines')
      expect(result.text).toContain('### Do')
      expect(result.text).toContain("### Don't")
    })

    it('should throw error for non-existent component', async () => {
      await expect(
        MockMCPResources.getUsageResource({
          componentId: 'non-existent-component',
        }),
      ).rejects.toThrow('Usage guidelines for component non-existent-component not found')
    })

    it('should return consistent content across multiple requests', async () => {
      const result1 = await MockMCPResources.getUsageResource({
        componentId: 'button',
      })

      const result2 = await MockMCPResources.getUsageResource({
        componentId: 'button',
      })

      expect(result1.text).toBe(result2.text)
      expect(result1.type).toBe(result2.type)
    })

    it('should handle different component types', async () => {
      const components = ['button', 'alert', 'table', 'form']

      for (const componentId of components) {
        // Only test if component has usage guidelines
        const hasUsage = componentRegistry.getComponentUsage(componentId)
        if (hasUsage) {
          const result = await MockMCPResources.getUsageResource({
            componentId,
          })

          expect(result.type).toBe('text')
          expect(result.text.length).toBeGreaterThan(0)
        }
      }
    })

    it('should return the same content as registry getComponentUsage', async () => {
      const componentId = 'button'
      const resourceResult = await MockMCPResources.getUsageResource({
        componentId,
      })

      const registryResult = componentRegistry.getComponentUsage(componentId)

      expect(resourceResult.text).toBe(registryResult)
    })
  })

  describe('resource URIs', () => {
    it('should work with all components that have usage guidelines', async () => {
      const allComponents = componentRegistry.getAllComponents()
      const componentsWithUsage = Object.values(allComponents)
        .filter((component) => component.usageGuidelines)
        .slice(0, 10) // Test first 10 to keep test fast

      expect(componentsWithUsage.length).toBeGreaterThan(0)

      for (const component of componentsWithUsage) {
        const result = await MockMCPResources.getUsageResource({
          componentId: component.id,
        })

        expect(result.type).toBe('text')
        expect(result.text).toBe(component.usageGuidelines)
      }
    })

    it('should generate correct URI pattern for components', () => {
      const allComponents = componentRegistry.getAllComponents()
      const componentsWithUsage = Object.values(allComponents).filter(
        (component) => component.usageGuidelines,
      )

      // Verify we can construct URIs for all components with usage
      componentsWithUsage.forEach((component) => {
        const uri = `cloudscape://usage/${component.id}`

        // URI should be well-formed
        expect(uri).toMatch(/^cloudscape:\/\/usage\/[a-z0-9-]+$/)
        expect(uri).toContain(component.id)
      })
    })
  })

  describe('content validation', () => {
    it('should return valid markdown content', async () => {
      const result = await MockMCPResources.getUsageResource({
        componentId: 'button',
      })

      const content = result.text

      // Should have markdown headers
      expect(content).toMatch(/^#{2,6}\s+.+$/m)

      // Should have structured content
      expect(content).toContain('### Do')
      expect(content).toContain("### Don't")

      // Should not have leading/trailing whitespace issues
      expect(content.trim()).toBe(content.replace(/^\s+|\s+$/g, ''))
    })

    it('should contain expected sections for typical components', async () => {
      const components = ['button', 'alert']

      for (const componentId of components) {
        const hasUsage = componentRegistry.getComponentUsage(componentId)
        if (hasUsage) {
          const result = await MockMCPResources.getUsageResource({
            componentId,
          })

          // Should contain common sections
          expect(result.text).toMatch(/## General guidelines/i)
          expect(result.text).toMatch(/### Do/)
          expect(result.text).toMatch(/### Don't/)
        }
      }
    })

    it('should handle components with varying content lengths', async () => {
      const allComponents = componentRegistry.getAllComponents()
      const componentsWithUsage = Object.values(allComponents)
        .filter((component) => component.usageGuidelines)
        .slice(0, 5)

      const contentLengths: number[] = []

      for (const component of componentsWithUsage) {
        const result = await MockMCPResources.getUsageResource({
          componentId: component.id,
        })

        contentLengths.push(result.text.length)
      }

      // Should have varying content lengths (not all the same)
      const uniqueLengths = new Set(contentLengths)
      expect(uniqueLengths.size).toBeGreaterThan(1)

      // All should be substantial content
      contentLengths.forEach((length) => {
        expect(length).toBeGreaterThan(100)
      })
    })
  })

  describe('error scenarios', () => {
    it('should handle component IDs with special characters', async () => {
      // Test that the resource handler properly validates component IDs
      await expect(
        MockMCPResources.getUsageResource({
          componentId: 'button-dropdown',
        }),
      ).resolves.toBeDefined()
    })

    it('should handle empty component ID', async () => {
      await expect(
        MockMCPResources.getUsageResource({
          componentId: '',
        }),
      ).rejects.toThrow()
    })

    it('should handle null/undefined component ID', async () => {
      await expect(
        MockMCPResources.getUsageResource({
          componentId: undefined as any,
        }),
      ).rejects.toThrow()
    })
  })

  describe('performance', () => {
    it('should handle multiple concurrent requests efficiently', async () => {
      const componentIds = ['button', 'alert', 'table']
      const startTime = Date.now()

      // Make concurrent requests
      const promises = componentIds.map((id) =>
        MockMCPResources.getUsageResource({ componentId: id }),
      )

      const results = await Promise.all(promises)
      const endTime = Date.now()

      // All should succeed
      expect(results).toHaveLength(componentIds.length)
      results.forEach((result) => {
        expect(result.type).toBe('text')
        expect(result.text.length).toBeGreaterThan(0)
      })

      // Should complete in reasonable time (less than 1 second for 3 components)
      expect(endTime - startTime).toBeLessThan(1000)
    })

    it('should cache content appropriately', async () => {
      // Multiple requests for same component should be fast
      const componentId = 'button'

      const startTime1 = Date.now()
      const result1 = await MockMCPResources.getUsageResource({ componentId })
      const endTime1 = Date.now()

      const startTime2 = Date.now()
      const result2 = await MockMCPResources.getUsageResource({ componentId })
      const endTime2 = Date.now()

      // Results should be identical
      expect(result1.text).toBe(result2.text)

      // Second request should be faster (or at least not significantly slower)
      const time1 = endTime1 - startTime1
      const time2 = endTime2 - startTime2

      // Allow some variance but second request shouldn't be much slower
      expect(time2).toBeLessThanOrEqual(time1 + 50)
    })
  })
})
