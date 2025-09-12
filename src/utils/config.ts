/**
 * Configuration utilities for the MCP server
 */

import fs from 'node:fs'
import path from 'node:path'
import yaml from 'js-yaml'

interface ServerConfig {
  port: number
  bind: string
  transportType: 'stdio' | 'sse'
}

/**
 * Get the server configuration from command line arguments, environment variables, and config file
 * Priority: command line args > environment variables > config file > defaults
 * @returns The server configuration
 */
export function getServerConfig(): ServerConfig {
  // Default configuration
  const defaultConfig: ServerConfig = {
    port: 3001,
    bind: '0.0.0.0',
    transportType: 'stdio',
  }

  // Read from config file if it exists
  const fileConfig: Partial<ServerConfig> = {}
  const configPath = path.join(process.cwd(), '.madness.yml')

  if (fs.existsSync(configPath)) {
    try {
      const configContent = fs.readFileSync(configPath, 'utf8')
      const parsedConfig = yaml.load(configContent) as Record<string, any>

      if (parsedConfig.port && typeof parsedConfig.port === 'number') {
        fileConfig.port = parsedConfig.port
      }

      if (parsedConfig.bind && typeof parsedConfig.bind === 'string') {
        fileConfig.bind = parsedConfig.bind
      }

      if (
        parsedConfig.transportType &&
        (parsedConfig.transportType === 'stdio' || parsedConfig.transportType === 'sse')
      ) {
        fileConfig.transportType = parsedConfig.transportType
      }
    } catch (error) {
      console.warn(`Warning: Failed to parse config file at ${configPath}`, error)
    }
  }

  // Read from environment variables
  const envConfig: Partial<ServerConfig> = {}

  if (process.env.PORT) {
    const port = parseInt(process.env.PORT, 10)
    if (!Number.isNaN(port)) {
      envConfig.port = port
    }
  }

  if (process.env.BIND) {
    envConfig.bind = process.env.BIND
  }

  if (process.env.TRANSPORT_TYPE) {
    const transportType = process.env.TRANSPORT_TYPE.toLowerCase()
    if (transportType === 'stdio' || transportType === 'sse') {
      envConfig.transportType = transportType as 'stdio' | 'sse'
    }
  }

  // Parse command line arguments
  const argConfig: Partial<ServerConfig> = {}
  const args = process.argv.slice(2)

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]

    if (arg === '--port' || arg === '-p') {
      const portValue = args[i + 1]
      if (portValue && !portValue.startsWith('-')) {
        const port = parseInt(portValue, 10)
        if (!Number.isNaN(port)) {
          argConfig.port = port
          i++ // Skip the next argument since we've used it as the value
        }
      }
    } else if (arg.startsWith('--port=')) {
      const portValue = arg.split('=')[1]
      if (portValue) {
        const port = parseInt(portValue, 10)
        if (!Number.isNaN(port)) {
          argConfig.port = port
        }
      }
    } else if (arg === '--bind' || arg === '-b') {
      const bindValue = args[i + 1]
      if (bindValue && !bindValue.startsWith('-')) {
        argConfig.bind = bindValue
        i++ // Skip the next argument since we've used it as the value
      }
    } else if (arg.startsWith('--bind=')) {
      const bindValue = arg.split('=')[1]
      if (bindValue) {
        argConfig.bind = bindValue
      }
    } else if (arg === '--transport' || arg === '-t') {
      const transportValue = args[i + 1]
      if (transportValue && !transportValue.startsWith('-')) {
        if (transportValue === 'stdio' || transportValue === 'sse') {
          argConfig.transportType = transportValue as 'stdio' | 'sse'
          i++ // Skip the next argument since we've used it as the value
        }
      }
    } else if (arg.startsWith('--transport=')) {
      const transportValue = arg.split('=')[1]
      if (transportValue === 'stdio' || transportValue === 'sse') {
        argConfig.transportType = transportValue as 'stdio' | 'sse'
      }
    }
  }

  // Merge configurations with priority: args > env > file > defaults
  return {
    ...defaultConfig,
    ...fileConfig,
    ...envConfig,
    ...argConfig,
  }
}
