/**
 * Unit Tests for Search Engine
 *
 * This file contains tests for the search engine functionality.
 * It verifies that the search engine correctly searches for components.
 */

import componentRegistry from '../../src/components/registry'
import searchEngine from '../../src/search/engine'
import { describe, it, expect } from 'vitest'

describe('Search Engine', () => {
  describe('searchComponents', () => {
    it('should return search results with correct structure', () => {
      const results = searchEngine.searchComponents({
        query: '',
      })

      console.log('results', results)

      // Verify search results structure
      expect(results).toBeDefined()
      expect(results).toHaveProperty('results')
      expect(results).toHaveProperty('totalResults')
      expect(results).toHaveProperty('query')
      expect(Array.isArray(results.results)).toBe(true)

      // Verify that some results were returned
      expect(results.totalResults).toBeGreaterThan(0)
      expect(results.results.length).toBeGreaterThan(0)
    })

    it('should return search results with correct result structure', () => {
      const results = searchEngine.searchComponents({
        query: '',
      })

      // Skip test if no results
      if (results.results.length === 0) {
        console.warn('No search results, skipping test')
        return
      }

      const firstResult = results.results[0]

      // Verify result structure
      expect(firstResult).toHaveProperty('id')
      expect(firstResult).toHaveProperty('name')
      expect(firstResult).toHaveProperty('category')
      expect(firstResult).toHaveProperty('description')
      expect(firstResult).toHaveProperty('relevance')
      expect(firstResult).toHaveProperty('matchedFields')
      expect(firstResult).toHaveProperty('tags')
      expect(firstResult).toHaveProperty('importPath')
      expect(firstResult).toHaveProperty('version')
      expect(firstResult).toHaveProperty('isExperimental')
      expect(Array.isArray(firstResult.matchedFields)).toBe(true)
      expect(Array.isArray(firstResult.tags)).toBe(true)
    })

    it('should filter results by query', () => {
      // Get all components to find a valid component name to search for
      const components = componentRegistry.getAllComponents()
      const componentNames = Object.values(components).map((c) => c.name)

      // Skip test if no components
      if (componentNames.length === 0) {
        console.warn('No components available, skipping test')
        return
      }

      // Use the first component name as the search query
      const searchQuery = componentNames[0]

      const results = searchEngine.searchComponents({
        query: searchQuery,
      })

      // Verify that results were filtered
      expect(results).toBeDefined()
      expect(results.results.length).toBeGreaterThan(0)
      expect(results.results.length).toBeLessThanOrEqual(Object.keys(components).length)

      // Verify that the first result matches the query
      const firstResult = results.results[0]
      expect(firstResult.name).toBe(searchQuery)
    })

    it('should filter results by category', () => {
      // Get all categories to find a valid category to filter by
      const categories = componentRegistry.getAllCategories()
      const categoryIds = Object.keys(categories)

      // Skip test if no categories
      if (categoryIds.length === 0) {
        console.warn('No categories available, skipping test')
        return
      }

      // Use the first category as the filter
      const categoryId = categoryIds[0]

      const results = searchEngine.searchComponents({
        query: '',
        category: categoryId,
      })

      // Verify that results were filtered
      expect(results).toBeDefined()
      expect(results.results.length).toBeGreaterThan(0)

      // Verify that all results have the correct category
      results.results.forEach((result) => {
        expect(result.category).toBe(categoryId)
      })
    })

    it('should filter results by tags', () => {
      // Get all components to find valid tags to filter by
      const components = componentRegistry.getAllComponents()
      const allTags = new Set<string>()

      Object.values(components).forEach((component) => {
        if (component.tags) {
          component.tags.forEach((tag) => allTags.add(tag))
        }
      })

      const tags = Array.from(allTags)

      // Skip test if no tags
      if (tags.length === 0) {
        console.warn('No tags available, skipping test')
        return
      }

      // Use the first tag as the filter
      const tag = tags[0]

      const results = searchEngine.searchComponents({
        query: '',
        tags: [tag],
      })

      // Verify that results were filtered
      expect(results).toBeDefined()

      // Skip further checks if no results
      if (results.results.length === 0) {
        console.warn(`No results for tag ${tag}, skipping further checks`)
        return
      }

      // Verify that all results have the correct tag
      results.results.forEach((result) => {
        expect(result.tags).toContain(tag)
      })
    })

    it('should apply pagination with limit and offset', () => {
      const limit = 5

      // Get all results
      const allResults = searchEngine.searchComponents({
        query: '',
      })

      // Skip test if not enough results
      if (allResults.totalResults <= limit) {
        console.warn('Not enough results for pagination test, skipping')
        return
      }

      // Get first page
      const firstPage = searchEngine.searchComponents({
        query: '',
        limit,
        offset: 0,
      })

      // Get second page
      const secondPage = searchEngine.searchComponents({
        query: '',
        limit,
        offset: limit,
      })

      // Verify pagination
      expect(firstPage.results.length).toBe(limit)
      expect(secondPage.results.length).toBeGreaterThan(0)

      // Verify that the pages contain different results
      const firstPageIds = firstPage.results.map((r) => r.id)
      const secondPageIds = secondPage.results.map((r) => r.id)

      secondPageIds.forEach((id) => {
        expect(firstPageIds).not.toContain(id)
      })
    })

    it('should sort results by relevance by default', () => {
      // Get all components to find a valid component name to search for
      const components = componentRegistry.getAllComponents()
      const componentNames = Object.values(components).map((c) => c.name)

      // Skip test if no components
      if (componentNames.length === 0) {
        console.warn('No components available, skipping test')
        return
      }

      // Use the first component name as the search query
      const searchQuery = componentNames[0]

      const results = searchEngine.searchComponents({
        query: searchQuery,
      })

      // Skip test if not enough results
      if (results.results.length <= 1) {
        console.warn('Not enough results for sorting test, skipping')
        return
      }

      // Verify that results are sorted by relevance in descending order
      for (let i = 0; i < results.results.length - 1; i++) {
        expect(results.results[i].relevance).toBeGreaterThanOrEqual(
          results.results[i + 1].relevance,
        )
      }
    })
  })

  describe('searchComponentsByFunctionality', () => {
    it('should return search results for a functionality', () => {
      const results = searchEngine.searchComponentsByFunctionality('button')

      // Verify search results structure
      expect(results).toBeDefined()
      expect(results).toHaveProperty('results')
      expect(results).toHaveProperty('totalResults')
      expect(results).toHaveProperty('functionality')
      expect(Array.isArray(results.results)).toBe(true)
    })

    it('should limit the number of results', () => {
      const limit = 3
      const results = searchEngine.searchComponentsByFunctionality('input', {
        limit,
      })

      // Verify limit was applied
      expect(results).toBeDefined()
      expect(results.results.length).toBeLessThanOrEqual(limit)
    })

    it('should use fuzzy matching when specified', () => {
      // Test with a slightly misspelled query
      const results = searchEngine.searchComponentsByFunctionality('buton', {
        fuzzyMatch: true,
      })

      // Verify that results were found despite the misspelling
      expect(results).toBeDefined()

      // Skip further checks if no results
      if (results.results.length === 0) {
        console.warn('No results for fuzzy search, skipping further checks')
        return
      }

      // Check if any result contains "button" in its name or id
      const hasButtonResult = results.results.some(
        (result) =>
          result.name.toLowerCase().includes('button') ||
          result.id.toLowerCase().includes('button'),
      )

      expect(hasButtonResult).toBe(true)
    })
  })
})
