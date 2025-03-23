import { connectMongo } from '@/lib/mongodb';
import { Room } from '../../../models/Room';

export async function GET(req: Request, { params }: { params: { roomId: string } }) {
  await connectMongo();
  const room = await Room.findOne({ roomId: params.roomId });
  if (!room) return Response.json({ success: false, message: 'Room không tồn tại' });

  return Response.json({ success: true, data: room });
}
