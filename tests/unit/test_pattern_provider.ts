/**
 * Unit Tests for PatternProvider
 * 
 * These tests verify the PatternProvider service functionality including
 * pattern search, details retrieval, category management, and validation.
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import { PatternProvider } from '../../src/pattern-provider';
import { Pattern } from '../../src/components/data/patterns';

describe('PatternProvider', () => {
  let patternProvider: PatternProvider;

  beforeEach(() => {
    patternProvider = new PatternProvider();
  });

  describe('searchPatterns', () => {
    test('should return all patterns with no filters', () => {
      const result = patternProvider.searchPatterns();
      
      expect(result.patterns).toBeInstanceOf(Array);
      expect(result.totalResults).toBeGreaterThanOrEqual(0);
      expect(result.query).toEqual({});
      expect(result.patterns.length).toBeLessThanOrEqual(20); // Default limit
    });

    test('should filter patterns by query', () => {
      const result = patternProvider.searchPatterns({ query: 'create' });
      
      result.patterns.forEach(pattern => {
        const matchesQuery = pattern.name.toLowerCase().includes('create') ||
                            pattern.description.toLowerCase().includes('create') ||
                            pattern.tags.some(tag => tag.toLowerCase().includes('create')) ||
                            pattern.usageGuidelines.toLowerCase().includes('create');
        expect(matchesQuery).toBe(true);
      });
    });

    test('should filter patterns by category', () => {
      const result = patternProvider.searchPatterns({ category: 'general' });
      
      result.patterns.forEach(pattern => {
        expect(pattern.category).toBe('general');
      });
    });

    test('should filter patterns by component', () => {
      const result = patternProvider.searchPatterns({ component: 'button' });
      
      result.patterns.forEach(pattern => {
        expect(pattern.components).toContain('button');
      });
    });

    test('should filter patterns by tags', () => {
      const result = patternProvider.searchPatterns({ tags: ['form'] });
      
      result.patterns.forEach(pattern => {
        expect(pattern.tags.some(tag => ['form'].includes(tag))).toBe(true);
      });
    });

    test('should respect limit parameter', () => {
      const limit = 5;
      const result = patternProvider.searchPatterns({ limit });
      
      expect(result.patterns.length).toBeLessThanOrEqual(limit);
    });

    test('should respect offset parameter', () => {
      const result1 = patternProvider.searchPatterns({ limit: 2, offset: 0 });
      const result2 = patternProvider.searchPatterns({ limit: 2, offset: 2 });
      
      if (result1.patterns.length > 0 && result2.patterns.length > 0) {
        expect(result1.patterns[0].id).not.toBe(result2.patterns[0].id);
      }
    });

    test('should cap limit at maximum value', () => {
      const result = patternProvider.searchPatterns({ limit: 200 });
      
      expect(result.patterns.length).toBeLessThanOrEqual(100); // Should be capped at 100
    });

    test('should handle zero limit', () => {
      const result = patternProvider.searchPatterns({ limit: 0 });
      
      expect(result.patterns.length).toBe(0);
    });

    test('should handle large offset', () => {
      const result = patternProvider.searchPatterns({ offset: 9999 });
      
      expect(result.patterns.length).toBe(0);
    });
  });

  describe('getPatternDetails', () => {
    test('should return pattern details for valid pattern ID', () => {
      const pattern = patternProvider.getPatternDetails({ 
        patternId: 'general-actions' 
      });
      
      expect(pattern.id).toBe('general-actions');
      expect(pattern).toHaveProperty('name');
      expect(pattern).toHaveProperty('description');
      expect(pattern).toHaveProperty('category');
      expect(pattern).toHaveProperty('components');
      expect(pattern).toHaveProperty('usageGuidelines');
      expect(pattern).toHaveProperty('examples');
      expect(pattern).toHaveProperty('codeExample');
      expect(pattern).toHaveProperty('relatedPatterns');
    });

    test('should throw error for missing pattern ID', () => {
      expect(() => {
        patternProvider.getPatternDetails({} as any);
      }).toThrow('patternId is required and must be a string');
    });

    test('should throw error for invalid pattern ID type', () => {
      expect(() => {
        patternProvider.getPatternDetails({ patternId: 123 as any });
      }).toThrow('patternId is required and must be a string');
    });

    test('should throw error for non-existent pattern', () => {
      expect(() => {
        patternProvider.getPatternDetails({ patternId: 'non-existent' });
      }).toThrow('Pattern with ID \'non-existent\' not found');
    });

    test('should respect includeExamples parameter', () => {
      const withExamples = patternProvider.getPatternDetails({ 
        patternId: 'general-actions',
        includeExamples: true
      });
      
      const withoutExamples = patternProvider.getPatternDetails({ 
        patternId: 'general-actions',
        includeExamples: false
      });
      
      expect(withExamples.examples.length).toBeGreaterThanOrEqual(0);
      expect(withoutExamples.examples).toEqual([]);
    });

    test('should respect includeCode parameter', () => {
      const withCode = patternProvider.getPatternDetails({ 
        patternId: 'general-actions',
        includeCode: true
      });
      
      const withoutCode = patternProvider.getPatternDetails({ 
        patternId: 'general-actions',
        includeCode: false
      });
      
      expect(withCode.codeExample.length).toBeGreaterThan(0);
      expect(withoutCode.codeExample).toBe('');
    });

    test('should respect includeUsageGuidelines parameter', () => {
      const withGuidelines = patternProvider.getPatternDetails({ 
        patternId: 'general-actions',
        includeUsageGuidelines: true
      });
      
      const withoutGuidelines = patternProvider.getPatternDetails({ 
        patternId: 'general-actions',
        includeUsageGuidelines: false
      });
      
      expect(withGuidelines.usageGuidelines.length).toBeGreaterThan(0);
      expect(withoutGuidelines.usageGuidelines).toBe('');
    });

    test('should respect includeRelatedPatterns parameter', () => {
      const withRelated = patternProvider.getPatternDetails({ 
        patternId: 'general-actions',
        includeRelatedPatterns: true
      });
      
      const withoutRelated = patternProvider.getPatternDetails({ 
        patternId: 'general-actions',
        includeRelatedPatterns: false
      });
      
      expect(Array.isArray(withRelated.relatedPatterns)).toBe(true);
      expect(withoutRelated.relatedPatterns).toEqual([]);
    });

    test('should validate boolean parameters', () => {
      expect(() => {
        patternProvider.getPatternDetails({ 
          patternId: 'general-actions',
          includeExamples: 'not-boolean' as any
        });
      }).toThrow('Include options must be boolean values');
    });
  });

  describe('getPatternCategories', () => {
    test('should return all categories with default options', () => {
      const result = patternProvider.getPatternCategories();
      
      expect(result).toHaveProperty('categories');
      expect(Array.isArray(result.categories)).toBe(true);
      expect(result.categories.length).toBeGreaterThan(0);
      
      result.categories.forEach(category => {
        expect(category).toHaveProperty('id');
        expect(category).toHaveProperty('name');
        expect(category).toHaveProperty('description');
        expect(category).toHaveProperty('patterns');
        expect(category).toHaveProperty('patternCount');
      });
    });

    test('should respect includePatternCount parameter', () => {
      const withCount = patternProvider.getPatternCategories({ 
        includePatternCount: true 
      });
      
      const withoutCount = patternProvider.getPatternCategories({ 
        includePatternCount: false 
      });
      
      withCount.categories.forEach(category => {
        expect(typeof category.patternCount).toBe('number');
        expect(category.patternCount).toBeGreaterThanOrEqual(0);
      });
      
      withoutCount.categories.forEach(category => {
        expect(category.patternCount).toBe(0);
      });
    });

    test('should respect includePatternList parameter', () => {
      const withList = patternProvider.getPatternCategories({ 
        includePatternList: true 
      });
      
      const withoutList = patternProvider.getPatternCategories({ 
        includePatternList: false 
      });
      
      withList.categories.forEach(category => {
        expect(Array.isArray(category.patterns)).toBe(true);
      });
      
      withoutList.categories.forEach(category => {
        expect(category.patterns).toEqual([]);
      });
    });

    test('should validate boolean parameters', () => {
      expect(() => {
        patternProvider.getPatternCategories({ 
          includePatternCount: 'not-boolean' as any
        });
      }).toThrow('Include options must be boolean values');
      
      expect(() => {
        patternProvider.getPatternCategories({ 
          includePatternList: 123 as any
        });
      }).toThrow('Include options must be boolean values');
    });
  });

  describe('getPattern', () => {
    test('should return pattern by ID', () => {
      const pattern = patternProvider.getPattern('general-actions');
      
      if (pattern) {
        expect(pattern.id).toBe('general-actions');
        expect(pattern.category).toBe('general');
      }
    });

    test('should return undefined for non-existent pattern', () => {
      const pattern = patternProvider.getPattern('non-existent');
      expect(pattern).toBeUndefined();
    });
  });

  describe('getPatternsByCategory', () => {
    test('should return patterns for valid category', () => {
      const patterns = patternProvider.getPatternsByCategory('general');
      
      patterns.forEach(pattern => {
        expect(pattern.category).toBe('general');
      });
    });

    test('should return empty array for non-existent category', () => {
      const patterns = patternProvider.getPatternsByCategory('non-existent');
      expect(patterns).toEqual([]);
    });
  });

  describe('getPatternsByComponent', () => {
    test('should return patterns that use specific component', () => {
      const patterns = patternProvider.getPatternsByComponent('button');
      
      patterns.forEach(pattern => {
        expect(pattern.components).toContain('button');
      });
    });

    test('should return empty array for component not used in any patterns', () => {
      const patterns = patternProvider.getPatternsByComponent('non-existent-component');
      expect(patterns).toEqual([]);
    });
  });

  describe('getPatternStats', () => {
    test('should return valid statistics', () => {
      const stats = patternProvider.getPatternStats();
      
      expect(stats).toHaveProperty('totalPatterns');
      expect(stats).toHaveProperty('totalCategories');
      expect(stats).toHaveProperty('componentsUsed');
      expect(stats).toHaveProperty('uniqueTags');
      expect(stats).toHaveProperty('byCategory');
      
      expect(typeof stats.totalPatterns).toBe('number');
      expect(typeof stats.totalCategories).toBe('number');
      expect(typeof stats.componentsUsed).toBe('number');
      expect(typeof stats.uniqueTags).toBe('number');
      expect(Array.isArray(stats.byCategory)).toBe(true);
    });

    test('should have consistent category counts', () => {
      const stats = patternProvider.getPatternStats();
      const totalByCategory = stats.byCategory.reduce((sum, cat) => sum + cat.patternCount, 0);
      
      expect(totalByCategory).toBe(stats.totalPatterns);
    });
  });

  describe('validatePatterns', () => {
    test('should validate pattern data integrity', () => {
      const validation = patternProvider.validatePatterns();
      
      expect(validation).toHaveProperty('valid');
      expect(validation).toHaveProperty('errors');
      expect(typeof validation.valid).toBe('boolean');
      expect(Array.isArray(validation.errors)).toBe(true);
    });
  });

  describe('getAvailableCategories', () => {
    test('should return sorted array of category IDs', () => {
      const categories = patternProvider.getAvailableCategories();
      
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);
      
      categories.forEach(categoryId => {
        expect(typeof categoryId).toBe('string');
      });
      
      // Should be sorted
      const sorted = [...categories].sort();
      expect(categories).toEqual(sorted);
    });
  });

  describe('getAllTags', () => {
    test('should return sorted array of unique tags', () => {
      const tags = patternProvider.getAllTags();
      
      expect(Array.isArray(tags)).toBe(true);
      
      tags.forEach(tag => {
        expect(typeof tag).toBe('string');
      });
      
      // Should be sorted and unique
      const sorted = [...tags].sort();
      const unique = [...new Set(tags)];
      expect(tags).toEqual(sorted);
      expect(tags).toEqual(unique);
    });
  });

  describe('getAllComponents', () => {
    test('should return sorted array of component IDs used in patterns', () => {
      const components = patternProvider.getAllComponents();
      
      expect(Array.isArray(components)).toBe(true);
      
      components.forEach(componentId => {
        expect(typeof componentId).toBe('string');
      });
      
      // Should be sorted and unique
      const sorted = [...components].sort();
      const unique = [...new Set(components)];
      expect(components).toEqual(sorted);
      expect(components).toEqual(unique);
    });
  });

  describe('findSimilarPatterns', () => {
    test('should find similar patterns for valid pattern ID', () => {
      const similarPatterns = patternProvider.findSimilarPatterns('general-actions', 3);
      
      expect(Array.isArray(similarPatterns)).toBe(true);
      expect(similarPatterns.length).toBeLessThanOrEqual(3);
      
      // Should not include the original pattern
      similarPatterns.forEach(pattern => {
        expect(pattern.id).not.toBe('general-actions');
      });
    });

    test('should return empty array for non-existent pattern', () => {
      const similarPatterns = patternProvider.findSimilarPatterns('non-existent');
      expect(similarPatterns).toEqual([]);
    });

    test('should respect limit parameter', () => {
      const limit = 2;
      const similarPatterns = patternProvider.findSimilarPatterns('general-actions', limit);
      
      expect(similarPatterns.length).toBeLessThanOrEqual(limit);
    });
  });

  describe('Complex search scenarios', () => {
    test('should handle multiple filters simultaneously', () => {
      const result = patternProvider.searchPatterns({ 
        query: 'resource',
        category: 'resource-management',
        tags: ['crud']
      });
      
      result.patterns.forEach(pattern => {
        // Should match all criteria
        expect(pattern.category).toBe('resource-management');
        
        const matchesQuery = pattern.name.toLowerCase().includes('resource') ||
                            pattern.description.toLowerCase().includes('resource') ||
                            pattern.tags.some(tag => tag.toLowerCase().includes('resource')) ||
                            pattern.usageGuidelines.toLowerCase().includes('resource');
        expect(matchesQuery).toBe(true);
        
        expect(pattern.tags.some(tag => ['crud'].includes(tag))).toBe(true);
      });
    });

    test('should handle empty results gracefully', () => {
      const result = patternProvider.searchPatterns({ 
        query: 'completely-non-existent-pattern-query',
        category: 'general'
      });
      
      expect(result.patterns).toEqual([]);
      expect(result.totalResults).toBe(0);
      expect(result.query.query).toBe('completely-non-existent-pattern-query');
    });
  });
});