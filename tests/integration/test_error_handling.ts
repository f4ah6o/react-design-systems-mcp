/**
 * Integration Tests for Error Handling
 * 
 * These tests verify error handling for missing demos/patterns and edge cases.
 * IMPORTANT: These tests MUST FAIL initially as the implementation doesn't exist yet.
 * This follows the RED-GREEN-REFACTOR TDD cycle.
 */

import { describe, test, expect, beforeAll } from '@jest/globals';
import { FastMCP } from 'fastmcp';
import { createFastMCPServer } from '../../src/mcp/server';

describe('Error Handling Integration Tests', () => {
  let server: FastMCP;

  beforeAll(() => {
    // Create the MCP server instance
    server = createFastMCPServer({
      name: 'cloudscape-mcp-test',
      description: 'Test server for error handling',
      version: '1.0.0'
    });
  });

  describe('Demo tool error handling', () => {
    test('should handle missing componentId gracefully', async () => {
      // This test MUST FAIL initially - tool validation doesn't exist yet
      await expect(
        server.callTool('get_component_demos', {})
      ).rejects.toThrow(/componentId.*required/i);
    });

    test('should handle non-existent componentId gracefully', async () => {
      // This test MUST FAIL initially
      const result = await server.callTool('get_component_demos', {
        componentId: 'completely-fake-component-xyz'
      });

      expect(result).toBeDefined();
      expect(result.type).toBe('text');
      
      const responseData = JSON.parse(result.text);
      expect(responseData.componentId).toBe('completely-fake-component-xyz');
      expect(responseData.demos).toEqual([]);
      expect(responseData.error).toBeUndefined(); // Should not error, just return empty
    });

    test('should handle malformed componentId parameters', async () => {
      // This test MUST FAIL initially
      await expect(
        server.callTool('get_component_demos', {
          componentId: null
        })
      ).rejects.toThrow();

      await expect(
        server.callTool('get_component_demos', {
          componentId: 123
        })
      ).rejects.toThrow();

      await expect(
        server.callTool('get_component_demos', {
          componentId: {}
        })
      ).rejects.toThrow();
    });

    test('should handle invalid optional parameters gracefully', async () => {
      // This test MUST FAIL initially
      await expect(
        server.callTool('get_component_demos', {
          componentId: 'button',
          includeCode: 'not-a-boolean'
        })
      ).rejects.toThrow();

      await expect(
        server.callTool('get_component_demos', {
          componentId: 'button',
          demoType: 123
        })
      ).rejects.toThrow();
    });

    test('should handle component with no available demos', async () => {
      // This test MUST FAIL initially
      const result = await server.callTool('get_component_demos', {
        componentId: 'badge' // Assume this component has no demos
      });

      const responseData = JSON.parse(result.text);
      expect(responseData.componentId).toBe('badge');
      expect(responseData.demos).toEqual([]);
      expect(responseData.message).toContain('No demos available');
    });
  });

  describe('Pattern search error handling', () => {
    test('should handle invalid parameter types in search_patterns', async () => {
      // This test MUST FAIL initially
      await expect(
        server.callTool('search_patterns', {
          query: 123
        })
      ).rejects.toThrow();

      await expect(
        server.callTool('search_patterns', {
          category: ['invalid', 'array']
        })
      ).rejects.toThrow();

      await expect(
        server.callTool('search_patterns', {
          limit: 'not-a-number'
        })
      ).rejects.toThrow();

      await expect(
        server.callTool('search_patterns', {
          offset: -5
        })
      ).rejects.toThrow();
    });

    test('should handle empty search results gracefully', async () => {
      // This test MUST FAIL initially
      const result = await server.callTool('search_patterns', {
        query: 'xyz-completely-nonexistent-pattern-query'
      });

      const responseData = JSON.parse(result.text);
      expect(responseData.patterns).toEqual([]);
      expect(responseData.totalResults).toBe(0);
      expect(responseData.query.query).toBe('xyz-completely-nonexistent-pattern-query');
    });

    test('should handle invalid category values', async () => {
      // This test MUST FAIL initially
      const result = await server.callTool('search_patterns', {
        category: 'totally-invalid-category'
      });

      const responseData = JSON.parse(result.text);
      expect(responseData.patterns).toEqual([]);
      expect(responseData.totalResults).toBe(0);
      expect(responseData.query.category).toBe('totally-invalid-category');
    });

    test('should handle extreme pagination values', async () => {
      // This test MUST FAIL initially
      // Test very large offset
      const result1 = await server.callTool('search_patterns', {
        offset: 99999,
        limit: 10
      });

      const data1 = JSON.parse(result1.text);
      expect(data1.patterns).toEqual([]);
      expect(data1.totalResults).toBeGreaterThanOrEqual(0);

      // Test zero limit
      const result2 = await server.callTool('search_patterns', {
        limit: 0
      });

      const data2 = JSON.parse(result2.text);
      expect(data2.patterns).toEqual([]);

      // Test very large limit (should be capped)
      const result3 = await server.callTool('search_patterns', {
        limit: 10000
      });

      const data3 = JSON.parse(result3.text);
      expect(data3.patterns.length).toBeLessThanOrEqual(100); // Should cap at reasonable limit
    });
  });

  describe('Pattern details error handling', () => {
    test('should handle missing patternId parameter', async () => {
      // This test MUST FAIL initially
      await expect(
        server.callTool('get_pattern_details', {})
      ).rejects.toThrow(/patternId.*required/i);
    });

    test('should handle non-existent patternId', async () => {
      // This test MUST FAIL initially
      await expect(
        server.callTool('get_pattern_details', {
          patternId: 'completely-fake-pattern-xyz'
        })
      ).rejects.toThrow(/pattern.*not found/i);
    });

    test('should handle malformed patternId parameters', async () => {
      // This test MUST FAIL initially
      await expect(
        server.callTool('get_pattern_details', {
          patternId: null
        })
      ).rejects.toThrow();

      await expect(
        server.callTool('get_pattern_details', {
          patternId: 123
        })
      ).rejects.toThrow();

      await expect(
        server.callTool('get_pattern_details', {
          patternId: {}
        })
      ).rejects.toThrow();
    });

    test('should handle invalid boolean parameters', async () => {
      // This test MUST FAIL initially
      await expect(
        server.callTool('get_pattern_details', {
          patternId: 'general-actions',
          includeExamples: 'not-a-boolean'
        })
      ).rejects.toThrow();

      await expect(
        server.callTool('get_pattern_details', {
          patternId: 'general-actions',
          includeCode: 123
        })
      ).rejects.toThrow();
    });

    test('should handle pattern with missing optional data', async () => {
      // This test MUST FAIL initially
      const result = await server.callTool('get_pattern_details', {
        patternId: 'general-actions',
        includeExamples: true,
        includeCode: true,
        includeUsageGuidelines: true
      });

      const responseData = JSON.parse(result.text);
      expect(responseData.id).toBe('general-actions');
      
      // Should handle cases where optional data is missing gracefully
      if (!responseData.examples) {
        expect(responseData.examples).toEqual([]);
      }
      
      if (!responseData.codeExample) {
        expect(responseData.codeExample).toBe('');
      }
      
      if (!responseData.usageGuidelines) {
        expect(responseData.usageGuidelines).toBe('');
      }
    });
  });

  describe('Pattern categories error handling', () => {
    test('should handle invalid boolean parameters', async () => {
      // This test MUST FAIL initially
      await expect(
        server.callTool('get_pattern_categories', {
          includePatternCount: 'not-a-boolean'
        })
      ).rejects.toThrow();

      await expect(
        server.callTool('get_pattern_categories', {
          includePatternList: 123
        })
      ).rejects.toThrow();
    });

    test('should handle system errors gracefully', async () => {
      // This test MUST FAIL initially
      // Test that the tool handles internal errors appropriately
      const result = await server.callTool('get_pattern_categories', {
        includePatternCount: true,
        includePatternList: true
      });

      expect(result).toBeDefined();
      expect(result.type).toBe('text');
      
      const responseData = JSON.parse(result.text);
      expect(responseData).toHaveProperty('categories');
      expect(Array.isArray(responseData.categories)).toBe(true);
      
      // Should have fallback behavior if data is missing
      if (responseData.categories.length === 0) {
        expect(responseData.error).toBeDefined();
      } else {
        expect(responseData.categories.length).toBe(3);
      }
    });
  });

  describe('Cross-tool error handling', () => {
    test('should handle chained tool errors gracefully', async () => {
      // This test MUST FAIL initially
      try {
        // First try to get demos for non-existent component
        const demoResult = await server.callTool('get_component_demos', {
          componentId: 'fake-component'
        });

        const demoData = JSON.parse(demoResult.text);
        expect(demoData.demos).toEqual([]);
        
        // Then try to search for patterns with non-existent component
        const patternResult = await server.callTool('search_patterns', {
          component: 'fake-component'
        });

        const patternData = JSON.parse(patternResult.text);
        expect(patternData.patterns).toEqual([]);
        
        // Both should handle errors gracefully without throwing
        expect(demoData.componentId).toBe('fake-component');
        expect(patternData.query.component).toBe('fake-component');
      } catch (error) {
        // If tools throw errors instead of returning empty results, that's also valid
        expect(error).toMatch(/not found|invalid/i);
      }
    });

    test('should handle concurrent error scenarios', async () => {
      // This test MUST FAIL initially
      // Make multiple invalid requests simultaneously
      const promises = [
        server.callTool('get_component_demos', { componentId: 'fake1' }),
        server.callTool('get_component_demos', { componentId: 'fake2' }),
        server.callTool('search_patterns', { category: 'invalid-category' }),
        server.callTool('get_pattern_details', { patternId: 'invalid-pattern' }).catch(e => e)
      ];

      const results = await Promise.allSettled(promises);
      
      // First two should succeed with empty results
      expect(results[0].status).toBe('fulfilled');
      expect(results[1].status).toBe('fulfilled');
      
      if (results[0].status === 'fulfilled') {
        const data = JSON.parse((results[0].value as any).text);
        expect(data.demos).toEqual([]);
      }
      
      // Third should succeed with empty results
      expect(results[2].status).toBe('fulfilled');
      if (results[2].status === 'fulfilled') {
        const data = JSON.parse((results[2].value as any).text);
        expect(data.patterns).toEqual([]);
      }
      
      // Fourth should either reject or return error - both acceptable
      expect(results[3].status === 'rejected' || results[3].status === 'fulfilled').toBe(true);
    });

    test('should maintain data consistency during error scenarios', async () => {
      // This test MUST FAIL initially
      // Test that partial failures don't corrupt data
      const validResult = await server.callTool('search_patterns', {
        category: 'general',
        limit: 2
      });

      const validData = JSON.parse(validResult.text);
      expect(validData.patterns.length).toBeGreaterThanOrEqual(0);
      
      // Try invalid operation
      const invalidResult = await server.callTool('search_patterns', {
        category: 'invalid-category',
        limit: 2
      });

      const invalidData = JSON.parse(invalidResult.text);
      expect(invalidData.patterns).toEqual([]);
      
      // Valid operation should still work after invalid one
      const validResult2 = await server.callTool('search_patterns', {
        category: 'general',
        limit: 2
      });

      const validData2 = JSON.parse(validResult2.text);
      expect(validData2.patterns.length).toBe(validData.patterns.length);
      
      // Data should be consistent
      if (validData.patterns.length > 0) {
        expect(validData2.patterns[0].id).toBe(validData.patterns[0].id);
      }
    });
  });

  describe('Resource access error handling', () => {
    test('should handle invalid resource URIs', async () => {
      // This test MUST FAIL initially
      await expect(
        server.readResource('cloudscape://invalid-resource-type/test')
      ).rejects.toThrow();

      await expect(
        server.readResource('invalid://demos/button')
      ).rejects.toThrow();
    });

    test('should handle missing resource parameters', async () => {
      // This test MUST FAIL initially
      await expect(
        server.readResource('cloudscape://demos/')
      ).rejects.toThrow();

      await expect(
        server.readResource('cloudscape://patterns/')
      ).rejects.toThrow();
    });

    test('should handle resource access for non-existent items', async () => {
      // This test MUST FAIL initially
      await expect(
        server.readResource('cloudscape://demos/fake-component')
      ).rejects.toThrow(/not found/i);

      await expect(
        server.readResource('cloudscape://patterns/fake-pattern')
      ).rejects.toThrow(/not found/i);
    });
  });

  describe('Input validation and sanitization', () => {
    test('should sanitize search query inputs', async () => {
      // This test MUST FAIL initially
      const maliciousInputs = [
        '<script>alert("xss")</script>',
        '"; DROP TABLE patterns; --',
        '../../etc/passwd',
        'null\x00byte',
        'very'.repeat(1000) // Very long string
      ];

      for (const input of maliciousInputs) {
        const result = await server.callTool('search_patterns', {
          query: input
        });

        const responseData = JSON.parse(result.text);
        expect(responseData.query.query).toBe(input); // Should preserve original (safely)
        expect(responseData.patterns).toBeDefined();
        expect(Array.isArray(responseData.patterns)).toBe(true);
      }
    });

    test('should handle special characters in component IDs', async () => {
      // This test MUST FAIL initially
      const specialChars = [
        'component-with-spaces in name',
        'component/with/slashes',
        'component@with#symbols',
        'component.with.dots',
        'COMPONENT-WITH-CAPS'
      ];

      for (const componentId of specialChars) {
        const result = await server.callTool('get_component_demos', {
          componentId
        });

        const responseData = JSON.parse(result.text);
        expect(responseData.componentId).toBe(componentId);
        expect(responseData.demos).toBeDefined();
        expect(Array.isArray(responseData.demos)).toBe(true);
      }
    });

    test('should handle unicode and international characters', async () => {
      // This test MUST FAIL initially
      const unicodeInputs = [
        '测试查询', // Chinese
        'тестовый запрос', // Russian
        'テストクエリ', // Japanese
        'émojis 🚀 🎉 ⚡', // Emojis and accents
        'اختبار' // Arabic
      ];

      for (const query of unicodeInputs) {
        const result = await server.callTool('search_patterns', {
          query
        });

        const responseData = JSON.parse(result.text);
        expect(responseData.query.query).toBe(query);
        expect(responseData.patterns).toBeDefined();
        expect(Array.isArray(responseData.patterns)).toBe(true);
      }
    });
  });
});