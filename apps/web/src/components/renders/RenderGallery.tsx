'use client';

import { useEffect, useState } from 'react';
import { api, RenderJob } from '@/lib/api';

export function RenderGallery({ projectId }: { projectId: string }) {
  const [renders, setRenders] = useState<RenderJob[]>([]);
  const [creating, setCreating] = useState(false);

  const load = () => {
    api.renders.list(projectId).then(setRenders).catch(console.error);
  };

  useEffect(() => { load(); }, [projectId]);

  // Poll for status updates
  useEffect(() => {
    const hasActive = renders.some(r => r.status === 'queued' || r.status === 'processing');
    if (!hasActive) return;
    const interval = setInterval(load, 2000);
    return () => clearInterval(interval);
  }, [renders, projectId]);

  const requestRender = async (tier: string) => {
    setCreating(true);
    try {
      await api.renders.create(projectId, tier);
      load();
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const statusLabel: Record<string, string> = {
    queued: 'Na fila',
    processing: 'A gerar...',
    completed: 'Concluído',
    failed: 'Erro',
  };

  const tierInfo: Record<string, { label: string; desc: string; cost: string }> = {
    draft: { label: 'Draft', desc: '1024×1024 · ~30s', cost: '€0.05' },
    standard: { label: 'Standard', desc: '2048×2048 · ~5min', cost: '€0.40' },
    premium: { label: 'Premium', desc: '4096×4096 · ~30min', cost: '€2.50' },
  };

  return (
    <div className="rounded-lg border border-navy-700 bg-navy-700/30 p-4">
      <h3 className="mb-3 text-lg font-semibold">Renderizações</h3>

      {/* Tier buttons */}
      <div className="mb-4 flex gap-2">
        {Object.entries(tierInfo).map(([tier, info]) => (
          <button
            key={tier}
            onClick={() => requestRender(tier)}
            disabled={creating}
            className="flex-1 rounded border border-navy-600 bg-navy-600/50 px-3 py-2 text-left hover:bg-navy-600 transition disabled:opacity-50"
          >
            <p className="text-sm font-semibold">{info.label}</p>
            <p className="text-xs text-navy-100">{info.desc}</p>
            <p className="text-xs text-terracotta-400">{info.cost}</p>
          </button>
        ))}
      </div>

      {/* Render list */}
      <div className="space-y-2 max-h-[250px] overflow-y-auto">
        {renders.map(job => (
          <div key={job.id} className="flex items-center gap-3 rounded bg-navy-600/50 px-3 py-2">
            {/* Thumbnail / status */}
            <div className="flex h-12 w-12 items-center justify-center rounded bg-navy-700 text-xs">
              {job.status === 'completed' ? '🖼️' :
               job.status === 'processing' ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-terracotta-400 border-t-transparent" />
               ) : '⏳'}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium capitalize">{job.tier} — {job.resolution}</p>
              <p className="text-xs text-navy-100">
                {statusLabel[job.status] ?? job.status}
                {job.estimatedCostEur != null && ` · ${job.estimatedCostEur.toFixed(2)}€`}
              </p>
            </div>
            <p className="text-xs text-navy-100">
              {new Date(job.createdAt).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        ))}
        {renders.length === 0 && (
          <p className="text-sm text-navy-100">Nenhuma renderização ainda. Escolha um nível acima.</p>
        )}
      </div>
    </div>
  );
}
