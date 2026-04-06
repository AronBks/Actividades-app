import { NestFactory } from '@nestjs/core';
import { repl } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.enableCors({
    origin: 'http://localhost:4200',
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Servidor en http://localhost:${port}`);
  console.log(`API: http://localhost:${port}/api`);

  if (process.env.NODE_ENV === 'development') {
    await repl(AppModule);
  }
}

bootstrap().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
