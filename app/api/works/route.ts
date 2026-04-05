import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Work from '@/models/Work';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = getAuthUser();
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const userId = searchParams.get('userId');

    const query: Record<string, unknown> = { flatId: auth.flatId };
    if (date) query.date = date;
    if (userId) query.userId = userId;
    // If not admin, only show own works
    if (auth.role === 'member') query.userId = auth.id;

    const works = await Work.find(query)
      .populate('userId', 'name email')
      .populate('workTypeId', 'name icon color')
      .sort({ date: -1, createdAt: -1 });

    return NextResponse.json(works);
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = getAuthUser();
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await dbConnect();

    const { userId, workTypeId, date, notes } = await req.json();
    if (!userId || !workTypeId || !date)
      return NextResponse.json({ error: 'userId, workTypeId, date required' }, { status: 400 });

    const work = await Work.create({
      userId,
      workTypeId,
      date,
      notes,
      flatId: auth.flatId,
      completed: false,
    });

    const populated = await work.populate([
      { path: 'userId', select: 'name email' },
      { path: 'workTypeId', select: 'name icon color' },
    ]);

    return NextResponse.json(populated);
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
