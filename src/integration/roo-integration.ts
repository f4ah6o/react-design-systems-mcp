/**
 * Roo Integration Module
 *
 * This module handles the integration between the Cloudscape MCP Server and Roo.
 * It provides enhanced error handling, logging, and performance optimizations.
 */

// Import required modules
import type { FastMCP } from 'fastmcp'

/**
 * Validate input parameters for MCP tools
 * @param input - Input parameters
 * @param schema - Input schema
 * @returns Validation result
 */
export function validateInput(input: any, schema: any): { valid: boolean; errors: string[] } {
  const result = {
    valid: true,
    errors: [] as string[],
  }

  // Check required fields
  if (schema.required) {
    for (const field of schema.required) {
      if (input[field] === undefined) {
        result.valid = false
        result.errors.push(`Missing required field: ${field}`)
      }
    }
  }

  // Check field types
  if (schema.properties) {
    for (const [field, fieldSchema] of Object.entries(schema.properties)) {
      if (input[field] !== undefined) {
        // Check type
        if ((fieldSchema as any).type === 'string' && typeof input[field] !== 'string') {
          result.valid = false
          result.errors.push(`Field ${field} must be a string`)
        } else if ((fieldSchema as any).type === 'number' && typeof input[field] !== 'number') {
          result.valid = false
          result.errors.push(`Field ${field} must be a number`)
        } else if ((fieldSchema as any).type === 'boolean' && typeof input[field] !== 'boolean') {
          result.valid = false
          result.errors.push(`Field ${field} must be a boolean`)
        } else if (
          (fieldSchema as any).type === 'object' &&
          (typeof input[field] !== 'object' || Array.isArray(input[field]))
        ) {
          result.valid = false
          result.errors.push(`Field ${field} must be an object`)
        } else if ((fieldSchema as any).type === 'array' && !Array.isArray(input[field])) {
          result.valid = false
          result.errors.push(`Field ${field} must be an array`)
        }

        // Check enum values
        if ((fieldSchema as any).enum && !(fieldSchema as any).enum.includes(input[field])) {
          result.valid = false
          result.errors.push(
            `Field ${field} must be one of: ${(fieldSchema as any).enum.join(', ')}`,
          )
        }
      }
    }
  }

  return result
}

/**
 * Sanitize input to prevent security issues
 * @param input - Input parameters
 * @returns Sanitized input
 */
export function sanitizeInput(input: any): any {
  const sanitized: any = {}

  for (const [key, value] of Object.entries(input)) {
    if (typeof value === 'string') {
      // Sanitize strings to prevent injection attacks
      sanitized[key] = value.replace(/[;<>&]/g, '')
    } else if (typeof value === 'object' && value !== null) {
      // Recursively sanitize objects
      sanitized[key] = sanitizeInput(value)
    } else {
      // Pass through other types
      sanitized[key] = value
    }
  }

  return sanitized
}

/**
 * Log MCP server activity
 * @param level - Log level (info, warn, error)
 * @param message - Log message
 * @param data - Additional data
 */
export function log(
  level: 'info' | 'warn' | 'error' | 'debug',
  message: string,
  data: Record<string, any> = {},
): void {
  const timestamp = new Date().toISOString()
  const _logEntry = {
    timestamp,
    level,
    message,
    ...data,
  }

  // Color codes for different log levels
  const colors = {
    info: '\x1b[36m', // Cyan
    warn: '\x1b[33m', // Yellow
    error: '\x1b[31m', // Red
    debug: '\x1b[90m', // Gray
    reset: '\x1b[0m', // Reset
  }

  // Format the log message for better console visibility
  const colorCode = colors[level] || colors.reset
  const levelPadded = level.toUpperCase().padEnd(5, ' ')
  const prefix = `${colorCode}[${timestamp}] [${levelPadded}]${colors.reset}`

  // Format the message
  console.error(`${prefix} ${message}`)

  // If there's additional data, print it with indentation
  if (Object.keys(data).length > 0) {
    // Filter out sensitive data and large objects
    const sanitizedData = { ...data }
    delete sanitizedData.stack // Don't show full stack traces in normal logs

    // For errors, show a more concise representation
    if (sanitizedData.error && typeof sanitizedData.error === 'object') {
      sanitizedData.error = sanitizedData.error.message || String(sanitizedData.error)
    }

    // Print the data in a readable format
    const dataString = JSON.stringify(sanitizedData, null, 2)
    console.error(`${colors.debug}  └─ ${dataString.replace(/\n/g, '\n     ')}${colors.reset}`)

    // If this is an error and we have a stack trace, print it separately
    if (level === 'error' && data.stack) {
      console.error(`${colors.error}  └─ Stack: ${data.stack.split('\n')[0]}${colors.reset}`)
      data.stack
        .split('\n')
        .slice(1)
        .forEach((line: string) => {
          console.error(`${colors.error}      ${line}${colors.reset}`)
        })
    }
  }
}

/**
 * Measure execution time of a function
 * @param fn - Function to measure
 * @param args - Function arguments
 * @returns Result and execution time
 */
export function measureExecutionTime<T>(
  fn: (...args: any[]) => T,
  args: any[],
): { result: T; executionTime: string } {
  const startTime = Date.now()
  const result = fn(...args)
  const endTime = Date.now()
  const executionTime = (endTime - startTime).toFixed(2)

  return {
    result,
    executionTime,
  }
}

/**
 * Enhance a FastMCP server with additional logging and event handling
 * @param server - FastMCP server instance
 * @returns Enhanced FastMCP server
 */
function enhanceFastMCPServer(server: FastMCP<any>): FastMCP<any> {
  // Log server start with a prominent banner
  /*
  console.error('\n' + '='.repeat(80));
  console.error(`\x1b[1m\x1b[36m  MCP SERVER: Cloudscape Assistant\x1b[0m`);
  console.error(`\x1b[36m  Cloudscape Design System component information and code generation\x1b[0m`);
  console.error('='.repeat(80) + '\n');

  log('info', `🚀 Starting FastMCP server: Cloudscape Assistant`, {
    version: '1.0.0'
  });
  */

  // Add custom event handlers if needed
  // FastMCP handles events differently than the old implementation

  return server
}

/**
 * Initialize the Roo integration
 * @param server - FastMCP server instance
 * @returns Enhanced FastMCP server
 */
export function initializeRooIntegration(server: FastMCP<any>): FastMCP<any> {
  // Enhance FastMCP server with logging and event handling
  const enhancedServer = enhanceFastMCPServer(server)

  // Log initialization
  /*
  log('info', '🔄 Initialized Roo integration', {
    serverName: 'Cloudscape Assistant',
    serverVersion: '1.0.0'
  });
  */

  // Add a shutdown hook to log when the server is stopping
  process.on('SIGINT', () => {
    log('info', '🛑 Shutting down server due to SIGINT signal...')
  })

  process.on('SIGTERM', () => {
    log('info', '🛑 Shutting down server due to SIGTERM signal...')
  })

  return enhancedServer
}
