import type { Project, ProjectStatus } from '@plantaviva/types';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';
export declare class ProjectsService {
    private projects;
    create(ownerId: string, dto: CreateProjectDto): Project;
    findAllByOwner(ownerId: string): Project[];
    findOne(id: string, ownerId: string): Project;
    update(id: string, ownerId: string, dto: UpdateProjectDto): Project;
    remove(id: string, ownerId: string): void;
    updateStatus(id: string, status: ProjectStatus): void;
}
//# sourceMappingURL=projects.service.d.ts.map