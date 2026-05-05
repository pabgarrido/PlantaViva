import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from './projects.service';
import { NotFoundException } from '@nestjs/common';

describe('ProjectsService', () => {
  let service: ProjectsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProjectsService],
    }).compile();
    service = module.get(ProjectsService);
  });

  it('creates a project', () => {
    const project = service.create('user-1', { name: 'Test Project' });
    expect(project.id).toBeDefined();
    expect(project.ownerId).toBe('user-1');
    expect(project.name).toBe('Test Project');
    expect(project.status).toBe('created');
  });

  it('lists projects by owner', () => {
    service.create('user-1', { name: 'P1' });
    service.create('user-2', { name: 'P2' });
    service.create('user-1', { name: 'P3' });
    const projects = service.findAllByOwner('user-1');
    expect(projects).toHaveLength(2);
  });

  it('finds one project', () => {
    const created = service.create('user-1', { name: 'P1' });
    const found = service.findOne(created.id, 'user-1');
    expect(found.id).toBe(created.id);
  });

  it('throws when project not found', () => {
    expect(() => service.findOne('nonexistent', 'user-1')).toThrow(NotFoundException);
  });

  it('throws when wrong owner', () => {
    const created = service.create('user-1', { name: 'P1' });
    expect(() => service.findOne(created.id, 'user-2')).toThrow(NotFoundException);
  });

  it('updates a project', () => {
    const created = service.create('user-1', { name: 'Old' });
    const updated = service.update(created.id, 'user-1', { name: 'New' });
    expect(updated.name).toBe('New');
  });

  it('deletes a project', () => {
    const created = service.create('user-1', { name: 'P1' });
    service.remove(created.id, 'user-1');
    expect(() => service.findOne(created.id, 'user-1')).toThrow(NotFoundException);
  });

  it('updates project status', () => {
    const created = service.create('user-1', { name: 'P1' });
    service.updateStatus(created.id, 'uploading');
    const found = service.findOne(created.id, 'user-1');
    expect(found.status).toBe('uploading');
  });
});
