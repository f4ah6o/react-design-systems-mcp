/**
 * Demo Provider Service
 * 
 * This module provides services for accessing and managing component demos.
 * It integrates with the demo data model and component registry to provide
 * comprehensive demo information for Cloudscape Design System components.
 */

import { Demo, demoData } from '../components/data/demos';
import componentRegistry from '../components/registry';

export interface DemoSearchOptions {
  componentId?: string;
  demoType?: string;
  includeCode?: boolean;
  includeVariations?: boolean;
  limit?: number;
  offset?: number;
  tags?: string[];
  complexity?: 'basic' | 'intermediate' | 'advanced';
}

export interface DemoSearchResult {
  componentId?: string;
  demos: Demo[];
  totalResults: number;
  query: DemoSearchOptions;
  message?: string;
}

/**
 * Demo Provider class for managing component demos
 */
export class DemoProvider {
  private demos: Record<string, Demo>;

  constructor() {
    this.demos = demoData;
  }

  /**
   * Get demos for a specific component
   */
  getComponentDemos(options: DemoSearchOptions): DemoSearchResult {
    const { componentId, includeCode = true, includeVariations = true } = options;

    if (!componentId) {
      throw new Error('componentId is required');
    }

    // Validate componentId parameter type
    if (typeof componentId !== 'string') {
      throw new Error('componentId must be a string');
    }

    // Get all demos for this component
    const componentDemos = Object.values(this.demos).filter(demo => 
      demo.componentId === componentId
    );

    // Apply filters
    let filteredDemos = componentDemos;

    if (options.demoType) {
      if (typeof options.demoType !== 'string') {
        throw new Error('demoType must be a string');
      }
      filteredDemos = filteredDemos.filter(demo => demo.type === options.demoType);
    }

    if (options.tags && options.tags.length > 0) {
      filteredDemos = filteredDemos.filter(demo =>
        options.tags!.some(tag => demo.tags.includes(tag))
      );
    }

    if (options.complexity) {
      filteredDemos = filteredDemos.filter(demo =>
        demo.metadata.complexity === options.complexity
      );
    }

    // Apply pagination
    const offset = options.offset || 0;
    const limit = options.limit || 10;
    const paginatedDemos = filteredDemos.slice(offset, offset + limit);

    // Transform demos based on options
    const transformedDemos = paginatedDemos.map(demo => ({
      ...demo,
      code: includeCode ? demo.code : undefined,
      variations: includeVariations ? demo.variations : []
    }));

    // Add message for empty results
    let message: string | undefined;
    if (transformedDemos.length === 0) {
      // Check if component exists
      const component = componentRegistry.getComponent(componentId);
      if (!component) {
        message = `Component '${componentId}' not found in registry`;
      } else {
        message = `No demos available for component '${componentId}'`;
      }
    }

    return {
      componentId,
      demos: transformedDemos,
      totalResults: filteredDemos.length,
      query: options,
      message
    };
  }

  /**
   * Get all available demos with optional filtering
   */
  getAllDemos(options: DemoSearchOptions = {}): Demo[] {
    let demos = Object.values(this.demos);

    // Apply filters
    if (options.demoType) {
      demos = demos.filter(demo => demo.type === options.demoType);
    }

    if (options.tags && options.tags.length > 0) {
      demos = demos.filter(demo =>
        options.tags!.some(tag => demo.tags.includes(tag))
      );
    }

    if (options.complexity) {
      demos = demos.filter(demo =>
        demo.metadata.complexity === options.complexity
      );
    }

    // Apply pagination
    const offset = options.offset || 0;
    const limit = options.limit || 50;
    
    return demos.slice(offset, offset + limit);
  }

  /**
   * Get a specific demo by ID
   */
  getDemo(demoId: string): Demo | undefined {
    return this.demos[demoId];
  }

  /**
   * Get demo statistics
   */
  getDemoStats() {
    const demos = Object.values(this.demos);
    const componentIds = [...new Set(demos.map(demo => demo.componentId))];
    const demoTypes = [...new Set(demos.map(demo => demo.type))];
    const complexityLevels = [...new Set(demos.map(demo => demo.metadata.complexity))];

    return {
      totalDemos: demos.length,
      componentsWithDemos: componentIds.length,
      demoTypes: demoTypes.length,
      complexityLevels,
      byComplexity: {
        basic: demos.filter(d => d.metadata.complexity === 'basic').length,
        intermediate: demos.filter(d => d.metadata.complexity === 'intermediate').length,
        advanced: demos.filter(d => d.metadata.complexity === 'advanced').length
      }
    };
  }

  /**
   * Validate demo data integrity
   */
  validateDemos(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const demos = Object.values(this.demos);

    for (const demo of demos) {
      // Validate required fields
      if (!demo.id || !demo.name || !demo.componentId) {
        errors.push(`Demo missing required fields: ${demo.id || 'unknown'}`);
        continue;
      }

      // Validate component exists in registry
      const component = componentRegistry.getComponent(demo.componentId);
      if (!component) {
        errors.push(`Demo ${demo.id} references non-existent component: ${demo.componentId}`);
      }

      // Validate variations if present
      if (demo.variations) {
        for (const variation of demo.variations) {
          if (!variation.name || !variation.description) {
            errors.push(`Demo ${demo.id} has invalid variation: missing name or description`);
          }

          // Validate variation props against component properties
          if (variation.props && component) {
            for (const propName of Object.keys(variation.props)) {
              if (!component.properties[propName]) {
                errors.push(`Demo ${demo.id} variation uses non-existent prop: ${propName}`);
              }
            }
          }
        }
      }

      // Validate metadata
      if (!demo.metadata || !demo.metadata.source || !demo.metadata.complexity) {
        errors.push(`Demo ${demo.id} has incomplete metadata`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get demo types available in the system
   */
  getDemoTypes(): string[] {
    const demos = Object.values(this.demos);
    return [...new Set(demos.map(demo => demo.type))].sort();
  }

  /**
   * Get components that have demos available
   */
  getComponentsWithDemos(): string[] {
    const demos = Object.values(this.demos);
    return [...new Set(demos.map(demo => demo.componentId))].sort();
  }
}

// Export singleton instance
const demoProvider = new DemoProvider();
export default demoProvider;