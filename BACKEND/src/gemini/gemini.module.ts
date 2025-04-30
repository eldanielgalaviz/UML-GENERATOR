// BACKEND/src/gemini/gemini.module.ts
import { Module } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { ConversationService } from '../conversation/conversation.service';
import { ConfigModule } from '@nestjs/config';
import { GeminiController } from './gemini.controller';

//@Module({
//  imports: [ConfigModule],
//  controllers: [GeminiController],
//  providers: [GeminiService, ConversationService],
//import { GeminiController } from './gemini.controller';

@Module({
  imports: [
    ConfigModule // Solo si necesitas la autenticación para las rutas de Gemini
  ],
  providers: [GeminiService, ConversationService],
  controllers: [GeminiController],
  exports: [GeminiService]
})
export class GeminiModule {}