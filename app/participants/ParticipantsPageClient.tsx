'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ParticipantsPageClient() {
  const [members, setMembers] = useState<{ name: string; number: string }[]>([{ name: '', number: '' }]);
  const [roomId, setRoomId] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const id = searchParams.get('roomId') || '';
    setRoomId(id);
  }, [searchParams]);

  const handleAddMember = () => {
    setMembers((prev) => [...prev, { name: '', number: '' }]);
    setTimeout(() => {
      inputRefs.current[members.length]?.focus();
    }, 100);
  };

  const handleChange = (index: number, field: 'name' | 'number', value: string) => {
    const updated = [...members];
    updated[index][field] = field === 'number' ? value.replace(/\D/g, '') : value;
    setMembers(updated);
  };

  const handleRemoveMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!roomId) return alert('Không tìm thấy Room ID');

    const isValid = members.every((m) => m.name.trim() !== '' && m.number.trim() !== '');
    if (!isValid) return alert('❌ Vui lòng nhập đầy đủ TÊN và SỐ THỨ TỰ cho tất cả!');

    const participantNumbers = members.map((m) => ({ name: m.name, number: m.number }));

    const res = await fetch('/api/create-room', {
      method: 'POST',
      body: JSON.stringify({ roomId, players: participantNumbers }),
    });

    const data = await res.json();
    if (data.error) return alert('Lỗi: ' + data.error);

    localStorage.setItem(`participants-${roomId}`, JSON.stringify(members));
    alert('✅ Đã lưu danh sách người chơi!');
    router.push(`/?roomId=${roomId}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddMember();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-5">
      <h1 className="text-3xl font-bold mb-6">📋 Danh sách người tham gia</h1>

      {members.map((m, i) => (
        <div key={i} className="flex gap-2 mb-4">
          <input
            ref={(el) => { inputRefs.current[i] = el; }}
            placeholder="Tên"
            className="p-3 rounded bg-gray-800 flex-1"
            value={m.name}
            onChange={(e) => handleChange(i, 'name', e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, i)}
          />
          <input
            placeholder="Số thứ tự"
            className="p-3 rounded bg-gray-800 w-32"
            value={m.number}
            onChange={(e) => handleChange(i, 'number', e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, i)}
          />
          <button className="bg-red-600 px-4 rounded" onClick={() => handleRemoveMember(i)}>
            Xóa
          </button>
        </div>
      ))}

      <div className="flex gap-4 mt-6">
        <button onClick={handleAddMember} className="bg-blue-600 hover:bg-blue-700 p-3 rounded">
          ➕ Thêm người
        </button>
        <button onClick={handleSave} className="bg-green-600 hover:bg-green-700 p-3 rounded">
          💾 Lưu danh sách
        </button>
      </div>
    </div>
  );
}
