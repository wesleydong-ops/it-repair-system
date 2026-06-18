---
name: unit-test
description: Write and run unit tests for code. Use when user asks to write tests, mentions "test this function", or when adding new functionality that needs test coverage.
---

# Unit Test

Write comprehensive unit tests for functions, components, and modules.

## Testing Strategy

1. **Identify Test Targets**
   - Pure functions and utilities
   - API endpoints and handlers
   - Vue components
   - Business logic modules

2. **Test Structure (AAA Pattern)**
   - **Arrange**: Set up test data and preconditions
   - **Act**: Execute the code being tested
   - **Assert**: Verify the expected outcome

3. **Test Categories**
   - Happy path (normal cases)
   - Edge cases (boundary values, empty inputs)
   - Error cases (invalid inputs, exceptions)
   - Integration points (API calls, database)

## Vue Component Testing

```typescript
import { mount } from '@vue/test-utils'
import MyComponent from './MyComponent.vue'

describe('MyComponent', () => {
  it('renders correctly', () => {
    const wrapper = mount(MyComponent)
    expect(wrapper.exists()).toBe(true)
  })

  it('handles user interaction', async () => {
    const wrapper = mount(MyComponent)
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })
})
```

## API Testing

```typescript
import request from 'supertest'
import app from './server'

describe('API Endpoints', () => {
  it('GET /api/users returns user list', async () => {
    const response = await request(app).get('/api/users')
    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
  })
})
```

## Best Practices

- One test file per source file
- Descriptive test names
- Isolate tests (no shared state)
- Mock external dependencies
- Aim for 80%+ coverage on critical paths

## Output Format

```markdown
## Test Coverage

### Tests Written
- `path/to/test.spec.ts`: X tests covering Y scenarios

### Coverage Summary
- Functions tested: X/Y
- Edge cases covered: X
- Error scenarios: X

### Running Tests
```bash
npm run test
# or
npm run test:coverage
```
```
