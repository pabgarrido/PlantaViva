const API_BASE = process.env['NEXT_PUBLIC_CORE_API_URL'] ?? 'http://localhost:3001';

async function apiFetch<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('pv_access_token') : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(opts.headers as Record<string, string> ?? {}),
  };

  const res = await fetch(`${API_BASE}/api/v1${path}`, {
    ...opts,
    headers,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${res.status}: ${body}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export interface Project {
  id: string;
  ownerId: string;
  name: string;
  status: string;
  location?: { lat: number; lng: number; label: string };
  createdAt: string;
  updatedAt: string;
}

export interface SasUrlResult {
  uploadUrl: string;
  blobName: string;
  expiresAt: string;
}

export const api = {
  projects: {
    list: () => apiFetch<Project[]>('/projects'),
    get: (id: string) => apiFetch<Project>(`/projects/${encodeURIComponent(id)}`),
    create: (name: string) => apiFetch<Project>('/projects', { method: 'POST', body: JSON.stringify({ name }) }),
    update: (id: string, data: Partial<Project>) =>
      apiFetch<Project>(`/projects/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => apiFetch<void>(`/projects/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  },
  uploads: {
    requestSas: (projectId: string, filename: string, fileType: string, fileSize: number) =>
      apiFetch<SasUrlResult>(`/projects/${encodeURIComponent(projectId)}/uploads/sas`, {
        method: 'POST',
        body: JSON.stringify({ filename, fileType, fileSize }),
      }),
    complete: (projectId: string, blobName: string, fileType: string) =>
      apiFetch<{ status: string }>(`/projects/${encodeURIComponent(projectId)}/uploads/complete`, {
        method: 'POST',
        body: JSON.stringify({ blobName, fileType }),
      }),
  },
};
