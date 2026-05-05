import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { B2CAuthGuard } from '../auth/b2c-auth.guard';
import { CurrentUser, AuthUser } from '../auth/current-user.decorator';
import { ProjectsService } from '../projects/projects.service';
import { RendersService } from './renders.service';
import type { RenderTier } from '@plantaviva/types';

@Controller()
@UseGuards(B2CAuthGuard)
export class RendersController {
  constructor(
    private readonly rendersService: RendersService,
    private readonly projectsService: ProjectsService,
  ) {}

  @Post('projects/:projectId/renders')
  createRender(
    @CurrentUser() user: AuthUser,
    @Param('projectId') projectId: string,
    @Body() body: { tier: RenderTier; cameraId?: string; resolution?: string },
  ) {
    this.projectsService.findOne(projectId, user.sub);
    return this.rendersService.create(projectId, body.tier, body.cameraId, body.resolution);
  }

  @Get('projects/:projectId/renders')
  listRenders(
    @CurrentUser() user: AuthUser,
    @Param('projectId') projectId: string,
  ) {
    this.projectsService.findOne(projectId, user.sub);
    return this.rendersService.findByProject(projectId);
  }

  @Get('renders/:id')
  getRender(@Param('id') id: string) {
    return this.rendersService.findOne(id);
  }
}
