'use client';

import { LoginButton } from '@/components/auth/LoginButton';

export function Navbar() {
  return (
    <nav className="flex items-center justify-between border-b border-navy-700 bg-navy-900 px-6 py-3">
      <div className="flex items-center gap-2">
        <span className="font-display text-xl font-bold text-terracotta-400">PlantaViva</span>
      </div>
      <LoginButton />
    </nav>
  );
}
