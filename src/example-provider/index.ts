/**
 * Example Provider
 *
 * This module provides examples for Cloudscape components.
 */

import componentRegistry from '../components/registry'

// Mock functions for methods that don't exist in the registry yet
// These would normally be implemented in the registry
const getAllExamples = (): Record<string, Example> => {
  // Get all components
  const components = componentRegistry.getAllComponents()

  // Collect all examples from all components
  const allExamples: Record<string, Example> = {}

  Object.values(components).forEach((component) => {
    const componentExamples = componentRegistry.getComponentExamples({ componentId: component.id })
    componentExamples.forEach((example) => {
      allExamples[example.id] = example
    })
  })

  return allExamples
}

const getExampleById = (exampleId: string): Example | null => {
  const allExamples = getAllExamples()
  return allExamples[exampleId] || null
}

// Define types
interface GetExamplesOptions {
  componentId: string
  type?: string
  limit?: number
  offset?: number
  tags?: string[]
}

interface SearchExamplesOptions {
  query: string
  tags?: string[]
  limit?: number
  offset?: number
}

interface Example {
  id: string
  name: string
  description: string
  component: string
  type: string
  code?: string
  tags?: string[]
}

interface ExamplesResponse {
  examples: Example[]
  totalExamples: number
  componentId: string
  componentName: string
  type?: string
  limit: number
  offset: number
}

interface SearchResponse {
  examples: Example[]
  totalExamples: number
  query: string
  tags?: string[]
  limit: number
  offset: number
}

interface ExampleCategory {
  id: string
  name: string
  count: number
}

interface ExampleTag {
  id: string
  name: string
  count: number
}

/**
 * Get examples for a component
 * @param options - Options for retrieving examples
 * @returns Examples response
 */
function getExamples({
  componentId,
  type,
  limit = 10,
  offset = 0,
  tags = [],
}: GetExamplesOptions): ExamplesResponse {
  const component = componentRegistry.getComponent(componentId)

  if (!component) {
    throw new Error(`Component ${componentId} not found`)
  }

  // Get examples for the component
  let examples = componentRegistry.getComponentExamples({ componentId })

  // Filter by type if specified
  if (type) {
    examples = examples.filter((example) => example.type === type)
  }

  // Filter by tags if specified
  if (tags.length > 0) {
    examples = examples.filter((example) => {
      // If example has tags, check if any of the requested tags match
      if (example.tags) {
        return tags.some((tag) => example.tags?.includes(tag))
      }
      return false
    })
  }

  // Get total count before pagination
  const totalExamples = examples.length

  // Apply pagination
  examples = examples.slice(offset, offset + limit)

  return {
    examples,
    totalExamples,
    componentId,
    componentName: component.name,
    type,
    limit,
    offset,
  }
}

/**
 * Get examples by type
 * @param options - Options for retrieving examples
 * @returns Examples response
 */
function getExamplesByType({
  type,
  limit = 10,
  offset = 0,
}: {
  type: string
  limit?: number
  offset?: number
}): { examples: Example[]; totalExamples: number; type: string; limit: number; offset: number } {
  if (!type) {
    throw new Error('Example type is required')
  }

  // Get all examples
  const allExamples = getAllExamples()

  // Filter by type
  let examples = Object.values(allExamples).filter((example) => example.type === type)

  // Get total count before pagination
  const totalExamples = examples.length

  // Apply pagination
  examples = examples.slice(offset, offset + limit)

  return {
    examples,
    totalExamples,
    type,
    limit,
    offset,
  }
}

/**
 * Get example by ID
 * @param exampleId - Example ID
 * @returns Example
 */
function getExample(exampleId: string): Example & { componentName: string } {
  const example = getExampleById(exampleId)

  if (!example) {
    throw new Error(`Example ${exampleId} not found`)
  }

  // Get the component for the example
  const component = componentRegistry.getComponent(example.component)

  return {
    ...example,
    componentName: component ? component.name : example.component,
  }
}

/**
 * Search examples
 * @param options - Search options
 * @returns Search results
 */
function searchExamples({
  query,
  tags = [],
  limit = 10,
  offset = 0,
}: SearchExamplesOptions): SearchResponse {
  if (!query) {
    throw new Error('Search query is required')
  }

  // Get all examples
  const allExamples = getAllExamples()

  // Filter by query
  let examples = Object.values(allExamples).filter((example: Example) => {
    const searchableText = [
      example.name,
      example.description,
      example.component,
      example.type,
      ...(example.tags || []),
    ]
      .join(' ')
      .toLowerCase()

    return searchableText.includes(query.toLowerCase())
  })

  // Filter by tags if specified
  if (tags.length > 0) {
    examples = examples.filter((example: Example) => {
      // If example has tags, check if any of the requested tags match
      if (example.tags) {
        return tags.some((tag) => example.tags?.includes(tag))
      }
      return false
    })
  }

  // Get total count before pagination
  const totalExamples = examples.length

  // Apply pagination
  examples = examples.slice(offset, offset + limit)

  return {
    examples,
    totalExamples,
    query,
    tags,
    limit,
    offset,
  }
}

/**
 * Get example categories
 * @returns Example categories
 */
function getExampleCategories(): ExampleCategory[] {
  // Get all examples
  const allExamples = getAllExamples()

  // Extract unique types
  const types = [...new Set(Object.values(allExamples).map((example: Example) => example.type))]

  // Create category objects
  return types.map((type) => {
    const count = Object.values(allExamples).filter(
      (example: Example) => example.type === type,
    ).length

    return {
      id: type,
      name: type.charAt(0).toUpperCase() + type.slice(1),
      count,
    }
  })
}

/**
 * Get example tags
 * @returns Example tags
 */
function getExampleTags(): ExampleTag[] {
  // Get all examples
  const allExamples = getAllExamples()

  // Extract all tags
  const tagCounts: Record<string, number> = {}

  Object.values(allExamples).forEach((example: Example) => {
    if (example.tags) {
      example.tags.forEach((tag: string) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      })
    }
  })

  // Create tag objects
  return Object.entries(tagCounts).map(([tag, count]) => ({
    id: tag,
    name: tag,
    count,
  }))
}

export default {
  getExamples,
  getExamplesByType,
  getExample,
  searchExamples,
  getExampleCategories,
  getExampleTags,
}
