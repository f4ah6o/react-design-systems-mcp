/**
 * Search Engine
 *
 * This module provides search functionality for Cloudscape components.
 */

import componentRegistry, { type ComponentMetadata } from '../components/registry'

// Define types for search options and results
export interface SearchOptions {
  query: string
  category?: string
  tags?: string[]
  limit?: number
  offset?: number
  fuzzyMatch?: boolean
  fuzzyThreshold?: number
  filters?: Record<string, any>
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface SearchResult {
  id: string
  name: string
  category: string
  description: string
  relevance: number
  matchedFields: string[]
  tags: string[]
  importPath: string
  version: string
  isExperimental: boolean
}

export interface SearchResults {
  results: SearchResult[]
  totalResults: number
  query: string
  category?: string
  tags?: string[]
  limit?: number
  offset?: number
}

/**
 * Search for components
 * @param options - Search options
 * @returns Search results
 */
export function searchComponents(options: SearchOptions): SearchResults {
  const {
    query,
    category,
    tags,
    limit = 10,
    offset = 0,
    fuzzyMatch = false,
    fuzzyThreshold = 0.7,
    filters = {},
    sortBy = 'relevance',
    sortOrder = 'desc',
  } = options

  // Get all components
  const allComponents = componentRegistry.getAllComponents()

  // Filter components
  const results = Object.values(allComponents).filter((component) => {
    // Filter by category
    if (category && component.category !== category) {
      return false
    }

    // Filter by tags
    if (tags && tags.length > 0) {
      // Check if component has tags and if any of the search tags match
      const componentTags = component.tags || []
      if (!componentTags.some((tag) => tags.includes(tag))) {
        return false
      }
    }

    // Filter by custom filters
    for (const [key, value] of Object.entries(filters)) {
      if (component[key as keyof ComponentMetadata] !== value) {
        return false
      }
    }

    // Search by query
    if (query) {
      const matchedFields: string[] = []
      const searchFields = ['id', 'name', 'description', 'tags']

      // Check if any field matches the query
      for (const field of searchFields) {
        const fieldValue = component[field as keyof ComponentMetadata]

        if (
          typeof fieldValue === 'string' &&
          fieldValue.toLowerCase().includes(query.toLowerCase())
        ) {
          matchedFields.push(field)
        } else if (Array.isArray(fieldValue)) {
          for (const value of fieldValue) {
            if (typeof value === 'string' && value.toLowerCase().includes(query.toLowerCase())) {
              matchedFields.push(field)
              break
            }
          }
        }
      }

      // If fuzzy matching is enabled, check for fuzzy matches
      if (fuzzyMatch && matchedFields.length === 0) {
        for (const field of searchFields) {
          const fieldValue = component[field as keyof ComponentMetadata]

          if (typeof fieldValue === 'string') {
            const similarity = calculateSimilarity(fieldValue.toLowerCase(), query.toLowerCase())
            if (similarity >= fuzzyThreshold) {
              matchedFields.push(field)
            }
          } else if (Array.isArray(fieldValue)) {
            for (const value of fieldValue) {
              if (typeof value === 'string') {
                const similarity = calculateSimilarity(value.toLowerCase(), query.toLowerCase())
                if (similarity >= fuzzyThreshold) {
                  matchedFields.push(field)
                  break
                }
              }
            }
          }
        }
      }

      // If no fields match, exclude the component
      if (matchedFields.length === 0) {
        return false
      }
      // Add matched fields to the component
      ;(component as any).matchedFields = matchedFields

      // Calculate relevance score
      ;(component as any).relevance = calculateRelevance(component, query, matchedFields)
    } else {
      // If no query is provided, include all components with default relevance
      ;(component as any).matchedFields = []
      ;(component as any).relevance = 1
    }

    return true
  })

  // Sort results
  results.sort((a, b) => {
    if (sortBy === 'relevance') {
      return sortOrder === 'asc'
        ? (a as any).relevance - (b as any).relevance
        : (b as any).relevance - (a as any).relevance
    } else {
      const aValue = a[sortBy as keyof ComponentMetadata]
      const bValue = b[sortBy as keyof ComponentMetadata]

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      } else {
        return 0
      }
    }
  })

