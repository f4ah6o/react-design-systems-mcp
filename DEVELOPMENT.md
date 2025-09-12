# React Design Systems MCP Development

This document contains development-specific information for the React Design Systems MCP project.

## Requirements

- **Node.js**: 22.x or higher
 - **pnpm**: 9.x or higher

## Project Structure

```
react-design-systems-mcp/
├── server.ts                  # Main server file
├── tsconfig.json              # TypeScript configuration
├── src/
│   ├── components/            # Component Registry
│   │   ├── data/              # Component data
│   │   │   ├── categories.ts  # Category metadata
│   │   │   ├── components.ts  # Component metadata
│   │   │   ├── examples.ts    # Example metadata
│   │   │   └── patterns.ts    # Pattern metadata
│   │   └── registry.ts        # Component Registry implementation
│   ├── search/                # Search Engine
│   │   └── engine.ts          # Search Engine implementation
│   ├── code-generator/        # Code Generator
│   │   └── generator.ts       # Code Generator implementation
│   ├── documentation/         # Documentation Provider
│   │   └── provider.ts        # Documentation Provider implementation
│   ├── example-provider/      # Example Provider
│   │   └── index.ts           # Example Provider implementation
│   ├── property-explorer/     # Property Explorer
│   │   └── index.ts           # Property Explorer implementation
│   ├── integration/           # Roo Integration
│   │   └── roo-integration.ts # Roo Integration implementation
│   ├── optimization/          # Performance Optimization
│   │   └── performance.ts     # Performance Optimization implementation
│   ├── security/              # Security Enhancements
│   │   └── index.ts           # Security Enhancements implementation
│   └── mcp/                   # MCP Server implementation
│       └── server.ts          # MCP Server implementation
├── test.ts                    # Basic test script
├── test-phase2.ts             # Phase 2 test script
├── test-phase3.ts             # Phase 3 test script
└── test-phase4.ts             # Phase 4 test script
```

## Installation for Development

```bash
# Clone the repository
git clone https://github.com/agentience/react-design-systems-mcp.git
cd react-design-systems-mcp

# Install dependencies
pnpm install
```

### Setup Steps

1. Ensure you have Node.js 22.x or higher installed:
```bash
node --version
# Should output v22.x or higher
```

2. Build the TypeScript code:
```bash
pnpm run build
```

## Usage (Development Environment)

### Running the Server

#### Standard Mode (stdio)

```bash
pnpm start
```

or

```bash
pnpm run dev
```

#### SSE Mode (for Web Applications)

```bash
pnpm run dev:sse
```

#### Advanced Development Usage

Start the server:
```bash
pnpm start

# With custom port
pnpm start -- --port 8080
# or
PORT=8080 pnpm start

# With custom bind address
pnpm start -- --bind 127.0.0.1
# or
BIND=127.0.0.1 pnpm start
```

For development with automatic reloading:
```bash
pnpm run dev

# With custom port
pnpm run dev -- --port 8080
# or
PORT=8080 pnpm run dev

# With custom bind address
pnpm run dev -- --bind 127.0.0.1
# or
BIND=127.0.0.1 pnpm run dev
```

### Testing

```bash
pnpm test
```

### Building

The build process includes automatic processing of usage.md files to convert internal links:

```bash
# Full build with link processing
pnpm run build

# Individual build steps
pnpm run prepare      # Compile TypeScript
pnpm run update-links # Process markdown links
pnpm run postbuild    # Copy data files

# Link processing utilities
pnpm run update-links:dry-run    # Preview changes without modifying files
pnpm run update-links:verbose    # Show detailed processing information
```

The build automatically converts internal markdown links in usage.md files from regular format to the `get_link_resource` tool call format, enabling the MCP server to resolve component, pattern, and foundation references.

## Core Components

The React Design Systems MCP server provides the following functionality:

