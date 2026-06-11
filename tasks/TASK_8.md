# TASK_8: Server Entry Point & Express Setup

## Description
Set up the main Express application with middleware, error handling, CORS (if needed), and route registration. Boot the server on configured port.

## Acceptance Criteria
- [ ] Express app created with standard middleware (json, urlencoded parsers)
- [ ] All routes registered: /oauth/authorize, /oauth/approve, /oauth/token, /api/me
- [ ] Error handling middleware logs errors and returns proper HTTP status codes
- [ ] Server boots on PORT from environment (default 3000)
- [ ] Accepts connections from localhost and remote (for Railway)
- [ ] Graceful shutdown on SIGTERM/SIGINT
- [ ] .env file loaded via dotenv
- [ ] console.log on startup shows server URL and port

## Files to Create
- `packages/server/src/index.ts`
- `.env.example` (at package/server root)

## Files to Modify
- `packages/server/package.json` (add start/dev scripts)

## Dependencies
- TASK_1 (Project Setup)
- TASK_4, TASK_5, TASK_6, TASK_7 (All routes)

## Pseudocode

```
import express from 'express'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// routes
app.get('/oauth/authorize', authorizeHandler)
app.post('/oauth/approve', approveHandler)
app.post('/oauth/token', tokenHandler)
app.get('/api/me', authenticateToken, meHandler)

// error handling
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

// startup
const server = app.listen(PORT, () => {
  console.log(`OAuth server running on http://localhost:${PORT}`)
})

// graceful shutdown
process.on('SIGTERM', () => server.close())
process.on('SIGINT', () => server.close())
```

## Environment Variables

```env
PORT=3000
JWT_SECRET=local-dev-secret-change-this
CLIENT_ID=democli
ALLOWED_REDIRECT_URIS=http://127.0.0.1
```

## Notes
- Use `dotenv` to load `.env` file
- PORT should accept from environment or default to 3000
- For development, use tsx or ts-node-dev for watch mode
- For production (Railway), ensure PORT is injectable
- CORS may not be needed if CLI communicates directly (no browser CORS issues)
