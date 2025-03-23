import { connectMongo } from '@/lib/mongodb';
import { Room } from '../../models/Room';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get('roomId');
  if (!roomId) return NextResponse.json({ error: 'Missing roomId' }, { status: 400 });

  await connectMongo();
  const room = await Room.findOne({ roomId });
  console.log(room);
  if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });

  return NextResponse.json(room);
}
