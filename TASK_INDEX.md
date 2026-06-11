# Task Index & Quick Reference

## 📋 Project Structure

```
cli-oauth-pkce/
├── PRD.md                    # Product requirements document
├── CLAUDE.md                 # Claude Code development guide
├── PROGRESS.md              # Progress tracking table
├── TASK_INDEX.md            # This file - quick reference
└── tasks/
    ├── TASK_1.md            # Project Setup & Monorepo Structure
    ├── TASK_2.md            # PKCE Utilities (Shared Logic)
    ├── TASK_3.md            # Auth Code Store & JWT Utilities
    ├── TASK_4.md            # Server Authorization Endpoint
    ├── TASK_5.md            # Server Approval Endpoint
    ├── TASK_6.md            # Server Token Exchange Endpoint
    ├── TASK_7.md            # Server Protected API Endpoint
    ├── TASK_8.md            # Server Entry Point & Express Setup
    ├── TASK_9.md            # CLI Callback Server
    ├── TASK_10.md           # CLI Token File Management
    ├── TASK_11.md           # CLI Login Command
    ├── TASK_12.md           # CLI Whoami Command
    ├── TASK_13.md           # CLI Logout Command
    ├── TASK_14.md           # CLI Entry Point & Command Setup
    └── TASK_15.md           # End-to-End Testing & Local Verification
```

---

## 🗺️ Task Dependency Map

```
TASK_1 (Setup)
├── TASK_2 (PKCE)
├── TASK_3 (Store & JWT)
│   ├── TASK_4 (Authorize)
│   │   └── TASK_5 (Approve)
│   │       └── TASK_6 (Token)
│   │           └── TASK_7 (API /me)
│   │               └── TASK_8 (Server boot)
│   │                   └── TASK_15 (E2E Testing)
│   │
│   ├── TASK_9 (CLI Callback)
│   └── TASK_10 (Token Storage)
│       ├── TASK_11 (Login)
│       ├── TASK_12 (Whoami)
│       └── TASK_13 (Logout)
│           └── TASK_14 (CLI Entry)
│               └── TASK_15 (E2E Testing)
```

---

## 🎯 Recommended Execution Order

### Phase 1: Foundation (3 tasks, ~5 hours)
1. **TASK_1** - Project Setup & Monorepo Structure
   - Creates folder structure, package.json files, TypeScript configs
   - ⏱️ 1.5 hours

2. **TASK_2** - PKCE Utilities (can start after TASK_1)
   - Implement generateVerifier, generateChallenge, verifyPKCE
   - ⏱️ 1.5 hours

3. **TASK_3** - Auth Code Store & JWT Utilities (can start after TASK_1)
   - Implement in-memory store, JWT signing/verification
   - ⏱️ 2 hours

### Phase 2: Server Implementation (5 tasks, ~8.5 hours)
4. **TASK_4** - Server Authorization Endpoint
   - GET /oauth/authorize with consent HTML form
   - ⏱️ 2 hours

5. **TASK_5** - Server Approval Endpoint
   - POST /oauth/approve with auth code generation
   - ⏱️ 1.5 hours

6. **TASK_6** - Server Token Exchange Endpoint
   - POST /oauth/token with PKCE verification and JWT issuance
   - ⏱️ 2 hours

7. **TASK_7** - Server Protected API Endpoint
   - GET /api/me with Bearer token validation
   - ⏱️ 1.5 hours

8. **TASK_8** - Server Entry Point & Express Setup
   - Integrate all routes, middleware, startup
   - ⏱️ 1.5 hours

### Phase 3: CLI Implementation (6 tasks, ~8.5 hours)
9. **TASK_9** - CLI Callback Server
   - Implement local HTTP server for OAuth callback
   - ⏱️ 1.5 hours

10. **TASK_10** - CLI Token File Management
    - Save/load/delete token from ~/.config/democli/
    - ⏱️ 1 hour

11. **TASK_11** - CLI Login Command
    - Full PKCE flow orchestration
    - ⏱️ 3 hours (complex, integrates many pieces)

12. **TASK_12** - CLI Whoami Command
    - Read token and call /api/me
    - ⏱️ 1.5 hours

13. **TASK_13** - CLI Logout Command
    - Delete token file
    - ⏱️ 0.5 hours

14. **TASK_14** - CLI Entry Point & Command Setup
    - Commander.js setup and command registration
    - ⏱️ 1 hour

### Phase 4: Testing & Verification (1 task, ~3 hours)
15. **TASK_15** - End-to-End Testing & Local Verification
    - Manual testing of full flow, error cases
    - ⏱️ 3 hours

---

## ⚡ Parallelization Opportunities

After **TASK_1** is complete, you can start:
- **TASK_2 + TASK_3** in parallel (both don't depend on each other)

After **TASK_2 + TASK_3** complete:
- **Server tasks (TASK_4-8)** and **CLI utilities (TASK_9-10)** can proceed in parallel

Once server is working:
- **CLI commands (TASK_11-14)** can be built and integrated

---

## 📊 Progress Tracking

**Total Effort**: 25 hours  
**Recommended Schedule**: 5-7 days (4 hours/day)

For detailed progress, see [PROGRESS.md](PROGRESS.md)

---

## 🔗 Key Files to Reference

| File | Purpose |
|------|---------|
| [PRD.md](PRD.md) | Full project specification and requirements |
| [CLAUDE.md](CLAUDE.md) | Development commands, architecture, code organization |
| [PROGRESS.md](PROGRESS.md) | Status tracking table with all tasks and dependencies |
| [tasks/TASK_*.md](tasks/) | Detailed implementation guide for each task |

---

## 💡 Tips for Implementation

1. **Start with TASK_1**: Don't skip setup; it takes only 1.5 hours and unblocks everything
2. **Read the PRD first**: Understand the OAuth flow before diving into code
3. **Test incrementally**: After each task, verify it works (see TASK_15 for testing checklist)
4. **Use CLAUDE.md**: Refer to it for development commands and architecture overview
5. **Check dependencies**: Before starting a task, ensure all dependencies (previous tasks) are done
6. **Update PROGRESS.md**: Mark tasks as IN_PROGRESS / DONE to track momentum

---

## 🎓 Learning Path

This project teaches:
1. **OAuth 2.0 Authorization Code Flow** (TASK_4, TASK_5, TASK_6)
2. **PKCE Security Pattern** (TASK_2, TASK_6)
3. **CLI Development** (TASK_9, TASK_11, TASK_14)
4. **Token Management** (TASK_3, TASK_10)
5. **API Security** (TASK_7)
6. **Full-Stack Integration** (TASK_15)

---

## ❓ Questions?

- Check the specific task file (e.g., TASK_11.md) for detailed implementation guidance
- Refer to CLAUDE.md for development patterns and commands
- See PRD.md for security requirements and project goals

---

**Last Updated**: 2026-06-11  
**Total Tasks**: 15  
**Status**: All TODO, ready to begin
