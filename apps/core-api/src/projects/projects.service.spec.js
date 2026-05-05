"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const projects_service_1 = require("./projects.service");
const common_1 = require("@nestjs/common");
describe('ProjectsService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [projects_service_1.ProjectsService],
        }).compile();
        service = module.get(projects_service_1.ProjectsService);
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
        expect(() => service.findOne('nonexistent', 'user-1')).toThrow(common_1.NotFoundException);
    });
    it('throws when wrong owner', () => {
        const created = service.create('user-1', { name: 'P1' });
        expect(() => service.findOne(created.id, 'user-2')).toThrow(common_1.NotFoundException);
    });
    it('updates a project', () => {
        const created = service.create('user-1', { name: 'Old' });
        const updated = service.update(created.id, 'user-1', { name: 'New' });
        expect(updated.name).toBe('New');
    });
    it('deletes a project', () => {
        const created = service.create('user-1', { name: 'P1' });
        service.remove(created.id, 'user-1');
        expect(() => service.findOne(created.id, 'user-1')).toThrow(common_1.NotFoundException);
    });
    it('updates project status', () => {
        const created = service.create('user-1', { name: 'P1' });
        service.updateStatus(created.id, 'uploading');
        const found = service.findOne(created.id, 'user-1');
        expect(found.status).toBe('uploading');
    });
});
//# sourceMappingURL=projects.service.spec.js.map