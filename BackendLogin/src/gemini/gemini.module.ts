import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { GeminiController } from './gemini.controller';
import { GeminiService } from './gemini.service';
import { ConversationService } from '../conversation/conversation.service';
import { Conversation } from '../conversation/entities/conversation.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Conversation]) // Asegúrate de que esto esté aquí
  ],
  controllers: [GeminiController],
  providers: [GeminiService, ConversationService],
})
export class GeminiModule {}