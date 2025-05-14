import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configurar CORS
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:4200'],  // Añade aquí todos tus orígenes frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Accept,Authorization,session-id',
    exposedHeaders: ['Content-Disposition'],  // Importante para las descargas
    credentials: true,
  });

  // Puerto del servidor
  const port = process.env.PORT || 3005;
  await app.listen(port);
  
  console.log(`Servidor ejecutándose en: http://localhost:${port}`);
}
bootstrap();