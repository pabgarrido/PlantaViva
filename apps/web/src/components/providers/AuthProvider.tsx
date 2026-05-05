'use client';

import { MsalProvider } from '@azure/msal-react';
import { msalInstance } from '@/lib/msal';
import { ReactNode, useEffect, useState } from 'react';

const b2cConfigured = !!process.env['NEXT_PUBLIC_ENTRA_B2C_CLIENT_ID'];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(!b2cConfigured);

  useEffect(() => {
    if (b2cConfigured) {
      msalInstance.initialize().then(() => setReady(true)).catch(() => setReady(true));
    }
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-900 text-white">
        <p>A carregar...</p>
      </div>
    );
  }

  if (!b2cConfigured) {
    return <>{children}</>;
  }

  return <MsalProvider instance={msalInstance}>{children}</MsalProvider>;
}
