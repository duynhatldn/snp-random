'use client';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function FloatingNumbers({ numbers, winner }: { numbers: number[], winner: number | null }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const floating = gsap.utils.toArray('.number-item');
    if (winner === null) {
      // Animate bay lơ lửng
      floating.forEach((el: any) => {
        gsap.to(el, {
          x: () => Math.random() * 400 - 200,
          y: () => Math.random() * 300 - 150,
          duration: 2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        });
      });
    } else {
      // Clear animation khi có winner
      gsap.killTweensOf(floating);
    }
  }, [winner]);

  return (
    <div ref={containerRef} className="relative w-full h-[400px] bg-black rounded-lg shadow-lg overflow-hidden">
      {/* Render số bay */}
      {numbers.map((num, i) => (
        <div key={i} className="number-item absolute text-white text-3xl font-bold">
          {num}
        </div>
      ))}

      {/* Số trúng rớt xuống */}
      {winner !== null && (
        <div className="absolute top-1/2 left-1/2 text-yellow-400 text-6xl font-extrabold animate-bounce" style={{ transform: 'translate(-50%, -50%)' }}>
          🎯 {winner} 🎯
        </div>
      )}
    </div>
  );
}
