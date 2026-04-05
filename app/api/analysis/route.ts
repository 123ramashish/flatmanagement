import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Work from '@/models/Work';
import User from '@/models/User';
import WorkType from '@/models/WorkType';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = getAuthUser();
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const userId = searchParams.get('userId');
    const workTypeId = searchParams.get('workTypeId');

    const query: Record<string, unknown> = { flatId: auth.flatId };
    if (startDate && endDate) query.date = { $gte: startDate, $lte: endDate };
    else if (startDate) query.date = { $gte: startDate };
    else if (endDate) query.date = { $lte: endDate };
    if (userId) query.userId = userId;
    if (workTypeId) query.workTypeId = workTypeId;

    const works = await Work.find(query)
      .populate('userId', 'name email')
      .populate('workTypeId', 'name icon color');

    const users = await User.find({ flatId: auth.flatId }, 'name email');
    const workTypes = await WorkType.find({ flatId: auth.flatId }, 'name icon color');

    // Build matrix: for each user x workType
    const matrix: Record<string, Record<string, { total: number; completed: number }>> = {};
    for (const u of users) {
      matrix[u._id.toString()] = {};
      for (const wt of workTypes) {
        matrix[u._id.toString()][wt._id.toString()] = { total: 0, completed: 0 };
      }
    }

    for (const w of works) {
      const uid = (w.userId as { _id: { toString(): string } })._id.toString();
      const wtid = (w.workTypeId as { _id: { toString(): string } })._id.toString();
      if (matrix[uid]?.[wtid]) {
        matrix[uid][wtid].total++;
        if (w.completed) matrix[uid][wtid].completed++;
      }
    }

    return NextResponse.json({ works, users, workTypes, matrix });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
