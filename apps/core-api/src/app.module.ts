import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health/health.controller';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';
import { UploadsModule } from './uploads/uploads.module';

@Module({
  imports: [TerminusModule, AuthModule, ProjectsModule, UploadsModule],
  controllers: [HealthController],
})
export class AppModule {}
