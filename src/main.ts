import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // trigger cors
  app.enableCors({
    origin: ['http://localhost:5173','https://storage.googleapis.com'],
    credentials: true,
  });
  app.use('/uploads',express.static(join(__dirname,'..','uploads')))
  app.use(cookieParser());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
