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

export interface SceneGraph {
  schemaVersion: string;
  units: string;
  rooms: Array<{ id: string; name: string; polygon: [number, number][]; ceilingHeight: number; floor?: string }>;
  walls: Array<{ id: string; from: [number, number]; to: [number, number]; thickness: number; height: number; openings: SceneOpening[] }>;
  openings: SceneOpening[];
  metadata: { parsedFrom: string; confidence: number; needsReview: boolean };
}

export interface SceneOpening {
  id: string;
  type: 'door' | 'window';
  wallId: string;
  position: number;
  width: number;
  height: number;
}

export interface Material {
  id: string;
  slug: string;
  namePt: string;
  nameEs: string;
  nameEn: string;
  category: string;
  supplier?: string;
  tags: string[];
  pbrMaps: Record<string, string | undefined>;
}

export interface RenderJob {
  id: string;
  projectId: string;
  tier: string;
  status: string;
  resolution?: string;
  resultUrl?: string;
  gpuSeconds?: number;
  estimatedCostEur?: number;
  createdAt: string;
  completedAt?: string;
}

export interface AssistantResponse {
  reply: string;
  actions: Array<{ tool: string; args: Record<string, unknown> }>;
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
      apiFetch<{ status: string; scene?: SceneGraph }>(`/projects/${encodeURIComponent(projectId)}/uploads/complete`, {
        method: 'POST',
        body: JSON.stringify({ blobName, fileType }),
      }),
  },
  scene: {
    get: (projectId: string) => apiFetch<SceneGraph>(`/projects/${encodeURIComponent(projectId)}/scene`),
    patch: (projectId: string, data: Partial<SceneGraph>) =>
      apiFetch<SceneGraph>(`/projects/${encodeURIComponent(projectId)}/scene`, { method: 'PATCH', body: JSON.stringify(data) }),
    regenerate: (projectId: string) =>
      apiFetch<SceneGraph>(`/projects/${encodeURIComponent(projectId)}/scene/regenerate`, { method: 'POST' }),
  },
  materials: {
    list: (params?: { category?: string; supplier?: string; q?: string }) => {
      const qs = new URLSearchParams();
      if (params?.category) qs.set('category', params.category);
      if (params?.supplier) qs.set('supplier', params.supplier);
      if (params?.q) qs.set('q', params.q);
      const query = qs.toString();
      return apiFetch<Material[]>(`/materials${query ? `?${query}` : ''}`);
    },
    categories: () => apiFetch<string[]>('/materials/categories'),
    suppliers: () => apiFetch<string[]>('/materials/suppliers'),
  },
  renders: {
    create: (projectId: string, tier: string) =>
      apiFetch<RenderJob>(`/projects/${encodeURIComponent(projectId)}/renders`, { method: 'POST', body: JSON.stringify({ tier }) }),
    list: (projectId: string) => apiFetch<RenderJob[]>(`/projects/${encodeURIComponent(projectId)}/renders`),
    get: (id: string) => apiFetch<RenderJob>(`/renders/${encodeURIComponent(id)}`),
  },
  assistant: {
    chat: (projectId: string, message: string) =>
      apiFetch<AssistantResponse>(`/projects/${encodeURIComponent(projectId)}/assistant`, { method: 'POST', body: JSON.stringify({ message }) }),
    history: (projectId: string) =>
      apiFetch<Array<{ role: string; content: string }>>(`/projects/${encodeURIComponent(projectId)}/assistant/history`),
  },
};
