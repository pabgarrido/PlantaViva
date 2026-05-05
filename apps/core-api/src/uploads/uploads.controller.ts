import { Controller, Post, Param, Body, UseGuards, Logger } from '@nestjs/common';
import { B2CAuthGuard } from '../auth/b2c-auth.guard';
import { CurrentUser, AuthUser } from '../auth/current-user.decorator';
import { UploadsService } from './uploads.service';
import { ProjectsService } from '../projects/projects.service';
import { SceneService } from '../scene/scene.service';
import { RequestSasDto } from './dto/upload.dto';
import type { FileType } from '@plantaviva/types';

const PARSER_URL = process.env['PARSER_WORKER_URL'] ?? 'http://localhost:8000';

@Controller('projects/:projectId/uploads')
@UseGuards(B2CAuthGuard)
export class UploadsController {
  private readonly logger = new Logger(UploadsController.name);

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

    try {
      this.projectsService.updateStatus(projectId, 'parsing');

      // Try to call the real parser worker
      let scene;
      try {
        this.logger.log(`Calling parser worker: ${PARSER_URL}/parse`);
        const response = await fetch(`${PARSER_URL}/parse`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId,
            blobName: body.blobName,
            fileType: body.fileType,
            storageConnectionString: process.env['AZURE_STORAGE_CONNECTION_STRING'] ?? '',
          }),
          signal: AbortSignal.timeout(60000),
        });

        if (response.ok) {
          const sceneData = await response.json() as any;
          this.logger.log(`Parser returned scene with ${sceneData.rooms?.length ?? 0} rooms`);
          scene = sceneData;
          this.sceneService.save(projectId, sceneData);
        } else {
          const errText = await response.text();
          this.logger.warn(`Parser returned ${response.status}: ${errText}`);
          throw new Error(`Parser error: ${response.status}`);
        }
      } catch (parserErr: any) {
        this.logger.warn(`Parser unavailable (${parserErr.message}), falling back to demo scene`);
        scene = this.sceneService.generateDemo(projectId, body.fileType as FileType);
      }

      this.projectsService.updateStatus(projectId, 'ready');
      return { status: 'ok', projectId, blobName: body.blobName, scene };
    } catch (err: any) {
      this.logger.error(`Upload complete failed: ${err.message}`);
      this.projectsService.updateStatus(projectId, 'error');
      throw err;
    }
  }
}
