/**
 * Documentation Provider
 *
 * This module provides documentation for Cloudscape components.
 */

import componentRegistry from '../components/registry'

// Define types
interface GetComponentDocumentationOptions {
  componentId: string
  section?: string
  format?: 'markdown' | 'html' | 'plain'
}

interface GetCategoryDocumentationOptions {
  categoryId: string
  format?: 'markdown' | 'html' | 'plain'
}

interface GetPatternDocumentationOptions {
  patternId: string
  section?: string
  format?: 'markdown' | 'html' | 'plain'
}

interface SearchDocumentationOptions {
  query: string
  scope?: 'components' | 'categories' | 'patterns' | 'all'
  limit?: number
}

interface DocumentationSection {
  overview: string
  props: string
  usage: string
  accessibility: string
  design: string
  bestPractices: string
  commonPitfalls: string
  migrationGuides: string
  examples: string
}

interface SearchResult {
  type: 'component' | 'category' | 'pattern'
  id: string
  name: string
  description: string
  relevance: number
}

interface SearchResponse {
  results: SearchResult[]
  totalResults: number
  query: string
  scope: string
}

/**
 * Get documentation for a component
 * @param options - Documentation options
 * @returns Component documentation
 */
function getComponentDocumentation({
  componentId,
  section,
  format = 'markdown',
}: GetComponentDocumentationOptions): DocumentationSection | string {
  const component = componentRegistry.getComponent(componentId)

  if (!component) {
    throw new Error(`Component ${componentId} not found`)
  }

  // Generate overview documentation
  const overview = `
# ${component.name}

${component.description}

## Import

\`\`\`jsx
import ${component.name} from "${component.importPath}";
\`\`\`

## Basic Usage

\`\`\`jsx
<${component.name} />
\`\`\`
`

  // Generate props documentation
  const propsDoc = Object.values(component.properties)
    .map((prop) => {
      const required = prop.required ? 'Required' : 'Optional'
      const defaultValue =
        prop.defaultValue !== null && prop.defaultValue !== undefined
          ? `Default: \`${JSON.stringify(prop.defaultValue)}\``
          : 'No default value'

      const acceptedValues =
        prop.acceptedValues && prop.acceptedValues.length > 0
          ? `\nAccepted values: ${prop.acceptedValues.map((v) => `\`${v}\``).join(', ')}`
          : ''

      const deprecated = prop.isDeprecated ? '\n**Deprecated**' : ''

      return `### ${prop.name}

Type: \`${prop.type}\`
${required} - ${defaultValue}${acceptedValues}${deprecated}

${prop.description}
`
    })
    .join('\n')

  // Generate usage documentation
  const usage = `
## Usage Guidelines

- Use ${component.name} for ${component.description?.toLowerCase() || 'its intended purpose'}
- Follow accessibility best practices
- Ensure proper keyboard navigation
${generateComponentSpecificUsageGuidelines(component)}
`

  // Generate accessibility documentation
  const accessibility = `
## Accessibility

${component.name} follows WAI-ARIA guidelines for accessibility:

- Proper ARIA roles and attributes
- Keyboard navigation support
- Screen reader compatibility
${generateComponentSpecificAccessibilityGuidelines(component)}
`

  // Generate design documentation
  const design = `
## Design Guidelines

- Use consistent spacing and alignment
- Follow Cloudscape Design System typography guidelines
- Maintain visual hierarchy
${generateComponentSpecificDesignGuidelines(component)}
`

  // Generate best practices documentation
  const bestPractices = `
## Best Practices

- Keep content concise and focused
- Use clear and descriptive labels
- Provide feedback for user interactions
- Test with different screen sizes
${generateComponentSpecificBestPractices(component)}
`

  // Generate common pitfalls documentation
  const commonPitfalls = `
## Common Pitfalls

- Overriding default styles without considering accessibility
- Nesting components incorrectly
- Not handling error states properly
- Ignoring responsive design considerations
${generateComponentSpecificCommonPitfalls(component)}
`

  // Generate migration guides documentation
  const migrationGuides = component.isExperimental
    ? `
## Migration Guides

This component is experimental and may change in future versions. Be prepared to update your code when upgrading Cloudscape.
`
    : `
## Migration Guides

When upgrading Cloudscape versions, check the changelog for any breaking changes to this component.
${generateComponentSpecificMigrationGuides(component)}
`

  // Generate examples documentation
  const examples = `
## Examples

${generateComponentExamplesDocumentation(component)}
`

  // Create documentation object
  const documentation: DocumentationSection = {
    overview,
    props: propsDoc,
    usage,
    accessibility,
    design,
    bestPractices,
    commonPitfalls,
    migrationGuides,
    examples,
  }

  // Return specific section if requested
  if (section && section in documentation) {
    return formatDocumentation(documentation[section as keyof DocumentationSection], format)
  }

  // Return full documentation
  return format === 'markdown'
    ? documentation
    : formatDocumentation(Object.values(documentation).join('\n\n'), format)
}

