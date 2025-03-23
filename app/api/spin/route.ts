import { connectMongo } from '@/lib/mongodb';
import { Room } from '../../models/Room';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const roomId = req.nextUrl.searchParams.get('roomId');
  const turn = parseInt(req.nextUrl.searchParams.get('turn') || '1');
  await connectMongo();

  const room = await Room.findOne({ roomId });
  if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });

  // Check winner setup trước
  const setup = room.winners.find((w: any) => w.turn === turn);
  let winner;
  if (setup) {
    winner = room.players.find((p: any) => p.number === setup.number);
  } else {
    // Random trong players chưa trúng
    const excluded = room.winners.map((w: any) => w.number);
    const candidates = room.players.filter((p: any) => !excluded.includes(p.number));
    winner = candidates[Math.floor(Math.random() * candidates.length)];
  }

  return NextResponse.json({ winner });
}
