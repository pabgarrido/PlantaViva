"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
let ProjectsService = class ProjectsService {
    // In-memory store — replaced with Azure SQL in Phase 2
    projects = new Map();
    create(ownerId, dto) {
        const now = new Date().toISOString();
        const project = {
            id: (0, crypto_1.randomUUID)(),
            ownerId,
            name: dto.name,
            status: 'created',
            location: dto.location,
            createdAt: now,
            updatedAt: now,
        };
        this.projects.set(project.id, project);
        return project;
    }
    findAllByOwner(ownerId) {
        return Array.from(this.projects.values()).filter((p) => p.ownerId === ownerId);
    }
    findOne(id, ownerId) {
        const project = this.projects.get(id);
        if (!project || project.ownerId !== ownerId) {
            throw new common_1.NotFoundException(`Project ${id} not found`);
        }
        return project;
    }
    update(id, ownerId, dto) {
        const project = this.findOne(id, ownerId);
        if (dto.name !== undefined)
            project.name = dto.name;
        if (dto.location !== undefined)
            project.location = dto.location;
        project.updatedAt = new Date().toISOString();
        this.projects.set(id, project);
        return project;
    }
    remove(id, ownerId) {
        this.findOne(id, ownerId); // throws if not found
        this.projects.delete(id);
    }
    updateStatus(id, status) {
        const project = this.projects.get(id);
        if (project) {
            project.status = status;
            project.updatedAt = new Date().toISOString();
            this.projects.set(id, project);
        }
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = __decorate([
    (0, common_1.Injectable)()
], ProjectsService);
//# sourceMappingURL=projects.service.js.map