/**
 * Get documentation for a category
 * @param options - Documentation options
 * @returns Category documentation
 */
function getCategoryDocumentation({
  categoryId,
  format = 'markdown',
}: GetCategoryDocumentationOptions): any {
  const category = componentRegistry.getCategory(categoryId)

  if (!category) {
    throw new Error(`Category ${categoryId} not found`)
  }

  // Get components in the category
  const components = category.components
    .map((componentId) => {
      const component = componentRegistry.getComponent(componentId)
      return component
        ? {
            id: component.id,
            name: component.name,
            description: component.description,
          }
        : null
    })
    .filter(Boolean)

  // Generate category documentation
  const overview = `
# ${category.name} Components

${category.description}

## Components in this Category

${components.map((component) => `- **${component?.name}**: ${component?.description}`).join('\n')}
`

  // Generate usage guidelines
  const usage = `
## Usage Guidelines

${generateCategorySpecificUsageGuidelines(category)}
`

  // Create documentation object
  const documentation = {
    overview,
    components,
    usage,
  }

  // Return formatted documentation
  return format === 'markdown'
    ? documentation
    : formatDocumentation(Object.values(documentation).join('\n\n'), format)
}

/**
 * Get documentation for a pattern
 * @param options - Documentation options
 * @returns Pattern documentation
 */
function getPatternDocumentation({
  patternId,
  section,
  format = 'markdown',
}: GetPatternDocumentationOptions): any {
  const pattern = componentRegistry.getPattern(patternId)

  if (!pattern) {
    throw new Error(`Pattern ${patternId} not found`)
  }

  // Get components used in the pattern
  const components = pattern.components
    .map((componentId) => {
      const component = componentRegistry.getComponent(componentId)
      return component
        ? {
            id: component.id,
            name: component.name,
            description: component.description,
          }
        : null
    })
    .filter(Boolean)

  // Generate pattern documentation
  const overview = `
# ${pattern.name}

${pattern.description}

## Components Used

${components.map((component) => `- **${component?.name}**: ${component?.description}`).join('\n')}

## Code Example

\`\`\`jsx
${pattern.code}
\`\`\`
`

  // Generate customization options documentation
  const customizationOptions = Object.entries(pattern.customizationOptions ?? {})
    .map(([_key, option]) => {
      const defaultValue =
        option.defaultValue !== null && option.defaultValue !== undefined
          ? `Default: \`${JSON.stringify(option.defaultValue)}\``
          : 'No default value'

      return `### ${option.name}

Type: \`${option.type}\`
${defaultValue}

${option.description}
`
    })
    .join('\n')

  // Generate usage guidelines
  const usage = `
## Usage Guidelines

${generatePatternSpecificUsageGuidelines(pattern)}
`

  // Generate best practices
  const bestPractices = `
## Best Practices

${generatePatternSpecificBestPractices(pattern)}
`

  // Create documentation object
  const documentation = {
    overview,
    components,
    customizationOptions,
    usage,
    bestPractices,
  }

  // Return specific section if requested
  if (section && section in documentation) {
    const sectionContent = documentation[section as keyof typeof documentation]
    return formatDocumentation(
      typeof sectionContent === 'string' ? sectionContent : JSON.stringify(sectionContent),
      format,
    )
  }

  // Return formatted documentation
  return format === 'markdown'
    ? documentation
    : formatDocumentation(Object.values(documentation).join('\n\n'), format)
}

