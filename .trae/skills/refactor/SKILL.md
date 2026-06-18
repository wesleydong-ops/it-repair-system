---
name: refactor
description: Refactor code to improve structure and maintainability without changing behavior. Use when user asks to "refactor", "clean up", "improve code structure", or when code has duplications or poor organization.
---

# Refactor

Systematically improve code structure and maintainability without changing external behavior.

## Refactoring Principles

1. **Preserve Behavior**
   - Ensure functionality remains identical
   - Run tests before and after refactoring
   - Make small, incremental changes

2. **Identify Refactoring Opportunities**
   - Code duplication (DRY violations)
   - Long functions/methods
   - Complex conditional logic
   - Poor naming
   - Tight coupling
   - God classes/objects

3. **Common Refactoring Patterns**
   - Extract Function/Method
   - Extract Variable
   - Rename for clarity
   - Replace conditional with polymorphism
   - Extract interface/abstract class
   - Consolidate duplicate code

## Refactoring Process

1. **Understand Current Code**
   - Read and comprehend the code
   - Identify responsibilities and dependencies
   - Note any existing tests

2. **Plan the Refactoring**
   - Define the goal (reduce duplication, improve readability, etc.)
   - Identify specific changes needed
   - Consider impact on other code

3. **Execute Safely**
   - Make one change at a time
   - Verify behavior after each change
   - Keep commits atomic

4. **Validate**
   - Run all tests
   - Check for regressions
   - Verify the improvement goal was met

## Output Format

```markdown
## Refactoring Summary

### Changes Made
- Extracted `functionName` from `originalLocation`
- Renamed `oldName` to `newName` for clarity
- Removed duplicate logic in `file1.ts` and `file2.ts`

### Benefits
- Improved readability
- Reduced code duplication
- Better separation of concerns

### Files Modified
- `path/to/file1.ts`
- `path/to/file2.ts`

### Verification
- All existing tests pass
- No behavioral changes
```
