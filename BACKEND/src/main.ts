import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Habilitar CORS
  app.enableCors({
    origin: 'http://localhost:5173', // O el puerto que uses para tu frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // Configurar ValidationPipe global
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  await app.listen(3000);
  // Cambiar a puerto 3001 para el backend
  const port = 3005;
  await app.listen(port);
  
  console.log(`Backend server running on http://localhost:${port}`);
}
bootstrap();