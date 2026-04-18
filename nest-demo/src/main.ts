import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from './logger/logger';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 启用CORS - 允许所有来源（开发环境）
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  });

  app.useLogger(app.get(Logger))

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
