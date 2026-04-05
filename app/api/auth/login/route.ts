import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Flat from '@/models/Flat';
import { signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { email, password, loginAs } = await req.json();

    if (loginAs === 'flat') {
      const flat = await Flat.findOne({ email });
      if (!flat) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      const valid = await bcrypt.compare(password, flat.password);
      if (!valid) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

      const token = signToken({ id: flat._id.toString(), flatId: flat._id.toString(), role: 'admin', name: flat.name });
      const res = NextResponse.json({ success: true, role: 'admin', name: flat.name });
      res.cookies.set('token', token, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7 });
      return res;
    } else {
      const user = await User.findOne({ email });
      if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

      const token = signToken({ id: user._id.toString(), flatId: user.flatId.toString(), role: user.role, name: user.name });
      const res = NextResponse.json({ success: true, role: user.role, name: user.name });
      res.cookies.set('token', token, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7 });
      return res;
    }
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
