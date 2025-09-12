/**
 * Code Generator
 *
 * This module provides code generation functionality for Cloudscape components.
 */

import componentRegistry from '../components/registry'

// Define types
interface GenerateComponentCodeOptions {
  componentId: string
  props?: Record<string, any>
  children?: string
  eventHandlers?: Record<string, string>
  typescript?: boolean
  style?: 'compact' | 'expanded'
  includeImports?: boolean
}

interface GeneratePatternCodeOptions {
  patternId: string
  customizations?: Record<string, any>
  typescript?: boolean
  style?: 'compact' | 'expanded'
  includeImports?: boolean
}

interface CodeGenerationResult {
  code: string
  imports: string[]
  language: string
  format: string
}

/**
 * Generate code for a component
 * @param options - Code generation options
 * @returns Generated code and imports
 */
function generateComponentCode({
  componentId,
  props = {},
  children,
  eventHandlers = {},
  typescript = false,
  style = 'expanded',
  includeImports = true,
}: GenerateComponentCodeOptions): CodeGenerationResult {
  const component = componentRegistry.getComponent(componentId)

  if (!component) {
    throw new Error(`Component ${componentId} not found`)
  }

  // Generate imports
  const imports = [`import ${component.name} from "${component.importPath}";`]

  // Add React import for TypeScript if needed
  if (typescript) {
    imports.unshift('import React from "react";')
  }

  // Generate props code
  const propsCode = Object.entries(props)
    .map(([key, value]) => {
      if (typeof value === 'string') {
        // If the value is already a code snippet (e.g., "item => item.name")
        if (value.includes('=>')) {
          return `${key}={${value}}`
        }
        // Otherwise, treat it as a string
        return `${key}="${value}"`
      } else if (typeof value === 'number' || typeof value === 'boolean') {
        return `${key}={${value}}`
      } else if (Array.isArray(value)) {
        return `${key}={${formatValue(value, style)}}`
      } else if (typeof value === 'object' && value !== null) {
        return `${key}={${formatValue(value, style)}}`
      }
      return ''
    })
    .filter(Boolean)
    .join(style === 'compact' ? ' ' : '\n  ')

  // Generate event handlers code
  const eventHandlersCode = Object.entries(eventHandlers)
    .map(([key, value]) => `${key}={${value}}`)
    .join(style === 'compact' ? ' ' : '\n  ')

  // Combine props and event handlers
  const allProps = [propsCode, eventHandlersCode]
    .filter(Boolean)
    .join(style === 'compact' ? ' ' : '\n  ')

  // Generate component code
  let code: string
  if (style === 'compact') {
    code = children
      ? `<${component.name} ${allProps}>${children}</${component.name}>`
      : `<${component.name} ${allProps} />`
  } else {
    if (children) {
      code = `<${component.name}
  ${allProps}
>
  ${children}
</${component.name}>`
    } else {
      code = `<${component.name}
  ${allProps}
/>`
    }
  }

  // Include imports in the code if requested
  if (includeImports) {
    code = `${imports.join('\n')}\n\n${code}`
  }

  return {
    code,
    imports,
    language: typescript ? 'typescript' : 'javascript',
    format: typescript ? 'tsx' : 'jsx',
  }
}

/**
 * Generate code for a pattern
 * @param options - Pattern generation options
 * @returns Generated code and imports
 */
