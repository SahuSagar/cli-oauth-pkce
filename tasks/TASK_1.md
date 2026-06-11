# TASK_1: Project Setup & Monorepo Structure

## Description
Set up the monorepo with pnpm workspaces, create package.json files for root, server, and CLI packages, and configure TypeScript for both packages.

## Acceptance Criteria
- [ ] Root package.json created with pnpm workspaces configuration
- [ ] `packages/server/package.json` created with correct dependencies (express, typescript, jsonwebtoken)
- [ ] `packages/cli/package.json` created with correct dependencies (commander, open, typescript)
- [ ] TypeScript configurations set up for both packages
- [ ] `pnpm install` runs without errors
- [ ] Both packages can be built independently with `pnpm build`

## Files to Create
- `package.json` (root)
- `pnpm-workspace.yaml`
- `packages/server/package.json`
- `packages/server/tsconfig.json`
- `packages/cli/package.json`
- `packages/cli/tsconfig.json`
- `.gitignore`

## Files to Modify
- None

## Dependencies
- None (first task)

## Key Dependencies to Install

### Root
```json
{
  "private": true,
  "name": "democli-monorepo",
  "workspaces": ["packages/*"]
}
```

### Server
```json
{
  "name": "democli-server",
  "dependencies": {
    "express": "^4.18.x",
    "jsonwebtoken": "^9.x",
    "dotenv": "^16.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "ts-node-dev": "^2.x",
    "@types/express": "^4.x",
    "@types/node": "^20.x"
  }
}
```

### CLI
```json
{
  "name": "@sahil/democli",
  "bin": { "democli": "./dist/index.js" },
  "dependencies": {
    "commander": "^12.x",
    "open": "^10.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "ts-node": "^10.x",
    "@types/node": "^20.x"
  }
}
```

## Notes
- Ensure `pnpm-workspace.yaml` points to `packages/*`
- Both packages should have `"type": "module"` or use CommonJS consistently
- Create `.env.example` for server configuration
