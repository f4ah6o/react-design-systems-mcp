# Tasks: Add Support for Cloudscape Design System Demo and Patterns

**Input**: Design documents from `/specs/001-add-support-for/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → If not found: ERROR "No implementation plan found"
   → Extract: tech stack, libraries, structure
2. Load optional design documents:
   → data-model.md: Extract entities → model tasks
   → contracts/: Each file → contract test task
   → research.md: Extract decisions → setup tasks
3. Generate tasks by category:
   → Setup: project init, dependencies, linting
   → Tests: contract tests, integration tests
   → Core: models, services, CLI commands
   → Integration: DB, middleware, logging
   → Polish: unit tests, performance, docs
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All contracts have tests?
   → All entities have models?
   → All endpoints implemented?
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Single project**: `src/`, `tests/` at repository root
- Paths assume single project structure per plan.md

## Phase 3.1: Setup & Research
- [x] T001 Research Cloudscape demos repository structure and extract demo data formats
- [x] T002 Research cloudscape.design/patterns website structure for pattern data extraction
- [x] T003 [P] Analyze existing MCP server tools in src/mcp/server.ts for API consistency patterns
- [x] T004 [P] Review existing component registry in src/components/registry.ts for integration points

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [x] T005 [P] Contract test get_component_demos tool in tests/contract/test_demo_tools.ts
- [x] T006 [P] Contract test search_patterns tool in tests/contract/test_pattern_tools.ts  
- [x] T007 [P] Contract test get_pattern_details tool in tests/contract/test_pattern_details.ts
- [x] T008 [P] Contract test get_pattern_categories tool in tests/contract/test_pattern_categories.ts
- [x] T009 [P] Integration test demo-component relationship in tests/integration/test_demo_integration.ts
- [x] T010 [P] Integration test pattern search functionality in tests/integration/test_pattern_search.ts
- [x] T011 [P] Integration test error handling for missing demos/patterns in tests/integration/test_error_handling.ts

## Phase 3.3: Data Models & Core Implementation (ONLY after tests are failing)
- [x] T012 [P] Create Demo entity data model in src/components/data/demos.ts
- [x] T013 [P] Create Pattern entity data model in src/components/data/patterns.ts
- [x] T014 [P] Create Pattern Category data model in src/components/data/pattern-categories.ts
- [x] T015 [P] Implement DemoProvider service in src/demo-provider/index.ts
- [x] T016 [P] Implement PatternProvider service in src/pattern-provider/index.ts
- [x] T017 Extend ComponentRegistry with demo methods in src/components/registry.ts
- [x] T018 Extend ComponentRegistry with pattern methods in src/components/registry.ts

## Phase 3.4: MCP Tool Integration
- [x] T019 Add get_component_demos tool to FastMCP server
- [x] T020 Add search_patterns tool to FastMCP server
- [x] T021 Add get_pattern_details tool to FastMCP server
- [x] T022 Add get_pattern_categories tool to FastMCP server
- [x] T023 Add demos resource to MCP resource system
- [x] T024 Add patterns resource to MCP resource system

## Phase 3.5: Data Population & Integration
- [x] T025 [P] Populate demo data from Cloudscape repository analysis in src/components/data/demos.ts
- [x] T026 [P] Populate pattern data from cloudscape.design/patterns in src/components/data/patterns.ts  
- [x] T027 [P] Populate pattern category data in src/components/data/pattern-categories.ts
- [x] T028 Create component-demo relationship mappings in src/components/data/component-demo-map.ts
- [x] T029 Update existing component data with demo references where available

## Phase 3.6: Polish & Validation
- [x] T030 [P] Unit tests for DemoProvider in tests/unit/test_demo_provider.ts
- [x] T031 [P] Unit tests for PatternProvider in tests/unit/test_pattern_provider.ts
- [x] T032 [P] Unit tests for demo data validation in tests/unit/test_demo_validation.ts
- [x] T033 [P] Unit tests for pattern data validation in tests/unit/test_pattern_validation.ts
- [x] T034 Update CLAUDE.md with new demo and pattern functionality
- [x] T035 Create quickstart.md for testing new MCP tools
- [x] T036 Performance tests ensuring sub-second response times
- [x] T037 End-to-end tests using npm test commands

## Dependencies
- Research (T001-T004) before all other phases
- Tests (T005-T011) before implementation (T012-T024)  
- Data models (T012-T014) before providers (T015-T016)
- Providers (T015-T016) before registry extension (T017-T018)
- Registry extension (T017-T018) before MCP tools (T019-T024)
- Data population (T025-T029) requires providers and models
- Polish (T030-T037) after all implementation complete

## Parallel Example
```
# Launch research phase together:
Task: "Research Cloudscape demos repository structure and extract demo data formats"
Task: "Research cloudscape.design/patterns website structure for pattern data extraction" 
Task: "Analyze existing MCP server tools in src/mcp/server.ts for API consistency patterns"
Task: "Review existing component registry in src/components/registry.ts for integration points"

# Launch contract tests together after research:
Task: "Contract test get_component_demos tool in tests/contract/test_demo_tools.ts"
Task: "Contract test search_patterns tool in tests/contract/test_pattern_tools.ts"
Task: "Contract test get_pattern_details tool in tests/contract/test_pattern_details.ts"
Task: "Contract test get_pattern_categories tool in tests/contract/test_pattern_categories.ts"
```

## Notes
- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Commit after each task
- Follow existing TypeScript/FastMCP patterns
- Maintain consistency with existing component registry approach

## Task Generation Rules
*Applied during main() execution*

1. **From Plan Requirements**:
   - Each new MCP tool → contract test task [P] 
   - Each provider service → creation task [P]
   
2. **From Data Model**:
   - Each entity (Demo, Pattern, PatternCategory) → model creation task [P]
   - Component relationships → mapping tasks
   
3. **From User Stories**:
   - Demo access → integration test [P]
   - Pattern search → integration test [P] 
   - Error handling → integration test [P]

4. **Ordering**:
   - Research → Tests → Models → Services → MCP Tools → Data Population → Polish
   - Dependencies block parallel execution

## Validation Checklist
*GATE: Checked by main() before returning*

- [x] All new MCP tools have corresponding contract tests
- [x] All entities (Demo, Pattern, PatternCategory) have model tasks  
- [x] All tests come before implementation
- [x] Parallel tasks truly independent (different files)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] TDD order enforced (tests before implementation)