import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Project Management Server API Documentation.')
    .setDescription('The API documentation of project management server.')
    .setVersion('1.0')
    .addTag('swagger-example')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap()
  .then(() => {
    console.log(`Application is running on PORT:${process.env.PORT ?? 3000}`);
  })
  .catch((error: unknown) => {
    console.log(`An error occured while boostraping the app: ${(error as Error)?.message}`);
  });
