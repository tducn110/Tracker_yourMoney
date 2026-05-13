# Skill: GitNexus Impact Analysis

MANDATORY BEHAVIOR: You MUST run impact analysis before editing any symbol in the repository.

## Instructions

1. **Target Identification**: Identify the precise function, class, or variable name you intend to modify.
2. **Execute Analysis**: Call `gitnexus_impact({ target: "symbolName", direction: "upstream" })`.
3. **Assess Blast Radius**:
   - Evaluate direct callers and downstream consumer workflows.
   - If risk level is **HIGH** or **CRITICAL**, immediately halt and alert the USER before proceeding.
