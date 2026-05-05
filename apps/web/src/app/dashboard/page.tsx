'use client';

import { useEffect, useState } from 'react';
import { api, Project } from '@/lib/api';
import { Navbar } from '@/components/layout/Navbar';

const b2cConfigured = !!process.env['NEXT_PUBLIC_ENTRA_B2C_CLIENT_ID'];

function useAuth() {
  if (!b2cConfigured) return true;
  try {
    const { useIsAuthenticated } = require('@azure/msal-react');
    return useIsAuthenticated();
  } catch {
    return true;
  }
}

export default function DashboardPage() {
  const isAuthenticated = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      api.projects.list().then(setProjects).catch(console.error);
    }
  }, [isAuthenticated]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setLoading(true);
    try {
      const project = await api.projects.create(newName.trim());
      setProjects((prev) => [project, ...prev]);
      setNewName('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.projects.delete(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <Navbar />
        <main className="flex min-h-[80vh] flex-col items-center justify-center bg-navy-900 text-white">
          <h1 className="font-display text-4xl font-bold text-terracotta-400">PlantaViva</h1>
          <p className="mt-4 text-navy-100">Faça login para aceder ao painel.</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-navy-900 px-6 py-8 text-white">
        <div className="mx-auto max-w-4xl">
          <h1 className="font-display text-3xl font-bold">Os meus projetos</h1>

          {/* Create project */}
          <div className="mt-6 flex gap-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="Nome do projeto..."
              className="flex-1 rounded border border-navy-600 bg-navy-700 px-4 py-2 text-white placeholder-navy-100 focus:border-terracotta-400 focus:outline-none"
            />
            <button
              onClick={handleCreate}
              disabled={loading || !newName.trim()}
              className="rounded bg-terracotta-500 px-6 py-2 font-semibold text-white hover:bg-terracotta-400 transition disabled:opacity-50"
            >
              {loading ? 'A criar...' : 'Criar projeto'}
            </button>
          </div>

          {/* Project list */}
          <div className="mt-8 space-y-3">
            {projects.length === 0 && (
              <p className="text-navy-100">Ainda não tem projetos. Crie o primeiro acima.</p>
            )}
            {projects.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between rounded-lg border border-navy-700 bg-navy-700/50 px-5 py-4"
              >
                <div>
                  <h3 className="text-lg font-semibold">{project.name}</h3>
                  <p className="text-sm text-navy-100">
                    Estado: <span className="text-terracotta-400">{project.status}</span>
                    {' · '}
                    {new Date(project.createdAt).toLocaleDateString('pt-PT')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`/projects/${project.id}`}
                    className="rounded bg-navy-600 px-4 py-2 text-sm hover:bg-navy-500 transition"
                  >
                    Abrir
                  </a>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="rounded bg-red-900/50 px-4 py-2 text-sm text-red-300 hover:bg-red-900 transition"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
