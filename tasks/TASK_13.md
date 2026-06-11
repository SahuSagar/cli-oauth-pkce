# TASK_13: CLI Logout Command

## Description
Implement `democli logout` command that deletes the saved token file and prints confirmation.

## Acceptance Criteria
- [ ] Reads token file location
- [ ] Deletes token file if it exists
- [ ] Silently succeeds if token file doesn't exist (already logged out)
- [ ] Prints confirmation: "Logged out."
- [ ] Returns exit code 0 on success

## Files to Create
- `packages/cli/src/commands/logout.ts`

## Files to Modify
- `packages/cli/src/index.ts` (register logout command)

## Dependencies
- TASK_1 (Project Setup)
- TASK_10 (Token file management - deleteToken function)

## Pseudocode

```
async function logout(options):
  try:
    deleteToken()
    console.log('Logged out.')
  catch error:
    if error.code == 'ENOENT':
      // Token doesn't exist; already logged out
      console.log('Logged out.')
    else:
      console.error(`Failed to log out: ${error.message}`)
      process.exit(1)
```

## Notes
- Token file deletion should be idempotent (no error if already deleted)
- Reuse `deleteToken()` from TASK_10
- Exit code 0 regardless of whether token existed before
- Simple one-liner output
