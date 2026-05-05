import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health/health.controller';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';
import { UploadsModule } from './uploads/uploads.module';
import { SceneModule } from './scene/scene.module';
import { MaterialsModule } from './materials/materials.module';
import { RendersModule } from './renders/renders.module';
import { AssistantModule } from './assistant/assistant.module';

@Module({
  imports: [
    TerminusModule,
    AuthModule,
    ProjectsModule,
    UploadsModule,
    SceneModule,
    MaterialsModule,
    RendersModule,
    AssistantModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
