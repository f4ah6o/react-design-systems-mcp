/**
 * MCP Server Test Helper
 *
 * This module provides utilities for testing MCP server functionality.
 * It combines the SSE client and JSON-RPC client to provide a unified interface
 * for interacting with the MCP server during tests.
 */

import { getConfig, shouldSkipInCI } from './config'
import { JsonRpcClient } from './jsonrpc-client'
import { SSEClient } from './sse-client'
import { TestReporter } from './test-reporter'

export interface MCPServerHelperOptions {
  host?: string
  port?: number
  sseEndpoint?: string
  jsonRpcEndpoint?: string
  testName?: string
}

export class MCPServerHelper {
  private config = getConfig()

  /**
   * Get the configuration
   *
   * @returns The test configuration
   */
  public getConfig() {
    return this.config
  }
  private sseClient: SSEClient
  private jsonRpcClient: JsonRpcClient
  private reporter: TestReporter
  private connected = false
  private sessionId = ''
  private clientId = `client_${Math.random().toString(36).substring(2, 10)}`

  constructor(options: MCPServerHelperOptions = {}) {
    const host = options.host || this.config.server.host
    const port = options.port || this.config.server.port
    const sseEndpoint = options.sseEndpoint || '/sse'
    const jsonRpcEndpoint = options.jsonRpcEndpoint || '/'
    const testName = options.testName || 'MCP Server Test'

    this.sseClient = new SSEClient({
      host,
      port,
      path: sseEndpoint,
      headers: {
        'X-MCP-Client-ID': this.clientId,
      },
    })

    this.jsonRpcClient = new JsonRpcClient({
      host,
      port,
      path: jsonRpcEndpoint,
      headers: {
        'X-MCP-Client-ID': this.clientId,
      },
    })

    this.reporter = new TestReporter(testName)

    // Set up event handlers
    this.sseClient.on('connected', () => {
      this.connected = true
      this.reporter.info('SSE connection established', { prefix: '🔌' })
    })

    this.sseClient.on('disconnected', () => {
      this.connected = false
      this.reporter.info('SSE connection closed', { prefix: '🔌' })
    })

    this.sseClient.on('session', (sessionId: string) => {
      this.sessionId = sessionId
      this.jsonRpcClient.setSessionId(sessionId)
      this.reporter.info(`Session ID: ${sessionId}`, { prefix: '🔑' })
    })

    this.sseClient.on('error', (error: Error) => {
      this.reporter.error(`SSE error: ${error.message}`, { prefix: '❌' })
    })

    this.sseClient.on('message', (message: any) => {
      this.reporter.debug(`Received SSE message: ${JSON.stringify(message)}`, { prefix: '📩' })
    })
  }

  /**
   * Connect to the MCP server
   *
   * @returns Promise that resolves when connected
   */
  public async connect(): Promise<void> {
    this.reporter.step('Connecting to MCP server')
    await this.sseClient.connect()
    this.jsonRpcClient.setClientId(this.clientId)
    return new Promise<void>((resolve) => {
      // Wait for session ID if not already received
      if (this.sessionId) {
        resolve()
      } else {
        this.sseClient.once('session', () => {
          resolve()
        })

        // Set a timeout in case we don't receive a session ID
        setTimeout(() => {
          if (!this.sessionId) {
            this.reporter.warn('No session ID received, continuing anyway', { prefix: '⚠️' })
            resolve()
          }
        }, 2000)
      }
    })
  }

  /**
   * Disconnect from the MCP server
   */
  public disconnect(): void {
    this.reporter.step('Disconnecting from MCP server')
    this.sseClient.disconnect()
    this.connected = false
  }

  /**
   * Check if the client is connected
   *
   * @returns True if connected
   */
  public isConnected(): boolean {
    return this.connected
  }

  /**
   * Get the session ID
   *
   * @returns The session ID
   */
  public getSessionId(): string {
    return this.sessionId
  }

