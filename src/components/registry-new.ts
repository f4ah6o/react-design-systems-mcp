/**
 * Component Registry (New Implementation)
 *
 * This module provides access to the Cloudscape component metadata using the new documentation format.
 * - Full documentation on all components is now available under src/components/{component-name}
 * - Each component directory provides:
 *   - examples (directory): Example implementations of specific use cases
 *   - usage.md: Guidelines on how and when to use the component
 *   - api.json: A full API representation of the component in JSON format
 */

import fs from 'node:fs'
import path from 'node:path'

// Define types for component metadata
export interface PropertyMetadata {
  name: string
  type: string
  description: string
  defaultValue?: any
  required: boolean
  acceptedValues?: (string | number)[]
  isDeprecated?: boolean
  examples?: string[]
}

export interface ComponentMetadata {
  id: string
  name: string
  category?: string
  description?: string
  importPath?: string
  version?: string
  isExperimental?: boolean
  relatedComponents?: string[]
  tags?: string[]
  properties: Record<string, PropertyMetadata>
  examples: string[]
}

export interface CategoryMetadata {
  id: string
  name: string
  description: string
  components: string[]
}

export interface PatternMetadata {
  id: string
  name: string
  description: string
  components: string[]
  code: string
  customizationOptions: Record<string, CustomizationOption>
}

export interface CustomizationOption {
  name: string
  type: string
  description: string
  defaultValue: any
  acceptedValues?: (string | number)[]
}

export interface ExampleMetadata {
  id: string
  name: string
  description: string
  component: string
  code: string
  type: string
  tags?: string[]
}

// Define types for API JSON format
interface ApiJsonProperty {
  name: string
  type: string
  inlineType?: {
    name: string
    type: string
    values?: string[]
    properties?: Array<{
      name: string
      type: string
      optional?: boolean
    }>
  }
  optional?: boolean
  description: string
  defaultValue?: string
  deprecatedTag?: string
  analyticsTag?: string
  i18nTag?: boolean
}

interface ApiJsonEvent {
  name: string
  description: string
  cancelable: boolean
}

interface ApiJsonFunction {
  name: string
  description: string
  returnType: string
  parameters: any[]
}

interface ApiJsonRegion {
  name: string
  description: string
  isDefault: boolean
  deprecatedTag?: string
}

interface ApiJson {
  name: string
  dashCaseName: string
  releaseStatus: string
  regions: ApiJsonRegion[]
  functions: ApiJsonFunction[]
  properties: ApiJsonProperty[]
  events: ApiJsonEvent[]
  _meta: {
    component: string
    source: string
    extracted_at: string
  }
}

// Cache for component metadata
const componentCache: Record<string, ComponentMetadata> = {}
const exampleCache: Record<string, ExampleMetadata> = {}
const categoryCache: Record<string, CategoryMetadata> = {}
const patternCache: Record<string, PatternMetadata> = {}

// Helper function to get component directories
function getComponentDirectories(): string[] {
  const componentsDir = path.resolve(__dirname, '../components')
  return fs
    .readdirSync(componentsDir)
    .filter((item) => {
      const itemPath = path.join(componentsDir, item)
      return (
        fs.statSync(itemPath).isDirectory() &&
        item !== 'data' && // Exclude the data directory
        fs.existsSync(path.join(itemPath, 'api.json'))
      ) // Must have api.json
    })
    .map((dir) => dir)
}

// Helper function to load API JSON
function loadApiJson(componentDir: string): ApiJson | null {
  try {
    const apiJsonPath = path.resolve(__dirname, componentDir, 'api.json')
    if (fs.existsSync(apiJsonPath)) {
      const apiJsonContent = fs.readFileSync(apiJsonPath, 'utf8')
      return JSON.parse(apiJsonContent)
    }
  } catch (error) {
    console.error(`Error loading API JSON for ${componentDir}:`, error)
  }
  return null
}

// Helper function to load usage markdown
function _loadUsageMd(componentDir: string): string | null {
  try {
    const usageMdPath = path.resolve(__dirname, componentDir, 'usage.md')
    if (fs.existsSync(usageMdPath)) {
      return fs.readFileSync(usageMdPath, 'utf8')
    }
  } catch (error) {
    console.error(`Error loading usage.md for ${componentDir}:`, error)
  }
  return null
}

