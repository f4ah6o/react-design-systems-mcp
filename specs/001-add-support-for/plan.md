# Implementation Plan: Add Support for Cloudscape Design System Demo and Patterns

**Branch**: `001-add-support-for` | **Date**: 2025-09-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-add-support-for/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
4. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
5. Execute Phase 1 → contracts, data-model.md, quickstart.md, CLAUDE.md
6. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
7. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
8. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
Add support for Cloudscape Design System demo and patterns to the existing MCP server. This will provide access to React/TypeScript interactive demos from the official Cloudscape demos repository and expose 61+ design patterns across General, Generative AI, and Resource Management categories from cloudscape.design/patterns.

## Technical Context
**Language/Version**: TypeScript (existing codebase uses TypeScript 97.8%)  
**Primary Dependencies**: FastMCP, React (for demo processing), existing component registry  
**Storage**: File-based data structures (consistent with existing components.ts approach)  
**Testing**: Jest (existing test framework), npm test commands  
**Target Platform**: Node.js 24.0.1+ (per existing requirements)  
**Project Type**: single (MCP server extension)  
**Performance Goals**: Same as existing MCP server (~sub-second response times)  
**Constraints**: Must integrate with existing FastMCP server and component registry  
**Scale/Scope**: 61+ patterns, multiple demo components from GitHub repository

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Simplicity**:
- Projects: 1 (extending existing MCP server)
- Using framework directly? (FastMCP framework used directly)
- Single data model? (extending existing component data model)
- Avoiding patterns? (using existing registry pattern)

**Architecture**:
- EVERY feature as library? (extending existing component library structure)
- Libraries listed: demo-provider (demo content), pattern-provider (pattern data)
- CLI per library: integrated into existing MCP tools
- Library docs: extends existing CLAUDE.md format

**Testing (NON-NEGOTIABLE)**:
- RED-GREEN-Refactor cycle enforced? (yes, will follow existing test structure)
- Git commits show tests before implementation? (required)
- Order: Contract→Integration→E2E→Unit strictly followed? (yes)
- Real dependencies used? (actual demo repository and pattern URLs)
- Integration tests for: new MCP tools, pattern data contracts
- FORBIDDEN: Implementation before test, skipping RED phase

**Observability**:
- Structured logging included? (using existing FastMCP logging)
- Frontend logs → backend? (N/A - server-side only)
- Error context sufficient? (yes, error handling for missing demos/patterns)

**Versioning**:
- Version number assigned? (will increment existing package version)
- BUILD increments on every change? (yes)
- Breaking changes handled? (extending existing API, no breaking changes)

## Project Structure

### Documentation (this feature)
```
specs/001-add-support-for/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
# Option 1: Single project (DEFAULT)
src/
├── components/          # Existing - extend with demo and pattern data
│   ├── data/           # Extend with demos.ts and patterns.ts
│   └── registry.ts     # Extend with demo/pattern methods
├── demo-provider/      # New - demo content management
├── pattern-provider/   # New - pattern data management
└── mcp/               # Existing - extend server with new tools
    └── server.ts      # Add new MCP tools for demos and patterns

tests/
├── contract/          # New tool contracts
├── integration/       # Demo/pattern integration tests
└── unit/             # Unit tests for new providers
```

**Structure Decision**: Option 1 (extending existing single project structure)

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - Research Cloudscape demos repository structure and data formats
   - Investigate cloudscape.design/patterns API or scraping approach
   - Analyze integration patterns with existing FastMCP tools
   - Review existing component data model for extension points

2. **Generate and dispatch research agents**:
   ```
   Task: "Research Cloudscape demos repository structure for data extraction"
   Task: "Investigate cloudscape.design/patterns data access methods"
   Task: "Analyze existing MCP server tools for consistent API patterns"
   Task: "Review existing component registry for demo/pattern integration"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [data access approach chosen]
   - Rationale: [why this method works best]
   - Alternatives considered: [other approaches evaluated]

**Output**: research.md with all technical approaches resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - Demo entity (component reference, demo content, variations)
   - Pattern entity (category, description, usage guidelines, examples)
   - Pattern Category entity (name, description, pattern list)
   - Integration with existing Component entity

2. **Generate API contracts** from functional requirements:
   - get_component_demos: Retrieve demo content for component
   - search_patterns: Search patterns by category/keyword  
   - get_pattern_details: Get detailed pattern information
   - get_pattern_categories: List all pattern categories
   - Output OpenAPI schemas to `/contracts/`

3. **Generate contract tests** from contracts:
   - Test each new MCP tool contract
   - Assert request/response schemas match
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Demo access integration test
   - Pattern search integration test
   - Component-demo relationship test

5. **Update CLAUDE.md incrementally**:
   - Add demo and pattern provider information
   - Update MCP tools documentation
   - Preserve existing project context
   - Keep under 150 lines for token efficiency

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, CLAUDE.md

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs
- Each new MCP tool → contract test task [P]
- Each provider (demo, pattern) → creation task [P]
- Each data file (demos.ts, patterns.ts) → task
- Integration tests for demo-component relationships

**Ordering Strategy**:
- TDD order: Contract tests → Integration tests → Implementation
- Dependency order: Data structures → Providers → MCP tools
- Mark [P] for parallel execution (independent providers)

**Estimated Output**: 15-20 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

No constitutional violations identified - extending existing architecture patterns.

## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [ ] Phase 0: Research complete (/plan command)
- [ ] Phase 1: Design complete (/plan command)
- [ ] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [ ] Post-Design Constitution Check: PASS
- [ ] All NEEDS CLARIFICATION resolved
- [ ] Complexity deviations documented

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*