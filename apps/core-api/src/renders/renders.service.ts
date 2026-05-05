import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { RenderJob, RenderTier, RenderStatus } from '@plantaviva/types';

@Injectable()
export class RendersService {
  private jobs: Map<string, RenderJob> = new Map();

  create(projectId: string, tier: RenderTier, cameraId?: string, resolution?: string): RenderJob {
    const now = new Date().toISOString();
    const job: RenderJob = {
      id: randomUUID(),
      projectId,
      tier,
      status: 'queued',
      cameraId,
      resolution: resolution ?? this.defaultResolution(tier),
      createdAt: now,
      updatedAt: now,
    };
    this.jobs.set(job.id, job);

    // Simulate async render processing
    this.simulateRender(job.id, tier);

    return job;
  }

  findByProject(projectId: string): RenderJob[] {
    return Array.from(this.jobs.values())
      .filter(j => j.projectId === projectId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  findOne(id: string): RenderJob {
    const job = this.jobs.get(id);
    if (!job) throw new NotFoundException(`Render job ${id} not found`);
    return job;
  }

  private defaultResolution(tier: RenderTier): string {
    switch (tier) {
      case 'draft': return '1024x1024';
      case 'standard': return '2048x2048';
      case 'premium': return '4096x4096';
    }
  }

  private simulateRender(jobId: string, tier: RenderTier) {
    const delay = tier === 'draft' ? 3000 : tier === 'standard' ? 8000 : 20000;

    // Move to processing
    setTimeout(() => {
      const job = this.jobs.get(jobId);
      if (job) {
        job.status = 'processing';
        job.updatedAt = new Date().toISOString();
      }
    }, 500);

    // Complete
    setTimeout(() => {
      const job = this.jobs.get(jobId);
      if (job) {
        job.status = 'completed';
        job.resultUrl = `/renders/${job.projectId}/${jobId}.png`;
        job.gpuSeconds = tier === 'draft' ? 5 : tier === 'standard' ? 45 : 300;
        job.aiCallsCount = tier === 'premium' ? 0 : 3;
        job.estimatedCostEur = tier === 'draft' ? 0.05 : tier === 'standard' ? 0.40 : 2.50;
        job.completedAt = new Date().toISOString();
        job.updatedAt = job.completedAt;
      }
    }, delay);
  }
}
