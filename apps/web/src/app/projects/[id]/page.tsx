'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { api, Project, SceneGraph } from '@/lib/api';
import { Navbar } from '@/components/layout/Navbar';
import { MaterialsBrowser } from '@/components/materials/MaterialsBrowser';
import { AssistantChat } from '@/components/assistant/AssistantChat';
import { RenderGallery } from '@/components/renders/RenderGallery';
import { SceneViewer } from '@/components/viewer/SceneViewer';

const ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'png', 'dwg', 'dxf', 'ifc', 'rvt'];
const MAX_FILE_SIZE = 200 * 1024 * 1024;
const b2cConfigured = !!process.env['NEXT_PUBLIC_ENTRA_B2C_CLIENT_ID'];

function useAuth() {
  if (!b2cConfigured) return true;
  try {
    const { useIsAuthenticated } = require('@azure/msal-react');
    return useIsAuthenticated();
  } catch { return true; }
}

type Tab = 'viewer' | 'materials' | 'renders' | 'assistant';

export default function ProjectPage() {
  const params = useParams();
  const projectId = params.id as string;
  const isAuthenticated = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [scene, setScene] = useState<SceneGraph | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('viewer');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && projectId) {
      api.projects.get(projectId).then(setProject).catch(console.error);
      api.scene.get(projectId).then(setScene).catch(() => {});
    }
  }, [isAuthenticated, projectId]);

  const handleUpload = useCallback(async (file: File) => {
    setError(null);
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setError(`Tipo não suportado: .${ext}`);
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('Ficheiro demasiado grande. Máximo: 200MB.');
      return;
    }

    setUploading(true);
    setUploadProgress('A obter URL de upload...');
    try {
      const sas = await api.uploads.requestSas(projectId, file.name, ext, file.size);

      // Real upload to Blob Storage (Azurite or Azure)
      setUploadProgress('A carregar para o armazenamento...');
      const uploadRes = await fetch(sas.uploadUrl, {
        method: 'PUT',
        headers: {
          'x-ms-blob-type': 'BlockBlob',
          'Content-Type': file.type || 'application/octet-stream',
        },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error(`Upload falhou: ${uploadRes.status} ${uploadRes.statusText}`);
      }

      setUploadProgress('A analisar planta...');
      await api.uploads.complete(projectId, sas.blobName, ext);

      const [updatedProject, updatedScene] = await Promise.all([
        api.projects.get(projectId),
        api.scene.get(projectId),
      ]);
      setProject(updatedProject);
      setScene(updatedScene);
      setUploadProgress(null);
      setActiveTab('viewer');
    } catch (err: any) {
      setError(err.message ?? 'Erro ao processar ficheiro');
    } finally {
      setUploading(false);
    }
  }, [projectId]);

  if (!isAuthenticated || !project) {
    return (
      <>
        <Navbar />
        <main className="flex min-h-[80vh] items-center justify-center bg-navy-900 text-white">
          <p>{!isAuthenticated ? 'Faça login.' : 'A carregar projeto...'}</p>
        </main>
      </>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'viewer', label: '3D' },
    { key: 'materials', label: 'Materiais' },
    { key: 'renders', label: 'Renders' },
    { key: 'assistant', label: 'Assistente' },
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-navy-900 px-6 py-6 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <a href="/dashboard" className="text-sm text-navy-100 hover:text-white transition">← Projetos</a>
              <h1 className="mt-1 font-display text-2xl font-bold">{project.name}</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  project.status === 'ready' ? 'bg-green-900/50 text-green-400' :
                  project.status === 'parsing' ? 'bg-yellow-900/50 text-yellow-400' :
                  'bg-navy-600 text-navy-100'
                }`}>{project.status}</span>
                {scene && (
                  <span className="text-xs text-navy-100">
                    {scene.rooms.length} divisões · {scene.walls.length} paredes · Confiança: {Math.round(scene.metadata.confidence * 100)}%
                  </span>
                )}
              </div>
            </div>
            <label className="cursor-pointer rounded bg-terracotta-500 px-4 py-2 text-sm font-semibold text-white hover:bg-terracotta-400 transition">
              {uploading ? uploadProgress : 'Carregar planta'}
              <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.dwg,.dxf,.ifc,.rvt"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} disabled={uploading} />
            </label>
          </div>

          {error && <div className="mb-4 rounded border border-red-800 bg-red-900/30 px-4 py-2 text-sm text-red-300">{error}</div>}

          {!scene && !uploading && (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-navy-600 bg-navy-700/30 p-16 transition hover:border-terracotta-400"
              onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleUpload(f); }}
              onDragOver={(e) => e.preventDefault()}>
              <p className="mb-2 text-lg font-semibold">Arraste uma planta para começar</p>
              <p className="text-sm text-navy-100">PDF, JPG, PNG, DWG, DXF, IFC, RVT — máx. 200MB</p>
            </div>
          )}

          {scene && (
            <>
              <div className="mb-4 flex gap-1 rounded-lg bg-navy-700/50 p-1">
                {tabs.map(t => (
                  <button key={t.key} onClick={() => setActiveTab(t.key)}
                    className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition ${
                      activeTab === t.key ? 'bg-terracotta-500 text-white' : 'text-navy-100 hover:text-white hover:bg-navy-600'
                    }`}>{t.label}</button>
                ))}
              </div>
              {activeTab === 'viewer' && <SceneViewer scene={scene} />}
              {activeTab === 'materials' && <MaterialsBrowser />}
              {activeTab === 'renders' && <RenderGallery projectId={projectId} />}
              {activeTab === 'assistant' && <AssistantChat projectId={projectId} />}
            </>
          )}
        </div>
      </main>
    </>
  );
}
