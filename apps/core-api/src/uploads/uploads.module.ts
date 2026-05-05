import { Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';
import { ProjectsModule } from '../projects/projects.module';
import { SceneModule } from '../scene/scene.module';

@Module({
  imports: [ProjectsModule, SceneModule],
  controllers: [UploadsController],
  providers: [UploadsService],
})
export class UploadsModule {}
