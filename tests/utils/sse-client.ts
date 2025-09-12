/**
 * SSE Client Implementation
 *
 * This module provides a client for connecting to the MCP server using Server-Sent Events (SSE).
 * It handles connection establishment, message parsing, and event handling.
 */

import { EventEmitter } from 'node:events'
import http from 'node:http'
import { getConfig } from './config'

export interface SSEMessage {
  type: string
  data: any
  id?: string
  event?: string
}

export interface SSEClientOptions {
  host?: string
  port?: number
  path?: string
  headers?: Record<string, string>
  timeout?: number
}

export class SSEClient extends EventEmitter {
  private config = getConfig()
  private host: string
  private port: number
  private path: string
  private headers: Record<string, string>
  private timeout: number
  private request: http.ClientRequest | null = null
  private response: http.IncomingMessage | null = null
  private connected = false
  private buffer = ''
  private sessionId = ''
  private clientId = `client_${Math.random().toString(36).substring(2, 10)}`

  constructor(options: SSEClientOptions = {}) {
    super()
    this.host = options.host || this.config.server.host
    this.port = options.port || this.config.server.port
    this.path = options.path || '/sse'
    this.headers = {
      Accept: 'text/event-stream',
      ...options.headers,
    }
    this.timeout = options.timeout || this.config.timeouts.connection
  }

  /**
   * Connect to the SSE endpoint
   *
   * @returns Promise that resolves when connected
   */
  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const connectionTimeout = setTimeout(() => {
        reject(new Error(`SSE connection timeout after ${this.timeout}ms`))
        this.disconnect()
      }, this.timeout)

      this.request = http.request(
        {
          hostname: this.host,
          port: this.port,
          path: this.path,
          method: 'GET',
          headers: this.headers,
        },
        (res) => {
          this.response = res

          if (res.statusCode !== 200) {
            clearTimeout(connectionTimeout)
            reject(new Error(`SSE connection failed with status code: ${res.statusCode}`))
            return
          }

          if (res.headers['content-type'] !== 'text/event-stream') {
            clearTimeout(connectionTimeout)
            reject(new Error(`Invalid content type: ${res.headers['content-type']}`))
            return
          }

          this.connected = true
          clearTimeout(connectionTimeout)
          resolve()
          this.emit('connected')

          res.on('data', this.handleData.bind(this))
          res.on('end', () => {
            this.connected = false
            this.emit('disconnected')
          })
        },
      )

      this.request.on('error', (error) => {
        clearTimeout(connectionTimeout)
        this.connected = false
        reject(error)
        this.emit('error', error)
      })

      this.request.end()
    })
  }

  /**
   * Disconnect from the SSE endpoint
   */
  public disconnect(): void {
    if (this.response) {
      this.response.destroy()
      this.response = null
    }
    if (this.request) {
      this.request.destroy()
      this.request = null
    }
    this.connected = false
    this.emit('disconnected')
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
   * Handle incoming data chunks
   *
   * @param chunk The data chunk
   */
  private handleData(chunk: Buffer): void {
    const chunkStr = chunk.toString()
    this.buffer += chunkStr

    // Extract session ID from endpoint message if available
    if (chunkStr.includes('event: endpoint')) {
      const lines = chunkStr.split('\n')
      for (const line of lines) {
        if (line.startsWith('data:')) {
          const dataContent = line.substring(5).trim()
          if (dataContent.includes('sessionId=')) {
            this.sessionId = dataContent.split('sessionId=')[1].split('&')[0]
            this.emit('session', this.sessionId)
          }
        }
      }
    }

    // Process complete SSE messages
    const messages = this.buffer.split('\n\n')
    this.buffer = messages.pop() || '' // Keep the last incomplete message

    for (const message of messages) {
      if (!message.trim()) continue

      try {
        const parsedMessage = this.parseSSEMessage(message)
        if (parsedMessage) {
          this.emit('message', parsedMessage)

          // Also emit an event for the specific message type
          if (parsedMessage.event) {
            this.emit(parsedMessage.event, parsedMessage.data)
          }
        }
      } catch (error) {
        this.emit('error', new Error(`Error parsing SSE message: ${error}`))
      }
    }
  }

  /**
   * Parse an SSE message
   *
   * @param message The raw SSE message
   * @returns The parsed message
   */
  private parseSSEMessage(message: string): SSEMessage | null {
    const lines = message.split('\n')
    let event: string | undefined
    let id: string | undefined
    let data = ''

    for (const line of lines) {
      if (line.startsWith('event:')) {
        event = line.substring(6).trim()
      } else if (line.startsWith('id:')) {
        id = line.substring(3).trim()
      } else if (line.startsWith('data:')) {
        data += line.substring(5).trim()
      }
    }

    if (!data) {
      return null
    }

    try {
      const parsedData = JSON.parse(data)
      return {
        type: event || 'message',
        data: parsedData,
        id,
        event,
      }
    } catch (_error) {
      // If it's not JSON, return the raw data
      return {
        type: event || 'message',
        data,
        id,
        event,
      }
    }
  }
}
