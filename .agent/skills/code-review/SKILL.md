---
name: code-review
description: Inspect diffs for bugs, security vulnerabilities, edge cases, and style conventions.
---

# Code Review Process

1. Inspect modified files using `git diff HEAD~1` (or the requested target branch).
2. Check for:
   - **Bugs & Edge Cases**: Null/undefined pointers, unhandled exceptions, race conditions, off-by-one errors.
   - **Security**: Leaked secrets, injection risks, missing input validation.
   - **Performance**: Unnecessary allocations, N+1 queries, unindexed queries.
3. Group findings into:
   - `[BLOCKER]`: Critical defects that break functionality or introduce vulnerabilities.
   - `[IMPORTANT]`: High-priority logic flaws or performance problems.
   - `[SUGGESTION]`: Maintainability improvements or minor cleanups.
4. Do not apply fixes automatically; present your findings first and wait for approval.
