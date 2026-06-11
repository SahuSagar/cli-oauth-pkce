import { Request, Response } from 'express';
import { storeAuthCode } from '../lib/store';
import { validateCredentials } from '../lib/user';
import { generateSecureToken } from '../lib/pkce';
import { renderConsent } from '../lib/render';

export function approveHandler(req: Request, res: Response): void {
  const { email, password, code_challenge, state, redirect_uri, client_id } = req.body;

  if (!validateCredentials(email, password)) {
    // re-render consent page with error rather than a blank 401
    res.status(401).send(renderConsent({
      code_challenge,
      state: state || '',
      redirect_uri,
      client_id,
      email,
      errorClass: 'visible',
      errorMessage: 'Invalid email or password.',
    }));
    return;
  }

  const code = generateSecureToken();

  storeAuthCode(code, {
    code_challenge,
    redirect_uri,
    client_id,
    user_id: 'user_1',
    expires_at: Date.now() + 60_000, // 60 second TTL
  });

  const callbackUrl = new URL(redirect_uri);
  callbackUrl.searchParams.set('code', code);
  callbackUrl.searchParams.set('state', state);

  res.redirect(302, callbackUrl.toString());
}

