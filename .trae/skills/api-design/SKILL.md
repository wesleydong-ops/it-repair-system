---
name: api-design
description: Design RESTful APIs with proper structure, naming, and documentation. Use when user asks to "design API", "create endpoint", or when building new backend functionality.
---

# API Design

Design clean, consistent, and well-documented RESTful APIs.

## API Design Principles

1. **RESTful Conventions**
   - Use nouns for resources (e.g., `/users`, `/orders`)
   - Use HTTP methods correctly (GET, POST, PUT, DELETE)
   - Proper status codes (200, 201, 400, 404, 500)
   - Stateless communication

2. **Naming Standards**
   - Plural nouns for collections: `/api/users`
   - Singular for single resources: `/api/users/:id`
   - Nested resources for relationships: `/api/users/:id/orders`
   - Query parameters for filtering: `/api/users?role=engineer`

3. **Request/Response Structure**
   - Consistent JSON format
   - Include success/error indicators
   - Pagination for lists
   - Meaningful error messages

## API Endpoint Template

```typescript
// GET - List resources
app.get('/api/resources', authenticateToken, (req, res) => {
  const { page = 1, size = 10, filter } = req.query
  // Fetch and return paginated data
  res.json({
    success: true,
    data: resources,
    total: totalCount,
    page: Number(page),
    size: Number(size)
  })
})

// GET - Single resource
app.get('/api/resources/:id', authenticateToken, (req, res) => {
  const resource = findById(req.params.id)
  if (!resource) {
    return res.status(404).json({ success: false, message: 'Not found' })
  }
  res.json({ success: true, data: resource })
})

// POST - Create resource
app.post('/api/resources', authenticateToken, (req, res) => {
  const { name, description } = req.body
  // Validate input
  const newResource = createResource({ name, description })
  res.status(201).json({ success: true, data: newResource })
})

// PUT - Update resource
app.put('/api/resources/:id', authenticateToken, (req, res) => {
  const { id } = req.params
  const updates = req.body
  const updated = updateResource(id, updates)
  res.json({ success: true, data: updated })
})

// DELETE - Remove resource
app.delete('/api/resources/:id', authenticateToken, (req, res) => {
  deleteResource(req.params.id)
  res.json({ success: true, message: 'Deleted successfully' })
})
```

## Error Handling

```typescript
// Standard error response format
{
  success: false,
  message: 'Error description',
  code: 'ERROR_CODE' // Optional
}

// Validation errors
{
  success: false,
  message: 'Validation failed',
  errors: [
    { field: 'email', message: 'Invalid email format' }
  ]
}
```

## Documentation Format

```markdown
## API Endpoint: [Method] /api/path

### Description
Brief description of what this endpoint does

### Authentication
Required: Yes/No

### Request
**Headers:**
- `Authorization: Bearer <token>` (if required)

**Parameters:**
- `param1` (string, required): Description
- `param2` (number, optional): Description

**Body (for POST/PUT):**
```json
{
  "field1": "value1",
  "field2": "value2"
}
```

### Response
**Success (200/201):**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error (400/404/500):**
```json
{
  "success": false,
  "message": "Error description"
}
```

### Example
```bash
curl -X GET http://localhost:8080/api/users \
  -H "Authorization: Bearer token123"
```
```

## Best Practices

- Version APIs when making breaking changes (`/api/v1/users`)
- Use HTTPS in production
- Implement rate limiting
- Log all API requests/responses
- Validate all input data
- Use middleware for authentication and error handling
