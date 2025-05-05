// src/conversation/conversation.controller.ts
import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { JwtAuthGuard } from '../auth/guards/jwt-guard.auth';

@Controller('api/conversations')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

// src/conversation/conversation.controller.ts
@UseGuards(JwtAuthGuard)
@Get()
async getUserConversations(@Request() req: any) {
  const userId = req.user.userId;
  console.log(`Obteniendo conversaciones para usuario ${userId}`);
  
  const conversations = await this.conversationService.getUserConversations(userId);
  console.log(`Encontradas ${conversations.length} conversaciones`);
  
  return conversations;
}

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getConversationById(@Param('id') sessionId: string) {
    return this.conversationService.getConversation(sessionId);
  }
  
}