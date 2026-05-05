// Core domain types for PlantaViva

export type Locale = 'pt-PT' | 'es' | 'en';

export type PlanTier = 'free' | 'solo' | 'atelier' | 'enterprise';

export type ProjectStatus =
  | 'created'
  | 'uploading'
  | 'parsing'
  | 'ready'
  | 'rendering'
  | 'error';

export type FileType = 'pdf' | 'jpg' | 'png' | 'dwg' | 'dxf' | 'ifc' | 'rvt';

export type RenderTier = 'draft' | 'standard' | 'premium';

export type RenderStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface User {
  id: string;
  entraB2CId: string;
  email: string;
  atelierName: string;
  atelierLogoUrl?: string;
  planTier: PlanTier;
  locale: Locale;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  ownerId: string;
  name: string;
  status: ProjectStatus;
  location?: {
    lat: number;
    lng: number;
    label: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface RenderJob {
  id: string;
  projectId: string;
  tier: RenderTier;
  status: RenderStatus;
  cameraId?: string;
  resolution?: string;
  resultUrl?: string;
  gpuSeconds?: number;
  aiCallsCount?: number;
  estimatedCostEur?: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

// Scene schema stored in Cosmos DB
export interface SceneRoom {
  id: string;
  name: string;
  polygon: [number, number][];
  ceilingHeight: number;
  floor?: string;
}

export interface SceneOpening {
  id: string;
  type: 'door' | 'window';
  wallId: string;
  position: number;
  width: number;
  height: number;
}

export interface SceneWall {
  id: string;
  from: [number, number];
  to: [number, number];
  thickness: number;
  height: number;
  openings: SceneOpening[];
}

export interface SceneGraph {
  schemaVersion: '1.0';
  units: 'meters';
  rooms: SceneRoom[];
  walls: SceneWall[];
  openings: SceneOpening[];
  metadata: {
    parsedFrom: FileType;
    confidence: number;
    needsReview: boolean;
  };
}

// Material
export interface Material {
  id: string;
  slug: string;
  namePt: string;
  nameEs: string;
  nameEn: string;
  category: string;
  supplier?: string;
  tags: string[];
  pbrMaps: {
    albedo?: string;
    normal?: string;
    roughness?: string;
    metallic?: string;
  };
}

// Share token payload
export interface ShareTokenPayload {
  shareId: string;
  projectId: string;
  permissions: ('view' | 'comment')[];
  expiresAt: string;
}

// Service Bus message shapes
export interface ParseJobMessage {
  jobId: string;
  projectId: string;
  fileType: FileType;
  blobUrl: string;
  featureFlags: {
    FEATURE_PDF_PARSER: boolean;
  };
}

export interface RenderJobMessage {
  jobId: string;
  projectId: string;
  tier: RenderTier;
  cameraId: string;
  resolution: string;
  featureFlags: {
    FEATURE_PREMIUM_RENDER: boolean;
  };
}

export interface VideoJobMessage {
  jobId: string;
  projectId: string;
  cameraPath: string[];
  featureFlags: {
    FEATURE_VIDEO: boolean;
  };
}

// Feature flags
export interface FeatureFlags {
  FEATURE_PDF_PARSER: boolean;
  FEATURE_VIDEO: boolean;
  FEATURE_PREMIUM_RENDER: boolean;
}

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  FEATURE_PDF_PARSER: false,
  FEATURE_VIDEO: false,
  FEATURE_PREMIUM_RENDER: false,
};

// SignalR events
export type SignalREvent =
  | { type: 'render.progress'; jobId: string; progress: number }
  | { type: 'render.completed'; jobId: string; resultUrl: string }
  | { type: 'render.failed'; jobId: string; error: string }
  | { type: 'parse.completed'; projectId: string }
  | { type: 'parse.failed'; projectId: string; error: string };
