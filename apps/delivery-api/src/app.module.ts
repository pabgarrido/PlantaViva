import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health/health.controller';
import { SharesController } from './shares/shares.controller';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController, SharesController],
})
export class AppModule {}
