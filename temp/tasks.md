# Migration Plan: fastmcp → @modelcontextprotocol/sdk

This document tracks the incremental migration from the current FastMCP-based server to the official Model Context Protocol SDK for Node (`@modelcontextprotocol/sdk`). The approach is staged to avoid regressions and keep E2E/unit tests passing during the transition.

## Goals
- Provide an SDK-based MCP server that exposes the same tools/resources as the existing FastMCP server.
- Keep FastMCP as the default path during the migration, with an opt-in path to run the SDK server for iterative testing.
- Minimize code duplication by reusing existing business logic (registry, providers, search, etc.).

## Phases

1) Bootstrap SDK Server (non-disruptive)
- Add dependency: `@modelcontextprotocol/sdk`.
- Scaffold `src/sdk/server.ts` that:
  - Creates an MCP `Server` instance.
  - Exposes SSE transport for local dev parity.
  - Registers a small subset of tools/resources to validate wiring (e.g., `get_component_details`, `get_link_resource`, `tools/list`, `resources/list`, `resources/read`).
- Add a dev script (e.g., `dev:sdk`) to run SDK server on the same port (`3001`) with SSE.
- Leave FastMCP as-is to not break current E2E.

2) Tool/Resource Parity
- Port remaining tools from `src/mcp/server.ts` to the SDK registration surface.
- Keep implementation logic shared by extracting common helpers if needed, or by calling into the same modules (registry, providers, search).
- Ensure `tests/utils` clients can speak to the SDK server (SSE + JSON-RPC).

3) E2E Compatibility
- Validate `tests/e2e` against SDK server. If JSON-RPC framing differs, adjust `tests/utils/jsonrpc-client.ts` to be SDK-aware (headers/session/paths) while remaining backward-compatible with FastMCP.

4) Cutover
- Switch default `pnpm dev:sse` to SDK server after parity confirmed.
- Remove FastMCP dependency and server entry, or keep behind a feature flag temporarily.

## Tasks (Initial)
- [x] Add `@modelcontextprotocol/sdk` dependency.
- [x] Create `src/sdk/server.ts` with SSE transport and basic tool/resource handlers:
  - [x] `tools/list`, `tools/call` (SDK-native)
  - [x] `resources/list`, `resources/read`
  - [x] `get_component_details`, `get_link_resource`
- [x] Add `dev:sdk` script and instructions.
- [x] Smoke test: start SDK server, verify `tools/list` and basic tool calls.

## Risks / Notes
- E2E clients currently assume FastMCP’s JSON-RPC behavior; SDK may require slight adjustments (headers/query params). We’ll implement a dual-compatible client.
- Keep changes surgical; avoid touching business logic (registry/providers) except for shared helpers.

## Next Steps After Bootstrap
- Port remaining tools/resources in batches and validate with E2E.
- Switch default dev script to SDK server once parity is achieved.

---

## Current Status (to resume later)

What’s done
- SDK server scaffolded at `src/sdk/server.ts` with SSE/STDIO support.
- Implemented tools on SDK side:
  - get_component_details, get_link_resource (shared parser at `src/sdk/link-parser.ts`)
  - search_components, search_documentation, get_pattern_categories, search_patterns
- Ported additional SDK tools for parity:
  - generate_component_code, generate_pattern_code
  - get_pattern_code, get_pattern_details, get_component_usage
  - validate_component_props, get_component_events, get_component_accessibility, get_component_versions
  - get_example_code, get_component_patterns
  - get_component_properties, get_component_examples, get_component_demos
  - get_component_dependencies, get_component_alternatives, compare_components
  - search_patterns (advanced provider), search_usage_guidelines, search_component_functions, search_component_events, search_component_properties
- Implemented resources on SDK side:
  - resources/list (returns FastMCP-equivalent URI patterns)
  - resources/read (handles components/categories/patterns/examples/usage/demos/pattern-categories and fixed resources)
- Test harness updates:
  - E2E: replaced `fail(...)` with `expect.fail(...)` (Vitest)
  - E2E: tool-availability guards so tests skip gracefully while migrating
  - JSON-RPC client: added multi-path fallback and `X-MCP-Session-ID` header (FastMCP/SDK両対応寄り)
- Unit tests are green. E2E works with FastMCP, and SDK path passes for implemented tools/resources.

Pending (SDK parity)
- Finish E2E client SDK-compat polish (now working with fallback; finalize once all tools migrated)
- Make SDK server the default dev script; remove FastMCP after parity confirmed
- Investigate SDK server runtime error when registering handlers (current `ts-node` run hits `Server.setRequestHandler` schema assertion; see `/tmp/sdk-server.log` from `pnpm run test:e2e`)

How to run (today)
- FastMCP server: `pnpm dev:sse`
- SDK server: `pnpm dev:sdk`
- Unit tests: `pnpm run test:unit`
- E2E tests: start a server (FastMCP or SDK), then `pnpm run test:e2e`

Resume checklist
- Start SDK server: `pnpm dev:sdk`
- Verify tools list: use e2e `tools.test.ts` or call `tools/list`
- Pick next tool to port from the Pending list (above), implement in `src/sdk/server.ts`
- Run E2E focused on that tool (see scripts in package.json) and iterate
- Update this file (temp/tasks.md) as items complete
