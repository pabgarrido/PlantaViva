'use client';

import { MsalProvider } from '@azure/msal-react';
import { msalInstance } from '@/lib/msal';
import { ReactNode, useEffect, useState } from 'react';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    msalInstance.initialize().then(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-900 text-white">
        <p>A carregar...</p>
      </div>
    );
  }

  return <MsalProvider instance={msalInstance}>{children}</MsalProvider>;
}
