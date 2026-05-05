import { AuthUser } from '../auth/current-user.decorator';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';
export declare class ProjectsController {
    private readonly projectsService;
    constructor(projectsService: ProjectsService);
    create(user: AuthUser, dto: CreateProjectDto): import("@plantaviva/types").Project;
    findAll(user: AuthUser): import("@plantaviva/types").Project[];
    findOne(user: AuthUser, id: string): import("@plantaviva/types").Project;
    update(user: AuthUser, id: string, dto: UpdateProjectDto): import("@plantaviva/types").Project;
    remove(user: AuthUser, id: string): void;
}
//# sourceMappingURL=projects.controller.d.ts.map