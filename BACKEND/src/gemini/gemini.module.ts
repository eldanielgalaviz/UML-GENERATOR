// BACKEND/src/gemini/gemini.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GeminiController } from './gemini.controller';
import { GeminiService } from './gemini.service';
import { ConversationService } from '../conversation/conversation.service';

@Module({
  imports: [ConfigModule],
  controllers: [GeminiController],
  providers: [GeminiService, ConversationService],
})
export class GeminiModule {}