/**
 * Search within documentation
 * @param options - Search options
 * @returns Search results
 */
function searchDocumentation({
  query,
  scope = 'all',
  limit = 10,
}: SearchDocumentationOptions): SearchResponse {
  if (!query) {
    throw new Error('Search query is required')
  }

  const results: SearchResult[] = []

  // Search in components
  if (scope === 'all' || scope === 'components') {
    const components = componentRegistry.getAllComponents()

    Object.values(components).forEach((component) => {
      const documentation = getComponentDocumentation({ componentId: component.id })
      const documentationText =
        typeof documentation === 'string' ? documentation : Object.values(documentation).join(' ')

      if (documentationText.toLowerCase().includes(query.toLowerCase())) {
        results.push({
          type: 'component',
          id: component.id,
          name: component.name,
          description: component.description || `${component.name} component`,
          relevance: calculateRelevance(documentationText.toLowerCase(), query),
        })
      }
    })
  }

  // Search in categories
  if (scope === 'all' || scope === 'categories') {
    const categories = componentRegistry.getAllCategories()

    Object.values(categories).forEach((category) => {
      const documentation = getCategoryDocumentation({ categoryId: category.id })
      const documentationText =
        typeof documentation === 'string' ? documentation : Object.values(documentation).join(' ')

      if (documentationText.toLowerCase().includes(query.toLowerCase())) {
        results.push({
          type: 'category',
          id: category.id,
          name: category.name,
          description: category.description,
          relevance: calculateRelevance(documentationText.toLowerCase(), query),
        })
      }
    })
  }

  // Search in patterns
  if (scope === 'all' || scope === 'patterns') {
    const patterns = componentRegistry.getAllPatterns()

    Object.values(patterns).forEach((pattern) => {
      const documentation = getPatternDocumentation({ patternId: pattern.id })
      const documentationText =
        typeof documentation === 'string' ? documentation : Object.values(documentation).join(' ')

      if (documentationText.toLowerCase().includes(query.toLowerCase())) {
        results.push({
          type: 'pattern',
          id: pattern.id,
          name: pattern.name,
          description: pattern.description,
          relevance: calculateRelevance(documentationText.toLowerCase(), query),
        })
      }
    })
  }

  // Sort results by relevance
  results.sort((a, b) => b.relevance - a.relevance)

  // Apply limit
  return {
    results: results.slice(0, limit),
    totalResults: results.length,
    query,
    scope,
  }
}

/**
 * Calculate relevance score for search results
 * @param text - Text to search in
 * @param query - Search query
 * @returns Relevance score
 */
function calculateRelevance(text: string, query: string): number {
  const queryLower = query.toLowerCase()
  const textLower = text.toLowerCase()

  // Count occurrences
  const occurrences = (textLower.match(new RegExp(queryLower, 'g')) || []).length

  // Check if query appears in title or description
  const titleOrDescriptionBoost = textLower.startsWith(queryLower) ? 5 : 0

  return occurrences + titleOrDescriptionBoost
}

/**
 * Format documentation
 * @param documentation - Documentation to format
 * @param format - Format ('markdown', 'html', 'plain')
 * @returns Formatted documentation
 */
function formatDocumentation(documentation: string, format: string): string {
  switch (format) {
    case 'html':
      return markdownToHtml(documentation)
    case 'plain':
      return markdownToPlain(documentation)
    default:
      return documentation
  }
}

/**
 * Convert markdown to HTML
 * @param markdown - Markdown to convert
 * @returns HTML
 */
