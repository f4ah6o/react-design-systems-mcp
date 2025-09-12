/**
 * Contract Tests for Pattern Tools
 *
 * These tests verify the contract/interface of the search_patterns MCP tool.
 * IMPORTANT: These tests MUST FAIL initially as the implementation doesn't exist yet.
 * This follows the RED-GREEN-REFACTOR TDD cycle.
 */

import { beforeAll, describe, expect, test } from '@jest/globals'
import type { FastMCP } from 'fastmcp'
import { createFastMCPServer } from '../../src/mcp/server'

describe('Pattern Tools Contract Tests', () => {
  let server: FastMCP

  beforeAll(() => {
    // Create the MCP server instance
    server = createFastMCPServer({
      name: 'cloudscape-mcp-test',
      description: 'Test server for pattern tools',
      version: '1.0.0',
    })
  })

  describe('search_patterns tool', () => {
    test('should be registered as a tool', () => {
      // This test verifies that the search_patterns tool exists
      const tools = server.listTools()
      const patternTool = tools.find((tool) => tool.name === 'search_patterns')

      expect(patternTool).toBeDefined()
      expect(patternTool?.name).toBe('search_patterns')
    })

    test('should have correct parameter schema', () => {
      const tools = server.listTools()
      const patternTool = tools.find((tool) => tool.name === 'search_patterns')

      expect(patternTool).toBeDefined()
      expect(patternTool?.description).toBe(
        'Search for Cloudscape design patterns across categories',
      )

      // Verify parameter schema structure
      const schema = patternTool?.parameters
      expect(schema).toBeDefined()

      // All parameters should be optional for search_patterns
      expect(schema?.properties).toHaveProperty('query')
      expect(schema?.properties?.query?.type).toBe('string')

      expect(schema?.properties).toHaveProperty('category')
      expect(schema?.properties?.category?.type).toBe('string')
      expect(schema?.properties?.category?.enum).toContain('general')
      expect(schema?.properties?.category?.enum).toContain('generative-ai')
      expect(schema?.properties?.category?.enum).toContain('resource-management')

      expect(schema?.properties).toHaveProperty('component')
      expect(schema?.properties?.component?.type).toBe('string')

      expect(schema?.properties).toHaveProperty('limit')
      expect(schema?.properties?.limit?.type).toBe('number')

      expect(schema?.properties).toHaveProperty('offset')
      expect(schema?.properties?.offset?.type).toBe('number')
    })

    test('should return all patterns when no parameters provided', async () => {
      // This test MUST FAIL initially - the tool doesn't exist yet
      const result = await server.callTool('search_patterns', {})

      expect(result).toBeDefined()
      expect(result.type).toBe('text')

      const responseData = JSON.parse(result.text)
      expect(responseData).toHaveProperty('query')
      expect(responseData).toHaveProperty('totalResults')
      expect(responseData).toHaveProperty('patterns')
      expect(Array.isArray(responseData.patterns)).toBe(true)
      expect(responseData.totalResults).toBeGreaterThan(0)

      // Should return patterns from all categories
      const categories = [...new Set(responseData.patterns.map((p: any) => p.category))]
      expect(categories.length).toBeGreaterThanOrEqual(3) // general, generative-ai, resource-management
    })

    test('should filter patterns by query text', async () => {
      // This test MUST FAIL initially
      const result = await server.callTool('search_patterns', {
        query: 'create',
      })

      expect(result).toBeDefined()
      const responseData = JSON.parse(result.text)
      expect(responseData.query.query).toBe('create')
      expect(responseData.patterns.length).toBeGreaterThan(0)

      // All returned patterns should match the query in name or description
      responseData.patterns.forEach((pattern: any) => {
        const matchesQuery =
          pattern.name.toLowerCase().includes('create') ||
          pattern.description.toLowerCase().includes('create')
        expect(matchesQuery).toBe(true)
      })
    })

    test('should filter patterns by category', async () => {
      // This test MUST FAIL initially
      const result = await server.callTool('search_patterns', {
        category: 'general',
      })

      expect(result).toBeDefined()
      const responseData = JSON.parse(result.text)
      expect(responseData.query.category).toBe('general')

      // All returned patterns should be from the general category
      responseData.patterns.forEach((pattern: any) => {
        expect(pattern.category).toBe('general')
      })
    })

    test('should filter patterns by component usage', async () => {
      // This test MUST FAIL initially
      const result = await server.callTool('search_patterns', {
        component: 'table',
      })

      expect(result).toBeDefined()
      const responseData = JSON.parse(result.text)
      expect(responseData.query.component).toBe('table')

      // All returned patterns should use the table component
      responseData.patterns.forEach((pattern: any) => {
        expect(pattern.components).toContain('table')
      })
    })

    test('should respect limit parameter', async () => {
      // This test MUST FAIL initially
      const result = await server.callTool('search_patterns', {
        limit: 5,
      })

      expect(result).toBeDefined()
      const responseData = JSON.parse(result.text)
      expect(responseData.query.limit).toBe(5)
      expect(responseData.patterns.length).toBeLessThanOrEqual(5)
    })

    test('should respect offset parameter for pagination', async () => {
      // This test MUST FAIL initially
      const firstPage = await server.callTool('search_patterns', {
        limit: 3,
        offset: 0,
      })

      const secondPage = await server.callTool('search_patterns', {
        limit: 3,
        offset: 3,
      })

      const firstData = JSON.parse(firstPage.text)
      const secondData = JSON.parse(secondPage.text)

      expect(firstData.patterns.length).toBeLessThanOrEqual(3)
      expect(secondData.patterns.length).toBeLessThanOrEqual(3)

      // Patterns should be different between pages
      if (firstData.patterns.length > 0 && secondData.patterns.length > 0) {
        const firstIds = firstData.patterns.map((p: any) => p.id)
        const secondIds = secondData.patterns.map((p: any) => p.id)
        const overlap = firstIds.filter((id: string) => secondIds.includes(id))
        expect(overlap.length).toBe(0)
      }
    })

    test('should combine multiple filters correctly', async () => {
      // This test MUST FAIL initially
      const result = await server.callTool('search_patterns', {
        query: 'form',
        category: 'resource-management',
      })

      expect(result).toBeDefined()
      const responseData = JSON.parse(result.text)

      responseData.patterns.forEach((pattern: any) => {
        // Should match both query and category
        expect(pattern.category).toBe('resource-management')
        const matchesQuery =
          pattern.name.toLowerCase().includes('form') ||
          pattern.description.toLowerCase().includes('form')
        expect(matchesQuery).toBe(true)
      })
    })

    test('should handle invalid category gracefully', async () => {
      // This test MUST FAIL initially - should return empty results or handle gracefully
      const result = await server.callTool('search_patterns', {
        category: 'invalid-category',
      })

      expect(result).toBeDefined()
      const responseData = JSON.parse(result.text)
      expect(responseData.patterns).toEqual([])
      expect(responseData.totalResults).toBe(0)
    })
  })

  describe('Pattern data structure validation', () => {
    test('should validate pattern metadata structure', async () => {
      // This test MUST FAIL initially
      const result = await server.callTool('search_patterns', {
        limit: 1,
      })

      const responseData = JSON.parse(result.text)

      if (responseData.patterns.length > 0) {
        const pattern = responseData.patterns[0]

        // Required fields
        expect(pattern).toHaveProperty('id')
        expect(pattern).toHaveProperty('name')
        expect(pattern).toHaveProperty('description')
        expect(pattern).toHaveProperty('category')
        expect(pattern).toHaveProperty('components')

        // Verify data types
        expect(typeof pattern.id).toBe('string')
        expect(typeof pattern.name).toBe('string')
        expect(typeof pattern.description).toBe('string')
        expect(typeof pattern.category).toBe('string')
        expect(Array.isArray(pattern.components)).toBe(true)

        // Optional fields with correct types if present
        if (pattern.usageGuidelines) {
          expect(typeof pattern.usageGuidelines).toBe('string')
        }

        if (pattern.examples) {
          expect(Array.isArray(pattern.examples)).toBe(true)
        }

        if (pattern.relatedPatterns) {
          expect(Array.isArray(pattern.relatedPatterns)).toBe(true)
        }
      }
    })

    test('should validate pattern category values', async () => {
      // This test MUST FAIL initially
      const result = await server.callTool('search_patterns', {})

      const responseData = JSON.parse(result.text)
      const validCategories = ['general', 'generative-ai', 'resource-management']

      responseData.patterns.forEach((pattern: any) => {
        expect(validCategories).toContain(pattern.category)
      })
    })

    test('should validate component references in patterns', async () => {
      // This test MUST FAIL initially
      const result = await server.callTool('search_patterns', {
        limit: 5,
      })

      const responseData = JSON.parse(result.text)

      responseData.patterns.forEach((pattern: any) => {
        expect(pattern.components).toBeDefined()
        expect(Array.isArray(pattern.components)).toBe(true)
        expect(pattern.components.length).toBeGreaterThan(0)

        pattern.components.forEach((component: string) => {
          expect(typeof component).toBe('string')
          expect(component.length).toBeGreaterThan(0)
        })
      })
    })
  })

  describe('Search functionality', () => {
    test('should perform case-insensitive search', async () => {
      // This test MUST FAIL initially
      const upperResult = await server.callTool('search_patterns', {
        query: 'CREATE',
      })

      const lowerResult = await server.callTool('search_patterns', {
        query: 'create',
      })

      const upperData = JSON.parse(upperResult.text)
      const lowerData = JSON.parse(lowerResult.text)

      expect(upperData.patterns.length).toBe(lowerData.patterns.length)

      if (upperData.patterns.length > 0) {
        expect(upperData.patterns[0].id).toBe(lowerData.patterns[0].id)
      }
    })

    test('should search in both name and description', async () => {
      // This test MUST FAIL initially
      const result = await server.callTool('search_patterns', {
        query: 'navigation',
      })

      const responseData = JSON.parse(result.text)

      if (responseData.patterns.length > 0) {
        let foundInName = false
        let foundInDescription = false

        responseData.patterns.forEach((pattern: any) => {
          if (pattern.name.toLowerCase().includes('navigation')) {
            foundInName = true
          }
          if (pattern.description.toLowerCase().includes('navigation')) {
            foundInDescription = true
          }
        })

        // Should find patterns matching in either name or description
        expect(foundInName || foundInDescription).toBe(true)
      }
    })

    test('should return empty results for no matches', async () => {
      // This test MUST FAIL initially
      const result = await server.callTool('search_patterns', {
        query: 'xyz-nonexistent-pattern-query-123',
      })

      const responseData = JSON.parse(result.text)
      expect(responseData.patterns).toEqual([])
      expect(responseData.totalResults).toBe(0)
    })
  })
})
