/**
 * End-to-End Tests for Usage Guidelines Hybrid Implementation
 *
 * This file contains integration tests that verify the complete usage guidelines
 * functionality works correctly from registry to MCP tools and resources.
 */

import componentRegistry from '../../src/components/registry'
import { describe, it, expect } from 'vitest'

describe('Usage Guidelines E2E Integration', () => {
  describe('hybrid approach validation', () => {
    it('should provide consistent data between registry and tools', () => {
      // Test that the registry functions and the tool implementations return consistent data
      const componentId = 'button'

      // Get data via registry
      const registryUsage = componentRegistry.getComponentUsage(componentId)
      const registryComponent = componentRegistry.getComponent(componentId)

      // Verify consistency
      expect(registryUsage).toBe(registryComponent?.usageGuidelines)
      expect(registryUsage).toBeTruthy()
      expect(registryUsage?.length).toBeGreaterThan(0)
    })

    it('should support both resource and tool access patterns', () => {
      const componentId = 'alert'

      // Resource pattern: direct access to full content
      const resourceContent = componentRegistry.getComponentUsage(componentId)
      expect(resourceContent).toBeTruthy()

      // Tool pattern: search functionality
      const searchResults = componentRegistry.searchUsageGuidelines({
        componentId: componentId,
      })
      expect(searchResults).toHaveLength(1)
      expect(searchResults[0].content).toBe(resourceContent)
    })

    it('should handle the complete workflow: discover → search → access', () => {
      // Step 1: Discover components with usage guidelines via search
      const allWithUsage = componentRegistry.searchUsageGuidelines({})
      expect(allWithUsage.length).toBeGreaterThan(0)

      // Step 2: Search for specific content
      const primaryButtonResults = componentRegistry.searchUsageGuidelines({
        query: 'primary button',
        limit: 3,
      })
      expect(primaryButtonResults.length).toBeGreaterThan(0)

      // Step 3: Access full content for found component
      const firstResult = primaryButtonResults[0]
      const fullContent = componentRegistry.getComponentUsage(firstResult.componentId)

      expect(fullContent).toBe(firstResult.content)
      expect(fullContent?.includes('primary button')).toBe(true)
    })
  })

  describe('data quality and coverage', () => {
    it('should have substantial coverage of components with usage guidelines', () => {
      const allComponents = componentRegistry.getAllComponents()
      const componentsWithUsage = Object.values(allComponents).filter(
        (component) => component.usageGuidelines,
      )

      // Should have significant coverage
      expect(componentsWithUsage.length).toBeGreaterThan(50)

      // Should include key components
      const keyComponents = ['button', 'alert', 'table', 'form']
      keyComponents.forEach((componentId) => {
        const component = allComponents[componentId]
        expect(component?.usageGuidelines).toBeTruthy()
      })
    })

    it('should have well-structured usage content', () => {
      const sampleComponents = ['button', 'alert', 'table']

      sampleComponents.forEach((componentId) => {
        const usage = componentRegistry.getComponentUsage(componentId)
        if (usage) {
          // Should have general guidelines
          expect(usage).toMatch(/## General guidelines/i)

          // Should have do's and don'ts
          expect(usage).toMatch(/### Do\s/)
          expect(usage).toMatch(/### Don't/)

          // Should be substantial content
          expect(usage.length).toBeGreaterThan(500)

          // Should have multiple sections
          const sections = usage.match(/^#{2,3}\s+.+$/gm)
          expect(sections?.length).toBeGreaterThan(2)
        }
      })
    })

    it('should support rich search across all content', () => {
      // Test various search patterns that should find content
      const searchTests = [
        { query: 'accessibility', expectedMin: 5 },
        { query: 'icon', expectedMin: 10 },
        { query: 'button', expectedMin: 15 },
        { section: 'Features', expectedMin: 50 },
        { section: 'General guidelines', expectedMin: 60 },
      ]

      searchTests.forEach((test) => {
        const results = componentRegistry.searchUsageGuidelines(test)
        expect(results.length).toBeGreaterThanOrEqual(test.expectedMin)

        // Verify results contain the search term
        if (test.query) {
          results.forEach((result) => {
            expect(result.content.toLowerCase()).toContain(test.query?.toLowerCase())
          })
        }

        if (test.section) {
          results.forEach((result) => {
            expect(result.content).toMatch(new RegExp(`##\\s+${test.section}`, 'i'))
          })
        }
      })
    })
  })

  describe('performance and scalability', () => {
    it('should handle large-scale searches efficiently', () => {
      const startTime = Date.now()

      // Perform multiple searches that cover different aspects
      const searches = [
        componentRegistry.searchUsageGuidelines({ query: 'button' }),
        componentRegistry.searchUsageGuidelines({ section: 'Features' }),
        componentRegistry.searchUsageGuidelines({ query: 'accessibility' }),
        componentRegistry.searchUsageGuidelines({}),
      ]

      const endTime = Date.now()

      // All searches should return results
      searches.forEach((results) => {
        expect(results.length).toBeGreaterThan(0)
      })

      // Should complete in reasonable time (less than 2 seconds for all searches)
      expect(endTime - startTime).toBeLessThan(2000)
    })

    it('should handle concurrent access patterns', () => {
      const componentIds = ['button', 'alert', 'table', 'form', 'input']

      const startTime = Date.now()

      // Simulate concurrent access to different components
      const usageResults = componentIds.map((id) => componentRegistry.getComponentUsage(id))

      // Simulate concurrent searches
      const searchResults = [
        componentRegistry.searchUsageGuidelines({ query: 'primary' }),
        componentRegistry.searchUsageGuidelines({ section: 'Features' }),
      ]

      const endTime = Date.now()

      // All operations should succeed
      usageResults.forEach((usage) => {
        if (usage) {
          expect(usage.length).toBeGreaterThan(0)
        }
      })

      searchResults.forEach((results) => {
        expect(results.length).toBeGreaterThan(0)
      })

      // Should complete efficiently
      expect(endTime - startTime).toBeLessThan(1000)
    })
  })

  describe('error handling and edge cases', () => {
    it('should gracefully handle components without usage guidelines', () => {
      const allComponents = componentRegistry.getAllComponents()
      const componentWithoutUsage = Object.values(allComponents).find(
        (component) => !component.usageGuidelines,
      )

      if (componentWithoutUsage) {
        const usage = componentRegistry.getComponentUsage(componentWithoutUsage.id)
        expect(usage).toBeNull()

        const searchResults = componentRegistry.searchUsageGuidelines({
          componentId: componentWithoutUsage.id,
        })
        expect(searchResults).toEqual([])
      }
    })

    it('should handle various search edge cases', () => {
      // Empty query
      const emptyQuery = componentRegistry.searchUsageGuidelines({ query: '' })
      expect(Array.isArray(emptyQuery)).toBe(true)

      // Very specific query that might not match
      const verySpecificQuery = componentRegistry.searchUsageGuidelines({
        query: 'xyzveryrareterm123',
      })
      expect(verySpecificQuery).toEqual([])

      // Non-existent section
      const nonExistentSection = componentRegistry.searchUsageGuidelines({
        section: 'NonExistentSection',
      })
      expect(nonExistentSection).toEqual([])

      // Non-existent component
      const nonExistentComponent = componentRegistry.searchUsageGuidelines({
        componentId: 'non-existent-component',
      })
      expect(nonExistentComponent).toEqual([])
    })

    it('should maintain data integrity across multiple operations', () => {
      const componentId = 'button'

      // Get initial data
      const initialUsage = componentRegistry.getComponentUsage(componentId)
      const initialSearch = componentRegistry.searchUsageGuidelines({ componentId })

      // Perform some operations
      componentRegistry.searchUsageGuidelines({ query: 'primary' })
      componentRegistry.getComponentUsage('alert')
      componentRegistry.searchUsageGuidelines({ section: 'Features' })

      // Verify data hasn't changed
      const laterUsage = componentRegistry.getComponentUsage(componentId)
      const laterSearch = componentRegistry.searchUsageGuidelines({ componentId })

      expect(laterUsage).toBe(initialUsage)
      expect(laterSearch).toEqual(initialSearch)
    })
  })

  describe('feature completeness', () => {
    it('should support all documented search parameters', () => {
      // Test all parameter combinations
      const parameterTests = [
        { query: 'button' },
        { section: 'Features' },
        { componentId: 'alert' },
        { query: 'primary', section: 'Features' },
        { query: 'icon', componentId: 'button' },
        { section: 'General guidelines', componentId: 'alert' },
        { query: 'accessibility', section: 'Features', componentId: 'form' },
      ]

      parameterTests.forEach((params) => {
        const results = componentRegistry.searchUsageGuidelines(params)
        expect(Array.isArray(results)).toBe(true)

        // Verify parameter constraints are applied
        if (params.componentId) {
          results.forEach((result) => {
            expect(result.componentId).toBe(params.componentId)
          })
        }

        if (params.query) {
          results.forEach((result) => {
            expect(result.content.toLowerCase()).toContain(params.query?.toLowerCase())
          })
        }

        if (params.section) {
          results.forEach((result) => {
            expect(result.content).toMatch(new RegExp(`##\\s+${params.section}`, 'i'))
          })
        }
      })
    })

    it('should provide comprehensive metadata in search results', () => {
      const results = componentRegistry.searchUsageGuidelines({
        query: 'primary button',
        limit: 3,
      })

      expect(results.length).toBeGreaterThan(0)

      results.forEach((result) => {
        // Required fields
        expect(result).toHaveProperty('componentId')
        expect(result).toHaveProperty('componentName')
        expect(result).toHaveProperty('content')

        // Field types
        expect(typeof result.componentId).toBe('string')
        expect(typeof result.componentName).toBe('string')
        expect(typeof result.content).toBe('string')

        // Content quality
        expect(result.componentId.length).toBeGreaterThan(0)
        expect(result.componentName.length).toBeGreaterThan(0)
        expect(result.content.length).toBeGreaterThan(0)

        // Optional matched sections should be array if present
        if (result.matchedSections) {
          expect(Array.isArray(result.matchedSections)).toBe(true)
        }
      })
    })
  })
})