// Helper function to get example files
function getExampleFiles(componentDir: string): string[] {
  try {
    const examplesDir = path.resolve(__dirname, componentDir, 'examples')
    if (fs.existsSync(examplesDir)) {
      return fs
        .readdirSync(examplesDir)
        .filter((file) => file.endsWith('.tsx.d'))
        .map((file) => file.replace('.tsx.d', ''))
    }
  } catch (error) {
    console.error(`Error loading examples for ${componentDir}:`, error)
  }
  return []
}

// Helper function to load example content
function loadExampleContent(componentDir: string, exampleFile: string): string | null {
  try {
    const examplePath = path.resolve(__dirname, componentDir, 'examples', `${exampleFile}.tsx.d`)
    if (fs.existsSync(examplePath)) {
      return fs.readFileSync(examplePath, 'utf8')
    }
  } catch (error) {
    console.error(`Error loading example ${exampleFile} for ${componentDir}:`, error)
  }
  return null
}

// Convert API JSON property to PropertyMetadata
function convertApiJsonProperty(apiProperty: ApiJsonProperty): PropertyMetadata {
  const acceptedValues: (string | number)[] = []

  // Extract accepted values from inlineType if available
  if (apiProperty.inlineType?.type === 'union' && apiProperty.inlineType.values) {
    apiProperty.inlineType.values.forEach((value) => {
      if (typeof value === 'string' || typeof value === 'number') {
        acceptedValues.push(value)
      }
    })
  }

  return {
    name: apiProperty.name,
    type: apiProperty.inlineType?.name || apiProperty.type,
    description: apiProperty.description,
    defaultValue: apiProperty.defaultValue
      ? apiProperty.defaultValue.replace(/^['"]|['"]$/g, '')
      : undefined,
    required: !apiProperty.optional,
    acceptedValues,
    isDeprecated: !!apiProperty.deprecatedTag,
    examples: [],
  }
}

// Convert example file to ExampleMetadata
function createExampleMetadata(componentId: string, exampleFile: string): ExampleMetadata {
  // Format the example name from the file name
  const name = exampleFile
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  // Determine example type based on filename
  let type = 'basic'
  if (exampleFile.includes('error')) type = 'error'
  else if (exampleFile.includes('warning')) type = 'warning'
  else if (exampleFile.includes('success')) type = 'success'
  else if (exampleFile.includes('loading')) type = 'loading'
  else if (exampleFile.includes('empty')) type = 'empty'

  // Extract tags from filename
  const tags = exampleFile.split('_').filter((tag) => tag.length > 2)

  return {
    id: `${componentId}-${exampleFile}`,
    name,
    description: `Example of ${name.toLowerCase()} for ${componentId}`,
    component: componentId,
    code: loadExampleContent(componentId, exampleFile) || '',
    type,
    tags,
  }
}

// Load all components
function loadAllComponents(): void {
  const componentDirs = getComponentDirectories()

  componentDirs.forEach((componentDir) => {
    const apiJson = loadApiJson(componentDir)
    if (!apiJson) return

    const componentId = apiJson.dashCaseName
    const exampleFiles = getExampleFiles(componentDir)

    // Create component metadata
    const componentMetadata: ComponentMetadata = {
      id: componentId,
      name: apiJson.name,
      category: determineCategory(componentId),
      description: extractDescription(apiJson),
      importPath: `@cloudscape-design/components/${componentId}`,
      version: '3.0.0', // Default version
      isExperimental: apiJson.releaseStatus === 'experimental',
      relatedComponents: [], // Would need additional logic to determine related components
      tags: determineTags(componentId, apiJson),
      properties: {},
      examples: exampleFiles,
    }

    // Convert properties
    apiJson.properties.forEach((prop) => {
      componentMetadata.properties[prop.name] = convertApiJsonProperty(prop)
    })

    // Store in cache
    componentCache[componentId] = componentMetadata

    // Process examples
    exampleFiles.forEach((exampleFile) => {
      const exampleMetadata = createExampleMetadata(componentDir, exampleFile)
      exampleCache[exampleMetadata.id] = exampleMetadata
    })
  })
}

// Helper function to determine component category
function determineCategory(componentId: string): string {
  // This is a simplified approach - in a real implementation, you might want to
  // have a more sophisticated categorization system
  if (['table', 'cards', 'alert', 'badge', 'box', 'status-indicator'].includes(componentId)) {
    return 'display'
  } else if (
    ['form', 'input', 'select', 'textarea', 'checkbox', 'radio-group', 'button'].includes(
      componentId,
    )
  ) {
    return 'input'
  } else if (['app-layout', 'grid', 'space-between', 'container'].includes(componentId)) {
    return 'layout'
  } else if (['side-navigation', 'tabs', 'breadcrumb-group'].includes(componentId)) {
    return 'navigation'
  } else {
    return 'other'
  }
}

// Helper function to extract description from API JSON
function extractDescription(apiJson: ApiJson): string {
  // This is a simplified approach - in a real implementation, you might want to
  // extract this from the usage.md file or have a separate description field
  const childrenRegion = apiJson.regions.find((region) => region.name === 'children')
  return childrenRegion?.description || ''
}

// Helper function to determine tags
function determineTags(componentId: string, apiJson: ApiJson): string[] {
  // This is a simplified approach - in a real implementation, you might want to
  // extract tags from the usage.md file or have a separate tags field
  const tags: string[] = [componentId]

  // Add category as a tag
  const category = determineCategory(componentId)
  if (category) tags.push(category)

  // Add release status as a tag
  if (apiJson.releaseStatus) tags.push(apiJson.releaseStatus)

  return tags
}

// Initialize the registry
function initialize(): void {
  loadAllComponents()
}

/**
 * Get all components
 * @returns All components
 */
export function getAllComponents(): Record<string, ComponentMetadata> {
  if (Object.keys(componentCache).length === 0) {
    initialize()
  }
  return componentCache
}

/**
 * Get a component by ID
 * @param componentId - Component ID
 * @returns Component metadata
 */
export function getComponent(componentId: string): ComponentMetadata | undefined {
  if (Object.keys(componentCache).length === 0) {
    initialize()
  }
  return componentCache[componentId]
}

/**
 * Get all categories
 * @returns All categories
 */
export function getAllCategories(): Record<string, CategoryMetadata> {
  if (Object.keys(categoryCache).length === 0) {
    // Generate categories from components
    const components = getAllComponents()
    const categories: Record<string, CategoryMetadata> = {}

    Object.values(components).forEach((component) => {
      if (component.category) {
        if (!categories[component.category]) {
          categories[component.category] = {
            id: component.category,
            name: component.category.charAt(0).toUpperCase() + component.category.slice(1),
            description: `${component.category.charAt(0).toUpperCase() + component.category.slice(1)} components`,
            components: [],
          }
        }
        categories[component.category].components.push(component.id)
      }
    })

    Object.assign(categoryCache, categories)
  }

  return categoryCache
}

/**
 * Get a category by ID
 * @param categoryId - Category ID
 * @returns Category metadata
 */
export function getCategory(categoryId: string): CategoryMetadata | undefined {
  const categories = getAllCategories()
  return categories[categoryId]
}

/**
 * Get all patterns
 * @returns All patterns
 */
export function getAllPatterns(): Record<string, PatternMetadata> {
  // In a real implementation, you would load patterns from a file or database
  return patternCache
}

/**
 * Get a pattern by ID
 * @param patternId - Pattern ID
 * @returns Pattern metadata
 */
export function getPattern(patternId: string): PatternMetadata | undefined {
  return patternCache[patternId]
}

/**
 * Get component examples
 * @param options - Options
 * @param options.componentId - Component ID
 * @param options.type - Example type
 * @param options.limit - Maximum number of examples to return
 * @returns Component examples
 */
export function getComponentExamples(options: {
  componentId: string
  type?: string
  limit?: number
}): ExampleMetadata[] {
  const { componentId, type, limit } = options

  // Ensure components are loaded
  getAllComponents()

  // Get component examples
  const componentExamples = Object.values(exampleCache).filter(
    (example: ExampleMetadata) =>
      example.component === componentId && (!type || example.type === type),
  )

  // Apply limit
  return limit ? componentExamples.slice(0, limit) : componentExamples
}

// Export the module
export default {
  getAllComponents,
  getComponent,
  getAllCategories,
  getCategory,
  getAllPatterns,
  getPattern,
  getComponentExamples,
}
