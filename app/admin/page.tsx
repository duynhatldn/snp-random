'use client';
import { useState } from 'react';

interface Player {
  name: string;
  number: number;
}

interface Winner {
  spin: number;
  winnerNumber: number;
}

interface RoomInfo {
  roomId: string;
  players: Player[];
  winners: Winner[];
}

export default function AdminPage() {
  const [inputRoomId, setInputRoomId] = useState('');
  const [spin, setSpin] = useState<number>(1);
  const [winnerNumber, setWinnerNumber] = useState<number>(0);
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);

  // ✅ Load room từ API
  const handleFetchRoom = async () => {
    if (!inputRoomId) return alert('Vui lòng nhập Room ID');
    const res = await fetch(`/api/get-room?roomId=${inputRoomId}`);
    const data = await res.json();
    if (data.error) alert(data.error);
    else setRoomInfo(data);
  };

  // ✅ Set 1 winner cho 1 spin
  const handlePredefine = async () => {
    if (!inputRoomId || !spin || !winnerNumber) return alert('Điền đủ thông tin');
    if (!roomInfo) return alert('Chưa load room');

    // ✅ Validate trùng lượt quay
    if (roomInfo.winners.some(w => w.spin === spin)) {
      return alert(`❌ Lượt quay ${spin} đã được cài winner trước đó!`);
    }

    // ✅ Validate số winner đã được set trúng ở lượt khác
    if (roomInfo.winners.some(w => w.winnerNumber === winnerNumber)) {
      return alert(`❌ Số ${winnerNumber} đã được set trúng ở lượt khác!`);
    }

    await fetch('/api/set-winner', {
      method: 'POST',
      body: JSON.stringify({ roomId: inputRoomId, spin, winnerNumber }),
    });

    alert('✅ Đã cài số trúng cho lượt quay!');
    
    // ✅ Reset input sau khi set
    setSpin(1);
    setWinnerNumber(0);
    handleFetchRoom(); // Reload lại room
  };

  return (
    <div className="p-5 max-w-3xl mx-auto text-white">
      <h1 className="text-3xl font-bold mb-8">🎯 Admin Control 🎯</h1>

      {/* ✅ Nhập Room ID */}
      <div className="mb-6">
        <input
          placeholder="🔑 Nhập Room ID"
          className="border p-3 w-full rounded bg-white text-black"
          value={inputRoomId}
          onChange={e => setInputRoomId(e.target.value)}
        />
        <button
          className="bg-green-600 hover:bg-green-700 text-white p-3 rounded mt-3 w-full"
          onClick={handleFetchRoom}
        >
          🔍 Load Room Info
        </button>
      </div>

      {/* ✅ Hiển thị Room Info */}
      {roomInfo && (
        <div className="bg-gray-800 p-4 rounded mb-6">
          <p><b>👥 Người chơi:</b></p>
          {roomInfo.players.length === 0 ? (
            <p className="italic">Không có người chơi</p>
          ) : (
            <ul className="list-disc list-inside">
              {roomInfo.players.map((player, idx) => (
                <li key={idx}>{player.name} - Số: {player.number}</li>
              ))}
            </ul>
          )}

          {/* ✅ Hiển thị winners */}
          <p className="mt-3"><b>🎯 Predefined Winners:</b></p>
          {roomInfo.winners.length === 0 ? (
            <p className="italic">Chưa cài số trúng</p>
          ) : (
            <ul className="list-disc list-inside">
              {roomInfo.winners.map((item, idx) => (
                <li key={idx}>Lượt {item.spin}: <b>{item.winnerNumber}</b></li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* ✅ Set Predefined Winner */}
      <div className="bg-gray-800 p-4 rounded">
        <h2 className="text-xl font-semibold mb-4">🎯 Set Winner</h2>
        <input
          type="number"
          placeholder="🔢 Lượt quay số mấy"
          className="border p-3 w-full rounded text-black mb-3"
          value={spin}
          onChange={e => setSpin(Number(e.target.value))}
        />
        <input
          type="number"
          placeholder="🏆 Số trúng muốn ra"
          className="border p-3 w-full rounded text-black mb-3"
          value={winnerNumber}
          onChange={e => setWinnerNumber(Number(e.target.value))}
        />
        <button
          className="bg-yellow-500 hover:bg-yellow-600 text-black p-3 rounded w-full"
          onClick={handlePredefine}
        >
          ✅ Cài Số Trúng
        </button>
      </div>
    </div>
  );
}
