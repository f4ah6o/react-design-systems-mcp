# Quickstart Guide: Demo and Pattern Features

This guide provides quick commands and examples to test the new demo and pattern functionality in the React Design Systems MCP server.

## Prerequisites

Ensure you have the server built and running:

```bash
npm install
npm run build
npm run dev
```

## Testing New MCP Tools

### 1. Get Component Demos

Test the `get_component_demos` tool to retrieve interactive demos for components:

```bash
# Basic usage - get all demos for button component
echo '{"tool": "get_component_demos", "arguments": {"componentId": "button"}}' | node dist/mcp/server.js

# With filtering - get basic demos only
echo '{"tool": "get_component_demos", "arguments": {"componentId": "button", "demoType": "basic"}}' | node dist/mcp/server.js

# Include code in response
echo '{"tool": "get_component_demos", "arguments": {"componentId": "table", "includeCode": true}}' | node dist/mcp/server.js

# Filter by complexity
echo '{"tool": "get_component_demos", "arguments": {"componentId": "form", "complexity": "intermediate"}}' | node dist/mcp/server.js
```

### 2. Search Design Patterns

Test the `search_patterns` tool to find design patterns:

```bash
# Search all patterns
echo '{"tool": "search_patterns", "arguments": {}}' | node dist/mcp/server.js

# Search by category
echo '{"tool": "search_patterns", "arguments": {"category": "generative-ai"}}' | node dist/mcp/server.js

# Search by query
echo '{"tool": "search_patterns", "arguments": {"query": "create"}}' | node dist/mcp/server.js

# Search by component
echo '{"tool": "search_patterns", "arguments": {"component": "button"}}' | node dist/mcp/server.js

# Search with tags
echo '{"tool": "search_patterns", "arguments": {"tags": ["crud"]}}' | node dist/mcp/server.js

# Limit results
echo '{"tool": "search_patterns", "arguments": {"limit": 3}}' | node dist/mcp/server.js
```

### 3. Get Pattern Details

Test the `get_pattern_details` tool to get comprehensive pattern information:

```bash
# Get full pattern details
echo '{"tool": "get_pattern_details", "arguments": {"patternId": "general-actions"}}' | node dist/mcp/server.js

# Get pattern without examples
echo '{"tool": "get_pattern_details", "arguments": {"patternId": "ai-content-generation", "includeExamples": false}}' | node dist/mcp/server.js

# Get pattern without code
echo '{"tool": "get_pattern_details", "arguments": {"patternId": "resource-list", "includeCode": false}}' | node dist/mcp/server.js

# Get pattern without usage guidelines
echo '{"tool": "get_pattern_details", "arguments": {"patternId": "dashboard-layout", "includeUsageGuidelines": false}}' | node dist/mcp/server.js
```

### 4. Get Pattern Categories

Test the `get_pattern_categories` tool to explore pattern organization:

```bash
# Get all categories
echo '{"tool": "get_pattern_categories", "arguments": {}}' | node dist/mcp/server.js

# Get categories without pattern counts
echo '{"tool": "get_pattern_categories", "arguments": {"includePatternCount": false}}' | node dist/mcp/server.js

# Get categories without pattern lists
echo '{"tool": "get_pattern_categories", "arguments": {"includePatternList": false}}' | node dist/mcp/server.js
```

## Testing with curl (if running SSE mode)

If running with `npm run dev:sse`, you can test with HTTP requests:

```bash
# Start SSE mode
npm run dev:sse

# Test get_component_demos
curl -X POST http://localhost:3000/mcp/tools/get_component_demos \
  -H "Content-Type: application/json" \
  -d '{"componentId": "button", "includeCode": true}'

# Test search_patterns
curl -X POST http://localhost:3000/mcp/tools/search_patterns \
  -H "Content-Type: application/json" \
  -d '{"category": "resource-management", "limit": 5}'

# Test get_pattern_details
curl -X POST http://localhost:3000/mcp/tools/get_pattern_details \
  -H "Content-Type: application/json" \
  -d '{"patternId": "ai-prompt-engineering"}'

# Test get_pattern_categories
curl -X POST http://localhost:3000/mcp/tools/get_pattern_categories \
  -H "Content-Type: application/json" \
  -d '{}'
```

## Testing MCP Resources

Test the new MCP resources for demos and pattern categories:

