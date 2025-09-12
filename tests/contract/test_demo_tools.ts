/**
 * Contract Tests for Demo Tools
 *
 * These tests verify the contract/interface of the get_component_demos MCP tool.
 * IMPORTANT: These tests MUST FAIL initially as the implementation doesn't exist yet.
 * This follows the RED-GREEN-REFACTOR TDD cycle.
 */

import { beforeAll, describe, expect, test } from '@jest/globals'
import type { FastMCP } from 'fastmcp'
import { createFastMCPServer } from '../../src/mcp/server'

describe('Demo Tools Contract Tests', () => {
  let server: FastMCP

  beforeAll(() => {
    // Create the MCP server instance
    server = createFastMCPServer({
      name: 'cloudscape-mcp-test',
      description: 'Test server for demo tools',
      version: '1.0.0',
    })
  })

  describe('get_component_demos tool', () => {
    test('should be registered as a tool', () => {
      // This test verifies that the get_component_demos tool exists
      const tools = server.listTools()
      const demoTool = tools.find((tool) => tool.name === 'get_component_demos')

      expect(demoTool).toBeDefined()
      expect(demoTool?.name).toBe('get_component_demos')
    })

    test('should have correct parameter schema', () => {
      const tools = server.listTools()
      const demoTool = tools.find((tool) => tool.name === 'get_component_demos')

      expect(demoTool).toBeDefined()
      expect(demoTool?.description).toBe('Get demo content for a specific Cloudscape component')

      // Verify parameter schema structure
      const schema = demoTool?.parameters
      expect(schema).toBeDefined()
      expect(schema?.properties).toHaveProperty('componentId')
      expect(schema?.properties?.componentId?.type).toBe('string')
      expect(schema?.required).toContain('componentId')

      // Optional parameters
      expect(schema?.properties).toHaveProperty('demoType')
      expect(schema?.properties?.demoType?.type).toBe('string')
      expect(schema?.properties).toHaveProperty('includeCode')
      expect(schema?.properties?.includeCode?.type).toBe('boolean')
    })

    test('should return demo data for valid component', async () => {
      // This test MUST FAIL initially - the tool doesn't exist yet
      const result = await server.callTool('get_component_demos', {
        componentId: 'button',
      })

      expect(result).toBeDefined()
      expect(result.type).toBe('text')

      const responseData = JSON.parse(result.text)
      expect(responseData).toHaveProperty('componentId', 'button')
      expect(responseData).toHaveProperty('demos')
      expect(Array.isArray(responseData.demos)).toBe(true)

      // Verify demo structure
      if (responseData.demos.length > 0) {
        const demo = responseData.demos[0]
        expect(demo).toHaveProperty('id')
        expect(demo).toHaveProperty('name')
        expect(demo).toHaveProperty('description')
        expect(demo).toHaveProperty('type')
        expect(demo).toHaveProperty('variations')
      }
    })

    test('should return empty array for component with no demos', async () => {
      // This test MUST FAIL initially
      const result = await server.callTool('get_component_demos', {
        componentId: 'nonexistent-component',
      })

      expect(result).toBeDefined()
      expect(result.type).toBe('text')

      const responseData = JSON.parse(result.text)
      expect(responseData).toHaveProperty('componentId', 'nonexistent-component')
      expect(responseData).toHaveProperty('demos')
      expect(responseData.demos).toEqual([])
    })

    test('should include code when includeCode is true', async () => {
      // This test MUST FAIL initially
      const result = await server.callTool('get_component_demos', {
        componentId: 'button',
        includeCode: true,
      })

      expect(result).toBeDefined()
      const responseData = JSON.parse(result.text)

      if (responseData.demos.length > 0) {
        const demo = responseData.demos[0]
        expect(demo).toHaveProperty('code')
        expect(typeof demo.code).toBe('string')
        expect(demo.code.length).toBeGreaterThan(0)
      }
    })

    test('should filter by demo type when specified', async () => {
      // This test MUST FAIL initially
      const result = await server.callTool('get_component_demos', {
        componentId: 'button',
        demoType: 'primary',
      })

      expect(result).toBeDefined()
      const responseData = JSON.parse(result.text)

      if (responseData.demos.length > 0) {
        responseData.demos.forEach((demo: any) => {
          expect(demo.type).toBe('primary')
        })
      }
    })

    test('should throw error for missing componentId parameter', async () => {
      // This test MUST FAIL initially - should throw validation error
      await expect(server.callTool('get_component_demos', {})).rejects.toThrow()
    })

    test('should handle invalid parameter types gracefully', async () => {
      // This test MUST FAIL initially - should throw validation error
      await expect(
        server.callTool('get_component_demos', {
          componentId: 123, // Should be string, not number
        }),
      ).rejects.toThrow()
    })
  })

  describe('Demo data structure validation', () => {
    test('should validate demo metadata structure', async () => {
      // This test MUST FAIL initially
      const result = await server.callTool('get_component_demos', {
        componentId: 'table',
      })

      const responseData = JSON.parse(result.text)

      if (responseData.demos.length > 0) {
        const demo = responseData.demos[0]

        // Required fields
        expect(demo).toHaveProperty('id')
        expect(demo).toHaveProperty('name')
        expect(demo).toHaveProperty('description')
        expect(demo).toHaveProperty('componentId')
        expect(demo).toHaveProperty('type')

        // Verify data types
        expect(typeof demo.id).toBe('string')
        expect(typeof demo.name).toBe('string')
        expect(typeof demo.description).toBe('string')
        expect(typeof demo.componentId).toBe('string')
        expect(typeof demo.type).toBe('string')

        // Optional fields with correct types if present
        if (demo.variations) {
          expect(Array.isArray(demo.variations)).toBe(true)
        }

        if (demo.tags) {
          expect(Array.isArray(demo.tags)).toBe(true)
        }

        if (demo.metadata) {
          expect(typeof demo.metadata).toBe('object')
        }
      }
    })

    test('should validate variation data structure', async () => {
      // This test MUST FAIL initially
      const result = await server.callTool('get_component_demos', {
        componentId: 'form',
      })

      const responseData = JSON.parse(result.text)

      const demosWithVariations = responseData.demos.filter(
        (demo: any) => demo.variations && demo.variations.length > 0,
      )

      if (demosWithVariations.length > 0) {
        const variation = demosWithVariations[0].variations[0]

        expect(variation).toHaveProperty('name')
        expect(variation).toHaveProperty('description')
        expect(typeof variation.name).toBe('string')
        expect(typeof variation.description).toBe('string')

        if (variation.props) {
          expect(typeof variation.props).toBe('object')
        }
      }
    })
  })
})
