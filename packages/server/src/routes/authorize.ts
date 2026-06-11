import { Request, Response } from 'express';
import { renderConsent } from '../lib/render';

const CLIENT_ID = process.env.CLIENT_ID || 'democli';
const ALLOWED_HOST = '127.0.0.1';

function isAllowedRedirectUri(uri: string): boolean {
  try {
    const { hostname } = new URL(uri);
    return hostname === ALLOWED_HOST || hostname === 'localhost';
  } catch {
    return false;
  }
}

export function authorizeHandler(req: Request, res: Response): void {
  const { client_id, redirect_uri, code_challenge, state, response_type } = req.query as Record<string, string>;

  if (!client_id || client_id !== CLIENT_ID) {
    res.status(400).send('Invalid client_id');
    return;
  }

  if (!redirect_uri || !isAllowedRedirectUri(redirect_uri)) {
    res.status(400).send('Invalid redirect_uri');
    return;
  }

  if (!code_challenge) {
    res.status(400).send('Missing code_challenge — PKCE is required');
    return;
  }

  if (response_type !== 'code') {
    res.status(400).send('response_type must be "code"');
    return;
  }

  res.send(renderConsent({
    code_challenge,
    state: state || '',
    redirect_uri,
    client_id,
    email: 'sahil@demo.com',
    errorClass: '',
    errorMessage: '',
  }));
}
