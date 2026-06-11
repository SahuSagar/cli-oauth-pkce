# TASK_11: CLI Login Command

## Description
Implement `democli login` command that orchestrates the full PKCE OAuth flow: generates verifier/challenge, starts callback server, opens browser, receives code, exchanges for token, and saves it.

## Acceptance Criteria
- [ ] Generates cryptographically secure verifier (32 bytes, base64url)
- [ ] Generates challenge from verifier (SHA256)
- [ ] Generates state param for CSRF protection (16 bytes, hex)
- [ ] Starts local HTTP callback server on random port
- [ ] Constructs authorization URL with all required params
- [ ] Opens browser to authorization URL using `open` package
- [ ] Prints user-friendly message: "Opening browser for authentication..."
- [ ] Waits for callback server to receive code + state
- [ ] Validates returned state matches generated state (CSRF check)
- [ ] Sends POST /oauth/token with code + verifier
- [ ] Handles token exchange errors gracefully
- [ ] Saves JWT to token file
- [ ] Closes callback server
- [ ] Prints success message: "✓ Authenticated as <email>"

## Files to Create
- `packages/cli/src/commands/login.ts`

## Files to Modify
- `packages/cli/src/index.ts` (register login command)

## Dependencies
- TASK_1 (Project Setup)
- TASK_2 (PKCE utilities)
- TASK_9 (Callback server)
- TASK_10 (Token file management)
- TASK_5, TASK_6 (Server approval/token endpoints)

## Pseudocode

```
async function login(options):
  verifier = generateVerifier()  // 32 bytes, base64url
  challenge = generateChallenge(verifier)
  state = crypto.randomBytes(16).toString('hex')
  
  { port, server } = startCallbackServer()
  
  authUrl = buildAuthorizationUrl({
    server_url: SERVER_URL,
    client_id: CLIENT_ID,
    redirect_uri: `http://127.0.0.1:${port}/callback`,
    code_challenge: challenge,
    state: state,
    response_type: 'code'
  })
  
  console.log('Opening browser for authentication...')
  open(authUrl)
  
  { code, state: returnedState } = await server.onCallback()
  
  if returnedState != state:
    throw 'CSRF check failed'
  
  response = POST /oauth/token {
    code,
    code_verifier: verifier,
    client_id: CLIENT_ID,
    redirect_uri: `http://127.0.0.1:${port}/callback`
  }
  
  if response.status != 200:
    throw response.error
  
  saveToken(response.access_token)
  
  user = decodeJWT(response.access_token)
  console.log(`✓ Authenticated as ${user.email}`)
```

## Authorization URL Format

```
GET https://server.example.com/oauth/authorize?
  client_id=democli&
  redirect_uri=http://127.0.0.1:54321/callback&
  code_challenge=<base64url(SHA256(verifier))>&
  code_challenge_method=S256&
  state=<16-byte-hex>&
  response_type=code&
  scope=openid%20profile
```

## Notes
- State param protects against CSRF attacks; must match on callback
- Verifier never sent to server (PKCE security property)
- Build authorization URL string manually or use URL constructor
- Use `open` package to open browser (cross-platform)
- Handle network errors, timeouts, and auth failures with clear messages
- Decode JWT to get email for success message (don't call /api/me yet)
