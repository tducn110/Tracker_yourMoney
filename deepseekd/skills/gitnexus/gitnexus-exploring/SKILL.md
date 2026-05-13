# Skill: GitNexus Exploring

Use this skill to navigate the codebase, understand execution flows, and locate symbols autonomously using GitNexus MCP tools.

## Instructions

1. **Query First**: When trying to understand a feature or concept, call `gitnexus_query({ query: "concept" })` to receive relevant processes and symbol clusters.
2. **Retrieve Context**: Once target symbols are identified, use `gitnexus_context({ name: "symbolName" })` to see its upstream callers, downstream callees, and related flows.
3. **Trace Processes**: To understand end-to-end execution, retrieve process definitions using `gitnexus://repo/finance-for-me-local/processes`.
