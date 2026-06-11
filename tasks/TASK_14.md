# TASK_14: CLI Entry Point & Command Setup

## Description
Set up the main CLI entry point with commander.js command parsing and registration. Wire together all commands (login, whoami, logout) and handle errors.

## Acceptance Criteria
- [ ] Commander program initialized with name, description, version
- [ ] All three commands registered: login, whoami, logout
- [ ] Shebang line added to make script executable
- [ ] Error handling for invalid commands
- [ ] Help message displays all available commands
- [ ] `#!/usr/bin/env node` at top of file
- [ ] `--version` flag displays package version
- [ ] `--help` displays usage information

## Files to Create
- `packages/cli/src/index.ts`

## Files to Modify
- `packages/cli/package.json` (add "bin" field)

## Dependencies
- TASK_1 (Project Setup)
- TASK_11 (Login command)
- TASK_12 (Whoami command)
- TASK_13 (Logout command)

## Pseudocode

```typescript
#!/usr/bin/env node

import { Command } from 'commander'
import { loginCommand } from './commands/login'
import { whoamiCommand } from './commands/whoami'
import { logoutCommand } from './commands/logout'

const program = new Command()

program
  .name('democli')
  .description('OAuth 2.0 + PKCE demo CLI')
  .version('0.1.0')

program
  .command('login')
  .description('Authenticate via browser')
  .action(loginCommand)

program
  .command('whoami')
  .description('Display current user')
  .action(whoamiCommand)

program
  .command('logout')
  .description('Remove saved credentials')
  .action(logoutCommand)

program.parse(process.argv)

if (!process.argv.slice(2).length) {
  program.outputHelp()
}
```

## package.json Configuration

```json
{
  "name": "@sahil/democli",
  "version": "0.1.0",
  "type": "module",
  "bin": {
    "democli": "./dist/index.js"
  },
  "scripts": {
    "build": "tsc",
    "dev": "ts-node src/index.ts"
  }
}
```

## Notes
- Shebang must be first line: `#!/usr/bin/env node`
- Use commander.js for command parsing
- Each command is an async function that returns Promise
- Version should match package.json version (can auto-inject at build time if desired)
- Help text should be clear and concise
- After building with tsc, make dist/index.js executable (chmod +x)