function markdownToHtml(markdown: string): string {
  // Simple markdown to HTML conversion
  let html = markdown

  // Headers
  html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>')
  html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>')
  html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>')

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')

  // Italic
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')

  // Code blocks
  html = html.replace(/```([^`]+)```/g, '<pre><code>$1</code></pre>')

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')

  // Lists
  html = html.replace(/^- (.*$)/gm, '<li>$1</li>')
  html = html.replace(/(<li>.*<\/li>)/gm, '<ul>$1</ul>')

  // Paragraphs
  html = html.replace(/^\s*(\n)?(.+)/gm, (m) =>
    /<(\/)?(h\d|ul|li|pre|code)/.test(m) ? m : `<p>${m}</p>`,
  )

  // Line breaks
  html = html.replace(/\n/g, '<br>')

  return html
}

/**
 * Convert markdown to plain text
 * @param markdown - Markdown to convert
 * @returns Plain text
 */
function markdownToPlain(markdown: string): string {
  // Simple markdown to plain text conversion
  let plain = markdown

  // Remove headers
  plain = plain.replace(/^# (.*$)/gm, '$1\n')
  plain = plain.replace(/^## (.*$)/gm, '$1\n')
  plain = plain.replace(/^### (.*$)/gm, '$1\n')

  // Remove bold and italic
  plain = plain.replace(/\*\*(.*?)\*\*/g, '$1')
  plain = plain.replace(/\*(.*?)\*/g, '$1')

  // Remove code blocks
  plain = plain.replace(/```([^`]+)```/g, '$1')

  // Remove inline code
  plain = plain.replace(/`([^`]+)`/g, '$1')

  return plain
}

/**
 * Generate component-specific usage guidelines
 * @param component - Component metadata
 * @returns Component-specific usage guidelines
 */
function generateComponentSpecificUsageGuidelines(component: any): string {
  // This would be expanded with component-specific guidelines
  switch (component.id) {
    case 'button':
      return `
- Use primary buttons for the main action
- Use normal buttons for secondary actions
- Use link buttons for tertiary actions
- Use icon buttons for compact UI elements`
    case 'table':
      return `
- Use tables to display structured data
- Include sorting and filtering for large datasets
- Use pagination for tables with many rows
- Provide clear column headers`
    case 'form':
      return `
- Group related form fields together
- Provide clear labels for all form fields
- Indicate required fields
- Display validation errors inline`
    default:
      return ''
  }
}

/**
 * Generate component-specific accessibility guidelines
 * @param component - Component metadata
 * @returns Component-specific accessibility guidelines
 */
function generateComponentSpecificAccessibilityGuidelines(component: any): string {
  // This would be expanded with component-specific guidelines
  switch (component.id) {
    case 'button':
      return `
- Ensure buttons have descriptive labels
- Use aria-label for icon-only buttons
- Maintain focus states for keyboard navigation`
    case 'table':
      return `
- Use proper table markup with headers
- Ensure keyboard navigation works for all table interactions
- Provide text alternatives for any visual indicators`
    case 'form':
      return `
- Associate labels with form controls
- Provide error messages that are announced by screen readers
- Ensure form can be completed using keyboard only`
    default:
      return ''
  }
}

/**
 * Generate component-specific design guidelines
 * @param component - Component metadata
 * @returns Component-specific design guidelines
 */
function generateComponentSpecificDesignGuidelines(component: any): string {
  // This would be expanded with component-specific guidelines
  switch (component.id) {
    case 'button':
      return `
- Use appropriate button variants based on importance
- Maintain consistent button sizing
- Use icons sparingly and with clear meaning`
    case 'table':
      return `
- Align text appropriately (left for text, right for numbers)
- Use zebra striping for better readability
- Highlight selected rows clearly`
    case 'form':
      return `
- Maintain consistent spacing between form elements
- Align form fields and labels consistently
- Use appropriate field widths based on expected input`
    default:
      return ''
  }
}

/**
 * Generate component-specific best practices
 * @param component - Component metadata
 * @returns Component-specific best practices
 */
function generateComponentSpecificBestPractices(component: any): string {
  // This would be expanded with component-specific best practices
  switch (component.id) {
    case 'button':
      return `
- Use verb-noun format for button labels (e.g., "Save changes")
- Disable buttons when actions are not available
- Provide loading states for asynchronous actions`
    case 'table':
      return `
- Implement efficient data loading for large datasets
- Provide empty state messaging when no data is available
- Allow users to customize their table view`
    case 'form':
      return `
- Validate input as users type
- Preserve user input when validation fails
- Provide clear success confirmation`
    default:
      return ''
  }
}

/**
 * Generate component-specific common pitfalls
 * @param component - Component metadata
 * @returns Component-specific common pitfalls
 */
function generateComponentSpecificCommonPitfalls(component: any): string {
  // This would be expanded with component-specific pitfalls
  switch (component.id) {
    case 'button':
      return `
