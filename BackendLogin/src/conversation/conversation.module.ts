// src/conversation/conversation.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationService } from './conversation.service';
import { ConversationController } from './conversation.controller';
import { Conversation } from './entities/conversation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Conversation])], // Esto es importante
  controllers: [ConversationController],
  providers: [ConversationService],
  exports: [ConversationService], // Y esto también
})
export class ConversationModule {}