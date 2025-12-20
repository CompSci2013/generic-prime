---
description: Analyze Angular documentation coverage, circular dependencies, and module issues
argument-hint: [-all|-doc|-circular|-module|-gen|-help]
allowed-tools: Bash(python3:*)
---

# Compodoc Analysis Command

Execute compodoc analysis based on the provided flag.

## Available Flags

- **`-all`**: Run all analysis types (documentation, circular dependencies, module imports/exports)
- **`-doc`**: Analyze documentation coverage from `coverage.html` (default)
- **`-circular`**: Detect circular dependencies in TypeScript files
- **`-module`**: Analyze module declarations for import/export issues
- **`-gen`**: Regenerate Compodoc documentation in the container
- **`-help`**: Show detailed help message

## Task

Parse the command argument: `$ARGUMENTS`

If the argument is `-help`, show this detailed help documentation with all flags explained.

For all other flags (`-all`, `-doc`, `-circular`, `-module`, `-gen`), execute the Python analysis script:

```bash
python3 /home/odin/projects/generic-prime/scripts/compodoc-analyzer.py $ARGUMENTS
```

Run the Python script with the provided flag and display all output directly to the user. The script will:

- **For `-doc`**: Parse `coverage.html` and display documentation coverage metrics by type and layer
- **For `-circular`**: Scan TypeScript files for circular import dependencies
- **For `-module`**: Inspect `@NgModule` decorators for import/export anti-patterns
- **For `-all`**: Run all three analyses in sequence
- **For `-gen`**: Regenerate Compodoc inside the container using podman exec

Do not modify or summarize the script output—show it exactly as returned by the Python script.
