'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import Spinner from '@/app/components/Spinner';

export default function RoomPage() {
  const { roomId } = useParams();
  const [winner, setWinner] = useState<number | null>(null);

  const handleSpin = async () => {
    const res = await fetch(`/api/spin?roomId=${roomId}`);
    const data = await res.json();
    setWinner(data.winner);
  };

  return (
    <div className="p-5 text-center">
      <h1 className="text-2xl font-bold mb-5">Room: {roomId}</h1>
      <Spinner number={winner} />
      <button onClick={handleSpin} className="mt-8 bg-orange-500 text-white px-6 py-3 rounded">
        Spin Now
      </button>
    </div>
  );
}
