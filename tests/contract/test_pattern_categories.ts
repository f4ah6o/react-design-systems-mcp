/**
 * Contract Tests for Pattern Categories Tool
 *
 * These tests verify the contract/interface of the get_pattern_categories MCP tool.
 * IMPORTANT: These tests MUST FAIL initially as the implementation doesn't exist yet.
 * This follows the RED-GREEN-REFACTOR TDD cycle.
 */

import { beforeAll, describe, expect, test } from '@jest/globals'
import type { FastMCP } from 'fastmcp'
import { createFastMCPServer } from '../../src/mcp/server'

describe('Pattern Categories Tool Contract Tests', () => {
  let server: FastMCP

  beforeAll(() => {
    // Create the MCP server instance
    server = createFastMCPServer({
      name: 'cloudscape-mcp-test',
      description: 'Test server for pattern categories',
      version: '1.0.0',
    })
  })

  describe('get_pattern_categories tool', () => {
    test('should be registered as a tool', () => {
      // This test verifies that the get_pattern_categories tool exists
      const tools = server.listTools()
      const categoriesTool = tools.find((tool) => tool.name === 'get_pattern_categories')

      expect(categoriesTool).toBeDefined()
      expect(categoriesTool?.name).toBe('get_pattern_categories')
    })

    test('should have correct parameter schema', () => {
      const tools = server.listTools()
      const categoriesTool = tools.find((tool) => tool.name === 'get_pattern_categories')

      expect(categoriesTool).toBeDefined()
      expect(categoriesTool?.description).toBe('Get all available pattern categories with metadata')

      // Verify parameter schema structure
      const schema = categoriesTool?.parameters
      expect(schema).toBeDefined()

      // Optional parameters
      expect(schema?.properties).toHaveProperty('includePatternCount')
      expect(schema?.properties?.includePatternCount?.type).toBe('boolean')

      expect(schema?.properties).toHaveProperty('includePatternList')
      expect(schema?.properties?.includePatternList?.type).toBe('boolean')

      // No required parameters - all should be optional
      expect(schema?.required).toEqual([])
    })

    test('should return all three main categories', async () => {
      // This test MUST FAIL initially - the tool doesn't exist yet
      const result = await server.callTool('get_pattern_categories', {})

      expect(result).toBeDefined()
      expect(result.type).toBe('text')

      const responseData = JSON.parse(result.text)
      expect(responseData).toHaveProperty('categories')
      expect(Array.isArray(responseData.categories)).toBe(true)
      expect(responseData.categories.length).toBe(3)

      // Extract category IDs
      const categoryIds = responseData.categories.map((cat: any) => cat.id)

      // Should have all three main categories
      expect(categoryIds).toContain('general')
      expect(categoryIds).toContain('generative-ai')
      expect(categoryIds).toContain('resource-management')
    })

    test('should return category metadata structure', async () => {
      // This test MUST FAIL initially
      const result = await server.callTool('get_pattern_categories', {})

      const responseData = JSON.parse(result.text)

      responseData.categories.forEach((category: any) => {
        // Required fields
        expect(category).toHaveProperty('id')
        expect(category).toHaveProperty('name')
        expect(category).toHaveProperty('description')

        // Verify data types
        expect(typeof category.id).toBe('string')
        expect(typeof category.name).toBe('string')
        expect(typeof category.description).toBe('string')

        // Verify content is not empty
        expect(category.id.length).toBeGreaterThan(0)
        expect(category.name.length).toBeGreaterThan(0)
        expect(category.description.length).toBeGreaterThan(0)
      })
    })

    test('should include pattern counts when requested', async () => {
      // This test MUST FAIL initially
      const result = await server.callTool('get_pattern_categories', {
        includePatternCount: true,
      })

      const responseData = JSON.parse(result.text)

      responseData.categories.forEach((category: any) => {
        expect(category).toHaveProperty('patternCount')
        expect(typeof category.patternCount).toBe('number')
        expect(category.patternCount).toBeGreaterThanOrEqual(0)
      })

      // Verify total pattern count is reasonable (should be 61+)
      const totalPatterns = responseData.categories.reduce(
        (sum: number, cat: any) => sum + cat.patternCount,
        0,
      )
      expect(totalPatterns).toBeGreaterThanOrEqual(61)
    })

    test('should include pattern lists when requested', async () => {
      // This test MUST FAIL initially
      const result = await server.callTool('get_pattern_categories', {
        includePatternList: true,
      })

      const responseData = JSON.parse(result.text)

      responseData.categories.forEach((category: any) => {
        expect(category).toHaveProperty('patterns')
        expect(Array.isArray(category.patterns)).toBe(true)

        if (category.patterns.length > 0) {
          category.patterns.forEach((pattern: any) => {
            expect(pattern).toHaveProperty('id')
            expect(pattern).toHaveProperty('name')
            expect(typeof pattern.id).toBe('string')
            expect(typeof pattern.name).toBe('string')
          })
        }
      })
    })

    test('should include both counts and lists when both flags are true', async () => {
      // This test MUST FAIL initially
      const result = await server.callTool('get_pattern_categories', {
        includePatternCount: true,
        includePatternList: true,
      })

      const responseData = JSON.parse(result.text)

      responseData.categories.forEach((category: any) => {
        expect(category).toHaveProperty('patternCount')
        expect(category).toHaveProperty('patterns')

        // Pattern count should match actual pattern list length
        expect(category.patternCount).toBe(category.patterns.length)
      })
    })

    test('should not include optional fields when flags are false', async () => {
      // This test MUST FAIL initially
      const result = await server.callTool('get_pattern_categories', {
        includePatternCount: false,
        includePatternList: false,
      })

      const responseData = JSON.parse(result.text)

      responseData.categories.forEach((category: any) => {
        // Should not have optional fields
        expect(category).not.toHaveProperty('patternCount')
        expect(category).not.toHaveProperty('patterns')

        // Should still have required fields
        expect(category).toHaveProperty('id')
        expect(category).toHaveProperty('name')
        expect(category).toHaveProperty('description')
      })
    })

    test('should handle invalid parameter types gracefully', async () => {
      // This test MUST FAIL initially - should throw validation error
      await expect(
        server.callTool('get_pattern_categories', {
          includePatternCount: 'true', // Should be boolean, not string
        }),
      ).rejects.toThrow()

      await expect(
        server.callTool('get_pattern_categories', {
          includePatternList: 123, // Should be boolean, not number
        }),
      ).rejects.toThrow()
    })
  })

  describe('Category data validation', () => {
    test('should validate general category details', async () => {
      // This test MUST FAIL initially
      const result = await server.callTool('get_pattern_categories', {
        includePatternCount: true,
        includePatternList: true,
      })

      const responseData = JSON.parse(result.text)
      const generalCategory = responseData.categories.find((cat: any) => cat.id === 'general')

      expect(generalCategory).toBeDefined()
      expect(generalCategory.name).toBe('General Patterns')
      expect(generalCategory.description).toContain('patterns')
      expect(generalCategory.patternCount).toBeGreaterThan(30) // Should have 35+ patterns
      expect(generalCategory.patterns.length).toBe(generalCategory.patternCount)

      // Verify some expected general patterns
      const patternIds = generalCategory.patterns.map((p: any) => p.id)
      expect(patternIds).toContain('general-actions')
      expect(patternIds).toContain('general-errors')
      expect(patternIds).toContain('general-filtering')
    })

    test('should validate generative AI category details', async () => {
      // This test MUST FAIL initially
      const result = await server.callTool('get_pattern_categories', {
        includePatternCount: true,
        includePatternList: true,
      })

      const responseData = JSON.parse(result.text)
      const aiCategory = responseData.categories.find((cat: any) => cat.id === 'generative-ai')

      expect(aiCategory).toBeDefined()
      expect(aiCategory.name).toBe('Generative AI Patterns')
      expect(aiCategory.description).toContain('AI')
      expect(aiCategory.patternCount).toBeGreaterThan(5) // Should have 9+ patterns
      expect(aiCategory.patterns.length).toBe(aiCategory.patternCount)

      // Verify some expected AI patterns
      const patternIds = aiCategory.patterns.map((p: any) => p.id)
      expect(patternIds).toContain('generative-ai-chat')
      expect(patternIds).toContain('generative-ai-loading-states')
    })

    test('should validate resource management category details', async () => {
      // This test MUST FAIL initially
      const result = await server.callTool('get_pattern_categories', {
        includePatternCount: true,
        includePatternList: true,
      })

      const responseData = JSON.parse(result.text)
      const resourceCategory = responseData.categories.find(
        (cat: any) => cat.id === 'resource-management',
      )

      expect(resourceCategory).toBeDefined()
      expect(resourceCategory.name).toBe('Resource Management Patterns')
      expect(resourceCategory.description).toContain('resource')
      expect(resourceCategory.patternCount).toBeGreaterThan(15) // Should have 17+ patterns
      expect(resourceCategory.patterns.length).toBe(resourceCategory.patternCount)

      // Verify some expected resource management patterns
      const patternIds = resourceCategory.patterns.map((p: any) => p.id)
      expect(patternIds).toContain('resource-management-create')
      expect(patternIds).toContain('resource-management-edit')
      expect(patternIds).toContain('resource-management-delete')
      expect(patternIds).toContain('resource-management-view')
    })

    test('should ensure no duplicate patterns across categories', async () => {
      // This test MUST FAIL initially
      const result = await server.callTool('get_pattern_categories', {
        includePatternList: true,
      })

      const responseData = JSON.parse(result.text)

      // Collect all pattern IDs
      const allPatternIds: string[] = []
      responseData.categories.forEach((category: any) => {
        category.patterns.forEach((pattern: any) => {
          allPatternIds.push(pattern.id)
        })
      })

      // Check for duplicates
      const uniquePatternIds = [...new Set(allPatternIds)]
      expect(allPatternIds.length).toBe(uniquePatternIds.length)
    })

    test('should validate pattern ID format within categories', async () => {
      // This test MUST FAIL initially
      const result = await server.callTool('get_pattern_categories', {
        includePatternList: true,
      })

      const responseData = JSON.parse(result.text)

      responseData.categories.forEach((category: any) => {
        category.patterns.forEach((pattern: any) => {
          // Pattern IDs should follow the format: categoryId-patternName
          expect(pattern.id).toMatch(new RegExp(`^${category.id}-`))
          expect(pattern.id).toMatch(/^[a-z-]+$/)
          expect(pattern.name.length).toBeGreaterThan(0)
        })
      })
    })
  })

  describe('Response structure validation', () => {
    test('should validate response metadata', async () => {
      // This test MUST FAIL initially
      const result = await server.callTool('get_pattern_categories', {
        includePatternCount: true,
      })

      const responseData = JSON.parse(result.text)

      expect(responseData).toHaveProperty('categories')
      expect(responseData).toHaveProperty('totalCategories')
      expect(responseData.totalCategories).toBe(3)

      if (responseData.totalPatterns !== undefined) {
        expect(typeof responseData.totalPatterns).toBe('number')
        expect(responseData.totalPatterns).toBeGreaterThan(60)
      }
    })

    test('should be consistent across multiple calls', async () => {
      // This test MUST FAIL initially
      const result1 = await server.callTool('get_pattern_categories', {})
      const result2 = await server.callTool('get_pattern_categories', {})

      const data1 = JSON.parse(result1.text)
      const data2 = JSON.parse(result2.text)

      expect(data1.categories.length).toBe(data2.categories.length)
      expect(data1.totalCategories).toBe(data2.totalCategories)

      // Category order should be consistent
      data1.categories.forEach((cat1: any, index: number) => {
        const cat2 = data2.categories[index]
        expect(cat1.id).toBe(cat2.id)
        expect(cat1.name).toBe(cat2.name)
      })
    })
  })
})
