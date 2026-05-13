# Skill: GitNexus Debugging

Use this skill to systematically root-cause runtime errors and pipeline failures.

## Instructions

1. **Map the Error**: Extract the failing function or component name from the stack trace.
2. **Contextualize**: Call `gitnexus_context({ name: "failingSymbol" })` to inspect state expectations and caller parameter injections.
3. **Analyze Upstream Flow**: Verify if upstream transformations satisfy downstream interfaces before suggesting patches.
