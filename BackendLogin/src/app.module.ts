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
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'dpg-d0t1ja95pdvs73eem3v0-a.oregon-postgres.render.com'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'umluser'),
        password: configService.get('DB_PASSWORD', 'C1882Qfc1nT7ARrvb3yJAA3y9giSbNBR'),
        database: configService.get('DB_NAME', 'umlgenerator'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    GeminiModule,
    ConversationModule,
  ],
})
export class AppModule {}

