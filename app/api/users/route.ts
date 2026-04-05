import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = getAuthUser();
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await dbConnect();
    const users = await User.find({ flatId: auth.flatId }, '-password');
    return NextResponse.json(users);
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = getAuthUser();
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await dbConnect();
    const { name, email, phone, password, role } = await req.json();

    if (!name || !email || !phone || !password)
      return NextResponse.json({ error: 'All fields required' }, { status: 400 });

    const existing = await User.findOne({ email });
    if (existing) return NextResponse.json({ error: 'Email already in use' }, { status: 409 });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, phone, password: hashed, flatId: auth.flatId, role: role || 'member' });

    return NextResponse.json({ success: true, user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role } });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
