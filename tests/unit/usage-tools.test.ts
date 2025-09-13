/**
 * Unit Tests for Usage Guidelines MCP Tools
 *
 * This file contains tests for the MCP tools that provide advanced usage guidelines functionality.
 */

import { describe, it, expect, vi } from 'vitest'
import componentRegistry from '../../src/components/registry'

// Mock MCP tool implementations for testing
class MockMCPTools {
  // Simulate get_component_usage tool
  static async get_component_usage(args: {
    componentId: string
    section?: string
    format?: 'markdown' | 'text' | 'json'
  }) {
    const { componentId, section, format = 'markdown' } = args

    const usageContent = componentRegistry.getComponentUsage(componentId)

    if (!usageContent) {
      throw new Error(`Usage guidelines for component ${componentId} not found`)
    }

    let content = usageContent

    // Extract specific section if requested
    if (section) {
      const lines = usageContent.split('\n')
      const sectionStart = lines.findIndex(
        (line) =>
          line.toLowerCase().includes(section.toLowerCase()) &&
          (line.startsWith('##') || line.startsWith('###')),
      )

      if (sectionStart === -1) {
        throw new Error(`Section "${section}" not found in usage guidelines for ${componentId}`)
      }

      // Find the end of the section
      let sectionEnd = lines.length
      for (let i = sectionStart + 1; i < lines.length; i++) {
        if (lines[i].startsWith('## ')) {
          sectionEnd = i
          break
        }
      }

      content = lines.slice(sectionStart, sectionEnd).join('\n').trim()
    }

    // Format the content based on requested format
    let formattedContent = content
    if (format === 'text') {
      // Strip markdown formatting for plain text
      formattedContent = content
        .replace(/#{1,6}\s+/g, '') // Remove headers
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
        .replace(/(?<!\s)\*([^*\n]+)\*(?!\s)/g, '$1') // Remove italic (single asterisks not preceded/followed by whitespace)
        .replace(/`(.*?)`/g, '$1') // Remove inline code
        .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links, keep text
        .replace(/^\s*\*\s+/gm, '• ') // Convert markdown bullets to unicode bullets
        .trim()
    } else if (format === 'json') {
      // Parse into structured format
      const parsedSections = MockMCPTools.parseMarkdownSections(content)
      formattedContent = JSON.stringify(
        {
          componentId,
          requestedSection: section,
          sections: parsedSections,
        },
        null,
        2,
      )
    }

    return {
      type: 'text',
      text: format === 'json' ? formattedContent : formattedContent,
    }
  }

  // Simulate search_usage_guidelines tool
  static async search_usage_guidelines(args: {
    query?: string
    section?: string
    componentId?: string
    limit?: number
  }) {
    const { query, section, componentId, limit } = args

    if (!query && !section && !componentId) {
      throw new Error(
        'At least one search parameter (query, section, or componentId) must be provided',
      )
    }

    const results = componentRegistry.searchUsageGuidelines({
      query,
      section,
      componentId,
    })

    // Apply limit if specified
    const limitedResults = limit ? results.slice(0, limit) : results

    return {
      type: 'text',
      text: JSON.stringify(
        {
          searchParams: { query, section, componentId, limit },
          totalResults: results.length,
          returnedResults: limitedResults.length,
          results: limitedResults.map((result) => ({
            componentId: result.componentId,
            componentName: result.componentName,
            matchedSections: result.matchedSections,
            // Truncate content for search results
            contentPreview:
              result.content.length > 500
                ? result.content.substring(0, 500) +
                  '...\n\n[Content truncated. Access full content via cloudscape://usage/' +
                  result.componentId +
                  ']'
                : result.content,
          })),
        },
        null,
        2,
      ),
    }
  }

  // Helper function to parse markdown sections
  static parseMarkdownSections(
    content: string,
  ): Array<{ title: string; level: number; content: string }> {
    const lines = content.split('\n')
    const sections: Array<{ title: string; level: number; content: string }> = []
    let currentSection: { title: string; level: number; content: string } | null = null

    lines.forEach((line) => {
      const headerMatch = line.match(/^(#{1,6})\s+(.+)$/)

      if (headerMatch) {
        // Save previous section if exists
        if (currentSection) {
          sections.push(currentSection)
        }

        // Start new section
        currentSection = {
          title: headerMatch[2],
          level: headerMatch[1].length,
          content: '',
        }
      } else if (currentSection) {
        // Add content to current section
        currentSection.content += (currentSection.content ? '\n' : '') + line
      }
    })

    // Add the last section
    if (currentSection) {
      sections.push(currentSection)
    }

    return sections.map((section) => ({
      ...section,
      content: section.content.trim(),
    }))
  }
}

describe('Usage Guidelines MCP Tools', () => {
  describe('get_component_usage tool', () => {
    it('should return full usage content for valid component', async () => {
      const result = await MockMCPTools.get_component_usage({
        componentId: 'button',
      })

      expect(result.type).toBe('text')
      expect(result.text).toBeDefined()
      expect(result.text.length).toBeGreaterThan(0)
      expect(result.text).toContain('## General guidelines')
    })

    it('should extract specific section when requested', async () => {
      const result = await MockMCPTools.get_component_usage({
        componentId: 'button',
        section: 'Features',
      })

      expect(result.type).toBe('text')
      expect(result.text).toContain('## Features')
      expect(result.text).not.toContain('## General guidelines')
    })

    it('should convert to text format when requested', async () => {
      const result = await MockMCPTools.get_component_usage({
        componentId: 'button',
        format: 'text',
      })

      // Should not contain markdown headers
      expect(result.text).not.toContain('##')
      expect(result.text).not.toContain('**')
      // Should convert bullet points to unicode bullets
      expect(result.text).toContain('•')
      // Should not contain markdown italic formatting
      expect(result.text).not.toMatch(/(?<!\s)\*[^*\n]+\*(?!\s)/)
    })

    it('should convert to JSON format when requested', async () => {
      const result = await MockMCPTools.get_component_usage({
        componentId: 'button',
        format: 'json',
      })

      expect(() => JSON.parse(result.text)).not.toThrow()

      const parsed = JSON.parse(result.text)
      expect(parsed).toHaveProperty('componentId', 'button')
      expect(parsed).toHaveProperty('sections')
      expect(Array.isArray(parsed.sections)).toBe(true)
    })

    it('should throw error for non-existent component', async () => {
      await expect(
        MockMCPTools.get_component_usage({
          componentId: 'non-existent-component',
        }),
      ).rejects.toThrow('Usage guidelines for component non-existent-component not found')
    })

    it('should throw error for non-existent section', async () => {
      await expect(
        MockMCPTools.get_component_usage({
          componentId: 'button',
          section: 'NonExistentSection',
        }),
      ).rejects.toThrow('Section "NonExistentSection" not found')
    })

    it('should handle section names case insensitively', async () => {
      const result1 = await MockMCPTools.get_component_usage({
        componentId: 'button',
        section: 'features',
      })

      const result2 = await MockMCPTools.get_component_usage({
        componentId: 'button',
        section: 'Features',
      })

      expect(result1.text).toBe(result2.text)
    })
  })

  describe('search_usage_guidelines tool', () => {
    it('should search by query', async () => {
      const result = await MockMCPTools.search_usage_guidelines({
        query: 'primary button',
      })

      expect(result.type).toBe('text')
      const parsed = JSON.parse(result.text)

      expect(parsed).toHaveProperty('searchParams')
      expect(parsed).toHaveProperty('totalResults')
      expect(parsed).toHaveProperty('results')
      expect(Array.isArray(parsed.results)).toBe(true)
      expect(parsed.totalResults).toBeGreaterThan(0)
    })

    it('should search by section', async () => {
      const result = await MockMCPTools.search_usage_guidelines({
        section: 'Features',
      })

      const parsed = JSON.parse(result.text)
      expect(parsed.totalResults).toBeGreaterThan(0)

      // All results should have Features in matchedSections
      parsed.results.forEach((resultItem: any) => {
        expect(resultItem.matchedSections).toBeDefined()
        expect(
          resultItem.matchedSections.some((section: string) =>
            section.toLowerCase().includes('features'),
          ),
        ).toBe(true)
      })
    })

    it('should search within specific component', async () => {
      const result = await MockMCPTools.search_usage_guidelines({
        componentId: 'button',
        query: 'primary',
      })

      const parsed = JSON.parse(result.text)
      expect(parsed.totalResults).toBeLessThanOrEqual(1)

      if (parsed.totalResults > 0) {
        expect(parsed.results[0].componentId).toBe('button')
      }
    })

    it('should apply limit parameter', async () => {
      const result = await MockMCPTools.search_usage_guidelines({
        section: 'Features',
        limit: 3,
      })

      const parsed = JSON.parse(result.text)
      expect(parsed.returnedResults).toBeLessThanOrEqual(3)
      expect(parsed.results.length).toBe(parsed.returnedResults)
    })

    it('should truncate long content in search results', async () => {
      const result = await MockMCPTools.search_usage_guidelines({
        query: 'button',
      })

      const parsed = JSON.parse(result.text)

      // Find a result with truncated content
      const truncatedResult = parsed.results.find((r: any) =>
        r.contentPreview.includes('[Content truncated'),
      )

      if (truncatedResult) {
        expect(truncatedResult.contentPreview).toContain('[Content truncated')
        expect(truncatedResult.contentPreview).toContain('cloudscape://usage/')
      }
    })

    it('should throw error when no search parameters provided', async () => {
      await expect(MockMCPTools.search_usage_guidelines({})).rejects.toThrow(
        'At least one search parameter',
      )
    })

    it('should return consistent results for same query', async () => {
      const result1 = await MockMCPTools.search_usage_guidelines({
        query: 'primary',
      })

      const result2 = await MockMCPTools.search_usage_guidelines({
        query: 'primary',
      })

      const parsed1 = JSON.parse(result1.text)
      const parsed2 = JSON.parse(result2.text)

      expect(parsed1.totalResults).toBe(parsed2.totalResults)
      expect(parsed1.results.length).toBe(parsed2.results.length)
    })

    it('should include matched sections in results', async () => {
      const result = await MockMCPTools.search_usage_guidelines({
        query: 'primary button',
      })

      const parsed = JSON.parse(result.text)

      // At least one result should have matched sections
      const resultWithSections = parsed.results.find(
        (r: any) => r.matchedSections && r.matchedSections.length > 0,
      )

      if (resultWithSections) {
        expect(Array.isArray(resultWithSections.matchedSections)).toBe(true)
        expect(resultWithSections.matchedSections.length).toBeGreaterThan(0)
      }
    })
  })

  describe('markdown section parsing', () => {
    it('should parse markdown sections correctly', () => {
      const content = `## Section 1
Content for section 1

### Subsection 1.1
Subsection content

## Section 2
Content for section 2`

      const sections = MockMCPTools.parseMarkdownSections(content)

      expect(sections).toHaveLength(3)
      expect(sections[0]).toEqual({
        title: 'Section 1',
        level: 2,
        content: 'Content for section 1',
      })
      expect(sections[1]).toEqual({
        title: 'Subsection 1.1',
        level: 3,
        content: 'Subsection content',
      })
      expect(sections[2]).toEqual({
        title: 'Section 2',
        level: 2,
        content: 'Content for section 2',
      })
    })

    it('should handle empty sections', () => {
      const content = `## Section 1

## Section 2
Content here`

      const sections = MockMCPTools.parseMarkdownSections(content)

      expect(sections).toHaveLength(2)
      expect(sections[0].content).toBe('')
      expect(sections[1].content).toBe('Content here')
    })

    it('should handle content without headers', () => {
      const content = `Some content without headers
More content`

      const sections = MockMCPTools.parseMarkdownSections(content)

      expect(sections).toHaveLength(0)
    })
  })

  describe('error handling', () => {
    it('should handle malformed section requests gracefully', async () => {
      // Test with section that exists but with different formatting
      await expect(
        MockMCPTools.get_component_usage({
          componentId: 'button',
          section: 'general guidelines', // lowercase
        }),
      ).resolves.toBeDefined()
    })

    it('should handle empty component usage content', async () => {
      // This would happen if a component exists but has no usage guidelines
      // The actual registry should prevent this, but testing edge case
      vi.spyOn(componentRegistry, 'getComponentUsage').mockReturnValueOnce('')

      await expect(
        MockMCPTools.get_component_usage({
          componentId: 'button',
        }),
      ).rejects.toThrow('Usage guidelines for component button not found')

      vi.restoreAllMocks()
    })
  })
})
