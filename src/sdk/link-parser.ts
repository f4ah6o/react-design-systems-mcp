/**
 * Parse a link from usage.md files to determine the appropriate backend resource
 * Copied from FastMCP server implementation to share with SDK server.
 */
export function parseLinkToResource(link: string): {
  success: boolean
  type?: 'component_example' | 'component_details' | 'pattern' | 'foundation' | 'external'
  componentId?: string
  exampleId?: string
  tabId?: string
  patternId?: string
  category?: string
  topic?: string
  url?: string
  error?: string
} {
  try {
    if (!link || typeof link !== 'string') {
      return {
        success: false,
        error: 'Invalid link: Link must be a non-empty string',
      }
    }

    // Normalize link: remove leading/trailing slashes and convert to lowercase for matching
    const cleanLink = link.replace(/^\/+|\/+$/g, '')

    // Parse component details links: components/{componentId}/?tabId={tab}
    const componentMatch = cleanLink.match(/^components\/([^/?]+)(?:\/)?(?:\?(.+))?$/)
    if (componentMatch) {
      const componentId = componentMatch[1]
      const queryString = componentMatch[2] || ''

      // Parse query string parameters
      const params = new URLSearchParams(queryString)
      const tabId = params.get('tabId') || undefined
      const exampleName = params.get('example') || undefined

      if (exampleName) {
        // Example link: components/{componentId}?example={exampleName}
        return {
          success: true,
          type: 'component_example',
          componentId,
          exampleId: `${componentId}-${exampleName}`.replace(/_/g, '-'),
          tabId,
        }
      }

      // Otherwise return component_details type
      return {
        success: true,
        type: 'component_details',
        componentId,
        tabId,
      }
    }

    // Parse pattern links: patterns/{category}/{subcategory}/{pattern-name}/
    const patternMatch = cleanLink.match(/^patterns\/([^/]+)\/([^/]+)\/([^/]+)(?:\/)?$/)
    if (patternMatch) {
      const [, category, subcategory, patternName] = patternMatch
      const patternId = `${category}-${subcategory}-${patternName}`.replace(/\//g, '-')

      return {
        success: true,
        type: 'pattern',
        patternId,
      }
    }

    // Parse simple pattern links: patterns/{category}/{pattern-name}/
    const simplePatternMatch = cleanLink.match(/^patterns\/([^/]+)\/([^/]+)(?:\/)?$/)
    if (simplePatternMatch) {
      const [, category, patternName] = simplePatternMatch
      const patternId = `${category}-${patternName}`.replace(/\//g, '-')

      return {
        success: true,
        type: 'pattern',
        patternId,
      }
    }

    // Parse foundation links: foundation/{category}/{topic}/
    const foundationMatch = cleanLink.match(/^foundation\/([^/]+)\/([^/#]+)(?:\/)?(?:#(.+))?$/)
    if (foundationMatch) {
      const [, category, topic, anchor] = foundationMatch

      return {
        success: true,
        type: 'foundation',
        category,
        topic: anchor ? `${topic}#${anchor}` : topic,
      }
    }

    // Parse example/demo links: examples/{type}/{demo-name}.html
    const exampleMatch = cleanLink.match(/^examples\/([^/]+)\/([^.]+)\.html$/)
    if (exampleMatch) {
      const [, _type, _demoName] = exampleMatch

      // For demo links, we'll treat them as external references since they're HTML files
      return {
        success: true,
        type: 'external',
        url: link,
      }
    }

    // If no patterns match, return an error
    return {
      success: false,
      error: `Unrecognized link pattern: ${link}`,
    }
  } catch (error) {
    return {
      success: false,
      error: `Error parsing link: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}

