// src/gemini/gemini.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GeminiController } from './gemini.controller';
import { GeminiService } from './gemini.service';
import { ConversationModule } from '../conversation/conversation.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule,
    ConversationModule // Importar este módulo
  ],
  controllers: [GeminiController],
  providers: [GeminiService],
})
export class GeminiModule {}