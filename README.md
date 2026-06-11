# democli — OAuth 2.0 + PKCE Demo

A portfolio project demonstrating the OAuth 2.0 Authorization Code flow with PKCE (Proof Key for Code Exchange). It's a working CLI tool that authenticates users via a browser-based OAuth login — the same pattern used by tools like GitHub CLI, Vercel CLI, and neonctl.

**What you'll learn:** How modern CLI tools let users log in through the browser without ever handling passwords, and why PKCE is essential for security when code is transmitted over a public channel.

---

## 🎯 What This Demonstrates

Run `democli login` in your terminal → browser opens → you log in → token saved locally → you can now call protected APIs.

It's a **real OAuth 2.0 flow**, not a simulator:
- ✅ PKCE prevents interception of authorization codes
- ✅ State param prevents CSRF attacks
- ✅ Auth codes expire (60 seconds) and are one-time use only
- ✅ Protected APIs validate signed JWT tokens
- ✅ Everything is end-to-end: local dev → deployed server → npm package

This project is **intentionally a demo**, not production-ready. See [Non-Goals](#non-goals) below.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm (or npm)

### 1. Clone and install
```bash
git clone <repo-url>
cd cli-oauth-pkce
pnpm install
```

### 2. Start the OAuth server

Create a `.env` file in `packages/server`:
```env
PORT=3000
JWT_SECRET=local-dev-secret-change-this
CLIENT_ID=democli
ALLOWED_REDIRECT_URIS=http://127.0.0.1
```

Start the server:
```bash
cd packages/server
pnpm dev
```

You'll see: `Server running on http://localhost:3000`

### 3. Build and run the CLI

In a new terminal:
```bash
cd packages/cli
pnpm build
node dist/index.js login
```

Your browser will open with a login form.

### 4. Log in with demo credentials
- **Email:** `sahil@demo.com`
- **Password:** `demo1234`

Click "Approve" → your browser redirects → CLI saves your token → done.

### 5. Verify you're logged in
```bash
node dist/index.js whoami
```

You'll see your user info. Try logging out:
```bash
node dist/index.js logout
```

Then `whoami` will tell you you're not logged in.

---

## 🔐 How PKCE Works (Plain English)

Imagine you're mailing a contract to a lawyer:

**Without PKCE (insecure):**
1. You write the contract, hand it to a courier
2. Courier shows it to the lawyer
3. Lawyer signs and gives the signed copy back to you
4. **Problem:** If someone intercepts the contract in transit, they can forge your signature

**With PKCE (secure):**
1. You generate a random **private key** (the verifier) and lock the contract with a **lock** (the challenge)
2. You mail the locked contract + lock to the lawyer
3. Lawyer signs the locked contract, mails it back
4. You unlock it with your private key, verify the signature
5. **Safe:** Even if someone intercepts the locked contract, they can't unlock it without your private key — which never leaves your hands

In OAuth terms:
- The **contract** is the authorization code
- Your **private key** is `code_verifier` (stays in the CLI)
- Your **lock** is `code_challenge` (sent to the server)
- The **server** stores the lock, hashes your verifier when you return it, and checks if it matches

**Why this matters:** Authorization codes are transmitted through your browser (the "insecure channel"). Without PKCE, if someone intercepts the code, they can use it to get a token. With PKCE, the intercepted code is useless without the verifier.

---

## 🏗️ Architecture

### Folder Structure
```
cli-oauth-pkce/
├── packages/
│   ├── server/              # OAuth server + protected API
│   │   ├── src/
│   │   │   ├── index.ts         # Express app setup
│   │   │   ├── routes/
│   │   │   │   ├── authorize.ts # GET /oauth/authorize
│   │   │   │   ├── approve.ts   # POST /oauth/approve
│   │   │   │   ├── token.ts     # POST /oauth/token
│   │   │   │   └── me.ts        # GET /api/me (protected)
│   │   │   └── lib/
│   │   │       ├── pkce.ts      # PKCE verification
│   │   │       ├── jwt.ts       # JWT signing
│   │   │       ├── store.ts     # Auth code storage
│   │   │       └── user.ts      # Hardcoded demo user
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── cli/                 # Command-line tool
│       ├── src/
│       │   ├── index.ts         # Command setup
│       │   ├── commands/
│       │   │   ├── login.ts     # Full OAuth flow
│       │   │   ├── whoami.ts    # Call /api/me
│       │   │   └── logout.ts    # Delete token
│       │   └── lib/
│       │       ├── pkce.ts      # Generate verifier/challenge
│       │       ├── callback.ts  # Local HTTP server
│       │       ├── token.ts     # Save/load token file
│       │       └── config.ts    # Server URL, client ID
│       ├── package.json
│       └── tsconfig.json
│
├── PRD.md               # Full product requirements
├── CLAUDE.md            # Development guide & patterns
└── README.md            # This file
```

### OAuth Flow (Step-by-Step)

```
User                    CLI                    Browser              OAuth Server
 │                       │                         │                     │
 ├─── democli login ─────→│                         │                     │
 │                       │  (1) Generate PKCE pair  │                     │
 │                       │  (2) Start local server  │                     │
 │                       │  (3) Open browser ─────────────────────────────→│
 │                       │                         │  GET /oauth/authorize│
 │                       │                         │  with code_challenge│
 │                       │                         │←─────────────────────│
 │                       │                         │  Login form          │
 │◄─────┤ Browser opened, enter credentials       │                     │
 │──────→ sahil@demo.com / demo1234 ────────────→ │ POST /oauth/approve  │
 │                       │                         │────────────────────→│
 │                       │                         │←─ Auth code ────────│
 │                       │                         │ (redirect callback) │
 │                       │◄─────────────────────────│                     │
 │                       │  GET /callback?code=... │                     │
 │                       │ (4) Extract code        │                     │
 │                       │ (5) Exchange code ─────────────────────────────→│
 │                       │  POST /oauth/token      │                     │
 │                       │  { code, code_verifier}│  POST /oauth/token  │
 │                       │                         │  Verify PKCE        │
 │                       │←─────────────────────────────────────────────────│
 │                       │  JWT token              │                     │
 │                       │ (6) Save to ~/.config/  │                     │
 │                       │                         │                     │
 │◄────── Authenticated! ├─ Token saved locally    │                     │
 │                       │                         │                     │
 ├─── democli whoami ────→│                         │                     │
 │                       │ (7) GET /api/me ───────────────────────────────→│
 │                       │  Bearer: <JWT>         │                     │
 │                       │←─────────────────────────────────────────────────│
 │◄─────── User info ────┤                         │                     │
```

---

## 🔒 Security Properties Explained

| Property | What it protects | How |
|----------|------------------|-----|
| **PKCE** | Auth code interception | Verifier stays in CLI memory; only hashed challenge sent to server. Even if code is intercepted, verifier is required to exchange it. |
| **State param** | CSRF attacks | CLI generates random state, server includes it in redirect, CLI validates on callback. Prevents attacker from tricking you into logging into their account. |
| **Auth code expiry** | Leaked codes | Codes expire after 60 seconds. If an old code leaks, it's already invalid. |
| **One-time use** | Code reuse attacks | After token exchange, server deletes the code. Can't use the same code twice. |
| **Bearer token validation** | Unauthorized API access | `/api/me` rejects requests without valid JWT. Token is signed with server's secret; can't be forged. |
| **JWT expiry** | Compromised tokens | Tokens expire after 1 hour. Even if a token leaks, it's only useful for a limited time. |

---

## 📝 Hardcoded Demo User

Since this is a demo with no real user database:
- **Email:** `sahil@demo.com`
- **Password:** `demo1234`

This is intentionally plaintext. **Don't do this in production.** See [Non-Goals](#non-goals).

---

## 💻 Development Commands

### Server
```bash
cd packages/server

# Watch mode (auto-recompile on changes)
pnpm dev

# One-time build
pnpm build

# Run built version
pnpm start

# Run tests (if any)
pnpm test
```

### CLI
```bash
cd packages/cli

# Build TypeScript → dist/
pnpm build

# Test a command
node dist/index.js login
node dist/index.js whoami
node dist/index.js logout

# Watch mode (manual rebuild needed)
pnpm dev
```

### Monorepo
```bash
cd cli-oauth-pkce  # project root

# Install all packages
pnpm install

# Run both server and CLI dev in separate terminals
# Terminal 1: cd packages/server && pnpm dev
# Terminal 2: cd packages/cli && pnpm build && node dist/index.js login
```

---

## 🧪 Testing the Flow

1. **Start server** (terminal 1)
   ```bash
   cd packages/server && pnpm dev
   ```

2. **Build CLI & login** (terminal 2)
   ```bash
   cd packages/cli
   pnpm build
   node dist/index.js login
   ```
   Browser opens → enter `sahil@demo.com` / `demo1234` → click Approve

3. **Verify token saved**
   ```bash
   cat ~/.config/democli/token.json
   ```
   You'll see: `{ "access_token": "eyJhbGc...", "saved_at": 1718000000000 }`

4. **Call protected API**
   ```bash
   node dist/index.js whoami
   ```
   Output: User info (name, email, token expiry)

5. **Test with invalid token** (optional)
   ```bash
   # Manually edit ~/.config/democli/token.json, corrupt the token
   node dist/index.js whoami
   # Should fail with 401 Unauthorized
   ```

6. **Logout and verify**
   ```bash
   node dist/index.js logout
   node dist/index.js whoami
   # Should say: "Not logged in. Run: democli login"
   ```

---

## ❌ Non-Goals (What's Missing for Production)

This project is a **demo**. The following production requirements are intentionally excluded:

| Feature | Why it's missing | What production would need |
|---------|------------------|--------------------------|
| **Rate limiting** | Adds complexity; not needed to understand OAuth | Implement per-IP/per-user rate limits on authorize & token endpoints to prevent brute force |
| **Real user database** | One hardcoded user is enough to show the flow | Real password hashing (bcrypt), user store (SQL DB), password reset flow |
| **Refresh token rotation** | Demo tokens expire after 1h; fine for learning | Issue refresh tokens, rotate them on each use, revoke old ones |
| **HTTPS on localhost** | Browsers allow plain HTTP for 127.0.0.1 per RFC 8252 | Use TLS for production; certificates, key rotation, HSTS headers |
| **Security headers** | Not needed for local demo | HSTS, CSP, X-Frame-Options, etc. on all responses |
| **Input validation** | Demo form is simple; hardcoded user | Validate email format, password strength, sanitize HTML form inputs |
| **CSRF tokens on form** | Single localhost form; low risk | CSRF tokens on state-changing requests |
| **Multi-tenant support** | Single client & user only | Multiple OAuth clients, scopes, permissions per client |
| **Token revocation API** | Not implemented | Endpoint to revoke tokens early (logout from all devices) |
| **Audit logging** | Not needed for learning | Log all auth events for compliance & debugging |

**Key insight:** This project teaches you how the **OAuth flow itself** works. Production deployment adds layers of hardening on top of this foundation.

---

## 🤔 FAQ

**Q: Why does the CLI need a local HTTP server?**  
A: The OAuth server can't call your terminal directly. It can only redirect the browser. So the CLI starts a tiny HTTP server on `127.0.0.1:random-port`, tells the OAuth server to redirect there, and waits to receive the auth code.

**Q: What if someone intercepts my browser's redirect to the callback?**  
A: They'd see the auth code, but not the `code_verifier`. Without the verifier, they can't exchange the code for a token. That's PKCE.

**Q: Can I run this without `pnpm`?**  
A: Yes, use `npm` instead. Change `pnpm install` → `npm install`, `pnpm dev` → `npm run dev`, etc. The `package.json` files support both.

**Q: Why is the demo user's password hardcoded?**  
A: This is a learning project, not a real app. Hardcoding avoids the complexity of password hashing, storage, and reset flows — which would distract from understanding OAuth + PKCE.

**Q: Can I deploy this and share it?**  
A: Yes! See the PRD.md section on deployment (Railway for server, npm for CLI). You'd update the `SERVER_URL` in the CLI to point to your deployed server, then publish to npm.

---

## 📚 References & Learning

- [OAuth 2.0 Authorization Code Flow](https://tools.ietf.org/html/rfc6749#section-1.3.1) — IETF spec
- [PKCE (RFC 7636)](https://tools.ietf.org/html/rfc7636) — Why & how PKCE works
- [Real-world examples](https://github.com/cli/cli) — GitHub CLI, Vercel CLI both use this pattern
- [PRD.md](./PRD.md) — Full product spec with technical requirements
- [CLAUDE.md](./CLAUDE.md) — Development guide, file structure, commands

---

## 📁 Project Files

- **[PRD.md](./PRD.md)** — Complete product requirements, architecture, endpoints, security properties
- **[CLAUDE.md](./CLAUDE.md)** — Development patterns, code organization, build/test commands
- **[tasks/](./tasks/)** — Breakdown of 15 implementation tasks with detailed guides
- **[PROGRESS.md](./PROGRESS.md)** — Status tracking of all tasks

---

## 🎓 What You'll Learn

1. **OAuth 2.0 Authorization Code Flow** — When to use it, why it's safe
2. **PKCE Security Pattern** — Why it matters, how to implement it
3. **CLI Development** — Spawning browser from terminal, handling callbacks, file I/O
4. **Token Management** — Signing, verifying, storing secrets safely
5. **API Security** — Validating Bearer tokens, protecting endpoints
6. **Full-Stack Integration** — Server + CLI working together end-to-end

---

**Ready to understand OAuth + PKCE? Start with the [Quick Start](#-quick-start) above.** Questions? Check [FAQ](#-faq) or open an issue.

---

Made as a learning project. See [Non-Goals](#non-goals) for what's intentionally not included.