- **Component Registry**: Metadata for Cloudscape components
- **Search Engine**: Search for components by name, category, or tags
- **Code Generator**: Generate code for components and common patterns
- **Documentation Provider**: Comprehensive documentation for components
- **Example Provider**: Usage examples for components
- **Property Explorer**: Detailed property information and relationships
- **Roo Integration**: Enhanced integration with Roo
- **Performance Optimization**: Caching and memoization for improved performance
- **Security Enhancements**: Input validation and sanitization
- **Remote Server Capability**: Server stays running and listens on the specified port

## Testing

Run the test scripts to verify that all components are working correctly:

```bash
# Basic test
node dist/test.js

# Phase 2 test (Component Registry and Search Engine)
node dist/test-phase2.js

# Phase 3 test (Code Generator, Documentation Provider, and Example Provider)
node dist/test-phase3.js

# Phase 4 test (Roo Integration, Performance, and Security)
node dist/test-phase4.js
```

## Implementation Phases

The React Design Systems MCP server was implemented in four phases:

### Phase 1: Initial Setup and Core Functionality

- Set up the basic MCP server infrastructure
- Implemented the Component Registry with metadata for the most commonly used components
- Implemented basic search functionality
- Implemented basic component retrieval functionality

### Phase 2: Complete Component Registry and Enhanced Search

- Completed the Component Registry with metadata for all Cloudscape components
- Enhanced search functionality with advanced filtering and ranking
- Implemented property exploration functionality
- Improved component retrieval with more detailed information

### Phase 3: Code Generation and Documentation

- Implemented code generation for individual components
- Implemented code generation for common Cloudscape patterns
- Implemented comprehensive documentation provider
- Implemented example provider

### Phase 4: Integration and Testing

- Integrated the MCP server with Roo
- Tested the integration with frontend-code mode
- Optimized performance with caching and memoization
- Implemented security enhancements with input validation and sanitization
- Finalized documentation

For more details on each phase, see the phase summary files:
- `docs/phase2-summary.md`
- `docs/phase3-summary.md`
- `docs/phase4-summary.md`

## FastMCP Implementation

This project uses the FastMCP framework, which provides a more structured and type-safe approach to building MCP servers. FastMCP offers several advantages over traditional MCP implementations:

### Key Features

- **Simplified tool and resource definition**: Easier API for defining MCP tools and resources
- **Built-in support for authentication**: Streamlined authentication handling
- **Session management**: Automatic session tracking and management
- **Image and audio content handling**: Support for multimedia content types
- **Improved logging**: Enhanced logging capabilities for debugging and monitoring
- **Better error handling**: More robust error handling and reporting
- **Support for SSE (Server-Sent Events)**: Real-time communication capabilities
- **CORS support**: Built-in Cross-Origin Resource Sharing support
- **Progress notifications**: Ability to send progress updates for long-running operations
- **Typed server events**: Type-safe event handling
- **Prompt argument auto-completion**: Enhanced development experience

### Transport Types

The FastMCP server supports two transport types:

1. **stdio (default)**: Standard input/output transport for local server communication
2. **SSE (Server-Sent Events)**: HTTP-based transport for web applications and remote clients

#### Running with stdio Transport

```bash
pnpm start
# or
pnpm run dev
```

#### Running with SSE Transport

```bash
pnpm run dev:sse
```

### Implementation Details

For detailed technical information about the FastMCP implementation, including tool and resource registration patterns, see [FastMCP Implementation Guide](docs/fastmcp-implementation.md).

## Node.js 22.x Notes

This project targets Node.js 22.x or higher. If you encounter any issues related to the Node.js version, ensure your local runtime matches 22.x and reinstall dependencies.

## Publishing

To publish a new version of the package:

1. Update the version in `package.json`
2. Build the package:
```bash
pnpm run build
```

3. Publish to npm:
```bash
pnpm publish
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests to ensure everything works
5. Submit a pull request

Please ensure your code follows the project's coding standards and includes appropriate tests.
