# TASK_12: CLI Whoami Command

## Description
Implement `democli whoami` command that reads saved token and calls protected `/api/me` endpoint to display current user information.

## Acceptance Criteria
- [ ] Reads token from `~/.config/democli/token.json`
- [ ] If no token exists, prints helpful error: "Not logged in. Run: democli login"
- [ ] Sends GET /api/me with `Authorization: Bearer <token>`
- [ ] Handles 401 Unauthorized (token expired/invalid)
- [ ] Handles network errors gracefully
- [ ] Parses JSON response and displays user info
- [ ] Formats output clearly: `Logged in as: <name> (<email>)`
- [ ] Returns exit code 0 on success, non-zero on error

## Files to Create
- `packages/cli/src/commands/whoami.ts`

## Files to Modify
- `packages/cli/src/index.ts` (register whoami command)

## Dependencies
- TASK_1 (Project Setup)
- TASK_10 (Token file management)
- TASK_7 (Server /api/me endpoint)

## Pseudocode

```
async function whoami(options):
  token = loadToken()
  
  if not token:
    console.log('Not logged in. Run: democli login')
    process.exit(1)
  
  try:
    response = GET /api/me {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  catch error:
    if error.statusCode == 401:
      console.error('Token expired or invalid. Run: democli login')
      process.exit(1)
    else:
      console.error(`Failed to fetch user info: ${error.message}`)
      process.exit(1)
  
  user = response.json()
  
  console.log()
  console.log(`Logged in as: ${user.name}`)
  console.log(`Email: ${user.email}`)
  console.log()
```

## Example Output

```
Logged in as: Sahil
Email: sahil@demo.com
```

## Notes
- Token file location should use same path logic as saveToken() / loadToken()
- HTTP client: use Node.js built-in `https` + `http` or `node-fetch` (if available)
- 401 response indicates token is invalid/expired; suggest `democli login` again
- Pretty-print user info (no JSON.stringify dumps)
- Handle missing token as non-error case (helpful message, exit code 1)
