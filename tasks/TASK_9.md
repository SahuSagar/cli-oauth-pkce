# TASK_9: CLI Callback Server

## Description
Implement local HTTP server that listens for the OAuth callback. Extracts authorization code and state from query params, validates state, and returns simple success/failure response to browser.

## Acceptance Criteria
- [ ] Creates HTTP server on random available port (127.0.0.1)
- [ ] Exposes `startCallbackServer()` that returns promise with code + state
- [ ] Listens on `/callback` endpoint
- [ ] Extracts `code` and `state` from query params
- [ ] Returns 200 HTML response on success
- [ ] Returns 400 if code/state missing
- [ ] Server auto-closes after receiving callback
- [ ] Resolves promise with extracted code and state
- [ ] Rejects promise on error (timeout, invalid request)

## Files to Create
- `packages/cli/src/lib/callback.ts`

## Files to Modify
- None

## Dependencies
- TASK_1 (Project Setup)

## Pseudocode

```
async function startCallbackServer():
  server = http.createServer(requestHandler)
  
  return new Promise((resolve, reject) => {
    server.listen(0, '127.0.0.1', () => {
      port = server.address().port
      resolve({ port, server })
    })
    
    // timeout after 5 minutes
    setTimeout(() => reject('Timeout'), 300_000)
  })

function requestHandler(req, res):
  if req.url not startsWith('/callback'):
    res.writeHead(404)
    res.end()
    return
  
  url = new URL(req.url, 'http://localhost')
  code = url.searchParams.get('code')
  state = url.searchParams.get('state')
  
  if not code or not state:
    res.writeHead(400)
    res.end('Missing code or state')
    return
  
  res.writeHead(200)
  res.end(successHtml)
  server.close()
  
  emit event or resolve promise with { code, state }
```

## Success Response HTML

```html
<!DOCTYPE html>
<html>
  <head><title>Authentication Successful</title></head>
  <body>
    <h1>✓ Authentication Successful</h1>
    <p>You can close this window and return to your terminal.</p>
  </body>
</html>
```

## Notes
- Use Node.js built-in `http` module (no external dependencies)
- Port 0 = OS assigns random available port
- Extract port from `server.address().port` after listening
- Return port so CLI can build the authorization URL
- Close server immediately after receiving callback (one-time use)
- Timeout after ~5 minutes to avoid hanging processes
