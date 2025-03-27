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
  const [alreadyWon, setAlreadyWon] = useState<string[]>([]);
  const [winnersDisplay, setWinnersDisplay] = useState<Participant[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
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
    setIsSpinning(true);
  };

  const handleVideoEnded = async () => {
    if (!isSpinning) return;
    setIsSpinning(false);

    let selected: Participant | null = null;
    const spin = alreadyWon.length + 1;
    let winnerNumberFromServer: string | null = null;

    try {
      const res = await fetch(`/api/get-winner?roomId=${roomId}&spin=${spin}`);
      let data: any = null;
      try {
        const text = await res.text();
        data = text ? JSON.parse(text) : null;
      } catch (err) {
        console.warn('Response is not valid JSON:', err);
      }

      if (data && data.winnerNumber) {
        winnerNumberFromServer = String(data.winnerNumber);
      }
    } catch (err) {
      console.error('Failed to fetch winner:', err);
    }

    if (
      winnerNumberFromServer &&
      !alreadyWon.includes(winnerNumberFromServer) &&
      participants.some(p => p.number === winnerNumberFromServer)
    ) {
      selected = participants.find(p => p.number === winnerNumberFromServer) || null;
    }

    if (!selected) {
      const available = participants.filter(p => !alreadyWon.includes(p.number));
      selected = available[Math.floor(Math.random() * available.length)];
    }

    if (selected) {
      setWinner(selected);
      setAlreadyWon(prev => [...prev, selected.number]);
      setWinnersDisplay(prev => [...prev, selected]);
    }
  };

  const resetGame = () => {
    setWinner(null);
    setStartJackpot(false);
    setIsSpinning(false);
  };

  const resetWinnersDisplay = () => {
    setWinnersDisplay([]);
  };

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (!startJackpot && participants.length > 0) {
          handleSpin(); // bắt đầu quay
        } else if (startJackpot && !winner) {
          videoRef.current?.pause();
          await handleVideoEnded(); // dừng video và xử lý
        } else if (winner && !isSpinning) {
          resetGame(); // quay về trang chính
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [startJackpot, participants, winner, isSpinning]);

  return (
    <div className="relative min-h-screen text-white bg-black overflow-hidden">
      {/* ✅ Video nền lặp */}
      <video
        className="fixed inset-0 w-full h-full object-cover z-0"
        src="/background.mp4"
        autoPlay
        muted
        loop
      />

      {startJackpot ? (
        <div
          className="fixed inset-0 w-full h-full bg-black bg-opacity-80 z-50"
          onClick={() => {
            if (winner && !isSpinning) resetGame();
          }}
        >
          <video
            ref={videoRef}
            src="/jackpot.mp4"
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            muted
            preload="auto"
            onEnded={handleVideoEnded}
          />

          {winner && (
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
        <div className="flex flex-col items-center justify-center min-h-screen relative z-10">
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 mb-6">
            LUCKY DRAW
          </h1>

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

          {/* ✅ Danh sách người trúng + nút reset */}
          {winnersDisplay.length > 0 && (
            <div className="fixed top-5 left-5 bg-black bg-opacity-60 px-4 py-3 rounded-lg shadow-lg max-w-xs z-30">
              <h2 className="text-lg font-bold text-yellow-400 mb-2 border-b border-yellow-500 pb-1">
                🎉 Người đã trúng
              </h2>
              <ul className="space-y-1 text-white text-sm font-medium">
                {winnersDisplay.map((w, idx) => (
                  <li key={idx} className="pl-2 border-l-4 border-yellow-500">
                    {w.number.padStart(3, '0')}. {w.name}
                  </li>
                ))}
              </ul>
              <button
                onClick={resetWinnersDisplay}
                className="mt-3 w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-semibold"
              >
                🔄 Reset Round
              </button>
            </div>
          )}

          <div className="fixed bottom-4 left-4 text-white text-sm bg-black bg-opacity-50 px-4 py-2 rounded">
            Room ID: <b>{roomId}</b>
          </div>

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
