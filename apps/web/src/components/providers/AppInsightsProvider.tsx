'use client';

import { useEffect } from 'react';
import {
  ApplicationInsights,
  type IConfiguration,
} from '@applicationinsights/web';

let appInsights: ApplicationInsights | null = null;

export function getAppInsights(): ApplicationInsights | null {
  return appInsights;
}

export function AppInsightsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const connectionString = process.env['NEXT_PUBLIC_APPLICATIONINSIGHTS_CONNECTION_STRING'];
    if (!connectionString || appInsights) return;

    const config: IConfiguration = {
      connectionString,
      enableAutoRouteTracking: true,
    };
    appInsights = new ApplicationInsights({ config });
    appInsights.loadAppInsights();
    appInsights.trackPageView();
  }, []);

  return <>{children}</>;
}
