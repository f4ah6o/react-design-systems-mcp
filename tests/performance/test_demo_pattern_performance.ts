/**
 * Performance Tests for Demo and Pattern Features
 * 
 * These tests ensure that demo and pattern operations complete within acceptable time limits.
 * All operations should complete in sub-second response times for optimal user experience.
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import { DemoProvider } from '../../src/demo-provider';
import { PatternProvider } from '../../src/pattern-provider';

describe('Demo and Pattern Performance Tests', () => {
  let demoProvider: DemoProvider;
  let patternProvider: PatternProvider;
  
  beforeEach(() => {
    demoProvider = new DemoProvider();
    patternProvider = new PatternProvider();
  });

  describe('DemoProvider Performance', () => {
    test('getComponentDemos should complete within 100ms', async () => {
      const startTime = performance.now();
      
      const result = demoProvider.getComponentDemos({ componentId: 'button' });
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(executionTime).toBeLessThan(100); // 100ms limit
      expect(result.componentId).toBe('button');
    });

    test('getComponentDemos with filtering should complete within 150ms', async () => {
      const startTime = performance.now();
      
      const result = demoProvider.getComponentDemos({ 
        componentId: 'button',
        demoType: 'basic',
        includeCode: true,
        includeVariations: true
      });
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(executionTime).toBeLessThan(150); // 150ms limit for complex queries
      expect(result.componentId).toBe('button');
    });

    test('getAllDemos should complete within 200ms', async () => {
      const startTime = performance.now();
      
      const result = demoProvider.getAllDemos();
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(executionTime).toBeLessThan(200); // 200ms limit for full dataset
      expect(Array.isArray(result)).toBe(true);
    });

    test('getAllDemos with complex filtering should complete within 300ms', async () => {
      const startTime = performance.now();
      
      const result = demoProvider.getAllDemos({
        demoType: 'basic',
        tags: ['button', 'form'],
        complexity: 'basic',
        limit: 10
      });
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(executionTime).toBeLessThan(300); // 300ms limit for complex filtering
      expect(Array.isArray(result)).toBe(true);
    });

    test('getDemo should complete within 50ms', async () => {
      const startTime = performance.now();
      
      const result = demoProvider.getDemo('button-basic');
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(executionTime).toBeLessThan(50); // 50ms limit for single item lookup
    });

    test('getDemoStats should complete within 100ms', async () => {
      const startTime = performance.now();
      
      const result = demoProvider.getDemoStats();
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(executionTime).toBeLessThan(100); // 100ms limit for statistics
      expect(typeof result.totalDemos).toBe('number');
    });

    test('validateDemos should complete within 500ms', async () => {
      const startTime = performance.now();
      
      const result = demoProvider.validateDemos();
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(executionTime).toBeLessThan(500); // 500ms limit for full validation
      expect(typeof result.valid).toBe('boolean');
    });

    test('bulk demo operations should be efficient', async () => {
      const startTime = performance.now();
      
      // Simulate multiple operations
      const operations = [
        () => demoProvider.getComponentDemos({ componentId: 'button' }),
        () => demoProvider.getComponentDemos({ componentId: 'table' }),
        () => demoProvider.getDemoTypes(),
        () => demoProvider.getComponentsWithDemos(),
        () => demoProvider.getDemoStats()
      ];
      
      operations.forEach(op => op());
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(executionTime).toBeLessThan(300); // 300ms for 5 operations
    });
  });

  describe('PatternProvider Performance', () => {
    test('searchPatterns should complete within 100ms', async () => {
      const startTime = performance.now();
      
      const result = patternProvider.searchPatterns();
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(executionTime).toBeLessThan(100); // 100ms limit
      expect(Array.isArray(result.patterns)).toBe(true);
    });

    test('searchPatterns with complex query should complete within 200ms', async () => {
      const startTime = performance.now();
      
      const result = patternProvider.searchPatterns({
        query: 'create',
        category: 'resource-management',
        component: 'button',
        tags: ['crud'],
        limit: 5
      });
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(executionTime).toBeLessThan(200); // 200ms limit for complex queries
      expect(Array.isArray(result.patterns)).toBe(true);
    });

    test('getPatternDetails should complete within 50ms', async () => {
      const startTime = performance.now();
      
      const result = patternProvider.getPatternDetails({ patternId: 'general-actions' });
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(executionTime).toBeLessThan(50); // 50ms limit for single item lookup
      expect(result.id).toBe('general-actions');
    });

    test('getPatternDetails with all options should complete within 100ms', async () => {
      const startTime = performance.now();
      
      const result = patternProvider.getPatternDetails({
        patternId: 'general-actions',
        includeExamples: true,
        includeCode: true,
        includeUsageGuidelines: true,
        includeRelatedPatterns: true
      });
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(executionTime).toBeLessThan(100); // 100ms limit with all options
      expect(result.id).toBe('general-actions');
    });

    test('getPatternCategories should complete within 100ms', async () => {
      const startTime = performance.now();
      
      const result = patternProvider.getPatternCategories();
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(executionTime).toBeLessThan(100); // 100ms limit
      expect(Array.isArray(result.categories)).toBe(true);
    });

    test('getPatternCategories with options should complete within 150ms', async () => {
      const startTime = performance.now();
      
      const result = patternProvider.getPatternCategories({
        includePatternCount: true,
        includePatternList: true
      });
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(executionTime).toBeLessThan(150); // 150ms limit with options
      expect(Array.isArray(result.categories)).toBe(true);
    });

    test('getPattern should complete within 25ms', async () => {
      const startTime = performance.now();
      
      const result = patternProvider.getPattern('general-actions');
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(executionTime).toBeLessThan(25); // 25ms limit for direct lookup
    });

    test('getPatternStats should complete within 100ms', async () => {
      const startTime = performance.now();
      
      const result = patternProvider.getPatternStats();
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(executionTime).toBeLessThan(100); // 100ms limit for statistics
      expect(typeof result.totalPatterns).toBe('number');
    });

    test('validatePatterns should complete within 300ms', async () => {
      const startTime = performance.now();
      
      const result = patternProvider.validatePatterns();
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(executionTime).toBeLessThan(300); // 300ms limit for full validation
      expect(typeof result.valid).toBe('boolean');
    });

    test('bulk pattern operations should be efficient', async () => {
      const startTime = performance.now();
      
      // Simulate multiple operations
      const operations = [
        () => patternProvider.searchPatterns({ category: 'general' }),
        () => patternProvider.searchPatterns({ category: 'generative-ai' }),
        () => patternProvider.getAvailableCategories(),
        () => patternProvider.getAllTags(),
        () => patternProvider.getPatternStats()
      ];
      
      operations.forEach(op => op());
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(executionTime).toBeLessThan(400); // 400ms for 5 operations
    });

    test('findSimilarPatterns should complete within 75ms', async () => {
      const startTime = performance.now();
      
      const result = patternProvider.findSimilarPatterns('general-actions', 3);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(executionTime).toBeLessThan(75); // 75ms limit for similarity search
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('Combined Operations Performance', () => {
    test('demo and pattern operations together should complete within 500ms', async () => {
      const startTime = performance.now();
      
      // Simulate real-world usage combining demos and patterns
      demoProvider.getComponentDemos({ componentId: 'button' });
      patternProvider.searchPatterns({ component: 'button' });
      demoProvider.getDemoStats();
      patternProvider.getPatternStats();
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(executionTime).toBeLessThan(500); // 500ms for combined operations
    });

    test('comprehensive search across demos and patterns should complete within 800ms', async () => {
      const startTime = performance.now();
      
      // Search for button-related content across both systems
      const demoResults = demoProvider.getAllDemos({ tags: ['button'] });
      const patternResults = patternProvider.searchPatterns({ component: 'button' });
      const demoStats = demoProvider.getDemoStats();
      const patternStats = patternProvider.getPatternStats();
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(executionTime).toBeLessThan(800); // 800ms for comprehensive search
      expect(Array.isArray(demoResults)).toBe(true);
      expect(Array.isArray(patternResults.patterns)).toBe(true);
    });
  });

  describe('Memory and Resource Usage', () => {
    test('repeated operations should not cause memory leaks', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Perform many operations
      for (let i = 0; i < 100; i++) {
        demoProvider.getComponentDemos({ componentId: 'button' });
        patternProvider.searchPatterns({ category: 'general' });
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be minimal (less than 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });

    test('large dataset operations should remain performant', async () => {
      const startTime = performance.now();
      
      // Get all data
      const allDemos = demoProvider.getAllDemos();
      const allPatterns = patternProvider.searchPatterns({ limit: 100 });
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(executionTime).toBeLessThan(300); // 300ms for large datasets
      expect(Array.isArray(allDemos)).toBe(true);
      expect(Array.isArray(allPatterns.patterns)).toBe(true);
    });
  });

  describe('Edge Case Performance', () => {
    test('operations with non-existent data should fail fast', async () => {
      const startTime = performance.now();
      
      try {
        patternProvider.getPatternDetails({ patternId: 'non-existent' });
      } catch (error) {
        const endTime = performance.now();
        const executionTime = endTime - startTime;
        
        expect(executionTime).toBeLessThan(25); // Should fail within 25ms
        expect(error).toBeDefined();
      }
    });

    test('empty filter operations should complete quickly', async () => {
      const startTime = performance.now();
      
      const result = demoProvider.getAllDemos({ tags: [] });
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(executionTime).toBeLessThan(50); // 50ms for empty filters
      expect(Array.isArray(result)).toBe(true);
    });

    test('large limit values should be handled efficiently', async () => {
      const startTime = performance.now();
      
      const result = patternProvider.searchPatterns({ limit: 1000 });
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(executionTime).toBeLessThan(150); // 150ms even with large limits
      expect(Array.isArray(result.patterns)).toBe(true);
    });
  });
});