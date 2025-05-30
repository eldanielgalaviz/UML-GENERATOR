import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configurar CORS para producción
  app.enableCors({
    origin: [
      'http://localhost:5173', 
      'http://localhost:4200',
      'https://uml-generator-4gsb-jesusdanielgfim-uasedumxs-projects.vercel.app',
      /\.vercel\.app$/ // Permitir cualquier subdominio de vercel.app
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Accept,Authorization,session-id',
    exposedHeaders: ['Content-Disposition'],
    credentials: true,
  });

  // Puerto dinámico para Render (por defecto usa 10000)
  const port = process.env.PORT || 10000; // Cambiar a 10000 para Render
  await app.listen(port, '0.0.0.0'); // 0.0.0.0 es importante para Render
  
  console.log(`🚀 Servidor ejecutándose en puerto: ${port}`);
  console.log(`📊 Entorno: ${process.env.NODE_ENV}`);
  console.log(`🔗 Base de datos: ${process.env.DATABASE_URL ? 'URL configurada' : 'Configuración manual'}`);
}
bootstrap();
