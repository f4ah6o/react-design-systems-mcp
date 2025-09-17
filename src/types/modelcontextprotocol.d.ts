declare module '@modelcontextprotocol/sdk/server' {
  export interface ServerOptions {
    name: string
    version: string
  }

  export class Server {
    constructor(options: ServerOptions)
    setRequestHandler(
      method: string,
      handler: (request: any) => any | Promise<any>,
    ): void
    connect(transport: any): Promise<void>
  }
}

declare module '@modelcontextprotocol/sdk/server/sse.js' {
  export interface SSEServerTransportOptions {
    path: string
    port: number
    heartbeatIntervalMs?: number
    keepAliveTimeoutMs?: number
  }

  export class SSEServerTransport {
    constructor(options: SSEServerTransportOptions)
  }
}

declare module '@modelcontextprotocol/sdk/server/stdio.js' {
  export class StdioServerTransport {
    constructor(options?: Record<string, unknown>)
  }
}
