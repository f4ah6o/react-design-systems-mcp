/**
 * Pattern Provider Service
 * 
 * This module provides services for accessing and managing design patterns.
 * It integrates with the pattern data model and component registry to provide
 * comprehensive pattern information for Cloudscape Design System patterns.
 */

import { Pattern, patternData } from '../components/data/patterns';
import { PatternCategory, patternCategories } from '../components/data/pattern-categories';
import componentRegistry from '../components/registry';

export interface PatternSearchOptions {
  query?: string;
  category?: string;
  component?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
}

export interface PatternSearchResult {
  patterns: Pattern[];
  totalResults: number;
  query: PatternSearchOptions;
  message?: string;
}

export interface PatternDetailsOptions {
  patternId: string;
  includeExamples?: boolean;
  includeCode?: boolean;
  includeUsageGuidelines?: boolean;
  includeRelatedPatterns?: boolean;
}

/**
 * Pattern Provider class for managing design patterns
 */
export class PatternProvider {
  private patterns: Record<string, Pattern>;
  private categories: Record<string, PatternCategory>;

  constructor() {
    this.patterns = patternData;
    this.categories = patternCategories;
  }

  /**
   * Search patterns with various filters
   */
  searchPatterns(options: PatternSearchOptions = {}): PatternSearchResult {
    let patterns = Object.values(this.patterns);

    // Apply text query filter
    if (options.query && options.query.trim()) {
      const query = options.query.toLowerCase().trim();
      patterns = patterns.filter(pattern =>
        pattern.name.toLowerCase().includes(query) ||
        pattern.description.toLowerCase().includes(query) ||
        pattern.tags.some(tag => tag.toLowerCase().includes(query)) ||
        pattern.usageGuidelines.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (options.category) {
      patterns = patterns.filter(pattern => pattern.category === options.category);
    }

    // Apply component filter
    if (options.component) {
      patterns = patterns.filter(pattern => 
        pattern.components.includes(options.component!)
      );
    }

    // Apply tags filter
    if (options.tags && options.tags.length > 0) {
      patterns = patterns.filter(pattern =>
        options.tags!.some(tag => pattern.tags.includes(tag))
      );
    }

    // Apply pagination
    const totalResults = patterns.length;
    const offset = Math.max(0, options.offset || 0);
    const limit = Math.min(100, Math.max(0, options.limit || 20)); // Cap at 100, default 20
    
    const paginatedPatterns = patterns.slice(offset, offset + limit);

    return {
      patterns: paginatedPatterns,
      totalResults,
      query: options
    };
  }

  /**
   * Get detailed information about a specific pattern
   */
  getPatternDetails(options: PatternDetailsOptions): Pattern {
    const { patternId, includeExamples = true, includeCode = true, 
            includeUsageGuidelines = true, includeRelatedPatterns = true } = options;

    if (!patternId || typeof patternId !== 'string') {
      throw new Error('patternId is required and must be a string');
    }

    const pattern = this.patterns[patternId];
    if (!pattern) {
      throw new Error(`Pattern with ID '${patternId}' not found`);
    }

    // Validate boolean parameters
    if (typeof includeExamples !== 'boolean' ||
        typeof includeCode !== 'boolean' ||
        typeof includeUsageGuidelines !== 'boolean' ||
        typeof includeRelatedPatterns !== 'boolean') {
      throw new Error('Include options must be boolean values');
    }

    // Build response based on options
    return {
      ...pattern,
      examples: includeExamples ? pattern.examples : [],
      codeExample: includeCode ? pattern.codeExample : '',
      usageGuidelines: includeUsageGuidelines ? pattern.usageGuidelines : '',
      relatedPatterns: includeRelatedPatterns ? pattern.relatedPatterns : []
    };
  }

  /**
   * Get all pattern categories with optional details
   */
  getPatternCategories(options: {
    includePatternCount?: boolean;
    includePatternList?: boolean;
  } = {}): { categories: PatternCategory[] } {
    const { includePatternCount = true, includePatternList = true } = options;

    // Validate boolean parameters
    if (typeof includePatternCount !== 'boolean' || typeof includePatternList !== 'boolean') {
      throw new Error('Include options must be boolean values');
    }

    const categories = Object.values(this.categories).map(category => ({
      ...category,
      patternCount: includePatternCount ? category.patternCount : 0,
      patterns: includePatternList ? category.patterns : []
    }));

    return { categories };
  }

  /**
   * Get a specific pattern by ID (simplified version)
   */
  getPattern(patternId: string): Pattern | undefined {
    return this.patterns[patternId];
  }

  /**
   * Get all patterns in a specific category
   */
  getPatternsByCategory(categoryId: string): Pattern[] {
    return Object.values(this.patterns).filter(pattern => 
      pattern.category === categoryId
    );
  }

  /**
   * Get patterns that use a specific component
   */
  getPatternsByComponent(componentId: string): Pattern[] {
    return Object.values(this.patterns).filter(pattern =>
      pattern.components.includes(componentId)
    );
  }

  /**
   * Get pattern statistics
   */
  getPatternStats() {
    const patterns = Object.values(this.patterns);
    const categories = Object.values(this.categories);
    const allComponents = new Set<string>();
    const allTags = new Set<string>();

    patterns.forEach(pattern => {
      pattern.components.forEach(comp => allComponents.add(comp));
      pattern.tags.forEach(tag => allTags.add(tag));
    });

    return {
      totalPatterns: patterns.length,
      totalCategories: categories.length,
      componentsUsed: allComponents.size,
      uniqueTags: allTags.size,
      byCategory: categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        patternCount: patterns.filter(p => p.category === cat.id).length
      }))
    };
  }

  /**
   * Validate pattern data integrity
   */
  validatePatterns(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const patterns = Object.values(this.patterns);

    for (const pattern of patterns) {
      // Validate required fields
      if (!pattern.id || !pattern.name || !pattern.description || !pattern.category) {
        errors.push(`Pattern missing required fields: ${pattern.id || 'unknown'}`);
        continue;
      }

      // Validate category exists
      if (!this.categories[pattern.category]) {
        errors.push(`Pattern ${pattern.id} references non-existent category: ${pattern.category}`);
      }

      // Validate components exist in registry
      for (const componentId of pattern.components) {
        const component = componentRegistry.getComponent(componentId);
        if (!component) {
          errors.push(`Pattern ${pattern.id} references non-existent component: ${componentId}`);
        }
      }

      // Validate related patterns exist
      for (const relatedPatternId of pattern.relatedPatterns) {
        if (!this.patterns[relatedPatternId]) {
          errors.push(`Pattern ${pattern.id} references non-existent related pattern: ${relatedPatternId}`);
        }
      }

      // Validate examples structure
      if (pattern.examples) {
        for (const example of pattern.examples) {
          if (!example.title || !example.description) {
            errors.push(`Pattern ${pattern.id} has invalid example: missing title or description`);
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get available pattern categories
   */
  getAvailableCategories(): string[] {
    return Object.keys(this.categories).sort();
  }

  /**
   * Get all tags used across patterns
   */
  getAllTags(): string[] {
    const patterns = Object.values(this.patterns);
    const tags = new Set<string>();
    
    patterns.forEach(pattern => {
      pattern.tags.forEach(tag => tags.add(tag));
    });
    
    return Array.from(tags).sort();
  }

  /**
   * Get components used across all patterns
   */
  getAllComponents(): string[] {
    const patterns = Object.values(this.patterns);
    const components = new Set<string>();
    
    patterns.forEach(pattern => {
      pattern.components.forEach(comp => components.add(comp));
    });
    
    return Array.from(components).sort();
  }

  /**
   * Search patterns by similarity to a given pattern
   */
  findSimilarPatterns(patternId: string, limit: number = 5): Pattern[] {
    const targetPattern = this.patterns[patternId];
    if (!targetPattern) {
      return [];
    }

    const patterns = Object.values(this.patterns).filter(p => p.id !== patternId);
    
    // Calculate similarity score based on shared components and tags
    const scoredPatterns = patterns.map(pattern => {
      let score = 0;
      
      // Category match
      if (pattern.category === targetPattern.category) {
        score += 10;
      }
      
      // Shared components
      const sharedComponents = pattern.components.filter(comp => 
        targetPattern.components.includes(comp)
      ).length;
      score += sharedComponents * 5;
      
      // Shared tags
      const sharedTags = pattern.tags.filter(tag => 
        targetPattern.tags.includes(tag)
      ).length;
      score += sharedTags * 2;
      
      return { pattern, score };
    });
    
    // Sort by score and return top results
    return scoredPatterns
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.pattern);
  }
}

// Export singleton instance
const patternProvider = new PatternProvider();
export default patternProvider;