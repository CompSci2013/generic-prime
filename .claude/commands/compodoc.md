# Compodoc Documentation & Code Analysis
#
# Analyze Angular application documentation coverage, circular dependencies, and module issues
#
# USAGE:
#   /compodoc              - Default: show documentation coverage analysis (same as -doc flag)
#   /compodoc -doc         - Analyze documentation coverage from coverage.html
#   /compodoc -circular    - Detect circular dependencies in the codebase
#   /compodoc -module      - Analyze module declarations for import/export issues
#   /compodoc -all         - Run all analysis types (-doc, -circular, -module)
#   /compodoc -gen         - Regenerate Compodoc documentation
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
#
#   -circular    Detect and report circular dependencies in TypeScript files
#                - Scan frontend/src directory for import cycles
#                - Group by severity and affected modules
#                - Suggest refactoring patterns to break cycles
#                - Check for service-to-service dependencies that create cycles
#                - Report component-to-component circular dependencies
#
#   -module      Analyze module imports/exports for configuration issues
#                - Find modules listed in both imports and exports (anti-pattern)
#                - Detect re-export of third-party dependencies (discouraged)
#                - Identify barrel modules vs regular modules
#                - Check for proper explicit imports (not re-export reliance)
#                - Flag modules that might be accidentally re-exported
#                - Report by file with specific line numbers
#
#   -all         Run complete analysis (-doc + -circular + -module)
#                - Full diagnostic report
#                - Prioritized action items
#                - Summary statistics across all checks
#
#   -gen         Regenerate Compodoc documentation
#                - Runs: npx compodoc -p tsconfig.json
#                - Updates frontend/documents/ directory
#                - Refreshes coverage metrics
#                - Takes ~5-10 seconds to run
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
#   # Regenerate docs then analyze coverage
#   /compodoc -gen
#   /compodoc -doc
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
# 2. Extract appropriate data (coverage.html, AST analysis, module inspection)
# 3. Format results with tables, metrics, and recommendations
# 4. Display actionable insights for developers
#
# The agent has access to:
# - Read tool for analyzing coverage.html and source files
# - Bash tool for running compodoc -p tsconfig.json
# - Grep tool for searching import/export statements
# - Glob tool for finding TypeScript files
# - Analysis Python scripts for circular dependency detection
