/**
 * Security Module
 *
 * This module provides security enhancements for the Cloudscape MCP Server.
 * It includes input validation, sanitization, and other security features.
 */

import type { FastMCP } from 'fastmcp'

/**
 * Validate component ID
 * @param componentId - Component ID to validate
 * @returns Whether the component ID is valid
 */
export function validateComponentId(componentId: string): boolean {
  // Component IDs should only contain lowercase letters, numbers, and hyphens
  return /^[a-z0-9-]+$/.test(componentId)
}

/**
 * Validate property ID
 * @param propertyId - Property ID to validate
 * @returns Whether the property ID is valid
 */
export function validatePropertyId(propertyId: string): boolean {
  // Property IDs should only contain letters, numbers, and hyphens
  return /^[a-zA-Z0-9-]+$/.test(propertyId)
}

/**
 * Validate pattern ID
 * @param patternId - Pattern ID to validate
 * @returns Whether the pattern ID is valid
 */
export function validatePatternId(patternId: string): boolean {
  // Pattern IDs should only contain lowercase letters, numbers, and hyphens
  return /^[a-z0-9-]+$/.test(patternId)
}

/**
 * Validate category ID
 * @param categoryId - Category ID to validate
 * @returns Whether the category ID is valid
 */
export function validateCategoryId(categoryId: string): boolean {
  // Category IDs should only contain lowercase letters, numbers, and hyphens
  return /^[a-z0-9-]+$/.test(categoryId)
}

/**
 * Validate example ID
 * @param exampleId - Example ID to validate
 * @returns Whether the example ID is valid
 */
export function validateExampleId(exampleId: string): boolean {
  // Example IDs should only contain lowercase letters, numbers, and hyphens
  return /^[a-z0-9-]+$/.test(exampleId)
}

/**
 * Sanitize string input
 * @param input - String to sanitize
 * @returns Sanitized string
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return input

  // Remove potentially dangerous characters
  return input.replace(/[<>'"&;]/g, '')
}

/**
 * Sanitize object input
 * @param input - Object to sanitize
 * @returns Sanitized object
 */
export function sanitizeObject(input: Record<string, any>): Record<string, any> {
  if (typeof input !== 'object' || input === null) return input

  const sanitized: Record<string, any> = {}

  for (const [key, value] of Object.entries(input)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value)
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value)
    } else {
      sanitized[key] = value
    }
  }

  return sanitized
}

/**
 * Sanitize code input
 * @param code - Code to sanitize
 * @returns Sanitized code
 */
export function sanitizeCode(code: string): string {
  if (typeof code !== 'string') return code

  // Remove potentially dangerous code patterns
  return code
    .replace(/eval\s*\(/g, 'disabledEval(')
    .replace(/new\s+Function/g, 'disabledFunction')
    .replace(/document\.write/g, 'disabledDocumentWrite')
    .replace(/window\.location/g, 'disabledWindowLocation')
    .replace(/localStorage/g, 'disabledLocalStorage')
    .replace(/sessionStorage/g, 'disabledSessionStorage')
    .replace(/setTimeout/g, 'disabledSetTimeout')
    .replace(/setInterval/g, 'disabledSetInterval')
}

/**
 * Validate and sanitize component search input
 * @param input - Search input
 * @returns Validated and sanitized input
 */
export function validateAndSanitizeSearchInput(input: Record<string, any>): Record<string, any> {
  const sanitized = sanitizeObject(input)

  // Validate query
  if (sanitized.query && typeof sanitized.query === 'string') {
    // Limit query length
    sanitized.query = sanitized.query.substring(0, 100)
  }

  // Validate limit
  if (sanitized.limit) {
    // Ensure limit is a number and within reasonable bounds
    sanitized.limit = Math.min(Math.max(parseInt(sanitized.limit.toString(), 10) || 10, 1), 100)
  }

  // Validate offset
  if (sanitized.offset) {
    // Ensure offset is a number and within reasonable bounds
    sanitized.offset = Math.max(parseInt(sanitized.offset.toString(), 10) || 0, 0)
  }

  return sanitized
}

/**
 * Validate and sanitize component details input
 * @param input - Component details input
 * @returns Validated and sanitized input
 * @throws {Error} - If component ID is invalid
 */
export function validateAndSanitizeComponentDetailsInput(
  input: Record<string, any>,
): Record<string, any> {
  const sanitized = sanitizeObject(input)

  // Validate component ID
  if (!validateComponentId(sanitized.componentId)) {
    throw new Error(`Invalid component ID: ${sanitized.componentId}`)
  }

  return sanitized
}

/**
 * Validate and sanitize code generation input
 * @param input - Code generation input
 * @returns Validated and sanitized input
 * @throws {Error} - If component ID is invalid
 */
export function validateAndSanitizeCodeGenerationInput(
  input: Record<string, any>,
): Record<string, any> {
  const sanitized = sanitizeObject(input)

  // Validate component ID
  if (!validateComponentId(sanitized.componentId)) {
    throw new Error(`Invalid component ID: ${sanitized.componentId}`)
  }

  // Sanitize props
  if (sanitized.props) {
    sanitized.props = sanitizeObject(sanitized.props)
  }

  // Sanitize children
  if (sanitized.children) {
    sanitized.children = sanitizeCode(sanitized.children)
  }

  // Sanitize event handlers
  if (sanitized.eventHandlers) {
    for (const [event, handler] of Object.entries(sanitized.eventHandlers)) {
      if (typeof handler === 'string') {
        sanitized.eventHandlers[event] = sanitizeCode(handler)
      }
    }
  }

  return sanitized
}

/**
 * Validate and sanitize pattern code generation input
 * @param input - Pattern code generation input
 * @returns Validated and sanitized input
 * @throws {Error} - If pattern ID is invalid
 */
export function validateAndSanitizePatternCodeGenerationInput(
  input: Record<string, any>,
): Record<string, any> {
  const sanitized = sanitizeObject(input)

  // Validate pattern ID
  if (!validatePatternId(sanitized.patternId)) {
    throw new Error(`Invalid pattern ID: ${sanitized.patternId}`)
  }

  // Sanitize customizations
  if (sanitized.customizations) {
    sanitized.customizations = sanitizeObject(sanitized.customizations)
  }

  return sanitized
}

/**
 * Apply security enhancements to the FastMCP server
 * @param server - FastMCP server instance
 * @returns Enhanced FastMCP server
 */
export function applySecurityEnhancements(server: FastMCP<any>): FastMCP<any> {
  // FastMCP already provides built-in security features
  // We can add additional security measures if needed

  //console.error('Security enhancements applied to FastMCP server');

  return server
}
