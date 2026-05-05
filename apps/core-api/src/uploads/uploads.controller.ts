import { Controller, Post, Param, Body, UseGuards } from '@nestjs/common';
import { B2CAuthGuard } from '../auth/b2c-auth.guard';
import { CurrentUser, AuthUser } from '../auth/current-user.decorator';
import { UploadsService } from './uploads.service';
import { ProjectsService } from '../projects/projects.service';
import { RequestSasDto } from './dto/upload.dto';

@Controller('projects/:projectId/uploads')
@UseGuards(B2CAuthGuard)
export class UploadsController {
  constructor(
    private readonly uploadsService: UploadsService,
    private readonly projectsService: ProjectsService,
  ) {}

  @Post('sas')
  async requestSas(
    @CurrentUser() user: AuthUser,
    @Param('projectId') projectId: string,
    @Body() dto: RequestSasDto,
  ) {
    // Verify project ownership
    this.projectsService.findOne(projectId, user.sub);

    const result = await this.uploadsService.generateSasUrl(
      projectId,
      dto.filename,
      dto.fileType,
    );

    return result;
  }

  @Post('complete')
  async completeUpload(
    @CurrentUser() user: AuthUser,
    @Param('projectId') projectId: string,
    @Body() body: { blobName: string; fileType: string },
  ) {
    // Verify project ownership
    this.projectsService.findOne(projectId, user.sub);

    // Update project status to 'uploading'
    this.projectsService.updateStatus(projectId, 'uploading');

    // TODO Phase 2: Publish parse job to Service Bus based on fileType
    // For now, transition straight to 'ready'
    this.projectsService.updateStatus(projectId, 'ready');

    return { status: 'ok', projectId, blobName: body.blobName };
  }
}
