import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import Flat from '@/models/Flat';
import { signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { name, address, email, password } = await req.json();

    if (!name || !address || !email || !password)
      return NextResponse.json({ error: 'All fields required' }, { status: 400 });

    const existing = await Flat.findOne({ email });
    if (existing)
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });

    const hashed = await bcrypt.hash(password, 10);
    const flat = await Flat.create({ name, address, email, password: hashed });

    const token = signToken({ id: flat._id.toString(), flatId: flat._id.toString(), role: 'admin', name: flat.name });

    const res = NextResponse.json({ success: true, flat: { id: flat._id, name: flat.name } });
    res.cookies.set('token', token, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7 });
    return res;
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
