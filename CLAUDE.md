# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

React Design Systems is a Model Context Protocol (MCP) server that provides comprehensive information about design systems created for React. The current version focuses exclusively on the AWS Cloudscape Design System components, along with code generation capabilities. It's built using the FastMCP framework and TypeScript.

## Development Commands

### Building and Running
```bash
# Install dependencies
npm install

# Build TypeScript to JavaScript
npm run build

# Run in development mode with auto-reload
npm run dev

# Run in development mode with SSE transport
npm run dev:sse

# Run production server
npm start
```

### Testing
```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit      # Unit tests only
npm run test:e2e       # End-to-end tests only
npm run test:tools     # Tools tests
npm run test:resources # Resources tests
npm run test:roo      # Roo integration tests

# Run tests in CI mode (skip long-running tests)
npm run test:ci
```

### Linting and Type Checking
```bash
# Run ESLint
npm run lint
```

## Architecture Overview

### Project Structure
- **src/components/**: Component registry and data
  - `registry.ts`: Main component registry implementation with demo and pattern integration
  - `data/`: Component metadata, categories, examples, patterns, and demos
    - `demos.ts`: Interactive demo data from Cloudscape demos repository
    - `patterns.ts`: Design patterns from cloudscape.design/patterns
    - `pattern-categories.ts`: Pattern category organization
    - `component-demo-map.ts`: Component-demo relationship mappings

- **src/demo-provider/**: Demo provider service
  - `index.ts`: DemoProvider service for demo management and search

- **src/pattern-provider/**: Pattern provider service
  - `index.ts`: PatternProvider service for pattern search and details

- **src/mcp/**: MCP server implementation
  - `server.ts`: FastMCP server implementation with demo and pattern tools
  - `fastmcp-server.ts`: Re-exports server.ts for backward compatibility

- **src/search/**: Search engine for components
- **src/code-generator/**: Code generation for components and patterns
- **src/documentation/**: Documentation provider
- **src/property-explorer/**: Component property exploration
- **src/example-provider/**: Component examples
- **src/integration/**: Roo integration
- **src/security/**: Security enhancements
- **src/optimization/**: Performance optimizations

### Key Technical Details

1. **FastMCP Framework**: The server uses FastMCP which provides:
   - Built-in SSE (Server-Sent Events) support
   - CORS support
   - Type-safe tool and resource definitions
   - Progress notifications
   - Session management

2. **Transport Modes**: 
   - `stdio` (default): For local MCP communication
   - `SSE`: For web applications and remote clients

3. **Component Data Structure**: Components have metadata including:
   - id, name, category, description
   - importPath, version, isExperimental
   - properties (with type, description, required status)
   - relatedComponents, tags
   - demoIds, primaryDemo, hasDemos (demo integration)

4. **Demo Data Structure**: Demos provide interactive examples with:
   - id, name, description, componentId
   - type, variations, tags, code
   - metadata (complexity, lastUpdated, version)

5. **Pattern Data Structure**: Patterns provide design guidance with:
   - id, name, description, category
   - components, usageGuidelines, examples
   - codeExample, relatedPatterns, tags

6. **Tools Available**: The server provides various tools like:
   - `search_components`: Search with advanced filtering
   - `get_component_details`: Get detailed component info
   - `generate_component_code`: Generate component code
   - `generate_pattern_code`: Generate pattern code
   - `validate_component_props`: Validate component props
   - `get_component_demos`: Get interactive demos for components
   - `search_patterns`: Search design patterns with filters
   - `get_pattern_details`: Get detailed pattern information
   - `get_pattern_categories`: Get pattern categories and organization
   - And many more...

## Development Guidelines

1. **TypeScript**: Use strict TypeScript settings as configured in tsconfig.json
2. **Node.js Version**: Requires Node.js 24.0.1 or higher
3. **Testing**: Write tests for new functionality in the appropriate test directory
4. **Component Data**: When adding new components, update the data files in src/components/data/
5. **FastMCP**: When adding new tools, follow the FastMCP pattern using Zod schemas for parameters

## Common Tasks

### Adding a New Component
1. Add component metadata to `src/components/data/components.ts`
2. Add examples to `src/components/data/examples.ts`
3. Update categories if needed in `src/components/data/categories.ts`
4. If adding demos, update `src/components/data/demos.ts` and `src/components/data/component-demo-map.ts`
5. Run tests to ensure everything works

### Adding a New Demo
1. Add demo data to `src/components/data/demos.ts`
2. Update component-demo mappings in `src/components/data/component-demo-map.ts`
3. Test with `DemoProvider` service methods
4. Validate demo structure using validation tests

### Adding a New Pattern
1. Add pattern data to `src/components/data/patterns.ts`
2. Update pattern categories in `src/components/data/pattern-categories.ts`
3. Test with `PatternProvider` service methods
4. Validate pattern structure using validation tests

### Adding a New Tool
1. Add the tool in `src/mcp/server.ts` using the FastMCP pattern
2. Define parameters using Zod schemas
3. Implement the execute function
4. Add corresponding tests

### Debugging
- Use `npm run dev` for development with auto-reload
- Check logs for FastMCP server output
- Use the test files to verify functionality
- Test demo functionality using `DemoProvider` methods
- Test pattern functionality using `PatternProvider` methods
- Validate data integrity using the validation test suites

### Testing New Demo and Pattern Features
```bash
# Test demo functionality
npm run test:unit -- --testNamePattern="DemoProvider"

# Test pattern functionality  
npm run test:unit -- --testNamePattern="PatternProvider"

# Test data validation
npm run test:unit -- --testNamePattern="validation"

# Test contract compliance
npm run test -- tests/contract/

# Test integration
npm run test -- tests/integration/
```

## Publishing
The package is published to npm as `@agentience/react-design-systems-mcp`. Before publishing:
1. Update version in package.json
2. Run `npm run build`
3. Run `npm run test:ci`
4. Use `npm publish` to publish