# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a portfolio project demonstrating OAuth 2.0 Authorization Code flow with PKCE (Proof Key for Code Exchange). It consists of:
- **CLI tool** (`packages/cli`): A terminal application that authenticates users via browser-based OAuth
- **OAuth Server** (`packages/server`): Express app that handles authorization, token exchange, and a protected API

The entire flow is: user runs `democli login` → browser opens → user authenticates → local HTTP callback server receives code → CLI exchanges code for JWT → token saved locally.

## Architecture

### Monorepo Structure
- **Root**: pnpm workspaces (single `pnpm install` installs both packages)
- **packages/cli**: TypeScript CLI tool with `commander` for command parsing
- **packages/server**: Node.js/Express OAuth server with in-memory auth code store

### Key Flow
1. CLI generates PKCE pair (verifier + challenge) for security
2. CLI starts local HTTP server on random port, opens browser to authorization endpoint
3. User logs in (hardcoded: `sahil@demo.com` / `demo1234`)
4. Server generates auth code, stores with challenge, redirects to local callback
5. CLI receives code via callback, exchanges it with server using verifier
6. Server validates verifier against stored challenge, issues JWT
7. CLI saves JWT to `~/.config/democli/token.json`

### Security Properties
- **PKCE**: Verifier stays in CLI memory; only challenge sent to server
- **State param**: Prevents CSRF attacks; CLI validates on callback
- **Auth code one-time use**: Server deletes code after token exchange
- **Auth code expiry**: 60-second TTL
- **Protected routes**: `/api/me` validates Bearer token with 1-hour JWT expiry

## Development Commands

### Setup
```bash
pnpm install                   # Install all packages via workspaces
```

### Server Development
```bash
cd packages/server
pnpm dev                       # Start with ts-node-dev or tsx --watch (runs on :3000)
pnpm build                     # Compile TypeScript
pnpm start                     # Run compiled version
pnpm test                      # Run tests if available
```

### CLI Development
```bash
cd packages/cli
pnpm build                     # Compile TypeScript
pnpm dev                       # Run with ts-node in watch mode
node dist/index.js login       # Test login command locally
node dist/index.js whoami      # Test whoami command
node dist/index.js logout      # Test logout command
```

### Environment Variables (Server)
Create `.env` in `packages/server`:
```
PORT=3000
JWT_SECRET=local-dev-secret-change-this
CLIENT_ID=democli
ALLOWED_REDIRECT_URIS=http://127.0.0.1
```

The `ALLOWED_REDIRECT_URIS` validation should match the host only (not port), since CLI picks random port each run.

## Code Organization

### Server (`packages/server/src`)
- **index.ts**: Express app setup, middleware, port binding
- **routes/**: Endpoint handlers
  - `authorize.ts`: `GET /oauth/authorize` — validates client_id, redirect_uri, code_challenge; serves login+consent HTML
  - `approve.ts`: `POST /oauth/approve` — processes login form; generates and stores auth code; redirects to callback
  - `token.ts`: `POST /oauth/token` — PKCE verification, JWT issuance
  - `me.ts`: `GET /api/me` — protected endpoint, validates Bearer token
- **lib/**: Shared utilities
  - `pkce.ts`: `verifyPKCE(verifier, storedChallenge)` using SHA256
  - `jwt.ts`: JWT signing/verification helpers using `jsonwebtoken`
  - `store.ts`: In-memory `Map<code, { code_challenge, expires_at, redirect_uri, client_id, user_id }>`
  - `user.ts`: Hardcoded demo user object
- **views/**: HTML templates
  - `consent.html`: Login + consent page (no framework; inline HTML string)

### CLI (`packages/cli/src`)
- **index.ts**: Commander setup, command registration
- **commands/**: Command implementations
  - `login.ts`: Full PKCE flow (generates verifier/challenge, starts local server, opens browser, exchanges code)
  - `whoami.ts`: Reads token, calls `/api/me`, prints user info
  - `logout.ts`: Deletes token file
- **lib/**: Shared utilities
  - `pkce.ts`: `generateVerifier()`, `generateChallenge(verifier)`
  - `callback.ts`: Local HTTP server for receiving OAuth callback
  - `token.ts`: Save/read token from `~/.config/democli/token.json`
  - `config.ts`: `SERVER_URL`, `CLIENT_ID` constants

## Key Implementation Details

### PKCE Verification
```ts
import crypto from 'crypto';
function verifyPKCE(verifier: string, storedChallenge: string): boolean {
  const hash = crypto.createHash('sha256').update(verifier).digest();
  const challenge = hash.toString('base64url');
  return challenge === storedChallenge;
}
```

### Auth Code Storage
In-memory `Map` with expiry cleanup:
```ts
type AuthCodeEntry = {
  code_challenge: string;
  expires_at: number;        // Date.now() + 60_000
  redirect_uri: string;
  client_id: string;
  user_id: string;
}
```

### Token Storage (CLI)
```json
~/.config/democli/token.json
{
  "access_token": "eyJhbGci...",
  "saved_at": 1718000000000
}
```
Use `os.homedir()` + `path.join()` for cross-platform paths.

## Testing Strategy

- **Server PKCE**: Test valid and invalid verifier/challenge pairs
- **Auth code expiry**: Test that expired codes are rejected
- **Protected route**: Test 401 without valid token
- **E2E flow**: Full login → whoami cycle locally before deployment

## Deployment

### Server → Railway
1. Push `packages/server` to GitHub
2. Connect to Railway, set root directory to `packages/server`
3. Set env vars: `JWT_SECRET`, `CLIENT_ID`, `ALLOWED_REDIRECT_URIS=https://127.0.0.1`
4. Railway auto-assigns subdomain (e.g., `democli-server.up.railway.app`)

### CLI → npm
1. Update `SERVER_URL` constant in CLI to Railway URL
2. Set `"bin": { "democli": "./dist/index.js" }` in package.json
3. `pnpm publish --access public`

## Non-Goals & Scope Limits

This is a **demo**, not production-ready. Explicitly out of scope:
- Rate limiting, brute force protection
- Real user database (one hardcoded user only)
- Refresh token rotation
- HTTPS on localhost (browsers allow plain HTTP for 127.0.0.1 per RFC 8252)
- Multiple OAuth clients or multi-tenant support
- Input sanitization beyond demo needs
- Security headers hardening

## Success Criteria

- [ ] `democli login` opens browser, authenticates, saves token end-to-end on localhost
- [ ] `democli whoami` returns user data with saved token
- [ ] Intercepted auth code (without verifier) is rejected
- [ ] Server deployed on Railway, CLI published to npm
- [ ] `npx @sahil/democli login` works from clean machine
- [ ] README explains PKCE in plain English with analogies

## Important Notes for Future Work

- **Hardcoded demo user**: `sahil@demo.com` / `demo1234` — plaintext fine for demo, flag in README
- **In-memory store**: Not persistent; auth codes lost on server restart (acceptable for demo)
- **Consent page styling**: Plain HTML/CSS; make it look intentional but don't over-engineer
- **State validation**: Implement CSRF protection via state param in both CLI and server
- **Error messages**: CLI should provide helpful feedback on auth failures
