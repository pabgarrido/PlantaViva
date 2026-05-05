import type { Metadata } from 'next';
import './globals.css';
import { AppInsightsProvider } from '@/components/providers/AppInsightsProvider';

export const metadata: Metadata = {
  title: 'PlantaViva — Visualizações Arquitetónicas',
  description:
    'Plataforma de renderização com IA para arquitetos portugueses. Carregue plantas e obtenha visualizações fotorrealistas.',
  metadataBase: new URL(process.env['NEXT_PUBLIC_APP_URL'] ?? 'https://app.plantaviva.pt'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-PT">
      <body>
        <AppInsightsProvider>{children}</AppInsightsProvider>
      </body>
    </html>
  );
}
