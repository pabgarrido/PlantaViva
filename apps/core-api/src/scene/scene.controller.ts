import { Controller, Get, Patch, Post, Param, Body, UseGuards, NotFoundException } from '@nestjs/common';
import { B2CAuthGuard } from '../auth/b2c-auth.guard';
import { CurrentUser, AuthUser } from '../auth/current-user.decorator';
import { ProjectsService } from '../projects/projects.service';
import { SceneService } from './scene.service';
import type { SceneGraph } from '@plantaviva/types';

@Controller('projects/:projectId/scene')
@UseGuards(B2CAuthGuard)
export class SceneController {
  constructor(
    private readonly sceneService: SceneService,
    private readonly projectsService: ProjectsService,
  ) {}

  @Get()
  getScene(@CurrentUser() user: AuthUser, @Param('projectId') projectId: string) {
    this.projectsService.findOne(projectId, user.sub);
    const scene = this.sceneService.get(projectId);
    if (!scene) throw new NotFoundException('Scene not found — upload a file first');
    return scene;
  }

  @Patch()
  patchScene(
    @CurrentUser() user: AuthUser,
    @Param('projectId') projectId: string,
    @Body() body: Partial<SceneGraph>,
  ) {
    this.projectsService.findOne(projectId, user.sub);
    const scene = this.sceneService.patch(projectId, body);
    if (!scene) throw new NotFoundException('Scene not found');
    return scene;
  }

  @Post('regenerate')
  regenerateScene(@CurrentUser() user: AuthUser, @Param('projectId') projectId: string) {
    const project = this.projectsService.findOne(projectId, user.sub);
    this.projectsService.updateStatus(projectId, 'parsing');
    // Re-generate the demo scene (in prod this would re-run the parser)
    const scene = this.sceneService.generateDemo(projectId, 'ifc');
    this.projectsService.updateStatus(projectId, 'ready');
    return scene;
  }
}
