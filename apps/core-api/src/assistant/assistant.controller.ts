import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { B2CAuthGuard } from '../auth/b2c-auth.guard';
import { CurrentUser, AuthUser } from '../auth/current-user.decorator';
import { ProjectsService } from '../projects/projects.service';
import { AssistantService } from './assistant.service';

@Controller('projects/:projectId/assistant')
@UseGuards(B2CAuthGuard)
export class AssistantController {
  constructor(
    private readonly assistantService: AssistantService,
    private readonly projectsService: ProjectsService,
  ) {}

  @Post()
  async chat(
    @CurrentUser() user: AuthUser,
    @Param('projectId') projectId: string,
    @Body() body: { message: string },
  ) {
    this.projectsService.findOne(projectId, user.sub);
    return this.assistantService.chat(projectId, body.message);
  }

  @Get('history')
  getHistory(
    @CurrentUser() user: AuthUser,
    @Param('projectId') projectId: string,
  ) {
    this.projectsService.findOne(projectId, user.sub);
    return this.assistantService.getHistory(projectId);
  }
}
