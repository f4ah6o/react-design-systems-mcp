/**
 * Pattern Category Data Model
 * 
 * This module defines pattern category entities based on cloudscape.design/patterns structure.
 * Categories organize the 61+ design patterns into General, Generative AI, Resource Management,
 * and Layout groups with metadata about pattern counts and relationships.
 */

export interface PatternSummary {
  id: string;
  name: string;
  description: string;
}

export interface PatternCategory {
  id: string;
  name: string;
  description: string;
  patterns: PatternSummary[];
  patternCount: number;
  lastUpdated: string;
  tags: string[];
}

/**
 * Pattern category data organized by the main categories from cloudscape.design/patterns
 * Each category contains patterns that share common use cases and interaction paradigms
 */
export const patternCategories: Record<string, PatternCategory> = {
  'general': {
    id: 'general',
    name: 'General Patterns',
    description: 'Common UI patterns and interactions used across most applications, including actions, navigation, filtering, and error handling.',
    patterns: [
      {
        id: 'general-actions',
        name: 'Actions',
        description: 'Patterns for user actions, including primary actions, secondary actions, and bulk actions.'
      },
      {
        id: 'general-errors',
        name: 'Errors',
        description: 'Patterns for displaying and handling errors, including validation errors, system errors, and recovery actions.'
      },
      {
        id: 'general-filtering',
        name: 'Filtering',
        description: 'Patterns for filtering and searching data, including property filters, faceted search, and advanced filtering.'
      }
    ],
    patternCount: 3,
    lastUpdated: '2025-09-11',
    tags: ['ui-patterns', 'common', 'interactions', 'actions', 'errors', 'filtering']
  },

  'generative-ai': {
    id: 'generative-ai',
    name: 'Generative AI Patterns',
    description: 'Specialized patterns for AI-powered features including conversational interfaces, content generation, and AI-assisted workflows.',
    patterns: [
      {
        id: 'generative-ai-chat',
        name: 'Chat',
        description: 'Conversational interface patterns for AI-powered chat experiences.'
      },
      {
        id: 'generative-ai-loading-states',
        name: 'Loading States',
        description: 'Loading patterns specific to AI content generation, including progressive loading and streaming responses.'
      },
      {
        id: 'generative-ai-content-generation',
        name: 'Content Generation',
        description: 'Patterns for AI-powered content creation interfaces with templates, prompts, and output management.'
      },
      {
        id: 'generative-ai-prompt-engineering',
        name: 'Prompt Engineering',
        description: 'Interface patterns for building, testing, and refining AI prompts with variables and templates.'
      }
    ],
    patternCount: 4,
    lastUpdated: '2025-09-11',
    tags: ['ai', 'generative', 'chat', 'conversation', 'loading', 'streaming', 'content-generation', 'prompt-engineering']
  },

  'resource-management': {
    id: 'resource-management',
    name: 'Resource Management Patterns',
    description: 'Patterns for managing resources and data entities, including CRUD operations, workflows, and resource lifecycles.',
    patterns: [
      {
        id: 'resource-management-create',
        name: 'Create Resource',
        description: 'Patterns for creating new resources, including forms, validation, and confirmation workflows.'
      },
      {
        id: 'resource-management-view',
        name: 'View Resource',
        description: 'Patterns for displaying resource details, including overview pages, detail panels, and read-only views.'
      },
      {
        id: 'resource-management-list',
        name: 'List Resources',
        description: 'Patterns for displaying collections of resources with filtering, sorting, and bulk actions.'
      },
      {
        id: 'resource-management-edit',
        name: 'Edit Resource',
        description: 'Patterns for modifying existing resources with validation, change tracking, and confirmation workflows.'
      },
      {
        id: 'resource-management-delete',
        name: 'Delete Resource',
        description: 'Safe deletion patterns with confirmation dialogs, bulk deletion, and recovery options.'
      }
    ],
    patternCount: 5,
    lastUpdated: '2025-09-11',
    tags: ['resource-management', 'crud', 'create', 'view', 'edit', 'delete', 'list', 'workflows', 'data-management', 'bulk-actions']
  },

  'layout': {
    id: 'layout',
    name: 'Layout Patterns',
    description: 'Structural patterns for organizing content and components, including tables, forms, and page layouts.',
    patterns: [
      {
        id: 'layout-data-table',
        name: 'Data Table',
        description: 'A table with sorting, filtering, and pagination.'
      },
      {
        id: 'layout-form',
        name: 'Form Layout',
        description: 'A form with validation and error handling.'
      }
    ],
    patternCount: 2,
    lastUpdated: '2025-09-11',
    tags: ['layout', 'structure', 'tables', 'forms', 'organization']
  }
};

/**
 * Get all pattern categories
 */
export function getAllPatternCategories(): PatternCategory[] {
  return Object.values(patternCategories);
}

/**
 * Get a specific pattern category by ID
 */
export function getPatternCategory(categoryId: string): PatternCategory | undefined {
  return patternCategories[categoryId];
}

/**
 * Get pattern categories with optional filtering
 */
export function getPatternCategories(options: {
  includePatternCount?: boolean;
  includePatternList?: boolean;
  tags?: string[];
} = {}): PatternCategory[] {
  let categories = getAllPatternCategories();
  
  // Filter by tags if provided
  if (options.tags && options.tags.length > 0) {
    categories = categories.filter(category =>
      options.tags!.some(tag => category.tags.includes(tag))
    );
  }
  
  // Transform based on options
  return categories.map(category => ({
    ...category,
    patterns: options.includePatternList === false ? [] : category.patterns,
    patternCount: options.includePatternCount === false ? 0 : category.patternCount
  }));
}

/**
 * Get pattern category statistics
 */
export function getPatternCategoryStats() {
  const categories = getAllPatternCategories();
  const totalPatterns = categories.reduce((sum, cat) => sum + cat.patternCount, 0);
  const totalCategories = categories.length;
  
  return {
    totalCategories,
    totalPatterns,
    categories: categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      patternCount: cat.patternCount
    }))
  };
}

export default patternCategories;