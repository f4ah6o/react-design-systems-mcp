/**
 * Integration Tests for Pattern Search Functionality
 * 
 * These tests verify the integration between pattern search and existing MCP tools.
 * IMPORTANT: These tests MUST FAIL initially as the implementation doesn't exist yet.
 * This follows the RED-GREEN-REFACTOR TDD cycle.
 */

import { describe, test, expect, beforeAll } from '@jest/globals';
import { FastMCP } from 'fastmcp';
import { createFastMCPServer } from '../../src/mcp/server';
import componentRegistry from '../../src/components/registry';

describe('Pattern Search Integration Tests', () => {
  let server: FastMCP;

  beforeAll(() => {
    // Create the MCP server instance
    server = createFastMCPServer({
      name: 'cloudscape-mcp-test',
      description: 'Test server for pattern search integration',
      version: '1.0.0'
    });
  });

  describe('Pattern search and component integration', () => {
    test('should find patterns that use existing components', async () => {
      // This test MUST FAIL initially - pattern search doesn't exist yet
      const existingComponents = componentRegistry.getAllComponents();
      const componentId = Object.keys(existingComponents)[0]; // Get any existing component
      
      const result = await server.callTool('search_patterns', {
        component: componentId
      });

      const responseData = JSON.parse(result.text);
      expect(responseData.query.component).toBe(componentId);
      
      if (responseData.patterns.length > 0) {
        // All returned patterns should use the specified component
        responseData.patterns.forEach((pattern: any) => {
          expect(pattern.components).toContain(componentId);
        });
        
        // Verify the component actually exists in registry
        const component = componentRegistry.getComponent(componentId);
        expect(component).toBeDefined();
      }
    });

    test('should integrate with existing search_components functionality', async () => {
      // This test MUST FAIL initially
      // First, search for components with a specific query
      const componentSearchResult = await server.callTool('search_components', {
        query: 'table',
        limit: 3
      });

      const componentData = JSON.parse(componentSearchResult.text);
      expect(componentData.results.length).toBeGreaterThan(0);
      
      // Then search for patterns that use any of these components
      for (const component of componentData.results.slice(0, 2)) {
        const patternSearchResult = await server.callTool('search_patterns', {
          component: component.componentId
        });

        const patternData = JSON.parse(patternSearchResult.text);
        expect(patternData.query.component).toBe(component.componentId);
        
        if (patternData.patterns.length > 0) {
          patternData.patterns.forEach((pattern: any) => {
            expect(pattern.components).toContain(component.componentId);
          });
        }
      }
    });

    test('should provide patterns relevant to component categories', async () => {
      // This test MUST FAIL initially
      const allComponents = componentRegistry.getAllComponents();
      const categories = componentRegistry.getAllCategories();
      
      // Test with components from different categories
      const categoryId = Object.keys(categories)[0];
      const category = categories[categoryId];
      
      if (category.components.length > 0) {
        const componentId = category.components[0];
        
        const result = await server.callTool('search_patterns', {
          component: componentId
        });

        const responseData = JSON.parse(result.text);
        
        if (responseData.patterns.length > 0) {
          // Patterns should be relevant to the component's category/purpose
          responseData.patterns.forEach((pattern: any) => {
            expect(pattern.components).toContain(componentId);
            expect(pattern.name.length).toBeGreaterThan(0);
            expect(pattern.description.length).toBeGreaterThan(0);
          });
        }
      }
    });
  });

  describe('Pattern categories and search consistency', () => {
    test('should maintain consistency between get_pattern_categories and search_patterns', async () => {
      // This test MUST FAIL initially
      // Get all categories
      const categoriesResult = await server.callTool('get_pattern_categories', {
        includePatternList: true
      });

      const categoriesData = JSON.parse(categoriesResult.text);
      expect(categoriesData.categories.length).toBe(3);
      
      // Test each category
      for (const category of categoriesData.categories) {
        const searchResult = await server.callTool('search_patterns', {
          category: category.id
        });

        const searchData = JSON.parse(searchResult.text);
        
        // All patterns returned should be from this category
        searchData.patterns.forEach((pattern: any) => {
          expect(pattern.category).toBe(category.id);
        });
        
        // Pattern count should be consistent
        if (category.patterns) {
          expect(searchData.patterns.length).toBeLessThanOrEqual(category.patterns.length);
          
          // All searched patterns should exist in the category's pattern list
          searchData.patterns.forEach((pattern: any) => {
            const existsInCategory = category.patterns.some((catPattern: any) => 
              catPattern.id === pattern.id
            );
            expect(existsInCategory).toBe(true);
          });
        }
      }
    });

    test('should handle cross-category pattern searches correctly', async () => {
      // This test MUST FAIL initially
      const searchResult = await server.callTool('search_patterns', {
        query: 'form' // Should match patterns across categories
      });

      const responseData = JSON.parse(searchResult.text);
      
      if (responseData.patterns.length > 1) {
        // Should find patterns from potentially multiple categories
        const categories = [...new Set(responseData.patterns.map((p: any) => p.category))];
        expect(categories.length).toBeGreaterThanOrEqual(1);
        
        // All patterns should match the search query
        responseData.patterns.forEach((pattern: any) => {
          const matchesQuery = pattern.name.toLowerCase().includes('form') ||
                              pattern.description.toLowerCase().includes('form');
          expect(matchesQuery).toBe(true);
        });
        
        // Categories should be valid
        const validCategories = ['general', 'generative-ai', 'resource-management'];
        categories.forEach(category => {
          expect(validCategories).toContain(category);
        });
      }
    });

    test('should provide detailed pattern information through get_pattern_details', async () => {
      // This test MUST FAIL initially
      // First, search for patterns
      const searchResult = await server.callTool('search_patterns', {
        category: 'general',
        limit: 3
      });

      const searchData = JSON.parse(searchResult.text);
      expect(searchData.patterns.length).toBeGreaterThan(0);
      
      // Then get detailed information for each found pattern
      for (const pattern of searchData.patterns.slice(0, 2)) {
        const detailsResult = await server.callTool('get_pattern_details', {
          patternId: pattern.id,
          includeExamples: true,
          includeUsageGuidelines: true
        });

        const detailsData = JSON.parse(detailsResult.text);
        
        // Details should be consistent with search results
        expect(detailsData.id).toBe(pattern.id);
        expect(detailsData.name).toBe(pattern.name);
        expect(detailsData.category).toBe(pattern.category);
        
        // Detailed information should be available
        expect(detailsData.usageGuidelines).toBeDefined();
        expect(typeof detailsData.usageGuidelines).toBe('string');
        expect(detailsData.usageGuidelines.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Pattern-component relationship validation', () => {
    test('should ensure all pattern components are valid', async () => {
      // This test MUST FAIL initially
      const result = await server.callTool('search_patterns', {
        limit: 10
      });

      const responseData = JSON.parse(result.text);
      const allComponents = componentRegistry.getAllComponents();
      
      responseData.patterns.forEach((pattern: any) => {
        expect(pattern.components).toBeDefined();
        expect(Array.isArray(pattern.components)).toBe(true);
        expect(pattern.components.length).toBeGreaterThan(0);
        
        // Each component should exist in the registry
        pattern.components.forEach((componentId: string) => {
          const component = componentRegistry.getComponent(componentId);
          expect(component).toBeDefined();
          expect(component?.id).toBe(componentId);
        });
      });
    });

    test('should provide patterns that demonstrate component usage', async () => {
      // This test MUST FAIL initially
      const componentId = 'button';
      const component = componentRegistry.getComponent(componentId);
      
      expect(component).toBeDefined();
      
      const result = await server.callTool('search_patterns', {
        component: componentId
      });

      const responseData = JSON.parse(result.text);
      
      if (responseData.patterns.length > 0) {
        // Patterns should demonstrate meaningful usage of the component
        responseData.patterns.forEach((pattern: any) => {
          expect(pattern.components).toContain(componentId);
          expect(pattern.description.length).toBeGreaterThan(20); // Meaningful description
          
          // Pattern should provide value beyond just using the component
          expect(pattern.name).not.toBe(componentId); // Should be more than just the component name
        });
      }
    });

    test('should handle complex component relationships in patterns', async () => {
      // This test MUST FAIL initially
      // Look for patterns that use multiple components
      const result = await server.callTool('search_patterns', {
        category: 'resource-management',
        limit: 5
      });

      const responseData = JSON.parse(result.text);
      
      if (responseData.patterns.length > 0) {
        // Find a pattern that uses multiple components
        const complexPattern = responseData.patterns.find((pattern: any) => 
          pattern.components.length > 2
        );
        
        if (complexPattern) {
          // All components should exist and be related
          complexPattern.components.forEach((componentId: string) => {
            const component = componentRegistry.getComponent(componentId);
            expect(component).toBeDefined();
          });
          
          // Pattern should describe how components work together
          expect(complexPattern.description.length).toBeGreaterThan(50);
          expect(complexPattern.name).not.toEqual(complexPattern.components.join('-'));
        }
      }
    });
  });

  describe('Search performance and pagination', () => {
    test('should handle pagination correctly across tools', async () => {
      // This test MUST FAIL initially
      // Test pagination with different limits and offsets
      const firstPage = await server.callTool('search_patterns', {
        limit: 3,
        offset: 0
      });

      const secondPage = await server.callTool('search_patterns', {
        limit: 3,
        offset: 3
      });

      const firstData = JSON.parse(firstPage.text);
      const secondData = JSON.parse(secondPage.text);
      
      expect(firstData.patterns.length).toBeLessThanOrEqual(3);
      expect(secondData.patterns.length).toBeLessThanOrEqual(3);
      
      // Patterns should be different between pages
      if (firstData.patterns.length > 0 && secondData.patterns.length > 0) {
        const firstIds = firstData.patterns.map((p: any) => p.id);
        const secondIds = secondData.patterns.map((p: any) => p.id);
        const overlap = firstIds.filter((id: string) => secondIds.includes(id));
        expect(overlap.length).toBe(0);
      }
      
      // Total results should be consistent
      if (firstData.totalResults !== undefined && secondData.totalResults !== undefined) {
        expect(firstData.totalResults).toBe(secondData.totalResults);
      }
    });

    test('should provide consistent results across multiple searches', async () => {
      // This test MUST FAIL initially
      const query = { category: 'general', limit: 5 };
      
      // Run the same search multiple times
      const result1 = await server.callTool('search_patterns', query);
      const result2 = await server.callTool('search_patterns', query);
      
      const data1 = JSON.parse(result1.text);
      const data2 = JSON.parse(result2.text);
      
      // Results should be identical
      expect(data1.patterns.length).toBe(data2.patterns.length);
      expect(data1.totalResults).toBe(data2.totalResults);
      
      if (data1.patterns.length > 0) {
        data1.patterns.forEach((pattern1: any, index: number) => {
          const pattern2 = data2.patterns[index];
          expect(pattern1.id).toBe(pattern2.id);
          expect(pattern1.name).toBe(pattern2.name);
        });
      }
    });

    test('should combine multiple search filters effectively', async () => {
      // This test MUST FAIL initially
      const result = await server.callTool('search_patterns', {
        query: 'create',
        category: 'resource-management',
        limit: 10
      });

      const responseData = JSON.parse(result.text);
      
      responseData.patterns.forEach((pattern: any) => {
        // Should match both query and category
        expect(pattern.category).toBe('resource-management');
        
        const matchesQuery = pattern.name.toLowerCase().includes('create') ||
                            pattern.description.toLowerCase().includes('create');
        expect(matchesQuery).toBe(true);
      });
      
      // Should not exceed limit
      expect(responseData.patterns.length).toBeLessThanOrEqual(10);
    });
  });

  describe('Error handling and edge cases', () => {
    test('should handle searches with no results gracefully', async () => {
      // This test MUST FAIL initially
      const result = await server.callTool('search_patterns', {
        query: 'nonexistent-pattern-xyz-123',
        category: 'general'
      });

      const responseData = JSON.parse(result.text);
      expect(responseData.patterns).toEqual([]);
      expect(responseData.totalResults).toBe(0);
      expect(responseData.query.query).toBe('nonexistent-pattern-xyz-123');
      expect(responseData.query.category).toBe('general');
    });

    test('should handle invalid category gracefully', async () => {
      // This test MUST FAIL initially
      const result = await server.callTool('search_patterns', {
        category: 'invalid-category',
        limit: 5
      });

      const responseData = JSON.parse(result.text);
      expect(responseData.patterns).toEqual([]);
      expect(responseData.totalResults).toBe(0);
      expect(responseData.query.category).toBe('invalid-category');
    });

    test('should handle component filter with non-existent component', async () => {
      // This test MUST FAIL initially
      const result = await server.callTool('search_patterns', {
        component: 'non-existent-component'
      });

      const responseData = JSON.parse(result.text);
      expect(responseData.patterns).toEqual([]);
      expect(responseData.totalResults).toBe(0);
      expect(responseData.query.component).toBe('non-existent-component');
    });
  });
});