import jwt from 'jsonwebtoken';

type TokenPayload = {
  sub: string;
  email: string;
  name: string;
};

export function signJWT(payload: TokenPayload): string {
  const secret = process.env.JWT_SECRET!;
  return jwt.sign(payload, secret, { expiresIn: '1h' });
}

export function verifyJWT(token: string): TokenPayload & { iat: number; exp: number } {
  const secret = process.env.JWT_SECRET!;
  return jwt.verify(token, secret) as TokenPayload & { iat: number; exp: number };
}
