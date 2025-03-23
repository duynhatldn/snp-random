'use client';
import { Suspense } from 'react';
import ParticipantsPageClient from './ParticipantsPageClient';

export default function ParticipantsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ParticipantsPageClient />
    </Suspense>
  );
}