  /**
   * Get the client ID
   *
   * @returns The client ID
   */
  public getClientId(): string {
    return this.clientId
  }

  /**
   * Get the SSE client
   *
   * @returns The SSE client
   */
  public getSSEClient(): SSEClient {
    return this.sseClient
  }

  /**
   * Get the JSON-RPC client
   *
   * @returns The JSON-RPC client
   */
  public getJsonRpcClient(): JsonRpcClient {
    return this.jsonRpcClient
  }

  /**
   * Get the test reporter
   *
   * @returns The test reporter
   */
  public getReporter(): TestReporter {
    return this.reporter
  }

  /**
   * List available tools
   *
   * @returns Promise that resolves with the tools list
   */
  public async listTools(): Promise<any> {
    this.reporter.step('Listing available tools')
    const result = await this.jsonRpcClient.listTools()

    if (result.tools && Array.isArray(result.tools)) {
      this.reporter.info(`Server reported ${result.tools.length} tools`, { prefix: '📋' })

      // Log the first few tools for visibility
      if (result.tools.length > 0) {
        this.reporter.debug('Available tools (first 3):', { prefix: '📋' })
        result.tools.slice(0, 3).forEach((tool: any, index: number) => {
          this.reporter.debug(
            `  ${index + 1}. ${tool.name} - ${tool.description.substring(0, 50)}${tool.description.length > 50 ? '...' : ''}`,
          )
        })

        if (result.tools.length > 3) {
          this.reporter.debug(`  ... and ${result.tools.length - 3} more`)
        }
      }
    }

    return result
  }

  /**
   * Call a tool
   *
   * @param name The tool name
   * @param args The tool arguments
   * @returns Promise that resolves with the tool result
   */
  public async callTool<T = any>(name: string, args: any = {}): Promise<T> {
    this.reporter.step(`Calling tool: ${name}`)
    this.reporter.debug(`Tool arguments: ${JSON.stringify(args)}`)

    try {
      const result = await this.jsonRpcClient.callTool<T>(name, args)
      this.reporter.debug(
        `Tool result: ${JSON.stringify(result).substring(0, 200)}${JSON.stringify(result).length > 200 ? '...' : ''}`,
      )
      return result
    } catch (error) {
      this.reporter.error(`Error calling tool ${name}: ${error}`)
      throw error
    }
  }

  /**
   * List available resources
   *
   * @returns Promise that resolves with the resources list
   */
  public async listResources(): Promise<any> {
    this.reporter.step('Listing available resources')
    const result = await this.jsonRpcClient.listResources()

    if (result.resources && Array.isArray(result.resources)) {
      this.reporter.info(`Server reported ${result.resources.length} resources`, { prefix: '📋' })

      // Log the resources for visibility
      if (result.resources.length > 0) {
        this.reporter.debug('Available resources:', { prefix: '📋' })
        result.resources.forEach((resource: any, index: number) => {
          this.reporter.debug(`  ${index + 1}. ${resource.uriPattern}`)
        })
      }
    }

    return result
  }

  /**
   * Read a resource
   *
   * @param uri The resource URI
   * @returns Promise that resolves with the resource content
   */
  public async readResource<T = any>(uri: string): Promise<T> {
    this.reporter.step(`Reading resource: ${uri}`)

    try {
      const result = await this.jsonRpcClient.readResource<T>(uri)
      this.reporter.debug(
        `Resource content: ${JSON.stringify(result).substring(0, 200)}${JSON.stringify(result).length > 200 ? '...' : ''}`,
      )
      return result
    } catch (error) {
      this.reporter.error(`Error reading resource ${uri}: ${error}`)
      throw error
    }
  }

  /**
   * Check if tests should be skipped in CI environment
   *
   * @param testName Optional test name for logging
   * @returns True if the test should be skipped
   */
  public static shouldSkipInCI(testName?: string): boolean {
    return shouldSkipInCI(testName)
  }
}
