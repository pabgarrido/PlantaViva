import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { Project, ProjectStatus } from '@plantaviva/types';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';

@Injectable()
export class ProjectsService {
  // In-memory store — replaced with Azure SQL in Phase 2
  private projects: Map<string, Project> = new Map();

  create(ownerId: string, dto: CreateProjectDto): Project {
    const now = new Date().toISOString();
    const project: Project = {
      id: randomUUID(),
      ownerId,
      name: dto.name,
      status: 'created' as ProjectStatus,
      location: dto.location,
      createdAt: now,
      updatedAt: now,
    };
    this.projects.set(project.id, project);
    return project;
  }

  findAllByOwner(ownerId: string): Project[] {
    return Array.from(this.projects.values()).filter((p) => p.ownerId === ownerId);
  }

  findOne(id: string, ownerId: string): Project {
    const project = this.projects.get(id);
    if (!project || project.ownerId !== ownerId) {
      throw new NotFoundException(`Project ${id} not found`);
    }
    return project;
  }

  update(id: string, ownerId: string, dto: UpdateProjectDto): Project {
    const project = this.findOne(id, ownerId);
    if (dto.name !== undefined) project.name = dto.name;
    if (dto.location !== undefined) project.location = dto.location;
    project.updatedAt = new Date().toISOString();
    this.projects.set(id, project);
    return project;
  }

  remove(id: string, ownerId: string): void {
    this.findOne(id, ownerId); // throws if not found
    this.projects.delete(id);
  }

  updateStatus(id: string, status: ProjectStatus): void {
    const project = this.projects.get(id);
    if (project) {
      project.status = status;
      project.updatedAt = new Date().toISOString();
      this.projects.set(id, project);
    }
  }
}
