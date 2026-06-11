type AuthCodeEntry = {
  code_challenge: string;
  expires_at: number;
  redirect_uri: string;
  client_id: string;
  user_id: string;
};

const codes = new Map<string, AuthCodeEntry>();

// clean up expired entries every 30 seconds
setInterval(() => {
  const now = Date.now();
  for (const [code, entry] of codes) {
    if (entry.expires_at < now) codes.delete(code);
  }
}, 30_000);

export function storeAuthCode(code: string, entry: AuthCodeEntry): void {
  codes.set(code, entry);
}

export function consumeAuthCode(code: string): AuthCodeEntry | null {
  const entry = codes.get(code);
  if (!entry) return null;

  codes.delete(code); // one-time use — delete immediately

  if (entry.expires_at < Date.now()) return null; // expired

  return entry;
}
