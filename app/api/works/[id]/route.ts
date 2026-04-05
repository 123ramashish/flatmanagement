import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Work from '@/models/Work';
import { getAuthUser } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = getAuthUser();
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await dbConnect();

    const { completed } = await req.json();
    const work = await Work.findOneAndUpdate(
      { _id: params.id, flatId: auth.flatId },
      { completed, completedAt: completed ? new Date() : null },
      { new: true }
    ).populate('userId', 'name email').populate('workTypeId', 'name icon color');

    return NextResponse.json(work);
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = getAuthUser();
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await dbConnect();
    await Work.findOneAndDelete({ _id: params.id, flatId: auth.flatId });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
