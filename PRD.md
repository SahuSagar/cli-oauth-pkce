# PRD — CLI OAuth 2.0 + PKCE Demo

**Author:** Sahil  
**Status:** Draft  
**Type:** Portfolio / Learning project  
**Last updated:** June 2026

---

## 1. Overview

Build a working demo of the OAuth 2.0 Authorization Code flow with PKCE, implemented as three pieces: a CLI tool, an OAuth server, and a protected API. The goal is to demonstrate a real authentication pattern used by tools like `neonctl`, GitHub CLI, and Vercel CLI — where a terminal process authenticates a user through the browser without ever handling their password.

This is a portfolio project first. It should be clean, well-structured, and deployable — something that can be shown to interviewers or linked from a GitHub profile.

---

## 2. Problem being solved

Most developers learn OAuth from the browser-to-server perspective. The CLI-to-browser-to-server pattern — where a terminal process spins up a local HTTP server, opens a browser, and waits for a callback — is less commonly understood but widely used in production tooling. This project makes that pattern tangible and explorable.

---

## 3. Goals

- Build a CLI (`democli`) that authenticates via a browser-based OAuth + PKCE flow
- Build an OAuth 2.0 server that issues auth codes and JWTs
- Build a simple protected API that validates those JWTs
- Run the entire flow locally first, then deploy
- The demo should be runnable by anyone with `npx @sahil/democli login`

---

## 4. Non-goals

- Production security hardening (rate limiting, brute force protection, TLS termination)
- Real user database — one hardcoded demo user is enough
- Refresh token rotation
- Multiple OAuth clients or multi-tenant support
- Mobile or SPA OAuth flows

---

## 5. Architecture

```
packages/
  cli/        → democli — the terminal tool
  server/     → OAuth server + protected API (single Express app)
```

### Flow summary

1. User runs `democli login`
2. CLI generates `code_verifier` + `code_challenge` (PKCE pair)
3. CLI starts a local HTTP server on a random port (e.g. `54321`)
4. CLI opens browser to `https://your-server.com/oauth/authorize?...&code_challenge=...&redirect_uri=http://127.0.0.1:54321/callback`
5. User sees a login + consent page, enters credentials, clicks Approve
6. Server generates an auth code, stores it with the challenge, redirects browser to `http://127.0.0.1:54321/callback?code=...`
7. CLI's local server receives the callback, extracts the code
8. CLI sends `POST /oauth/token` with `{ code, code_verifier }` directly to the server
9. Server hashes the verifier, checks it matches the stored challenge, issues a signed JWT
10. CLI saves the JWT to `~/.config/democli/token.json`, shuts down local server
11. User runs `democli whoami` → CLI reads token, calls `GET /api/me`, prints user info

---

## 6. Components

### 6.1 OAuth server (`packages/server`)

**Runtime:** Node.js + TypeScript  
**Framework:** Express  
**Deploy target:** Railway (free tier)

#### Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/oauth/authorize` | Validates client_id, redirect_uri, code_challenge. Serves the login + consent HTML page. |
| `POST` | `/oauth/approve` | Receives login form (email + password). Validates against hardcoded user. Generates auth code. Stores `{ code, code_challenge, expires_at }` in memory (Map). Redirects browser to `redirect_uri?code=...&state=...`. |
| `POST` | `/oauth/token` | Receives `{ code, code_verifier, client_id, redirect_uri }`. Looks up stored code. Runs `SHA256(code_verifier) === stored_challenge`. If match, issues signed JWT. Deletes the code (one-time use). |
| `GET` | `/api/me` | Protected. Validates `Authorization: Bearer <token>`. Returns fake user JSON. |
| `GET` | `/.well-known/oauth-authorization-server` | Optional — returns server metadata (good for demo polish) |

#### PKCE verification (core logic)

```ts
import crypto from 'crypto';

function verifyPKCE(verifier: string, storedChallenge: string): boolean {
  const hash = crypto.createHash('sha256').update(verifier).digest();
  const challenge = hash.toString('base64url');
  return challenge === storedChallenge;
}
```

#### Auth code store

In-memory `Map` is fine for demo. Each entry:

```ts
type AuthCodeEntry = {
  code_challenge: string;
  expires_at: number;       // Date.now() + 60_000
  redirect_uri: string;
  client_id: string;
  user_id: string;
}
```

Entries are deleted on use, or expired by a cleanup interval.

#### JWT signing

Use `jsonwebtoken`. Sign with a `JWT_SECRET` env var.

```ts
const token = jwt.sign(
  { sub: 'user_1', email: 'sahil@demo.com', name: 'Sahil' },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);
```

#### Hardcoded demo user

```ts
const DEMO_USER = {
  id: 'user_1',
  email: 'sahil@demo.com',
  password: 'demo1234',   // plaintext fine for demo, note this in README
  name: 'Sahil',
};
```

#### Consent page

A plain HTML page served inline from Express. Shows app name, requested scopes, and an Approve button. No React, no bundler — just a `res.send(html)` string. Style it enough that it looks intentional.

---

### 6.2 CLI (`packages/cli`)

**Runtime:** Node.js + TypeScript  
**Package name:** `@sahil/democli` (or similar scoped name)  
**Publish target:** npm

#### Commands

**`democli login`**

Full PKCE flow. Steps:

