'use client';

const b2cConfigured = !!process.env['NEXT_PUBLIC_ENTRA_B2C_CLIENT_ID'];

function MsalLoginButton() {
  // Dynamic import to avoid MSAL errors when not configured
  const { useIsAuthenticated, useMsal } = require('@azure/msal-react');
  const { loginRequest } = require('@/lib/msal');
  const { InteractionStatus } = require('@azure/msal-browser');

  const { instance, inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  if (inProgress !== InteractionStatus.None) {
    return <button disabled className="rounded bg-navy-600 px-4 py-2 text-sm text-white opacity-50">A carregar...</button>;
  }

  if (isAuthenticated) {
    return (
      <button
        onClick={() => instance.logoutRedirect()}
        className="rounded bg-navy-600 px-4 py-2 text-sm text-white hover:bg-navy-500 transition"
      >
        Sair
      </button>
    );
  }

  return (
    <button
      onClick={() => instance.loginRedirect(loginRequest)}
      className="rounded bg-terracotta-500 px-4 py-2 text-sm font-semibold text-white hover:bg-terracotta-400 transition"
    >
      Entrar
    </button>
  );
}

export function LoginButton() {
  if (!b2cConfigured) {
    return (
      <span className="rounded bg-navy-600 px-4 py-2 text-sm text-navy-100">
        Dev mode (sem B2C)
      </span>
    );
  }

  return <MsalLoginButton />;
}
