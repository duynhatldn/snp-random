import { connectMongo } from '@/lib/mongodb';
import { Room } from '../../models/Room';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { roomId, players } = await req.json(); 
  if (!players || players.length === 0) {
    return NextResponse.json({ error: 'Players list is required' }, { status: 400 });
  }

  await connectMongo();
  const newRoom = await Room.create({
    roomId,
    players, 
    winners: [],
  });

  return NextResponse.json({ success: true, roomId: newRoom.roomId });
}