1. Generate verifier: `crypto.randomBytes(32).toString('base64url')`
2. Generate challenge: `crypto.createHash('sha256').update(verifier).digest('base64url')`
3. Generate state: `crypto.randomBytes(16).toString('hex')` (CSRF protection)
4. Start local HTTP server on a random available port
5. Build the authorization URL with all params
6. `open(authUrl)` — opens the browser
7. Print `"Opening browser for authentication..."` to terminal
8. Await callback on local server
9. Validate state param matches
10. Extract `code` from callback query params
11. Send `POST /oauth/token` with `{ code, code_verifier, client_id, redirect_uri }`
12. Receive JWT, save to `~/.config/democli/token.json`
13. Close local server
14. Print `"✓ Authenticated as sahil@demo.com"`

**`democli whoami`**

1. Read token from `~/.config/democli/token.json`
2. If no token: print `"Not logged in. Run: democli login"`, exit
3. `GET /api/me` with `Authorization: Bearer <token>`
4. Print user info

**`democli logout`**

Delete `~/.config/democli/token.json`. Print `"Logged out."`.

#### Dependencies

```json
"dependencies": {
  "commander": "^12.x",
  "open": "^10.x"
}
```

`crypto` and `http` are Node built-ins — no install needed.

#### Token storage

```ts
// ~/.config/democli/token.json
{
  "access_token": "eyJhbGci...",
  "saved_at": 1718000000000
}
```

Use `os.homedir()` + `path.join` to resolve the config path cross-platform.

---

## 7. Security properties demonstrated

| Property | How it's shown |
|---|---|
| PKCE prevents auth code interception | Verifier never leaves CLI process memory |
| State param prevents CSRF | CLI validates state on callback |
| Auth codes are one-time use | Server deletes code after exchange |
| Auth codes expire | 60-second TTL, checked on token exchange |
| Tokens are scoped JWTs | `sub`, `email`, `exp` claims |
| Protected route validates token | `/api/me` returns 401 without valid Bearer |

---

## 8. Local development setup

```
# Root
npm install           # installs both packages via workspaces

# Terminal 1
cd packages/server
npm run dev           # ts-node-dev or tsx --watch, runs on :3000

# Terminal 2
cd packages/cli
npm run build         # tsc
node dist/index.js login
```

Environment variables for server (`.env`):

```
PORT=3000
JWT_SECRET=local-dev-secret-change-this
CLIENT_ID=democli
ALLOWED_REDIRECT_URIS=http://127.0.0.1
```

The `ALLOWED_REDIRECT_URIS` check should match any port on `127.0.0.1` — validate the host only, not the port, since the CLI picks a random port each run.

---

## 9. Deployment plan

### Server → Railway

1. Push `packages/server` to GitHub
2. Connect repo to Railway, set root directory to `packages/server`
3. Set env vars: `JWT_SECRET`, `CLIENT_ID`, `ALLOWED_REDIRECT_URIS=https://127.0.0.1`
4. Railway auto-assigns a subdomain: `democli-server.up.railway.app`

### CLI → npm

1. Update `SERVER_URL` constant in CLI from `http://localhost:3000` to Railway URL
2. Set `"bin": { "democli": "./dist/index.js" }` in `package.json`
3. `npm publish --access public`

Anyone can then run:
```bash
npx @sahil/democli login
```

---

## 10. Repo structure

```
democli/
  packages/
    server/
      src/
        index.ts          # Express app entry
        routes/
          authorize.ts    # GET /oauth/authorize
          approve.ts      # POST /oauth/approve
          token.ts        # POST /oauth/token
          me.ts           # GET /api/me
        lib/
          pkce.ts         # verifyPKCE()
          jwt.ts          # sign / verify helpers
          store.ts        # in-memory auth code Map
          user.ts         # hardcoded demo user
        views/
          consent.html    # login + approve page
      package.json
      tsconfig.json
    cli/
      src/
        index.ts          # commander setup
        commands/
          login.ts
          whoami.ts
          logout.ts
        lib/
          pkce.ts         # generateVerifier(), generateChallenge()
          callback.ts     # local HTTP server
          token.ts        # save / read token file
          config.ts       # SERVER_URL, CLIENT_ID constants
      package.json
      tsconfig.json
  package.json            # npm workspaces root
  README.md
```

---

## 11. README must-haves

- What this is and what it demonstrates (1 paragraph)
- Architecture diagram (can paste the ASCII one from this doc)
- Quick start: server setup + `npx @sahil/democli login`
- The PKCE explanation in plain English with the lock/key analogy
- Security properties table
- Note that this is a demo — list what's missing for production

---

## 12. Success criteria

- [ ] `democli login` opens browser, authenticates, saves token — end to end on localhost
- [ ] `democli whoami` returns user data using the saved token
- [ ] Intercepted auth code (simulated by copying the callback URL and replaying it without the verifier) is rejected by the server
- [ ] Server deployed on Railway, CLI published to npm
- [ ] `npx @sahil/democli login` works from a machine with no local setup
- [ ] README is self-contained — someone unfamiliar with PKCE can read it and understand what the project demonstrates

---

## 13. Out of scope (explicitly)

- HTTPS on localhost (browsers allow plain HTTP for `127.0.0.1` per RFC 8252 — note this in README)
- Multiple demo users
- Token refresh
- Admin UI
- Rate limiting, security headers, input sanitisation beyond the demo's needs