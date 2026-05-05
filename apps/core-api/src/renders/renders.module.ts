import { Module } from '@nestjs/common';
import { RendersController } from './renders.controller';
import { RendersService } from './renders.service';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [ProjectsModule],
  controllers: [RendersController],
  providers: [RendersService],
  exports: [RendersService],
})
export class RendersModule {}