```bash
# Access demo resource
echo '{"method": "resources/read", "params": {"uri": "cloudscape://demos/button"}}' | node dist/mcp/server.js

# Access pattern category resource
echo '{"method": "resources/read", "params": {"uri": "cloudscape://pattern-categories/generative-ai"}}' | node dist/mcp/server.js
```

## Unit Tests

Run specific test suites for the new functionality:

```bash
# Test DemoProvider functionality
npm run test:unit -- --testNamePattern="DemoProvider"

# Test PatternProvider functionality
npm run test:unit -- --testNamePattern="PatternProvider"

# Test demo data validation
npm run test:unit -- --testNamePattern="demo.*validation"

# Test pattern data validation
npm run test:unit -- --testNamePattern="pattern.*validation"

# Test all new contract tests
npm test tests/contract/

# Test all new integration tests
npm test tests/integration/
```

## Integration Tests

Test the complete integration between components, demos, and patterns:

```bash
# Test demo-component relationships
npm test tests/integration/test_demo_integration.ts

# Test pattern search functionality
npm test tests/integration/test_pattern_search.ts

# Test error handling across the system
npm test tests/integration/test_error_handling.ts
```

## Common Test Scenarios

### Scenario 1: Find demos for a component
```bash
# Get all button demos
echo '{"tool": "get_component_demos", "arguments": {"componentId": "button"}}' | node dist/mcp/server.js
```

### Scenario 2: Discover patterns by category
```bash
# Find all generative AI patterns
echo '{"tool": "search_patterns", "arguments": {"category": "generative-ai"}}' | node dist/mcp/server.js
```

### Scenario 3: Get detailed pattern guidance
```bash
# Get full details for content generation pattern
echo '{"tool": "get_pattern_details", "arguments": {"patternId": "ai-content-generation"}}' | node dist/mcp/server.js
```

### Scenario 4: Explore pattern categories
```bash
# See all available pattern categories
echo '{"tool": "get_pattern_categories", "arguments": {"includePatternCount": true}}' | node dist/mcp/server.js
```

## Expected Outputs

### Demo Tool Output
```json
{
  "componentId": "button",
  "demos": [
    {
      "id": "button-basic",
      "name": "Basic Button",
      "description": "Simple button with standard interactions",
      "componentId": "button",
      "type": "basic",
      "variations": [...],
      "tags": ["button", "basic", "interaction"],
      "code": "...",
      "metadata": {
        "complexity": "basic",
        "lastUpdated": "2025-09-11",
        "version": "1.0.0"
      }
    }
  ],
  "totalResults": 1,
  "query": {"componentId": "button"}
}
```

### Pattern Search Output
```json
{
  "patterns": [
    {
      "id": "general-actions",
      "name": "General Actions",
      "description": "Standard action patterns for user interactions",
      "category": "general",
      "components": ["button"],
      "usageGuidelines": "...",
      "examples": [...],
      "codeExample": "...",
      "relatedPatterns": [...],
      "tags": ["general", "actions", "button"],
      "lastUpdated": "2025-09-11"
    }
  ],
  "totalResults": 1,
  "query": {}
}
```

## Troubleshooting

### Common Issues

1. **Server not running**: Make sure `npm run dev` is running
2. **TypeScript errors**: Run `npm run build` to compile TypeScript
3. **Test failures**: Ensure all dependencies are installed with `npm install`
4. **Tool not found**: Verify tool name spelling and server is properly started

### Debug Commands

```bash
# Check server status
curl -X GET http://localhost:3000/health

# View server logs
npm run dev 2>&1 | tee server.log

# Test basic MCP functionality
echo '{"tool": "search_components", "arguments": {"query": "button"}}' | node dist/mcp/server.js
```

### Validation

After testing, verify data integrity:

```bash
# Run all validation tests
npm run test:unit -- --testNamePattern="validation"

# Check demo-component mapping consistency
npm run test:unit -- --testNamePattern="component.*demo.*map"
```

## Next Steps

After successful testing:

1. **Integration**: Use tools in your MCP client application
2. **Customization**: Add more demos and patterns as needed
3. **Extension**: Build additional tools on top of the demo and pattern data
4. **Deployment**: Deploy to production with confidence

For more detailed information, see `CLAUDE.md` and the test files in `tests/unit/`, `tests/contract/`, and `tests/integration/`.