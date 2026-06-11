# TASK_10: CLI Token File Management

## Description
Implement utilities to save and read JWT tokens from `~/.config/democli/token.json`. Create config directory if needed, handle missing tokens gracefully, and validate token format.

## Acceptance Criteria
- [ ] `saveToken(token)` writes to `~/.config/democli/token.json`
- [ ] Creates `~/.config/democli/` directory if it doesn't exist
- [ ] Saves token with metadata: `{ access_token, saved_at }`
- [ ] `loadToken()` reads from `~/.config/democli/token.json`
- [ ] Returns null if file doesn't exist
- [ ] Validates token is non-empty string
- [ ] `deleteToken()` removes token file
- [ ] Cross-platform path resolution using `os.homedir()` + `path.join()`
- [ ] File permissions: readable/writable by user only (mode 0600)

## Files to Create
- `packages/cli/src/lib/token.ts`

## Files to Modify
- None

## Dependencies
- TASK_1 (Project Setup)

## Pseudocode

```
import os from 'os'
import path from 'path'
import fs from 'fs/promises'

function getConfigDir():
  return path.join(os.homedir(), '.config', 'democli')

async function saveToken(token):
  configDir = getConfigDir()
  
  try:
    fs.mkdir(configDir, { recursive: true })
  catch:
    throw new Error('Failed to create config directory')
  
  tokenData = {
    access_token: token,
    saved_at: Date.now()
  }
  
  tokenPath = path.join(configDir, 'token.json')
  fs.writeFile(tokenPath, JSON.stringify(tokenData, null, 2))
  fs.chmod(tokenPath, 0o600)  // user read/write only

async function loadToken():
  configDir = getConfigDir()
  tokenPath = path.join(configDir, 'token.json')
  
  try:
    content = fs.readFile(tokenPath, 'utf-8')
    data = JSON.parse(content)
    return data.access_token
  catch:
    return null

async function deleteToken():
  configDir = getConfigDir()
  tokenPath = path.join(configDir, 'token.json')
  
  try:
    fs.unlink(tokenPath)
  catch error:
    if error.code != 'ENOENT':  // ignore if doesn't exist
      throw error
```

## Token File Format

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "saved_at": 1718000000000
}
```

## Notes
- Use `os.homedir()` for cross-platform home directory resolution
- File permissions (0o600) ensure only the user can read/write
- `saveToken()` should overwrite existing token
- `loadToken()` returns null (not error) if token doesn't exist
- `deleteToken()` should silently succeed even if file doesn't exist (ENOENT)
- Use `fs/promises` for async file operations (cleaner than callbacks)
