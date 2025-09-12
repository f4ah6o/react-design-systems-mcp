/**
 * Unit Tests for Usage Guidelines Functionality
 *
 * This file contains tests for the usage guidelines hybrid implementation,
 * covering both resource-style access and advanced tool functionality.
 */

import componentRegistry from '../../src/components/registry'

describe('Usage Guidelines', () => {
  describe('getComponentUsage', () => {
    it('should return usage guidelines for existing component', () => {
      const buttonUsage = componentRegistry.getComponentUsage('button')

      expect(buttonUsage).toBeDefined()
      expect(typeof buttonUsage).toBe('string')
      expect(buttonUsage?.length).toBeGreaterThan(0)
    })

    it('should return usage guidelines with expected content structure', () => {
      const buttonUsage = componentRegistry.getComponentUsage('button')

      expect(buttonUsage).toContain('## General guidelines')
      expect(buttonUsage).toContain('### Do')
      expect(buttonUsage).toContain("### Don't")
    })

    it('should return null for non-existent component', () => {
      const usage = componentRegistry.getComponentUsage('non-existent-component')

      expect(usage).toBeNull()
    })

    it('should return consistent content across multiple calls', () => {
      const usage1 = componentRegistry.getComponentUsage('alert')
      const usage2 = componentRegistry.getComponentUsage('alert')

      expect(usage1).toBe(usage2)
    })

    it('should handle components without usage guidelines', () => {
      // Some components might not have usage guidelines
      const component = componentRegistry.getComponent('button')
      if (component && !component.usageGuidelines) {
        const usage = componentRegistry.getComponentUsage('button')
        expect(usage).toBeNull()
      }
    })
  })

  describe('searchUsageGuidelines', () => {
    describe('query search', () => {
      it('should find components containing search query', () => {
        const results = componentRegistry.searchUsageGuidelines({
          query: 'primary button',
        })

        expect(Array.isArray(results)).toBe(true)
        expect(results.length).toBeGreaterThan(0)

        // Should find at least the button component
        const buttonResult = results.find((r) => r.componentId === 'button')
        expect(buttonResult).toBeDefined()
        expect(buttonResult?.componentName).toBe('Button')
        expect(buttonResult?.content).toContain('primary button')
      })

      it('should return matched sections for query results', () => {
        const results = componentRegistry.searchUsageGuidelines({
          query: 'primary',
        })

        expect(results.length).toBeGreaterThan(0)

        // At least one result should have matched sections
        const resultWithSections = results.find(
          (r) => r.matchedSections && r.matchedSections.length > 0,
        )
        expect(resultWithSections).toBeDefined()
        expect(Array.isArray(resultWithSections?.matchedSections)).toBe(true)
      })

      it('should perform case-insensitive search', () => {
        const lowerResults = componentRegistry.searchUsageGuidelines({
          query: 'primary',
        })
        const upperResults = componentRegistry.searchUsageGuidelines({
          query: 'PRIMARY',
        })

        expect(lowerResults.length).toBe(upperResults.length)
        expect(lowerResults.map((r) => r.componentId).sort()).toEqual(
          upperResults.map((r) => r.componentId).sort(),
        )
      })

      it('should return empty array for non-matching query', () => {
        const results = componentRegistry.searchUsageGuidelines({
          query: 'xyznonexistentquery123',
        })

        expect(results).toEqual([])
      })
    })

    describe('section search', () => {
      it('should find components with specific section', () => {
        const results = componentRegistry.searchUsageGuidelines({
          section: 'Features',
        })

        expect(results.length).toBeGreaterThan(0)

        // Verify each result contains the Features section
        results.forEach((result) => {
          expect(result.content).toMatch(/##\s+Features/i)
        })
      })

      it('should find components with General guidelines section', () => {
        const results = componentRegistry.searchUsageGuidelines({
          section: 'General guidelines',
        })

        expect(results.length).toBeGreaterThan(0)

        // Should include common components like button, alert
        const componentIds = results.map((r) => r.componentId)
        expect(componentIds).toContain('button')
        expect(componentIds).toContain('alert')
      })

      it('should perform case-insensitive section search', () => {
        const lowerResults = componentRegistry.searchUsageGuidelines({
          section: 'features',
        })
        const upperResults = componentRegistry.searchUsageGuidelines({
          section: 'FEATURES',
        })

        expect(lowerResults.length).toBe(upperResults.length)
      })

      it('should return empty array for non-existent section', () => {
        const results = componentRegistry.searchUsageGuidelines({
          section: 'NonExistentSection',
        })

        expect(results).toEqual([])
      })
    })

    describe('component-specific search', () => {
      it('should search within specific component only', () => {
        const results = componentRegistry.searchUsageGuidelines({
          componentId: 'button',
          query: 'primary',
        })

        expect(results.length).toBeLessThanOrEqual(1)
        if (results.length > 0) {
          expect(results[0].componentId).toBe('button')
          expect(results[0].content).toContain('primary')
        }
      })

      it('should return component usage without query when only componentId provided', () => {
        const results = componentRegistry.searchUsageGuidelines({
          componentId: 'alert',
        })

        expect(results.length).toBe(1)
        expect(results[0].componentId).toBe('alert')
        expect(results[0].componentName).toBe('Alert')
        expect(results[0].content.length).toBeGreaterThan(0)
      })

      it('should return empty array for non-existent component', () => {
        const results = componentRegistry.searchUsageGuidelines({
          componentId: 'non-existent-component',
        })

        expect(results).toEqual([])
      })
    })

    describe('combined search parameters', () => {
      it('should combine query and section filters', () => {
        const results = componentRegistry.searchUsageGuidelines({
          query: 'button',
          section: 'Features',
        })

        // Should only return components that have both the query and the section
        expect(Array.isArray(results)).toBe(true)

        // If there are results, they should match both criteria
        results.forEach((result) => {
          expect(result.content.toLowerCase()).toContain('button')
          expect(result.content).toMatch(/##\s+Features/i)
        })

        // Should find at least some results since many components mention "button" and have Features section
        expect(results.length).toBeGreaterThan(0)
      })

      it('should combine componentId and query filters', () => {
        const results = componentRegistry.searchUsageGuidelines({
          componentId: 'button',
          query: 'primary',
        })

        expect(results.length).toBeLessThanOrEqual(1)
        if (results.length > 0) {
          expect(results[0].componentId).toBe('button')
          expect(results[0].content).toContain('primary')
        }
      })
    })

    describe('result structure', () => {
      it('should return results with correct structure', () => {
        const results = componentRegistry.searchUsageGuidelines({
          query: 'primary',
          section: 'Features',
        })

        if (results.length > 0) {
          const result = results[0]

          expect(result).toHaveProperty('componentId')
          expect(result).toHaveProperty('componentName')
          expect(result).toHaveProperty('content')
          expect(typeof result.componentId).toBe('string')
          expect(typeof result.componentName).toBe('string')
          expect(typeof result.content).toBe('string')

          // matchedSections is optional but should be array if present
          if (result.matchedSections) {
            expect(Array.isArray(result.matchedSections)).toBe(true)
          }
        }
      })
    })

    describe('edge cases', () => {
      it('should handle empty query string', () => {
        const results = componentRegistry.searchUsageGuidelines({
          query: '',
        })

        // Empty query should be treated as no query
        expect(Array.isArray(results)).toBe(true)
      })

      it('should handle whitespace-only query', () => {
        const results = componentRegistry.searchUsageGuidelines({
          query: '   ',
        })

        expect(Array.isArray(results)).toBe(true)
      })

      it('should handle special characters in query', () => {
        const results = componentRegistry.searchUsageGuidelines({
          query: 'button.',
        })

        expect(Array.isArray(results)).toBe(true)
      })
    })
  })

  describe('integration with component registry', () => {
    it('should load usage guidelines when components are loaded', () => {
      const components = componentRegistry.getAllComponents()
      const componentsWithUsage = Object.values(components).filter(
        (component) => component.usageGuidelines,
      )

      expect(componentsWithUsage.length).toBeGreaterThan(0)

      // Test that getComponentUsage returns the same content as component.usageGuidelines
      const buttonComponent = components.button
      if (buttonComponent?.usageGuidelines) {
        const directUsage = componentRegistry.getComponentUsage('button')
        expect(directUsage).toBe(buttonComponent.usageGuidelines)
      }
    })

    it('should have consistent component counts', () => {
      const allComponents = componentRegistry.getAllComponents()
      const searchResults = componentRegistry.searchUsageGuidelines({})

      // The number of search results should match the number of components with usage guidelines
      const componentsWithUsage = Object.values(allComponents).filter(
        (component) => component.usageGuidelines,
      )

      expect(searchResults.length).toBe(componentsWithUsage.length)
    })
  })
})
