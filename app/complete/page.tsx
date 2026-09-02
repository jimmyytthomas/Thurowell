'use client';

import { Suspense } from 'react';
import SessionComplete from '@/components/SessionComplete';

export default function CompletePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] text-[var(--text-secondary)]">
          <p className="font-light">Loading…</p>
        </div>
      }
    >
      <SessionComplete />
    </Suspense>
  );
}
