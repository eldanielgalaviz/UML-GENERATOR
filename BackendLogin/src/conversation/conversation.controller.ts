// src/conversation/conversation.controller.ts
import { Controller, Get, Param, UseGuards, Request, NotFoundException, Logger } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { JwtAuthGuard } from '../auth/guards/jwt-guard.auth';

@Controller('api/conversations')
export class ConversationController {
  private readonly logger = new Logger(ConversationController.name);

  constructor(private readonly conversationService: ConversationService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getUserConversations(@Request() req: any) {
    const userId = req.user.userId;
    this.logger.log(`Obteniendo conversaciones para usuario ${userId}`);
    return this.conversationService.getUserConversations(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':sessionId')
  async getConversationById(@Param('sessionId') sessionId: string) {
    return this.conversationService.getConversation(sessionId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':sessionId/details')
  async getConversationDetails(
    @Param('sessionId') sessionId: string,
    @Request() req: any
  ) {
    const userId = req.user.userId;
    this.logger.log(`Obteniendo detalles de conversación ${sessionId} para usuario ${userId}`);
    
    const conversation = await this.conversationService.getConversationWithDetails(sessionId, userId);
    
    if (!conversation) {
      throw new NotFoundException(`Conversación con ID ${sessionId} no encontrada`);
    }
    
    return conversation;
  }
}