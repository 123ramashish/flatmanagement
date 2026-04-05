import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Message from '@/models/Message';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  try {
    const auth = getAuthUser();
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await dbConnect();

    const messages = await Message.find({ flatId: auth.flatId })
      .populate('userId', 'name')
      .sort({ createdAt: 1 })
      .limit(100);

    return NextResponse.json(messages);
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = getAuthUser();
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await dbConnect();

    const body = await req.json();
    const { text, imageUrl, workId } = body;

    if (!text && !imageUrl)
      return NextResponse.json({ error: 'text or imageUrl required' }, { status: 400 });

    const msg = await Message.create({
      flatId: auth.flatId,
      userId: auth.id,
      text,
      imageUrl,
      workId,
    });

    const populated = await msg.populate('userId', 'name');
    return NextResponse.json(populated);
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
