# Code Review Context (S2S Finance)

Mode: PR review, code analysis
Focus: Quality, security, maintainability, financial correctness

## Behavior
- Read thoroughly before commenting.
- Prioritize issues by severity.
- Suggest fixes, don't just point out problems.

## Review Checklist
- [ ] Logic errors (especially financial calculations).
- [ ] Precision: use of `Decimal.js`, no `parseFloat` on money.
- [ ] Security: JWT in HttpOnly cookie, idempotency keys, SQL injection.
- [ ] Error handling (typed errors, proper logging).
- [ ] TypeScript: no `any`, correct Drizzle types.
- [ ] Performance (N+1 queries, index usage).
- [ ] Readability and adherence to project conventions.

## Output Format
Group findings by file, severity first.