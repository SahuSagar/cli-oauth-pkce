# TASK_6: Server Token Exchange Endpoint

## Description
Implement `POST /oauth/token` endpoint that exchanges an auth code + PKCE verifier for a JWT. Core logic: verify code exists and hasn't expired, verify PKCE (verifier matches stored challenge), delete code (one-time use), issue JWT.

## Acceptance Criteria
- [ ] Accepts POST with JSON: `{ code, code_verifier, client_id, redirect_uri }`
- [ ] Returns 400 if code not found or expired
- [ ] Returns 400 if PKCE verification fails (verifier doesn't match challenge)
- [ ] Returns 400 if redirect_uri doesn't match stored value
- [ ] Returns 400 if client_id doesn't match stored value
- [ ] Deletes auth code after successful exchange (one-time use enforcement)
- [ ] Issues JWT with sub, email, name, exp claims
- [ ] Returns 200 with JSON: `{ access_token, token_type: "Bearer", expires_in: 3600 }`

## Files to Create
- `packages/server/src/routes/token.ts`

## Files to Modify
- `packages/server/src/index.ts` (register route)

## Dependencies
- TASK_1 (Project Setup)
- TASK_2 (PKCE verification utilities)
- TASK_3 (JWT signing, AuthCodeStore)
- TASK_5 (Approval endpoint - stores auth codes)

## Pseudocode

```
POST /oauth/token:
  { code, code_verifier, client_id, redirect_uri } = req.body
  
  entry = store.retrieve(code)
  if not entry:
    return 400 'Invalid or expired code'
  
  if entry.client_id != client_id:
    return 400 'Client ID mismatch'
  
  if entry.redirect_uri != redirect_uri:
    return 400 'Redirect URI mismatch'
  
  if not verifyPKCE(code_verifier, entry.code_challenge):
    return 400 'PKCE verification failed'
  
  user = getUserById(entry.user_id)
  jwt = signJWT({
    sub: user.id,
    email: user.email,
    name: user.name
  })
  
  return 200 {
    access_token: jwt,
    token_type: 'Bearer',
    expires_in: 3600
  }
```

## Notes
- PKCE verification happens AFTER code validity checks
- Auth code is deleted by store.retrieve() automatically (one-time use)
- JWT expiry: 1 hour (3600 seconds)
- Return 400 with descriptive error messages for all failure cases
- Validate all 4 params (code, verifier, client_id, redirect_uri) before proceeding
