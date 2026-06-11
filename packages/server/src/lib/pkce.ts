import crypto from 'crypto';

export function verifyPKCE(verifier: string, storedChallenge: string): boolean {
  const hash = crypto.createHash('sha256').update(verifier).digest();
  const challenge = hash.toString('base64url');
  return challenge === storedChallenge;
}

export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('base64url');
}
