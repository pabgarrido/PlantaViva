'use client';

import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { loginRequest } from '@/lib/msal';
import { InteractionStatus } from '@azure/msal-browser';

export function LoginButton() {
  const { instance, inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  const handleLogin = () => {
    instance.loginRedirect(loginRequest);
  };

  const handleLogout = () => {
    instance.logoutRedirect();
  };

  if (inProgress !== InteractionStatus.None) {
    return <button disabled className="rounded bg-navy-600 px-4 py-2 text-sm text-white opacity-50">A carregar...</button>;
  }

  if (isAuthenticated) {
    return (
      <button
        onClick={handleLogout}
        className="rounded bg-navy-600 px-4 py-2 text-sm text-white hover:bg-navy-500 transition"
      >
        Sair
      </button>
    );
  }

  return (
    <button
      onClick={handleLogin}
      className="rounded bg-terracotta-500 px-4 py-2 text-sm font-semibold text-white hover:bg-terracotta-400 transition"
    >
      Entrar
    </button>
  );
}
