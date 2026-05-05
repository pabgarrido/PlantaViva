import 'reflect-metadata';
import './telemetry';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  const port = process.env['PORT'] ?? 3002;
  await app.listen(port);
  console.log(`[delivery-api] listening on port ${port}`);
}

bootstrap();
