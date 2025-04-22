// BACKEND/src/conversation/conversation.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { IEEE830Requirement, MermaidDiagram } from '../gemini/interfaces/code-generation.interface';

interface ConversationState {
  originalRequirements: string;
  requirements: IEEE830Requirement[];
  diagrams: MermaidDiagram[];
  messages: {
    role: 'user' | 'system';
    content: string;
  }[];
}

@Injectable()
export class ConversationService {
  private readonly logger = new Logger(ConversationService.name);
  private conversations: Map<string, ConversationState> = new Map();

  createConversation(sessionId: string, originalRequirements: string): void {
    this.conversations.set(sessionId, {
      originalRequirements,
      requirements: [],
      diagrams: [],
      messages: [
        {
          role: 'user',
          content: originalRequirements
        }
      ]
    });
    this.logger.log(`Conversación creada con ID: ${sessionId}`);
  }

  getConversation(sessionId: string): ConversationState | null {
    return this.conversations.get(sessionId) || null;
  }

  updateConversation(
    sessionId: string, 
    requirements?: IEEE830Requirement[], 
    diagrams?: MermaidDiagram[]
  ): void {
    const conversation = this.getConversation(sessionId);
    if (!conversation) {
      throw new Error(`Conversación con ID ${sessionId} no encontrada`);
    }

    if (requirements) {
      conversation.requirements = requirements;
    }

    if (diagrams) {
      conversation.diagrams = diagrams;
    }

    this.conversations.set(sessionId, conversation);
    this.logger.log(`Conversación actualizada: ${sessionId}`);
  }

  addMessage(sessionId: string, role: 'user' | 'system', content: string): void {
    const conversation = this.getConversation(sessionId);
    if (!conversation) {
      throw new Error(`Conversación con ID ${sessionId} no encontrada`);
    }

    conversation.messages.push({ role, content });
    this.conversations.set(sessionId, conversation);
  }

  getFullPrompt(sessionId: string): string {
    const conversation = this.getConversation(sessionId);
    if (!conversation) {
      throw new Error(`Conversación con ID ${sessionId} no encontrada`);
    }

    // Combina el requerimiento original con los mensajes posteriores para formar un prompt completo
    let fullPrompt = conversation.originalRequirements + "\n\n";
    
    // Añadir mensajes posteriores al primer requerimiento
    for (let i = 1; i < conversation.messages.length; i++) {
      const message = conversation.messages[i];
      if (message.role === 'user') {
        fullPrompt += `Usuario: ${message.content}\n\n`;
      } else {
        fullPrompt += `Sistema: ${message.content}\n\n`;
      }
    }

    return fullPrompt;
  }
}