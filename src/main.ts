import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap()
  .then(() => {
    console.log(`Application is running on PORT:${process.env.PORT ?? 3000}`);
  })
  .catch((error: unknown) => {
    console.log(`An error occured while boostraping the app: ${(error as Error)?.message}`);
  });
