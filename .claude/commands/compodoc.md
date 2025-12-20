# Compodoc Documentation & Code Analysis
#
# Analyze Angular application documentation coverage, circular dependencies, and module issues
# NOTE: Compodoc regeneration runs inside the generic-prime-dev container
#
# USAGE:
#   /compodoc              - Default: show documentation coverage analysis (same as -doc flag)
#   /compodoc -doc         - Analyze documentation coverage from coverage.html
#   /compodoc -circular    - Detect circular dependencies in the codebase
#   /compodoc -module      - Analyze module declarations for import/export issues
#   /compodoc -all         - Run all analysis types (-doc, -circular, -module)
#   /compodoc -gen         - Regenerate Compodoc documentation (runs in container)
#   /compodoc -help        - Show this help message
#
# FLAGS EXPLAINED:
#
#   -doc         Extract and analyze documentation coverage from frontend/documents/coverage.html
#                - Show all 118 documented/undocumented items
#                - Display coverage by component type (component, interface, injectable, class)
#                - Show undocumented items (0% coverage)
#                - Show partially documented items (1-99% coverage)
#                - Break down by layer (Framework, Domain, Features)
#                - Recommend priority items for documentation
#                - Runs on host (no container needed)
#
#   -circular    Detect and report circular dependencies in TypeScript files
#                - Scan frontend/src directory for import cycles
#                - Group by severity and affected modules
#                - Suggest refactoring patterns to break cycles
#                - Check for service-to-service dependencies that create cycles
#                - Report component-to-component circular dependencies
#                - Runs on host (no container needed)
#
#   -module      Analyze module imports/exports for configuration issues
#                - Find modules listed in both imports and exports (anti-pattern)
#                - Detect re-export of third-party dependencies (discouraged)
#                - Identify barrel modules vs regular modules
#                - Check for proper explicit imports (not re-export reliance)
#                - Flag modules that might be accidentally re-exported
#                - Report by file with specific line numbers
#                - Runs on host (no container needed)
#
#   -all         Run complete analysis (-doc + -circular + -module)
#                - Full diagnostic report
#                - Prioritized action items
#                - Summary statistics across all checks
#                - Runs on host (no container needed)
#
#   -gen         Regenerate Compodoc documentation
#                - CONTAINER OPERATION: Runs inside generic-prime-dev container
#                - Sequence:
#                  1. podman exec -it generic-prime-dev bash
#                  2. cd /app/frontend
#                  3. rm -fr documents/
#                  4. npm run build:doc
#                  5. npm run compodoc
#                - Updates frontend/documents/ directory with new coverage metrics
#                - Takes ~30-60 seconds to complete (includes npm tasks)
#                - REQUIRES: Container must be running and have dependencies installed
#
#   -help        Display this help message with all flag descriptions
#
# EXAMPLES:
#
#   # Analyze only documentation coverage
#   /compodoc -doc
#
#   # Find circular dependency issues in the codebase
#   /compodoc -circular
#
#   # Check module imports/exports for accidental re-exports
#   /compodoc -module
#
#   # Run all checks at once
#   /compodoc -all
#
#   # Regenerate Compodoc inside container
#   /compodoc -gen
#   (Wait 30-60 seconds for container npm tasks to complete)
#
#   # Regenerate then analyze coverage
#   /compodoc -gen
#   /compodoc -doc
#
#   # Manual regeneration (without /compodoc command):
#   podman exec -it generic-prime-dev bash
#   cd /app/frontend
#   rm -fr documents/
#   npm run build:doc
#   npm run compodoc
#
# OUTPUT:
#
#   Documentation Coverage (-doc):
#     - Overall statistics (total items, fully documented, partially documented, undocumented)
#     - Breakdown by type (components, interfaces, injectables, classes)
#     - Breakdown by layer (framework services, domain config, features)
#     - List of 0% coverage items with recommendations
#     - List of partial coverage items (1-99%)
#     - Priority matrix for documentation work
#
#   Circular Dependencies (-circular):
#     - All detected import cycles with import paths
#     - Severity levels (critical, high, medium, low)
#     - Suggested refactoring patterns
#     - Module relationship diagram
#     - Import chain visualization
#
#   Module Analysis (-module):
#     - Files with both imports and exports of same module
#     - Specific line numbers and identifiers
#     - Suggested fixes for each issue
#     - Module re-export summary
#     - Best practice violations
#
# RELATED DOCUMENTATION:
#
#   - /bootstrap        - Initialize session with project context
#   - PROJECT-STATUS.md - Current state and known issues
#   - MODULE-ARCHITECTURE-AUDIT.md - Detailed module anti-pattern documentation
#
# NOTES:
#
#   - Documentation coverage data comes from frontend/documents/coverage.html
#   - Compodoc regeneration requires npm and TypeScript dependencies
#   - Circular dependency detection uses AST parsing of .ts files
#   - Module analysis inspects @NgModule decorators and export statements
#   - All analysis is read-only (no modifications to source code)
#   - Results are displayed in the Claude Code terminal
#
# COMMAND IMPLEMENTATION:
#
# This command triggers Claude Code agent to:
# 1. Parse command flags from user input
# 2. Execute appropriate analysis based on flag:
#    - Host-side analysis (-doc, -circular, -module): Direct Python script execution
#    - Container operation (-gen): Podman exec into generic-prime-dev container
# 3. Extract appropriate data (coverage.html, AST analysis, module inspection)
# 4. Format results with tables, metrics, and recommendations
# 5. Display actionable insights for developers
#
# The agent has access to:
# - Bash tool for executing podman commands and Compodoc regeneration
# - Python tool for running compodoc-analyzer.py analysis scripts
# - Read tool for analyzing coverage.html and source files
# - Grep tool for searching import/export statements
# - Glob tool for finding TypeScript files
#
# CONTAINER OPERATIONS (-gen flag):
# When -gen flag is used, the agent:
# 1. Runs: podman exec -it generic-prime-dev bash -c "cd /app/frontend && rm -fr documents/"
# 2. Runs: podman exec generic-prime-dev npm run build:doc
# 3. Runs: podman exec generic-prime-dev npm run compodoc
# 4. Waits for container operations to complete (~30-60 seconds)
# 5. Confirms frontend/documents/ directory has been updated
# 6. Displays success message with timestamp
#
# HOST OPERATIONS (-doc, -circular, -module flags):
# - Execute immediately without container
# - Use compodoc-analyzer.py Python script
# - Read from already-generated frontend/documents/coverage.html
# - No npm or npm dependencies required
