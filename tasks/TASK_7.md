# TASK_7: Server Protected API Endpoint

## Description
Implement `GET /api/me` endpoint that returns current user information. Validates Bearer token, decodes JWT, and returns user data.

## Acceptance Criteria
- [ ] Validates `Authorization: Bearer <token>` header is present
- [ ] Returns 401 if Authorization header missing
- [ ] Returns 401 if token invalid or expired
- [ ] Decodes JWT and extracts user claims
- [ ] Returns 200 with JSON user object: `{ id, email, name, ... }`
- [ ] No user lookup needed (info is in JWT claims)

## Files to Create
- `packages/server/src/routes/me.ts`

## Files to Modify
- `packages/server/src/index.ts` (register route, add auth middleware)

## Dependencies
- TASK_1 (Project Setup)
- TASK_3 (JWT verification)
- TASK_6 (Token endpoint - generates tokens)

## Pseudocode

```
GET /api/me:
  authHeader = req.headers.authorization  // "Bearer <token>"
  
  if not authHeader or not startsWith('Bearer '):
    return 401 'Missing Bearer token'
  
  token = authHeader.slice(7)  // remove "Bearer "
  
  try:
    claims = verifyJWT(token, JWT_SECRET)
  catch error:
    return 401 'Invalid or expired token'
  
  return 200 {
    id: claims.sub,
    email: claims.email,
    name: claims.name
  }
```

## Middleware Pattern

```
middleware authenticateToken:
  get Bearer token from Authorization header
  try to verify it
  attach user claims to req.user
  
can be reused on other protected routes
```

## Notes
- Bearer token format: `Authorization: Bearer eyJhbGci...`
- JWT claims come from the token itself (no database lookup needed)
- Use `jwt.verify()` which throws on expired/invalid tokens
- Return descriptive 401 messages for debugging
- This endpoint demonstrates token validation for CLI's `whoami` command
