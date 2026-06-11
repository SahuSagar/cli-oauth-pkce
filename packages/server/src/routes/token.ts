import { Request, Response } from 'express';
import { consumeAuthCode } from '../lib/store';
import { verifyPKCE } from '../lib/pkce';
import { signJWT } from '../lib/jwt';
import { DEMO_USER } from '../lib/user';

export function tokenHandler(req: Request, res: Response): void {
  const { code, code_verifier, client_id, redirect_uri } = req.body;

  if (!code || !code_verifier || !client_id || !redirect_uri) {
    res.status(400).json({ error: 'Missing required parameters' });
    return;
  }

  const entry = consumeAuthCode(code);

  if (!entry) {
    res.status(400).json({ error: 'Invalid or expired authorization code' });
    return;
  }

  if (entry.client_id !== client_id) {
    res.status(400).json({ error: 'client_id mismatch' });
    return;
  }

  if (entry.redirect_uri !== redirect_uri) {
    res.status(400).json({ error: 'redirect_uri mismatch' });
    return;
  }

  if (!verifyPKCE(code_verifier, entry.code_challenge)) {
    res.status(400).json({ error: 'PKCE verification failed' });
    return;
  }

  const token = signJWT({
    sub: DEMO_USER.id,
    email: DEMO_USER.email,
    name: DEMO_USER.name,
  });

  res.json({
    access_token: token,
    token_type: 'Bearer',
    expires_in: 3600,
  });
}
