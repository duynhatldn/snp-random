import { connectMongo } from '@/lib/mongodb';
import { Room } from '../../models/Room';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { roomId, spin, winnerNumber } = await req.json();

  await connectMongo();

  await Room.updateOne(
    { roomId },
    { $push: { winners: { spin, winnerNumber } } } // ✅ Đúng theo schema
  );

  return NextResponse.json({ success: true });
}
