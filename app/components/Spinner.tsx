'use client';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function Spinner({ number }: { number: number | null }) {
  const spinnerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (number !== null && spinnerRef.current) {
      gsap.fromTo(
        spinnerRef.current,
        { rotate: 0 },
        { rotate: 1440, duration: 2, ease: 'power4.out' }
      );
    }
  }, [number]);

  return (
    <div
      ref={spinnerRef}
      className="w-64 h-64 rounded-full border-8 border-blue-500 flex items-center justify-center text-4xl font-bold bg-white shadow-xl"
    >
      {number !== null ? number : 'READY'}
    </div>
  );
}
