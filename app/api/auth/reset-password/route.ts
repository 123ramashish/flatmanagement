// app/api/auth/reset-password/route.ts
// ─────────────────────────────────────
// Validates the token from the email link and updates the user's password.
// Works alongside: app/api/auth/forgot-password/route.ts
// ─────────────────────────────────────
'use server'
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Flat from '@/models/Flat';
import { resetTokenStore } from '../forgot-password/route';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    // Look up token
    const entry = resetTokenStore.get(token);

    if (!entry) {
      return NextResponse.json({ error: 'Invalid or expired reset link' }, { status: 400 });
    }

    if (Date.now() > entry.expiresAt) {
      resetTokenStore.delete(token);
      return NextResponse.json({ error: 'Reset link has expired. Please request a new one.' }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);

    // Update password in the correct collection
    if (entry.isFlat) {
      const flat = await Flat.findOneAndUpdate(
        { email: entry.email },
        { password: hashed },
        { new: true }
      );
      if (!flat) {
        return NextResponse.json({ error: 'Account not found' }, { status: 404 });
      }
    } else {
      const user = await User.findOneAndUpdate(
        { email: entry.email },
        { password: hashed },
        { new: true }
      );
      if (!user) {
        return NextResponse.json({ error: 'Account not found' }, { status: 404 });
      }
    }

    // Invalidate the token after use
    resetTokenStore.delete(token);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('reset-password error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}