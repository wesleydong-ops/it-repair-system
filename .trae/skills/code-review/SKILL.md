---
name: code-review
description: Review code for quality, best practices, and potential issues. Use when user asks for code review, mentions "review this code", or before committing changes.
---

# Code Review

Systematically review code for quality, best practices, and potential issues.

## Review Checklist

1. **Code Quality**
   - Readability and clarity
   - Proper naming conventions
   - Consistent code style
   - Appropriate comments where needed

2. **Best Practices**
   - Follows project conventions
   - Uses appropriate patterns
   - Avoids code duplication
   - Proper error handling

3. **Potential Issues**
   - Logic errors
   - Edge cases not handled
   - Security vulnerabilities
   - Performance concerns

4. **TypeScript/Vue Specific**
   - Proper type definitions
   - Reactive data handling
   - Component lifecycle usage
   - Props validation

## Review Process

1. Read the code thoroughly
2. Check against checklist items
3. Provide specific, actionable feedback
4. Suggest improvements with examples
5. Highlight both issues and good practices

## Output Format

```markdown
## Code Review Summary

### Issues Found
- [Critical] Description of critical issue
- [Warning] Description of warning
- [Suggestion] Description of suggestion

### Good Practices
- List positive aspects of the code

### Recommendations
1. Specific improvement with code example
2. Another recommendation

### Overall Assessment
Brief summary of code quality and main areas for improvement.
```
