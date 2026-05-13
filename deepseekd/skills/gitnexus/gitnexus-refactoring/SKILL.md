# Skill: GitNexus Refactoring

Use this skill to perform graph-aware symbol extraction, splitting, and renaming securely.

## Instructions

1. **Avoid Plain Text Search/Replace**: Never rely on raw regex or plain text global find-and-replace for symbol renaming.
2. **Graph-Aware Renaming**: Invoke `gitnexus_rename` to safely update references across dependent files and imports.
3. **Verify Integrity**: Always call `gitnexus_detect_changes()` post-refactoring to guarantee no unintended code paths were severed.
