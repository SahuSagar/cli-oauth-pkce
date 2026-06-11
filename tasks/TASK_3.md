# TASK_3: Implement Auth Code Store & JWT Utilities (Server)

## Description
Create server-side utilities for managing auth codes and JWT tokens. Implement in-memory auth code storage with expiry, JWT signing/verification, and hardcoded demo user.

## Acceptance Criteria
- [ ] `AuthCodeStore` (Map-based) stores and retrieves auth codes with 60-second TTL
- [ ] Expired auth codes are deleted and rejected
- [ ] `signJWT(payload, secret)` creates signed tokens with 1-hour expiry
- [ ] `verifyJWT(token, secret)` validates and decodes tokens
- [ ] Hardcoded demo user object defined: `{ id, email, password, name }`
- [ ] Auth code entries include: code_challenge, expires_at, redirect_uri, client_id, user_id

## Files to Create
- `packages/server/src/lib/store.ts`
- `packages/server/src/lib/jwt.ts`
- `packages/server/src/lib/user.ts`

## Files to Modify
- None

## Dependencies
- TASK_1 (Project Setup)

## Pseudocode

```
class AuthCodeStore:
  codes = Map<string, AuthCodeEntry>
  
  store(code, entry):
    codes.set(code, entry)
  
  retrieve(code):
    entry = codes.get(code)
    if entry.expires_at < now():
      codes.delete(code)
      return null
    codes.delete(code)  // one-time use
    return entry
  
  cleanup():
    for each code in codes:
      if entry.expires_at < now():
        codes.delete(code)

function signJWT(payload, secret):
  return jwt.sign(payload, secret, { expiresIn: '1h' })

function verifyJWT(token, secret):
  return jwt.verify(token, secret)
```

## Code Snippet (Reference from PRD)

```ts
import jwt from 'jsonwebtoken';

const token = jwt.sign(
  { sub: 'user_1', email: 'sahil@demo.com', name: 'Sahil' },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);

const DEMO_USER = {
  id: 'user_1',
  email: 'sahil@demo.com',
  password: 'demo1234',
  name: 'Sahil',
};
```

## Notes
- AuthCodeEntry type: `{ code_challenge, expires_at, redirect_uri, client_id, user_id }`
- Cleanup interval recommended (optional): run every 30s to remove expired entries
- JWT payload should include: `sub` (user id), `email`, `name`, `iat`, `exp`
- Store should be instantiated once and reused across requests
