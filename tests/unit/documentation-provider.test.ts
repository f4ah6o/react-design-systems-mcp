/**
 * Unit Tests for Documentation Provider
 *
 * This file contains tests for the documentation provider functionality.
 * It verifies that the provider correctly generates and formats documentation.
 */

import componentRegistry from '../../src/components/registry'
import documentationProvider from '../../src/documentation/provider'
import { describe, it, expect } from 'vitest'

describe('Documentation Provider', () => {
  describe('getComponentDocumentation', () => {
    it('should return documentation for a component', () => {
      // Get a valid component ID to test with
      const components = componentRegistry.getAllComponents()
      const componentId = Object.keys(components)[0]

      // Skip test if no components
      if (!componentId) {
        console.warn('No components available, skipping test')
        return
      }

      const documentation = documentationProvider.getComponentDocumentation({
        componentId,
      })

      // Verify documentation was returned
      expect(documentation).toBeDefined()

      // Verify documentation structure when returned as an object
      if (typeof documentation === 'object') {
        expect(documentation).toHaveProperty('overview')
        expect(documentation).toHaveProperty('props')
        expect(documentation).toHaveProperty('usage')
        expect(documentation).toHaveProperty('accessibility')
        expect(documentation).toHaveProperty('design')
        expect(documentation).toHaveProperty('bestPractices')
        expect(documentation).toHaveProperty('commonPitfalls')
        expect(documentation).toHaveProperty('migrationGuides')
        expect(documentation).toHaveProperty('examples')
      }
    })

    it('should return a specific section when requested', () => {
      // Get a valid component ID to test with
      const components = componentRegistry.getAllComponents()
      const componentId = Object.keys(components)[0]

      // Skip test if no components
      if (!componentId) {
        console.warn('No components available, skipping test')
        return
      }

      const section = 'usage'
      const documentation = documentationProvider.getComponentDocumentation({
        componentId,
        section,
      })

      // Verify section was returned as a string
      expect(documentation).toBeDefined()
      expect(typeof documentation).toBe('string')
      expect(documentation).toContain('Usage Guidelines')
    })

    it('should format documentation in different formats', () => {
      // Get a valid component ID to test with
      const components = componentRegistry.getAllComponents()
      const componentId = Object.keys(components)[0]

      // Skip test if no components
      if (!componentId) {
        console.warn('No components available, skipping test')
        return
      }

      const section = 'overview'

      // Test markdown format (default)
      const markdownDoc = documentationProvider.getComponentDocumentation({
        componentId,
        section,
        format: 'markdown',
      })

      // Test HTML format
      const htmlDoc = documentationProvider.getComponentDocumentation({
        componentId,
        section,
        format: 'html',
      })

      // Test plain text format
      const plainDoc = documentationProvider.getComponentDocumentation({
        componentId,
        section,
        format: 'plain',
      })

      // Verify different formats
      expect(markdownDoc).toBeDefined()
      expect(htmlDoc).toBeDefined()
      expect(plainDoc).toBeDefined()

      expect(typeof markdownDoc).toBe('string')
      expect(typeof htmlDoc).toBe('string')
      expect(typeof plainDoc).toBe('string')

      // Verify HTML format contains HTML tags
      expect(htmlDoc).toContain('<h1>')

      // Verify plain format doesn't contain markdown or HTML
      expect(plainDoc).not.toContain('#')
      expect(plainDoc).not.toContain('<h1>')
    })

    it('should throw an error for non-existent component', () => {
      expect(() => {
        documentationProvider.getComponentDocumentation({
          componentId: 'non-existent-component',
        })
      }).toThrow('Component non-existent-component not found')
    })
  })

  describe('getCategoryDocumentation', () => {
    it('should return documentation for a category', () => {
      // Get a valid category ID to test with
      const categories = componentRegistry.getAllCategories()
      const categoryId = Object.keys(categories)[0]

      // Skip test if no categories
      if (!categoryId) {
        console.warn('No categories available, skipping test')
        return
      }

      const documentation = documentationProvider.getCategoryDocumentation({
        categoryId,
      })

      // Verify documentation was returned
      expect(documentation).toBeDefined()

      // Verify documentation structure when returned as an object
      if (typeof documentation === 'object') {
        expect(documentation).toHaveProperty('overview')
        expect(documentation).toHaveProperty('components')
        expect(documentation).toHaveProperty('usage')
        expect(Array.isArray(documentation.components)).toBe(true)
      }
    })

    it('should format category documentation in different formats', () => {
      // Get a valid category ID to test with
      const categories = componentRegistry.getAllCategories()
      const categoryId = Object.keys(categories)[0]

      // Skip test if no categories
      if (!categoryId) {
        console.warn('No categories available, skipping test')
        return
      }

      // Test HTML format
      const htmlDoc = documentationProvider.getCategoryDocumentation({
        categoryId,
        format: 'html',
      })

      // Verify HTML format
      expect(htmlDoc).toBeDefined()
      expect(typeof htmlDoc).toBe('string')
      expect(htmlDoc).toContain('<h1>')
    })

    it('should throw an error for non-existent category', () => {
      expect(() => {
        documentationProvider.getCategoryDocumentation({
          categoryId: 'non-existent-category',
        })
      }).toThrow('Category non-existent-category not found')
    })
  })

  describe('getPatternDocumentation', () => {
    it('should return documentation for a pattern', () => {
      // Get a valid pattern ID to test with
      const patterns = componentRegistry.getAllPatterns()
      const patternId = Object.keys(patterns)[0]

      // Skip test if no patterns
      if (!patternId) {
        console.warn('No patterns available, skipping test')
        return
      }

      const documentation = documentationProvider.getPatternDocumentation({
        patternId,
      })

      // Verify documentation was returned
      expect(documentation).toBeDefined()

      // Verify documentation structure when returned as an object
      if (typeof documentation === 'object') {
        expect(documentation).toHaveProperty('overview')
        expect(documentation).toHaveProperty('components')
        expect(documentation).toHaveProperty('customizationOptions')
        expect(documentation).toHaveProperty('usage')
        expect(documentation).toHaveProperty('bestPractices')
        expect(Array.isArray(documentation.components)).toBe(true)
      }
    })

    it('should return a specific section when requested', () => {
      // Get a valid pattern ID to test with
      const patterns = componentRegistry.getAllPatterns()
      const patternId = Object.keys(patterns)[0]

      // Skip test if no patterns
      if (!patternId) {
        console.warn('No patterns available, skipping test')
        return
      }

      const section = 'usage'
      const documentation = documentationProvider.getPatternDocumentation({
        patternId,
        section,
      })

      // Verify section was returned
      expect(documentation).toBeDefined()
    })

    it('should throw an error for non-existent pattern', () => {
      expect(() => {
        documentationProvider.getPatternDocumentation({
          patternId: 'non-existent-pattern',
        })
      }).toThrow('Pattern non-existent-pattern not found')
    })
  })

  describe('searchDocumentation', () => {
    it('should return search results with correct structure', () => {
      // Get a valid component name to search for
      const components = componentRegistry.getAllComponents()
      const componentNames = Object.values(components).map((c) => c.name)

      // Skip test if no components
      if (componentNames.length === 0) {
        console.warn('No components available, skipping test')
        return
      }

      // Use the first component name as the search query
      const searchQuery = componentNames[0]

      const results = documentationProvider.searchDocumentation({
        query: searchQuery,
      })

      // Verify search results structure
      expect(results).toBeDefined()
      expect(results).toHaveProperty('results')
      expect(results).toHaveProperty('totalResults')
      expect(results).toHaveProperty('query')
      expect(results).toHaveProperty('scope')
      expect(Array.isArray(results.results)).toBe(true)
    })

    it('should filter results by scope', () => {
      // Get a valid component name to search for
      const components = componentRegistry.getAllComponents()
      const componentNames = Object.values(components).map((c) => c.name)

      // Skip test if no components
      if (componentNames.length === 0) {
        console.warn('No components available, skipping test')
        return
      }

      // Use the first component name as the search query
      const searchQuery = componentNames[0]

      const results = documentationProvider.searchDocumentation({
        query: searchQuery,
        scope: 'components',
      })

      // Verify search results are filtered by scope
      expect(results).toBeDefined()
      expect(results.scope).toBe('components')

      // Verify all results are components
      results.results.forEach((result) => {
        expect(result.type).toBe('component')
      })
    })

    it('should limit the number of results', () => {
      const limit = 2
      const results = documentationProvider.searchDocumentation({
        query: 'a', // Generic query that should match multiple items
        limit,
      })

      // Verify limit was applied
      expect(results).toBeDefined()
      expect(results.results.length).toBeLessThanOrEqual(limit)
    })

    it('should throw an error for empty query', () => {
      expect(() => {
        documentationProvider.searchDocumentation({
          query: '',
        })
      }).toThrow('Search query is required')
    })
  })

  describe('formatDocumentation', () => {
    it('should format markdown to HTML', () => {
      // Create a simple markdown string
      const markdown = `
# Test Heading

This is a **bold** text with *italic* emphasis.

\`\`\`
code block
\`\`\`

- List item 1
- List item 2
      `

      const html = documentationProvider.formatDocumentation(markdown, 'html')

      // Verify HTML formatting
      expect(html).toContain('<h1>Test Heading</h1>')
      expect(html).toContain('<strong>bold</strong>')
      expect(html).toContain('<em>italic</em>')
      expect(html).toContain('<pre><code>')
      expect(html).toContain('code block')
      expect(html).toContain('<li>List item 1</li>')
      expect(html).toContain('<li>List item 2</li>')
    })

    it('should format markdown to plain text', () => {
      // Create a simple markdown string
      const markdown = `
# Test Heading

This is a **bold** text with *italic* emphasis.

\`\`\`
code block
\`\`\`
      `

      const plain = documentationProvider.formatDocumentation(markdown, 'plain')

      // Verify plain text formatting
      expect(plain).toContain('Test Heading')
      expect(plain).toContain('This is a bold text with italic emphasis.')
      expect(plain).toContain('code block')
      expect(plain).not.toContain('#')
      expect(plain).not.toContain('**')
      expect(plain).not.toContain('*')
      expect(plain).not.toContain('```')
    })
  })
})
