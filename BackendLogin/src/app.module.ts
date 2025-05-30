// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { GeminiModule } from './gemini/gemini.module';
import { ConversationModule } from './conversation/conversation.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const isProduction = configService.get('NODE_ENV') === 'production';
        
        // Si estás en producción, usar DATABASE_URL directamente
        if (isProduction && configService.get('DATABASE_URL')) {
          return {
            type: 'postgres',
            url: configService.get('DATABASE_URL'),
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: true, // ⚠️ Cambiar a false en producción real
            ssl: {
              rejectUnauthorized: false, // Necesario para Render
            },
            logging: false, // Reducir logs en producción
          };
        }
        
        // Configuración para desarrollo o cuando no hay DATABASE_URL
        return {
          type: 'postgres',
          host: configService.get('DB_HOST', 'localhost'),
          port: parseInt(configService.get('DB_PORT', '5432')),
          username: configService.get('DB_USERNAME', 'postgres'),
          password: configService.get('DB_PASSWORD', 'admin'),
          database: configService.get('DB_NAME', 'UMLGENERATOR'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: true,
          ssl: isProduction ? {
            rejectUnauthorized: false
          } : false,
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    GeminiModule,
    ConversationModule,
  ],
})
export class AppModule {}