  // Apply pagination
  const paginatedResults = results.slice(offset, offset + limit)

  // Map results to search results
  const searchResults = paginatedResults.map((component) => ({
    id: component.id,
    name: component.name,
    category: component.category || 'other',
    description: component.description || '',
    relevance: (component as any).relevance,
    matchedFields: (component as any).matchedFields,
    tags: component.tags || [],
    importPath: component.importPath || '',
    version: component.version || '3.0.0',
    isExperimental: component.isExperimental || false,
  }))

  return {
    results: searchResults,
    totalResults: results.length,
    query,
    category,
    tags,
    limit,
    offset,
  }
}

/**
 * Search for components by functionality
 * @param functionality - Functionality to search for
 * @param options - Search options
 * @returns Search results
 */
export function searchComponentsByFunctionality(
  functionality: string,
  options: {
    limit?: number
    fuzzyMatch?: boolean
  } = {},
): {
  results: SearchResult[]
  totalResults: number
  functionality: string
} {
  const { limit = 10, fuzzyMatch = false } = options

  // Search for components with the specified functionality
  const searchResults = searchComponents({
    query: functionality,
    fuzzyMatch,
    limit,
  })

  return {
    results: searchResults.results,
    totalResults: searchResults.totalResults,
    functionality,
  }
}

/**
 * Calculate the similarity between two strings
 * @param str1 - First string
 * @param str2 - Second string
 * @returns Similarity score (0-1)
 */
function calculateSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1
  if (str1.length === 0 || str2.length === 0) return 0

  // Calculate Levenshtein distance
  const distance = levenshteinDistance(str1, str2)
  const maxLength = Math.max(str1.length, str2.length)

  // Convert distance to similarity score
  return 1 - distance / maxLength
}

/**
 * Calculate the Levenshtein distance between two strings
 * @param str1 - First string
 * @param str2 - Second string
 * @returns Levenshtein distance
 */
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length
  const n = str2.length

  // Create a matrix of size (m+1) x (n+1)
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0))

  // Initialize the first row and column
  for (let i = 0; i <= m; i++) {
    dp[i][0] = i
  }
  for (let j = 0; j <= n; j++) {
    dp[0][j] = j
  }

  // Fill the matrix
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]
      } else {
        dp[i][j] =
          1 +
          Math.min(
            dp[i - 1][j], // Deletion
            dp[i][j - 1], // Insertion
            dp[i - 1][j - 1], // Substitution
          )
      }
    }
  }

  return dp[m][n]
}

/**
 * Calculate the relevance score for a component
 * @param component - Component metadata
 * @param query - Search query
 * @param matchedFields - Fields that matched the query
 * @returns Relevance score
 */
function calculateRelevance(
  component: ComponentMetadata,
  query: string,
  matchedFields: string[],
): number {
  let relevance = 0

  // Assign weights to different fields
  const fieldWeights: Record<string, number> = {
    id: 5,
    name: 4,
    description: 3,
    tags: 2,
  }

  // Calculate relevance based on matched fields
  for (const field of matchedFields) {
    relevance += fieldWeights[field] || 1
  }

  // Boost relevance for exact matches
  for (const field of matchedFields) {
    const fieldValue = component[field as keyof ComponentMetadata]

    if (typeof fieldValue === 'string' && fieldValue.toLowerCase() === query.toLowerCase()) {
      relevance *= 2
      break
    } else if (Array.isArray(fieldValue)) {
      for (const value of fieldValue) {
        if (typeof value === 'string' && value.toLowerCase() === query.toLowerCase()) {
          relevance *= 2
          break
        }
      }
    }
  }

  return relevance
}

// Export the module
export default {
  searchComponents,
  searchComponentsByFunctionality,
}