- Using too many primary buttons on a single page
- Not providing enough visual distinction between button types
- Using buttons when links would be more appropriate`
    case 'table':
      return `
- Loading too much data at once, causing performance issues
- Not handling empty or error states
- Making tables too wide for mobile screens`
    case 'form':
      return `
- Creating forms that are too long without breaking into steps
- Not providing clear validation messages
- Not preserving user input when errors occur`
    default:
      return ''
  }
}

/**
 * Generate component-specific migration guides
 * @param component - Component metadata
 * @returns Component-specific migration guides
 */
function generateComponentSpecificMigrationGuides(component: any): string {
  // This would be expanded with component-specific migration guides
  switch (component.id) {
    case 'button':
      return `
### Migrating from v1 to v2
- The \`size\` prop has been renamed to \`variant\`
- The \`primary\` prop has been removed in favor of \`variant="primary"\``
    case 'table':
      return `
### Migrating from v1 to v2
- The \`items\` prop now requires a unique \`id\` for each item
- The \`onSort\` prop has been replaced with \`onSortingChange\``
    case 'form':
      return `
### Migrating from v1 to v2
- Form fields now require explicit \`id\` props
- The \`error\` prop has been renamed to \`errorText\``
    default:
      return ''
  }
}

/**
 * Generate component examples documentation
 * @param component - Component metadata
 * @returns Component examples documentation
 */
function generateComponentExamplesDocumentation(component: any): string {
  // Get examples for the component
  const examples = componentRegistry.getComponentExamples({ componentId: component.id })

  if (examples.length === 0) {
    return 'No examples available for this component.'
  }

  return examples
    .map(
      (example) => `
### ${example.name}

${example.description}

\`\`\`jsx
${example.code}
\`\`\`
`,
    )
    .join('\n')
}

/**
 * Generate category-specific usage guidelines
 * @param category - Category metadata
 * @returns Category-specific usage guidelines
 */
function generateCategorySpecificUsageGuidelines(category: any): string {
  // This would be expanded with category-specific guidelines
  switch (category.id) {
    case 'navigation':
      return `
- Use consistent navigation patterns throughout your application
- Provide clear visual indicators for the current location
- Ensure navigation is accessible via keyboard`
    case 'containers':
      return `
- Use containers to group related content
- Maintain consistent spacing between containers
- Use appropriate container variants based on content importance`
    case 'forms':
      return `
- Group related form fields together
- Provide clear validation feedback
- Use appropriate input types for different data`
    default:
      return 'Follow Cloudscape Design System guidelines for consistent user experience.'
  }
}

/**
 * Generate pattern-specific usage guidelines
 * @param pattern - Pattern metadata
 * @returns Pattern-specific usage guidelines
 */
function generatePatternSpecificUsageGuidelines(pattern: any): string {
  // This would be expanded with pattern-specific guidelines
  switch (pattern.id) {
    case 'data-table':
      return `
- Use for displaying structured data that needs sorting and filtering
- Implement pagination for large datasets
- Provide clear column headers and sorting indicators`
    case 'form-layout':
      return `
- Use for collecting user input in a structured way
- Group related fields together
- Provide clear validation feedback
- Include appropriate actions (submit, cancel)`
    default:
      return 'Follow Cloudscape Design System guidelines for consistent user experience.'
  }
}

/**
 * Generate pattern-specific best practices
 * @param pattern - Pattern metadata
 * @returns Pattern-specific best practices
 */
function generatePatternSpecificBestPractices(pattern: any): string {
  // This would be expanded with pattern-specific best practices
  switch (pattern.id) {
    case 'data-table':
      return `
- Implement efficient data loading for large datasets
- Preserve user's sorting and filtering preferences
- Provide empty and loading states
- Allow users to customize their view`
    case 'form-layout':
      return `
- Validate input as users type
- Preserve user input when validation fails
- Provide clear success confirmation
- Use appropriate field types for different data`
    default:
      return 'Follow Cloudscape Design System best practices for optimal user experience.'
  }
}

export default {
  getComponentDocumentation,
  getCategoryDocumentation,
  getPatternDocumentation,
  searchDocumentation,
  formatDocumentation,
}
