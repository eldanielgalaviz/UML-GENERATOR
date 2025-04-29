// BACKEND/src/gemini/gemini.module.ts
import { Module } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { ConversationService } from '../conversation/conversation.service';

@Module({
  imports: [ConfigModule],
  controllers: [GeminiController],
  providers: [GeminiService, ConversationService],
//import { GeminiController } from './gemini.controller';
//import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule // Solo si necesitas la autenticación para las rutas de Gemini
  ],
  providers: [GeminiService],
  controllers: [GeminiController],
  exports: [GeminiService]
})
export class GeminiModule {}