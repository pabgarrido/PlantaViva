'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useIsAuthenticated } from '@azure/msal-react';
import { api, Project } from '@/lib/api';
import { Navbar } from '@/components/layout/Navbar';

const ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'png', 'dwg', 'dxf', 'ifc', 'rvt'];
const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB

export default function ProjectPage() {
  const params = useParams();
  const projectId = params.id as string;
  const isAuthenticated = useIsAuthenticated();
  const [project, setProject] = useState<Project | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && projectId) {
      api.projects.get(projectId).then(setProject).catch(console.error);
    }
  }, [isAuthenticated, projectId]);

  const getFileExtension = (filename: string): string => {
    return filename.split('.').pop()?.toLowerCase() ?? '';
  };

  const handleUpload = useCallback(async (file: File) => {
    setError(null);
    const ext = getFileExtension(file.name);
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setError(`Tipo de ficheiro não suportado: .${ext}. Use: ${ALLOWED_EXTENSIONS.join(', ')}`);
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

      setUploadProgress('A carregar ficheiro...');
      // Upload directly to Blob Storage via SAS URL
      const uploadRes = await fetch(sas.uploadUrl, {
        method: 'PUT',
        headers: {
          'x-ms-blob-type': 'BlockBlob',
          'Content-Type': file.type || 'application/octet-stream',
        },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error(`Upload falhou: ${uploadRes.status}`);
      }

      setUploadProgress('A processar...');
      await api.uploads.complete(projectId, sas.blobName, ext);

      // Refresh project state
      const updated = await api.projects.get(projectId);
      setProject(updated);
      setUploadProgress(null);
    } catch (err: any) {
      setError(err.message ?? 'Erro ao carregar ficheiro');
    } finally {
      setUploading(false);
    }
  }, [projectId]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  }, [handleUpload]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  if (!isAuthenticated) {
    return (
      <>
        <Navbar />
        <main className="flex min-h-[80vh] items-center justify-center bg-navy-900 text-white">
          <p>Faça login para aceder ao projeto.</p>
        </main>
      </>
    );
  }

  if (!project) {
    return (
      <>
        <Navbar />
        <main className="flex min-h-[80vh] items-center justify-center bg-navy-900 text-white">
          <p>A carregar projeto...</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-navy-900 px-6 py-8 text-white">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-between">
            <div>
              <a href="/dashboard" className="text-sm text-navy-100 hover:text-white transition">
                ← Voltar aos projetos
              </a>
              <h1 className="mt-2 font-display text-3xl font-bold">{project.name}</h1>
              <p className="text-sm text-navy-100">
                Estado: <span className="text-terracotta-400">{project.status}</span>
              </p>
            </div>
          </div>

          {/* Upload zone */}
          <div
            className="mt-8 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-navy-600 bg-navy-700/30 p-12 transition hover:border-terracotta-400"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            {uploading ? (
              <div className="text-center">
                <div className="mb-3 h-8 w-8 animate-spin rounded-full border-4 border-terracotta-400 border-t-transparent mx-auto" />
                <p className="text-navy-100">{uploadProgress}</p>
              </div>
            ) : (
              <>
                <p className="mb-2 text-lg font-semibold">Arraste um ficheiro ou clique para selecionar</p>
                <p className="mb-4 text-sm text-navy-100">
                  PDF, JPG, PNG, DWG, DXF, IFC, RVT — máx. 200MB
                </p>
                <label className="cursor-pointer rounded bg-terracotta-500 px-6 py-2 font-semibold text-white hover:bg-terracotta-400 transition">
                  Selecionar ficheiro
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png,.dwg,.dxf,.ifc,.rvt"
                    onChange={handleFileSelect}
                  />
                </label>
              </>
            )}
          </div>

          {error && (
            <div className="mt-4 rounded border border-red-800 bg-red-900/30 px-4 py-3 text-red-300">
              {error}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
