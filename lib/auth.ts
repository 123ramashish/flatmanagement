import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const SECRET = process.env.NEXTAUTH_SECRET || 'fallback-secret';

export function signToken(payload: object) {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, SECRET) as { id: string; flatId: string; role: string; name: string };
  } catch {
    return null;
  }
}

export function getAuthUser() {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  return verifyToken(token);
}
