import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Habilitar CORS
  app.enableCors({
    origin: 'http://localhost:5173', // URL de tu aplicación Vite
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Cambiar a puerto 3001 para el backend
  const port = 3001;
  await app.listen(port);
  
  console.log(`Backend server running on http://localhost:${port}`);
}
bootstrap();