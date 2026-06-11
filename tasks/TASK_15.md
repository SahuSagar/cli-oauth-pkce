# TASK_15: End-to-End Testing & Local Verification

## Description
Test the complete OAuth flow locally before deployment. Verify server startup, authorization, token exchange, and protected API access. Test error cases (invalid credentials, expired tokens, PKCE mismatch).

## Acceptance Criteria
- [ ] Server starts on :3000 without errors
- [ ] CLI builds without TypeScript errors
- [ ] `democli login` opens browser successfully
- [ ] Login form accepts demo credentials (sahil@demo.com / demo1234)
- [ ] Browser redirects to callback URL with auth code
- [ ] CLI receives code and exchanges it for token
- [ ] Token saved to `~/.config/democli/token.json`
- [ ] `democli whoami` displays user info from /api/me
- [ ] `democli logout` removes token file
- [ ] Invalid credentials (wrong password) rejected with 401
- [ ] Missing PKCE verifier results in token exchange failure
- [ ] Expired token (manually set JWT exp) returns 401 from /api/me
- [ ] PKCE verification fails when verifier doesn't match challenge

## Test Scenarios

### Happy Path
1. Start server: `cd packages/server && pnpm dev`
2. Build CLI: `cd packages/cli && pnpm build`
3. Run login: `node packages/cli/dist/index.js login`
4. Authorize in browser
5. Check token saved: `cat ~/.config/democli/token.json`
6. Run whoami: `node packages/cli/dist/index.js whoami`
7. Run logout: `node packages/cli/dist/index.js logout`

### Error Cases
1. Invalid credentials: Try password "wrong" on authorize page
2. Expired token: Manually edit token.json to set past expiry, run whoami
3. PKCE mismatch: (Manual test via curl)
4. Missing code in callback: Interrupt flow

## Files to Create
- None (testing is manual + optional automated test suite)

## Files to Modify
- None

## Dependencies
- TASK_8 (Server setup)
- TASK_11, TASK_12, TASK_13, TASK_14 (All CLI commands)

## Manual Testing Checklist

```
Server:
  [ ] npm install works
  [ ] .env file created
  [ ] pnpm dev starts server on :3000
  [ ] Server logs startup message
  [ ] GET http://localhost:3000/oauth/authorize?... loads consent page

CLI Login Flow:
  [ ] democli login runs without errors
  [ ] Browser opens to authorization URL
  [ ] Authorization page loads with form
  [ ] Demo user email is prefilled
  [ ] Password field accepts input
  [ ] Approve button works
  [ ] Browser redirects with code and state params
  [ ] Success page displays in browser
  [ ] CLI shows success message with user email
  [ ] Token file created at ~/.config/democli/token.json
  [ ] Token contains valid JWT

CLI Whoami:
  [ ] democli whoami loads token
  [ ] whoami calls /api/me successfully
  [ ] User name and email displayed
  [ ] Not logged in message if no token

CLI Logout:
  [ ] democli logout succeeds
  [ ] Token file deleted
  [ ] whoami shows "not logged in" after logout

Error Cases:
  [ ] Invalid password rejected
  [ ] Missing code in callback handled
  [ ] Invalid token rejected by /api/me
  [ ] PKCE mismatch rejected at /oauth/token
```

## Notes
- Manual testing is sufficient for a demo project
- Automated integration tests (optional) would need test server and fixtures
- Use real browser to test authorization page rendering
- Check browser DevTools for any console errors during callback
- Verify token file permissions (should be 0o600, readable by user only)
