import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TasksModule } from './tasks/tasks.module';
import { UsuarioModule } from './usuario/usuario.module';
import { HorarioModule } from './horario/horario.module';
import { AsistenciaModule } from './asistencia/asistencia.module';
import { ActividadModule } from './actividad/actividad.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Importante para que el ConfigService esté disponible en todos los módulos
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432', 10),
      username: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'admin',
      database: process.env.DATABASE_NAME || 'school_management',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // Solo para desarrollo
    }),
    AuthModule,
    UsersModule,
    TasksModule,
    UsuarioModule,
    HorarioModule,
    AsistenciaModule,
    ActividadModule,
  ],
})
export class AppModule {}