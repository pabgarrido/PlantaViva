import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config();
// Application Insights must be initialized before importing other modules
import './telemetry';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  app.enableCors({
    origin: process.env['CORS_ORIGIN'] ?? 'http://localhost:3000',
    credentials: true,
  });
  const port = process.env['PORT'] ?? 3001;
  await app.listen(port);
  console.log(`[core-api] listening on port ${port}`);
}

bootstrap();
