'use client';
import { useRef } from 'react';

export default function JackpotVideo({
  winner,
  onFinish,
}: {
  winner: number | null;
  onFinish: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <div
      className="relative w-full h-screen bg-black cursor-pointer"
      onClick={onFinish}
    >
      {/* ✅ Video full màn hình */}
      <video
        ref={videoRef}
        src="/spin.mp4"
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted
        preload="auto"
        onEnded={() => {
          // ✅ Giữ nguyên video không reset, chỉ chờ click mới thoát
        }}
      />

      {/* ✅ Hiển thị kết quả đè lên đúng giữa video */}
      {winner != null && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <span className="text-yellow-400 text-8xl font-extrabold tracking-widest drop-shadow-2xl">
            {winner.toString().padStart(3, '0')}
            </span>
        </div>
      )}

      {/* ✅ Hướng dẫn click khi hết video */}
      {winner !== null && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-white text-2xl animate-bounce">
          👉 BẤM VÀO ĐÂY ĐỂ TIẾP TỤC 👈
        </div>
      )}
    </div>
  );
}
