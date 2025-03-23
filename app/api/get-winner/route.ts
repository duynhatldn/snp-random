import { connectMongo } from '@/lib/mongodb';
import { Room } from '../../models/Room';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get('roomId');
  const spin = Number(searchParams.get('spin'));

  if (!roomId || isNaN(spin)) {
    return NextResponse.json({ error: 'Thiếu roomId hoặc spin' }, { status: 400 });
  }

  await connectMongo();
  const room = await Room.findOne({ roomId });
  if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });

  const winner = room.winners.find((w: any) => w.spin === spin);

  if (!winner) {
    return NextResponse.json({ message: 'Chưa cài winner cho lượt quay này' });
  }

  return NextResponse.json({ spin: winner.spin, winnerNumber: winner.winnerNumber });
}
