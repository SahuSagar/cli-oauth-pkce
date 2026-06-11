# TASK_2: Implement PKCE Utilities (Shared Logic)

## Description
Create PKCE (Proof Key for Code Exchange) utility functions used by both server and CLI. Implement verifier generation, challenge generation, and challenge verification.

## Acceptance Criteria
- [ ] `verifyPKCE(verifier, storedChallenge)` correctly validates PKCE pairs
- [ ] `generateVerifier()` creates a cryptographically secure 32-byte base64url string
- [ ] `generateChallenge(verifier)` generates SHA256 hash in base64url format
- [ ] All functions use Node.js built-in `crypto` module
- [ ] Unit tests pass for valid and invalid verifier/challenge pairs

## Files to Create
- `packages/server/src/lib/pkce.ts`
- `packages/cli/src/lib/pkce.ts`
- `packages/server/test/pkce.test.ts` (optional but recommended)

## Files to Modify
- None

## Dependencies
- TASK_1 (Project Setup)

## Pseudocode

```
function generateVerifier():
  return base64url(random 32 bytes)

function generateChallenge(verifier):
  hash = SHA256(verifier)
  return base64url(hash)

function verifyPKCE(verifier, storedChallenge):
  computedChallenge = generateChallenge(verifier)
  return computedChallenge === storedChallenge
```

## Code Snippet (Reference from PRD)

```ts
import crypto from 'crypto';

function verifyPKCE(verifier: string, storedChallenge: string): boolean {
  const hash = crypto.createHash('sha256').update(verifier).digest();
  const challenge = hash.toString('base64url');
  return challenge === storedChallenge;
}
```

## Notes
- Both server and CLI need these utilities, so implement in both packages
- Use `crypto.randomBytes()` for verifier generation
- Use `crypto.createHash('sha256')` for challenge generation
- base64url encoding is important (not standard base64)
