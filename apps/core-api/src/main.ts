import 'reflect-metadata';
// Application Insights must be initialized before importing other modules
import './telemetry';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  const port = process.env['PORT'] ?? 3001;
  await app.listen(port);
  console.log(`[core-api] listening on port ${port}`);
}

bootstrap();
