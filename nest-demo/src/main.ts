import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from './logger/logger';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import { getFileStoragePublicPrefix, getFileStorageRoot } from './files/files.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const fileStorageRoot = getFileStorageRoot();
  const fileStoragePublicPrefix = getFileStoragePublicPrefix();
  const allowedOrigins = (
    process.env.CORS_ORIGIN ||
    [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'https://sdsosa.com',
      'http://sdsosa.com',
    ].join(',')
  )
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      // Allow non-browser requests such as curl/Postman and local frontend dev origins.
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS origin not allowed: ${origin}`), false);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  });
  app.setGlobalPrefix('api');

  app.useLogger(app.get(Logger))
  app.use(fileStoragePublicPrefix, express.static(fileStorageRoot));
  app.use('/uploads', express.static(fileStorageRoot));

  const config = new DocumentBuilder()
  .setTitle('接口文档')
  .setDescription('描述')
  .setVersion('1.0')
  .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
