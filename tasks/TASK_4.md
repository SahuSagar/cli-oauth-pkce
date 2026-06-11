# TASK_4: Server Authorization Endpoint

## Description
Implement `GET /oauth/authorize` endpoint that validates client_id, redirect_uri, and code_challenge, then serves the login + consent HTML page.

## Acceptance Criteria
- [ ] Validates `client_id` matches configured value
- [ ] Validates `redirect_uri` host matches allowed origins (127.0.0.1 for dev)
- [ ] Validates `code_challenge` is present and non-empty
- [ ] Validates `response_type=code` is present
- [ ] Returns 400 with error message for invalid parameters
- [ ] Returns 200 with HTML form for valid requests
- [ ] HTML form includes hidden inputs for: code_challenge, state, redirect_uri, client_id

## Files to Create
- `packages/server/src/routes/authorize.ts`
- `packages/server/src/views/consent.html` (template)

## Files to Modify
- `packages/server/src/index.ts` (register route)

## Dependencies
- TASK_1 (Project Setup)
- TASK_3 (User utilities - for demo user data in page)

## Pseudocode

```
GET /oauth/authorize?client_id=democli&redirect_uri=...&code_challenge=...&state=...&response_type=code:
  if not client_id or client_id != EXPECTED:
    return 400 error
  
  if not redirect_uri or not isAllowedRedirectUri(redirect_uri):
    return 400 error
  
  if not code_challenge:
    return 400 error
  
  html = renderConsent({
    client_id,
    redirect_uri,
    code_challenge,
    state,
    scope: 'openid profile'
  })
  
  return 200 html
```

## HTML Form Structure

The consent.html should include:
- App name and brief description
- Scope list (e.g., "Read your profile information")
- Approve button (submits POST /oauth/approve)
- Hidden inputs for: code_challenge, state, redirect_uri, client_id, email (prefilled demo email)
- Simple CSS styling (no framework)

## Notes
- ALLOWED_REDIRECT_URIS validation: check host only, not port (CLI uses random port)
- For dev: allow `127.0.0.1`, `localhost`
- For prod (Railway): allow `https://127.0.0.1`
- HTML can be inline in the route or imported from a template file
- No React/framework; plain HTML/CSS/form submission
