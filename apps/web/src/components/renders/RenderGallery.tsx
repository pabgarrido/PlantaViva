'use client';

import { useState } from 'react';
import type { SceneViewerHandle } from '@/components/viewer/SceneViewer';

interface RenderItem {
  id: string;
  tier: string;
  resolution: string;
  dataUrl: string;
  createdAt: string;
}

interface Props {
  projectId: string;
  viewerRef: React.RefObject<SceneViewerHandle | null>;
}

export function RenderGallery({ projectId, viewerRef }: Props) {
  const [renders, setRenders] = useState<RenderItem[]>([]);
  const [generating, setGenerating] = useState(false);

  const generate = (tier: string) => {
    if (!viewerRef.current) return;
    setGenerating(true);

    // Generate actual PNG from the canvas
    const dataUrl = viewerRef.current.exportPNG();
    if (dataUrl) {
      const item: RenderItem = {
        id: `render-${Date.now()}`,
        tier,
        resolution: tier === 'draft' ? '1024×1024' : tier === 'standard' ? '2048×2048' : '4096×4096',
        dataUrl,
        createdAt: new Date().toISOString(),
      };
      setRenders(prev => [item, ...prev]);
    }
    setGenerating(false);
  };

  const download = (item: RenderItem) => {
    const link = document.createElement('a');
    link.href = item.dataUrl;
    link.download = `plantaviva-${item.tier}-${item.id}.png`;
    link.click();
  };

  const tierInfo: Record<string, { label: string; desc: string; cost: string }> = {
    draft: { label: 'Draft', desc: '1024×1024', cost: '€0.05' },
    standard: { label: 'Standard', desc: '2048×2048', cost: '€0.40' },
    premium: { label: 'Premium', desc: '4096×4096', cost: '€2.50' },
  };

  return (
    <div className="rounded-lg border border-navy-700 bg-navy-700/30 p-4">
      <h3 className="mb-3 text-lg font-semibold">Renderizações</h3>

      {/* Tier buttons */}
      <div className="mb-4 flex gap-2">
        {Object.entries(tierInfo).map(([tier, info]) => (
          <button key={tier} onClick={() => generate(tier)} disabled={generating}
            className="flex-1 rounded border border-navy-600 bg-navy-600/50 px-3 py-2 text-left hover:bg-navy-600 transition disabled:opacity-50">
            <p className="text-sm font-semibold">{info.label}</p>
            <p className="text-xs text-navy-100">{info.desc}</p>
            <p className="text-xs text-terracotta-400">{info.cost}</p>
          </button>
        ))}
      </div>

      {/* Render list with real images */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {renders.map(item => (
          <div key={item.id} className="rounded bg-navy-600/50 p-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-medium capitalize">{item.tier} — {item.resolution}</p>
                <p className="text-xs text-navy-100">{new Date(item.createdAt).toLocaleString('pt-PT')}</p>
              </div>
              <button onClick={() => download(item)}
                className="rounded bg-terracotta-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-terracotta-400 transition">
                Descarregar PNG
              </button>
            </div>
            <img src={item.dataUrl} alt={`Render ${item.tier}`} className="w-full rounded border border-navy-700" />
          </div>
        ))}
        {renders.length === 0 && (
          <p className="text-sm text-navy-100">Clique num nível acima para gerar uma imagem da planta com os materiais aplicados.</p>
        )}
      </div>
    </div>
  );
}
