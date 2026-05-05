import { Controller, Post, Param, Body, UseGuards } from '@nestjs/common';
import { B2CAuthGuard } from '../auth/b2c-auth.guard';
import { CurrentUser, AuthUser } from '../auth/current-user.decorator';
import { UploadsService } from './uploads.service';
import { ProjectsService } from '../projects/projects.service';
import { SceneService } from '../scene/scene.service';
import { RequestSasDto } from './dto/upload.dto';
import type { FileType } from '@plantaviva/types';

@Controller('projects/:projectId/uploads')
@UseGuards(B2CAuthGuard)
export class UploadsController {
  constructor(
    private readonly uploadsService: UploadsService,
    private readonly projectsService: ProjectsService,
    private readonly sceneService: SceneService,
  ) {}

  @Post('sas')
  async requestSas(
    @CurrentUser() user: AuthUser,
    @Param('projectId') projectId: string,
    @Body() dto: RequestSasDto,
  ) {
    this.projectsService.findOne(projectId, user.sub);
    return this.uploadsService.generateSasUrl(projectId, dto.filename, dto.fileType);
  }

  @Post('complete')
  async completeUpload(
    @CurrentUser() user: AuthUser,
    @Param('projectId') projectId: string,
    @Body() body: { blobName: string; fileType: string },
  ) {
    this.projectsService.findOne(projectId, user.sub);
    this.projectsService.updateStatus(projectId, 'uploading');

    // In prod: publish to Service Bus → parser-worker processes file
    // In dev: generate demo scene inline
    this.projectsService.updateStatus(projectId, 'parsing');
    const scene = this.sceneService.generateDemo(projectId, body.fileType as FileType);
    this.projectsService.updateStatus(projectId, 'ready');

    return { status: 'ok', projectId, blobName: body.blobName, scene };
  }
}
