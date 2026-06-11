# TASK_5: Server Approval Endpoint

## Description
Implement `POST /oauth/approve` endpoint that processes login form submission, validates credentials against demo user, generates an auth code, stores it with PKCE challenge, and redirects to callback URL.

## Acceptance Criteria
- [ ] Accepts POST with form data: `{ email, password, code_challenge, state, redirect_uri, client_id }`
- [ ] Validates email/password against hardcoded demo user
- [ ] Returns 401 for invalid credentials
- [ ] Generates cryptographically secure random auth code (16+ bytes)
- [ ] Stores auth code with metadata: code_challenge, redirect_uri, client_id, user_id, expires_at (60s)
- [ ] Redirects browser to `redirect_uri?code=...&state=...` with 302 redirect
- [ ] Maintains state param through the flow (CSRF protection)

## Files to Create
- `packages/server/src/routes/approve.ts`

## Files to Modify
- `packages/server/src/index.ts` (register route)

## Dependencies
- TASK_1 (Project Setup)
- TASK_3 (AuthCodeStore, demo user)
- TASK_4 (Authorization endpoint - sets up the form)

## Pseudocode

```
POST /oauth/approve:
  { email, password, code_challenge, state, redirect_uri, client_id } = req.body
  
  if not validateCredentials(email, password):
    return 401 'Invalid credentials'
  
  authCode = generateSecureRandomCode()  // 32-byte base64url
  
  store.save(authCode, {
    code_challenge,
    redirect_uri,
    client_id,
    user_id: DEMO_USER.id,
    expires_at: now() + 60_000
  })
  
  callbackUrl = `${redirect_uri}?code=${authCode}&state=${state}`
  return redirect(302, callbackUrl)
```

## Code Logic

```
function generateSecureRandomCode():
  return crypto.randomBytes(32).toString('base64url')

function validateCredentials(email, password):
  return email === DEMO_USER.email && password === DEMO_USER.password
```

## Notes
- Auth code must be one-time use (deleted after successful token exchange in TASK_6)
- 60-second expiry is enforced both by TTL and checked during token exchange
- State param is passed through for CSRF protection; don't modify it
- Use form-urlencoded content type from HTML form submission
- Email/password in this demo are plaintext; note in README this is demo-only
