---
name: bug-fix
description: Systematically debug and fix bugs in code. Use when user reports a bug, mentions "fix this error", or when encountering unexpected behavior.
---

# Bug Fix

Systematic approach to debugging and fixing bugs.

## Debugging Process

1. **Reproduce the Bug**
   - Understand the exact steps to reproduce
   - Identify the environment and conditions
   - Confirm the expected vs actual behavior

2. **Isolate the Issue**
   - Check error messages and stack traces
   - Use console.log/debugger to trace execution
   - Identify the specific file and line causing the issue

3. **Root Cause Analysis**
   - Determine why the bug occurs
   - Check related code and dependencies
   - Look for similar patterns in the codebase

4. **Implement Fix**
   - Make minimal, targeted changes
   - Follow project conventions
   - Ensure fix doesn't break other functionality

5. **Verify Fix**
   - Test the original bug scenario
   - Check edge cases
   - Run related tests if available

## Common Bug Categories

- **API/Network Issues**: Check endpoints, request/response format, authentication
- **State Management**: Verify reactive data, component state, props
- **Logic Errors**: Review conditions, loops, calculations
- **UI/Rendering**: Check CSS, component lifecycle, event handlers

## Output Format

```markdown
## Bug Analysis

### Issue Description
Brief description of the bug

### Root Cause
Explanation of why the bug occurs

### Fix Applied
Description of changes made

### Files Modified
- `path/to/file.ts`: Description of change

### Verification
Steps to verify the fix works
```
