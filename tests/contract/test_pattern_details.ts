/**
 * Contract Tests for Pattern Details Tool
 *
 * These tests verify the contract/interface of the get_pattern_details MCP tool.
 * IMPORTANT: These tests MUST FAIL initially as the implementation doesn't exist yet.
 * This follows the RED-GREEN-REFACTOR TDD cycle.
 */

import { beforeAll, describe, expect, test } from 'vitest'
import type { FastMCP } from 'fastmcp'
import { createFastMCPServer } from '../../src/mcp/server'

describe('Pattern Details Tool Contract Tests', () => {
  let server: FastMCP

  beforeAll(() => {
    // Create the MCP server instance
    server = createFastMCPServer({
      name: 'cloudscape-mcp-test',
      description: 'Test server for pattern details',
      version: '1.0.0',
    })
  })

  describe('get_pattern_details tool', () => {
    test('should be registered as a tool', () => {
      // This test verifies that the get_pattern_details tool exists
      const tools = server.listTools()
      const patternDetailsTool = tools.find((tool) => tool.name === 'get_pattern_details')

      expect(patternDetailsTool).toBeDefined()
      expect(patternDetailsTool?.name).toBe('get_pattern_details')
    })

    test('should have correct parameter schema', () => {
      const tools = server.listTools()
      const patternDetailsTool = tools.find((tool) => tool.name === 'get_pattern_details')

      expect(patternDetailsTool).toBeDefined()
      expect(patternDetailsTool?.description).toBe(
        'Get detailed information about a specific design pattern',
      )

      // Verify parameter schema structure
      const schema = patternDetailsTool?.parameters
      expect(schema).toBeDefined()

      // Required parameters
      expect(schema?.properties).toHaveProperty('patternId')
      expect(schema?.properties?.patternId?.type).toBe('string')
      expect(schema?.required).toContain('patternId')

      // Optional parameters
      expect(schema?.properties).toHaveProperty('includeExamples')
      expect(schema?.properties?.includeExamples?.type).toBe('boolean')

      expect(schema?.properties).toHaveProperty('includeCode')
      expect(schema?.properties?.includeCode?.type).toBe('boolean')

      expect(schema?.properties).toHaveProperty('includeUsageGuidelines')
      expect(schema?.properties?.includeUsageGuidelines?.type).toBe('boolean')
    })

    test('should return pattern details for valid pattern ID', async () => {
      // This test MUST FAIL initially - the tool doesn't exist yet
      const result = await server.callTool('get_pattern_details', {
        patternId: 'general-actions',
      })

      expect(result).toBeDefined()
      expect(result.type).toBe('text')

      const responseData = JSON.parse(result.text)

      // Required fields
      expect(responseData).toHaveProperty('id', 'general-actions')
      expect(responseData).toHaveProperty('name')
      expect(responseData).toHaveProperty('description')
      expect(responseData).toHaveProperty('category')
      expect(responseData).toHaveProperty('components')

      // Verify data types
      expect(typeof responseData.name).toBe('string')
      expect(typeof responseData.description).toBe('string')
      expect(typeof responseData.category).toBe('string')
      expect(Array.isArray(responseData.components)).toBe(true)

      // Verify category is valid
      const validCategories = ['general', 'generative-ai', 'resource-management']
      expect(validCategories).toContain(responseData.category)
    })

    test('should include examples when includeExamples is true', async () => {
      // This test MUST FAIL initially
      const result = await server.callTool('get_pattern_details', {
        patternId: 'resource-management-create',
        includeExamples: true,
      })

      expect(result).toBeDefined()
      const responseData = JSON.parse(result.text)

      expect(responseData).toHaveProperty('examples')
      expect(Array.isArray(responseData.examples)).toBe(true)

      if (responseData.examples.length > 0) {
        const example = responseData.examples[0]
        expect(example).toHaveProperty('title')
        expect(example).toHaveProperty('description')
        expect(typeof example.title).toBe('string')
        expect(typeof example.description).toBe('string')

        // Optional fields
        if (example.code) {
          expect(typeof example.code).toBe('string')
        }

        if (example.demoUrl) {
          expect(typeof example.demoUrl).toBe('string')
        }
      }
    })

    test('should include code when includeCode is true', async () => {
      // This test MUST FAIL initially
      const result = await server.callTool('get_pattern_details', {
        patternId: 'general-filtering',
        includeCode: true,
      })

      expect(result).toBeDefined()
      const responseData = JSON.parse(result.text)

      expect(responseData).toHaveProperty('codeExample')
      expect(typeof responseData.codeExample).toBe('string')
      expect(responseData.codeExample.length).toBeGreaterThan(0)

      // Should contain React/TypeScript code
      expect(responseData.codeExample).toMatch(/import.*from/)
      expect(responseData.codeExample).toMatch(/@cloudscape-design\/components/)
    })

    test('should include usage guidelines when includeUsageGuidelines is true', async () => {
      // This test MUST FAIL initially
      const result = await server.callTool('get_pattern_details', {
        patternId: 'generative-ai-chat',
        includeUsageGuidelines: true,
      })

      expect(result).toBeDefined()
      const responseData = JSON.parse(result.text)

      expect(responseData).toHaveProperty('usageGuidelines')
      expect(typeof responseData.usageGuidelines).toBe('string')
      expect(responseData.usageGuidelines.length).toBeGreaterThan(0)

      // Should contain structured guidelines
      expect(responseData.usageGuidelines).toMatch(/when to use|how to use|best practices/i)
    })

    test('should return all data when all include flags are true', async () => {
      // This test MUST FAIL initially
      const result = await server.callTool('get_pattern_details', {
        patternId: 'resource-management-edit',
        includeExamples: true,
        includeCode: true,
        includeUsageGuidelines: true,
      })

      expect(result).toBeDefined()
      const responseData = JSON.parse(result.text)

      // Should have all optional fields
      expect(responseData).toHaveProperty('examples')
      expect(responseData).toHaveProperty('codeExample')
      expect(responseData).toHaveProperty('usageGuidelines')
    })

    test('should throw error for missing patternId parameter', async () => {
      // This test MUST FAIL initially - should throw validation error
      await expect(server.callTool('get_pattern_details', {})).rejects.toThrow()
    })

    test('should throw error for invalid patternId', async () => {
      // This test MUST FAIL initially - should throw meaningful error
      await expect(
        server.callTool('get_pattern_details', {
          patternId: 'nonexistent-pattern',
        }),
      ).rejects.toThrow('Pattern nonexistent-pattern not found')
    })

    test('should handle invalid parameter types gracefully', async () => {
      // This test MUST FAIL initially - should throw validation error
      await expect(
        server.callTool('get_pattern_details', {
          patternId: 123, // Should be string, not number
        }),
      ).rejects.toThrow()

      await expect(
        server.callTool('get_pattern_details', {
          patternId: 'valid-pattern',
          includeExamples: 'true', // Should be boolean, not string
        }),
      ).rejects.toThrow()
    })
  })

  describe('Pattern details data structure validation', () => {
    test('should validate complete pattern structure', async () => {
      // This test MUST FAIL initially
      const result = await server.callTool('get_pattern_details', {
        patternId: 'general-onboarding',
        includeExamples: true,
        includeCode: true,
        includeUsageGuidelines: true,
      })

      const responseData = JSON.parse(result.text)

      // Core pattern fields
      expect(responseData).toHaveProperty('id')
      expect(responseData).toHaveProperty('name')
      expect(responseData).toHaveProperty('description')
      expect(responseData).toHaveProperty('category')
      expect(responseData).toHaveProperty('components')

      // Optional detailed fields
      expect(responseData).toHaveProperty('examples')
      expect(responseData).toHaveProperty('codeExample')
      expect(responseData).toHaveProperty('usageGuidelines')

      // Verify nested structures
      if (responseData.relatedPatterns) {
        expect(Array.isArray(responseData.relatedPatterns)).toBe(true)
        responseData.relatedPatterns.forEach((relatedId: string) => {
          expect(typeof relatedId).toBe('string')
        })
      }

      if (responseData.tags) {
        expect(Array.isArray(responseData.tags)).toBe(true)
        responseData.tags.forEach((tag: string) => {
          expect(typeof tag).toBe('string')
        })
      }
    })

    test('should validate component references', async () => {
      // This test MUST FAIL initially
      const result = await server.callTool('get_pattern_details', {
        patternId: 'general-data-visualization',
      })

      const responseData = JSON.parse(result.text)

      expect(responseData.components).toBeDefined()
      expect(Array.isArray(responseData.components)).toBe(true)
      expect(responseData.components.length).toBeGreaterThan(0)

      responseData.components.forEach((componentId: string) => {
        expect(typeof componentId).toBe('string')
        expect(componentId.length).toBeGreaterThan(0)
        // Should be valid Cloudscape component IDs (kebab-case)
        expect(componentId).toMatch(/^[a-z]+(-[a-z]+)*$/)
      })
    })

    test('should validate pattern metadata', async () => {
      // This test MUST FAIL initially
      const result = await server.callTool('get_pattern_details', {
        patternId: 'resource-management-delete',
      })

      const responseData = JSON.parse(result.text)

      // Required string fields should not be empty
      expect(responseData.name.length).toBeGreaterThan(0)
      expect(responseData.description.length).toBeGreaterThan(0)

      // Category should be one of the three valid categories
      const validCategories = ['general', 'generative-ai', 'resource-management']
      expect(validCategories).toContain(responseData.category)

      // ID should match expected format
      expect(responseData.id).toMatch(/^[a-z-]+$/)

      // Should have at least one component
      expect(responseData.components.length).toBeGreaterThan(0)
    })
  })

  describe('Pattern categories', () => {
    test('should return valid general patterns', async () => {
      // This test MUST FAIL initially
      const result = await server.callTool('get_pattern_details', {
        patternId: 'general-errors',
      })

      const responseData = JSON.parse(result.text)
      expect(responseData.category).toBe('general')
      expect(responseData.name).toBeDefined()
      expect(responseData.description).toBeDefined()
    })

    test('should return valid generative AI patterns', async () => {
      // This test MUST FAIL initially
      const result = await server.callTool('get_pattern_details', {
        patternId: 'generative-ai-loading-states',
      })

      const responseData = JSON.parse(result.text)
      expect(responseData.category).toBe('generative-ai')
      expect(responseData.name).toBeDefined()
      expect(responseData.description).toBeDefined()
    })

    test('should return valid resource management patterns', async () => {
      // This test MUST FAIL initially
      const result = await server.callTool('get_pattern_details', {
        patternId: 'resource-management-view',
      })

      const responseData = JSON.parse(result.text)
      expect(responseData.category).toBe('resource-management')
      expect(responseData.name).toBeDefined()
      expect(responseData.description).toBeDefined()
    })
  })
})
