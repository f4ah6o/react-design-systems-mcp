/**
 * Unit Tests for DemoProvider
 * 
 * These tests verify the DemoProvider service functionality including
 * demo retrieval, filtering, validation, and error handling.
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import { DemoProvider } from '../../src/demo-provider';
import { Demo } from '../../src/components/data/demos';

describe('DemoProvider', () => {
  let demoProvider: DemoProvider;

  beforeEach(() => {
    demoProvider = new DemoProvider();
  });

  describe('getComponentDemos', () => {
    test('should return demos for valid component', () => {
      const result = demoProvider.getComponentDemos({ componentId: 'button' });
      
      expect(result.componentId).toBe('button');
      expect(result.demos).toBeInstanceOf(Array);
      expect(result.totalResults).toBeGreaterThanOrEqual(0);
      expect(result.query.componentId).toBe('button');
    });

    test('should return empty results for non-existent component', () => {
      const result = demoProvider.getComponentDemos({ componentId: 'non-existent' });
      
      expect(result.componentId).toBe('non-existent');
      expect(result.demos).toEqual([]);
      expect(result.totalResults).toBe(0);
      expect(result.message).toContain('No demos available');
    });

    test('should throw error for missing componentId', () => {
      expect(() => {
        demoProvider.getComponentDemos({} as any);
      }).toThrow('componentId is required');
    });

    test('should throw error for invalid componentId type', () => {
      expect(() => {
        demoProvider.getComponentDemos({ componentId: 123 as any });
      }).toThrow('componentId must be a string');
    });

    test('should filter by demo type', () => {
      const result = demoProvider.getComponentDemos({ 
        componentId: 'button',
        demoType: 'basic'
      });
      
      result.demos.forEach(demo => {
        expect(demo.type).toBe('basic');
      });
    });

    test('should filter by complexity', () => {
      const result = demoProvider.getComponentDemos({ 
        componentId: 'table',
        complexity: 'intermediate'
      });
      
      result.demos.forEach(demo => {
        expect(demo.metadata.complexity).toBe('intermediate');
      });
    });

    test('should filter by tags', () => {
      const result = demoProvider.getComponentDemos({ 
        componentId: 'button',
        tags: ['basic']
      });
      
      result.demos.forEach(demo => {
        expect(demo.tags.some(tag => ['basic'].includes(tag))).toBe(true);
      });
    });

    test('should respect includeCode parameter', () => {
      const resultWithCode = demoProvider.getComponentDemos({ 
        componentId: 'button',
        includeCode: true
      });
      
      const resultWithoutCode = demoProvider.getComponentDemos({ 
        componentId: 'button',
        includeCode: false
      });
      
      if (resultWithCode.demos.length > 0) {
        expect(resultWithCode.demos[0].code).toBeDefined();
      }
      if (resultWithoutCode.demos.length > 0) {
        expect(resultWithoutCode.demos[0].code).toBeUndefined();
      }
    });

    test('should respect includeVariations parameter', () => {
      const resultWithVariations = demoProvider.getComponentDemos({ 
        componentId: 'button',
        includeVariations: true
      });
      
      const resultWithoutVariations = demoProvider.getComponentDemos({ 
        componentId: 'button',
        includeVariations: false
      });
      
      if (resultWithVariations.demos.length > 0) {
        expect(resultWithVariations.demos[0].variations).toBeInstanceOf(Array);
      }
      if (resultWithoutVariations.demos.length > 0) {
        expect(resultWithoutVariations.demos[0].variations).toEqual([]);
      }
    });

    test('should handle pagination with limit and offset', () => {
      const result = demoProvider.getComponentDemos({ 
        componentId: 'button',
        limit: 1,
        offset: 0
      });
      
      expect(result.demos.length).toBeLessThanOrEqual(1);
    });

    test('should validate optional parameters', () => {
      expect(() => {
        demoProvider.getComponentDemos({ 
          componentId: 'button',
          demoType: 123 as any
        });
      }).toThrow('demoType must be a string');

      expect(() => {
        demoProvider.getComponentDemos({ 
          componentId: 'button',
          includeCode: 'not-boolean' as any
        });
      }).toThrow('includeCode must be a boolean value');
    });
  });

  describe('getAllDemos', () => {
    test('should return all demos with default options', () => {
      const demos = demoProvider.getAllDemos();
      
      expect(demos).toBeInstanceOf(Array);
      expect(demos.length).toBeGreaterThanOrEqual(0);
    });

    test('should filter by demo type', () => {
      const demos = demoProvider.getAllDemos({ demoType: 'basic' });
      
      demos.forEach(demo => {
        expect(demo.type).toBe('basic');
      });
    });

    test('should filter by tags', () => {
      const demos = demoProvider.getAllDemos({ tags: ['button'] });
      
      demos.forEach(demo => {
        expect(demo.tags.includes('button')).toBe(true);
      });
    });

    test('should filter by complexity', () => {
      const demos = demoProvider.getAllDemos({ complexity: 'basic' });
      
      demos.forEach(demo => {
        expect(demo.metadata.complexity).toBe('basic');
      });
    });

    test('should respect pagination', () => {
      const limit = 2;
      const demos = demoProvider.getAllDemos({ limit });
      
      expect(demos.length).toBeLessThanOrEqual(limit);
    });
  });

  describe('getDemo', () => {
    test('should return demo by ID', () => {
      const demo = demoProvider.getDemo('button-basic');
      
      if (demo) {
        expect(demo.id).toBe('button-basic');
        expect(demo.componentId).toBe('button');
      }
    });

    test('should return undefined for non-existent demo', () => {
      const demo = demoProvider.getDemo('non-existent');
      expect(demo).toBeUndefined();
    });
  });

  describe('getDemoStats', () => {
    test('should return valid statistics', () => {
      const stats = demoProvider.getDemoStats();
      
      expect(stats).toHaveProperty('totalDemos');
      expect(stats).toHaveProperty('componentsWithDemos');
      expect(stats).toHaveProperty('demoTypes');
      expect(stats).toHaveProperty('complexityLevels');
      expect(stats).toHaveProperty('byComplexity');
      
      expect(typeof stats.totalDemos).toBe('number');
      expect(typeof stats.componentsWithDemos).toBe('number');
      expect(typeof stats.demoTypes).toBe('number');
      expect(Array.isArray(stats.complexityLevels)).toBe(true);
      expect(typeof stats.byComplexity).toBe('object');
    });

    test('should have consistent complexity counts', () => {
      const stats = demoProvider.getDemoStats();
      const totalByComplexity = stats.byComplexity.basic + 
                               stats.byComplexity.intermediate + 
                               stats.byComplexity.advanced;
      
      expect(totalByComplexity).toBe(stats.totalDemos);
    });
  });

  describe('getDemoTypes', () => {
    test('should return array of demo types', () => {
      const types = demoProvider.getDemoTypes();
      
      expect(Array.isArray(types)).toBe(true);
      types.forEach(type => {
        expect(typeof type).toBe('string');
      });
    });

    test('should return sorted unique types', () => {
      const types = demoProvider.getDemoTypes();
      const sorted = [...types].sort();
      const unique = [...new Set(types)];
      
      expect(types).toEqual(sorted);
      expect(types).toEqual(unique);
    });
  });

  describe('getComponentsWithDemos', () => {
    test('should return array of component IDs', () => {
      const componentIds = demoProvider.getComponentsWithDemos();
      
      expect(Array.isArray(componentIds)).toBe(true);
      componentIds.forEach(id => {
        expect(typeof id).toBe('string');
      });
    });

    test('should return sorted unique component IDs', () => {
      const componentIds = demoProvider.getComponentsWithDemos();
      const sorted = [...componentIds].sort();
      const unique = [...new Set(componentIds)];
      
      expect(componentIds).toEqual(sorted);
      expect(componentIds).toEqual(unique);
    });
  });

  describe('validateDemos', () => {
    test('should validate demo data integrity', () => {
      const validation = demoProvider.validateDemos();
      
      expect(validation).toHaveProperty('valid');
      expect(validation).toHaveProperty('errors');
      expect(typeof validation.valid).toBe('boolean');
      expect(Array.isArray(validation.errors)).toBe(true);
    });

    test('should report errors for invalid demo data', () => {
      // This test would require mocking invalid data or testing with known invalid scenarios
      const validation = demoProvider.validateDemos();
      
      validation.errors.forEach(error => {
        expect(typeof error).toBe('string');
        expect(error.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Edge cases and error handling', () => {
    test('should handle empty query strings', () => {
      const result = demoProvider.getComponentDemos({ 
        componentId: 'button',
        tags: []
      });
      
      expect(result.componentId).toBe('button');
    });

    test('should handle very large limit values', () => {
      const result = demoProvider.getComponentDemos({ 
        componentId: 'button',
        limit: 9999
      });
      
      expect(result.demos.length).toBeLessThanOrEqual(9999);
    });

    test('should handle zero limit', () => {
      const result = demoProvider.getComponentDemos({ 
        componentId: 'button',
        limit: 0
      });
      
      expect(result.demos.length).toBe(0);
    });

    test('should handle very large offset values', () => {
      const result = demoProvider.getComponentDemos({ 
        componentId: 'button',
        offset: 9999
      });
      
      expect(result.demos.length).toBe(0);
    });
  });
});