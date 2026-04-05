import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import WorkType from '@/models/WorkType';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  try {
    const auth = getAuthUser();
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await dbConnect();
    const types = await WorkType.find({ flatId: auth.flatId });
    return NextResponse.json(types);
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = getAuthUser();
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await dbConnect();
    const { name, icon, color } = await req.json();
    if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 });
    const wt = await WorkType.create({ name, icon: icon || '🧹', color: color || '#22c55e', flatId: auth.flatId });
    return NextResponse.json(wt);
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
