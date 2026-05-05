import { AuthUser } from '../auth/current-user.decorator';
import { UploadsService } from './uploads.service';
import { ProjectsService } from '../projects/projects.service';
import { RequestSasDto } from './dto/upload.dto';
export declare class UploadsController {
    private readonly uploadsService;
    private readonly projectsService;
    constructor(uploadsService: UploadsService, projectsService: ProjectsService);
    requestSas(user: AuthUser, projectId: string, dto: RequestSasDto): Promise<import("./uploads.service").SasUrlResult>;
    completeUpload(user: AuthUser, projectId: string, body: {
        blobName: string;
        fileType: string;
    }): Promise<{
        status: string;
        projectId: string;
        blobName: string;
    }>;
}
//# sourceMappingURL=uploads.controller.d.ts.map