function generatePatternCode({
  patternId,
  customizations = {},
  typescript = false,
  style = 'expanded',
  includeImports = true,
}: GeneratePatternCodeOptions): CodeGenerationResult {
  const pattern = componentRegistry.getPattern(patternId)

  if (!pattern) {
    throw new Error(`Pattern ${patternId} not found`)
  }

  // Get the pattern code
  let code = pattern.code

  // Apply customizations
  Object.entries(customizations).forEach(([key, value]) => {
    // Replace placeholders in the code
    const placeholder = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g')
    if (code.match(placeholder)) {
      code = code.replace(placeholder, formatValue(value, style))
    }
  })

  // Extract imports from the pattern code
  const importRegex = /import\s+(?:[\w\s{},*]+)\s+from\s+["']([^"']+)["'];?/g
  const imports: string[] = []
  let match
  while ((match = importRegex.exec(code)) !== null) {
    imports.push(match[0])
  }

  // Add React import for TypeScript if needed
  if (typescript && !imports.some((imp) => imp.includes('import React'))) {
    imports.unshift('import React from "react";')
  }

  // Format code based on style
  if (style === 'compact') {
    // Replace newlines and multiple spaces with single spaces
    code = code.replace(/\s+/g, ' ')
  }

  // Include imports in the code if requested
  if (!includeImports) {
    // Remove import statements from the code
    code = code.replace(/import\s+(?:[\w\s{},*]+)\s+from\s+["']([^"']+)["'];?/g, '').trim()
  }

  return {
    code,
    imports,
    language: typescript ? 'typescript' : 'javascript',
    format: typescript ? 'tsx' : 'jsx',
  }
}

/**
 * Format a value for code generation
 * @param value - The value to format
 * @param style - Code style ('compact' or 'expanded')
 * @returns Formatted value
 */
function formatValue(value: any, style: string = 'expanded'): string {
  if (typeof value === 'string') {
    return `"${value}"`
  } else if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  } else if (Array.isArray(value)) {
    if (style === 'compact') {
      return `[${value.map((item) => formatValue(item, style)).join(', ')}]`
    } else {
      return `[
  ${value.map((item) => formatValue(item, style)).join(',\n  ')}
]`
    }
  } else if (typeof value === 'object' && value !== null) {
    if (style === 'compact') {
      return `{${Object.entries(value)
        .map(([k, v]) => `${k}: ${formatValue(v, style)}`)
        .join(', ')}}`
    } else {
      return `{
  ${Object.entries(value)
    .map(([k, v]) => `${k}: ${formatValue(v, style)}`)
    .join(',\n  ')}
}`
    }
  } else if (value === null) {
    return 'null'
  } else if (value === undefined) {
    return 'undefined'
  }
  return String(value)
}

/**
 * Generate TypeScript interface for a component
 * @param componentId - Component ID
 * @returns TypeScript interface
 */
function generateComponentInterface(componentId: string): string {
  const component = componentRegistry.getComponent(componentId)

  if (!component) {
    throw new Error(`Component ${componentId} not found`)
  }

  const properties = Object.values(component.properties)

  // Generate interface
  const interfaceName = `${component.name}Props`

  const propertyDefinitions = properties
    .map((prop) => {
      const required = prop.required ? '' : '?'
      return `  /**
   * ${prop.description}
   */
  ${prop.name}${required}: ${mapTypeToTypeScript(prop.type)};`
    })
    .join('\n\n')

  return `/**
 * Props for the ${component.name} component
 */
interface ${interfaceName} {
${propertyDefinitions}
}`
}

/**
 * Map a component property type to TypeScript type
 * @param type - Component property type
 * @returns TypeScript type
 */
function mapTypeToTypeScript(type: string): string {
  // Handle common types
  switch (type.toLowerCase()) {
    case 'string':
      return 'string'
    case 'number':
      return 'number'
    case 'boolean':
      return 'boolean'
    case 'function':
      return '() => void'
    case 'array':
      return 'any[]'
    case 'object':
      return 'Record<string, any>'
    case 'node':
      return 'React.ReactNode'
    case 'element':
      return 'React.ReactElement'
    case 'date':
      return 'Date'
    default:
      // Handle complex types
      if (type.includes('[]')) {
        const baseType = type.replace('[]', '')
        return `${mapTypeToTypeScript(baseType)}[]`
      }
      if (type.includes('|')) {
        const unionTypes = type.split('|').map((t) => t.trim())
        return unionTypes.map(mapTypeToTypeScript).join(' | ')
      }
      return 'any'
  }
}

export default {
  generateComponentCode,
  generatePatternCode,
  generateComponentInterface,
  formatValue,
}
