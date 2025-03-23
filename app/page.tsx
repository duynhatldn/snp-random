'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

type Participant = {
  name: string;
  number: string;
};

export default function HomePage() {
  const [roomId, setRoomId] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [winner, setWinner] = useState<Participant | null>(null);
  const [startJackpot, setStartJackpot] = useState(false);
  const [videoPhase, setVideoPhase] = useState(1);
  const [alreadyWon, setAlreadyWon] = useState<string[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    let id = urlParams.get('roomId');

    if (id) {
      setRoomId(id);
      const saved = localStorage.getItem(`participants-${id}`);
      if (saved) setParticipants(JSON.parse(saved));
    } else {
      const newId = Math.floor(10000 + Math.random() * 90000).toString();
      setRoomId(newId);
      localStorage.removeItem(`participants-${newId}`);
    }
  }, []);

  const handleSpin = () => {
    if (participants.length === 0) return;
    setStartJackpot(true);
    setVideoPhase(1);
  };

  const handleVideoEnded = async () => {
    if (videoPhase === 1) {
      setVideoPhase(2);
      let selected: Participant | null = null;

      // ✅ Gọi API lấy winner nếu có setup
      const spin = alreadyWon.length + 1;
      let winnerNumberFromServer: string | null = null;
      try {
        const res = await fetch(`/api/get-winner?roomId=${roomId}&spin=${spin}`);
        const data = await res.json();
        if (data.winnerNumber) winnerNumberFromServer = String(data.winnerNumber);
      } catch (err) {
        console.error('Failed to fetch winner:', err);
      }

      // ✅ Check nếu số winner setup hợp lệ và chưa từng trúng
      if (
        winnerNumberFromServer &&
        !alreadyWon.includes(winnerNumberFromServer) &&
        participants.some(p => p.number === winnerNumberFromServer)
      ) {
        selected = participants.find(p => p.number === winnerNumberFromServer) || null;
      }

      // ✅ Nếu không hợp lệ hoặc không tồn tại → random nhưng tránh số trúng cũ
      if (!selected) {
        const available = participants.filter(p => !alreadyWon.includes(p.number));
        selected = available[Math.floor(Math.random() * available.length)];
      }

      // ✅ Cập nhật người trúng + danh sách số đã trúng
      if (selected) {
        setWinner(selected);
        setAlreadyWon(prev => [...prev, selected.number]);
      }
    }
  };

  const resetGame = () => {
    setStartJackpot(false);
    setWinner(null);
    setVideoPhase(1);
  };

  return (
    <div className="relative min-h-screen text-white bg-black overflow-hidden">
      {startJackpot ? (
        <div
          className="fixed inset-0 w-full h-full bg-black z-50"
          onClick={videoPhase === 2 && winner ? resetGame : undefined}
        >
          <video
            ref={videoRef}
            src={videoPhase === 1 ? '/video1.mp4' : '/video2.mp4'}
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            muted
            preload="auto"
            onEnded={handleVideoEnded}
          />
          {videoPhase === 2 && winner && (
            <div
              className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-drop"
              style={{
                width: '260px',
                height: '360px',
                background: 'linear-gradient(160deg, #1a1a1a 20%, #444 80%)',
                border: '3px solid #aaa',
                borderRadius: '20px',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '5rem',
                fontWeight: 'bold',
                textShadow: '0 0 25px #fff',
                boxShadow: '0 0 60px rgba(255,255,255,0.5)',
              }}
            >
              {winner.number.padStart(3, '0')}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 mb-6">
            LUCKY DRAW
          </h1>

          {/* ✅ Room ID giữ góc dưới bên trái */}
          <div className="fixed bottom-4 left-4 text-white text-sm bg-black bg-opacity-50 px-4 py-2 rounded">
            Room ID: <b>{roomId}</b>
          </div>

          {/* ✅ Nút Quay đúng trung tâm */}
          <button
            onClick={handleSpin}
            disabled={participants.length === 0}
            className={`px-10 py-5 text-2xl font-bold rounded-xl shadow ${
              participants.length === 0
                ? 'bg-gray-500 cursor-not-allowed'
                : 'bg-yellow-500 hover:bg-yellow-600 text-black'
            }`}
          >
            🎯 QUAY 🎯
          </button>

          {/* ✅ Chuyển sang thêm người */}
          <button
            onClick={() => router.push(`/participants?roomId=${roomId}`)}
            className="fixed bottom-5 right-5 bg-gray-700 hover:bg-gray-800 text-white p-4 rounded-full shadow-lg text-sm"
          >
            ✍️ Tạo / Sửa Danh Sách
          </button>
        </div>
      )}
    </div>
  );
}
