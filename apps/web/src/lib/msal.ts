'use client';

import { PublicClientApplication, Configuration, LogLevel } from '@azure/msal-browser';

const msalConfig: Configuration = {
  auth: {
    clientId: process.env['NEXT_PUBLIC_ENTRA_B2C_CLIENT_ID'] ?? '',
    authority: `https://${process.env['NEXT_PUBLIC_ENTRA_B2C_TENANT']}.b2clogin.com/${process.env['NEXT_PUBLIC_ENTRA_B2C_TENANT']}.onmicrosoft.com/${process.env['NEXT_PUBLIC_ENTRA_B2C_POLICY'] ?? 'B2C_1_signup_signin'}`,
    knownAuthorities: [
      `${process.env['NEXT_PUBLIC_ENTRA_B2C_TENANT']}.b2clogin.com`,
    ],
    redirectUri: typeof window !== 'undefined' ? window.location.origin : '/',
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      logLevel: LogLevel.Warning,
    },
  },
};

export const msalInstance = new PublicClientApplication(msalConfig);

export const loginRequest = {
  scopes: ['openid', 'profile', 'offline_access'],
};
