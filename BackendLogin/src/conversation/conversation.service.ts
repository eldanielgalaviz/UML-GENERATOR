// src/conversation/conversation.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { IEEE830Requirement, MermaidDiagram } from '../gemini/interfaces/diagram.interface';

@Injectable()
export class ConversationService {
  private readonly logger = new Logger(ConversationService.name);
  private conversations: Map<string, any> = new Map();

  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
  ) {}

  // Crear una nueva conversación
  async createConversation(
    sessionId: string, 
    originalRequirements: string,
    userId?: number
  ): Promise<void> {
    // Mantener en memoria para uso inmediato
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
    
    // Si hay usuario autenticado, crear en la base de datos
    if (userId) {
      try {
        const conversation = this.conversationRepository.create({
          sessionId,
          title: this.generateTitle(originalRequirements),
          originalRequirements,
          requirements: [],
          diagrams: [],
          messages: [
            {
              role: 'user',
              content: originalRequirements
            }
          ],
          userId
        });
        
        await this.conversationRepository.save(conversation);
        this.logger.log(`Conversación guardada en BD para usuario ${userId} con ID: ${conversation.id}`);
      } catch (error) {
        this.logger.error(`Error al guardar conversación en BD: ${error.message}`);
      }
    }
  }

  // Obtiene una conversación
  async getConversation(sessionId: string): Promise<any> {
    // Primero buscar en memoria
    const memoryConversation = this.conversations.get(sessionId);
    if (memoryConversation) {
      return memoryConversation;
    }
    
    // Si no está en memoria, buscar en BD
    try {
      const dbConversation = await this.conversationRepository.findOne({
        where: { sessionId }
      });
      
      if (dbConversation) {
        // Cargar en memoria para uso futuro
        this.conversations.set(sessionId, {
          originalRequirements: dbConversation.originalRequirements,
          requirements: dbConversation.requirements || [],
          diagrams: dbConversation.diagrams || [],
          messages: dbConversation.messages || []
        });
        
        return this.conversations.get(sessionId);
      }
    } catch (error) {
      this.logger.error(`Error al buscar conversación en BD: ${error.message}`);
    }
    
    return null;
  }

  // Actualiza la conversación
  async updateConversation(
    sessionId: string, 
    requirements?: IEEE830Requirement[], 
    diagrams?: MermaidDiagram[],
    userId?: number
  ): Promise<void> {
    const conversation = await this.getConversation(sessionId);
    if (!conversation) {
      throw new Error(`Conversación con ID ${sessionId} no encontrada`);
    }

    if (requirements) {
      conversation.requirements = requirements;
    }

    if (diagrams) {
      conversation.diagrams = diagrams;
    }

    // Actualizar en memoria
    this.conversations.set(sessionId, conversation);
    
    // Actualizar en BD si tenemos el ID de usuario
    if (userId) {
      try {
        await this.conversationRepository.update(
          { sessionId },
          {
            requirements: conversation.requirements,
            diagrams: conversation.diagrams,
            messages: conversation.messages,
            updatedAt: new Date()
          }
        );
      } catch (error) {
        this.logger.error(`Error al actualizar conversación en BD: ${error.message}`);
      }
    }
  }

  // Añade un mensaje a la conversación
  async addMessage(
    sessionId: string, 
    role: 'user' | 'system', 
    content: string,
    userId?: number
  ): Promise<void> {
    const conversation = await this.getConversation(sessionId);
    if (!conversation) {
      throw new Error(`Conversación con ID ${sessionId} no encontrada`);
    }

    conversation.messages.push({ role, content });
    this.conversations.set(sessionId, conversation);
    
    // Actualizar en BD si tenemos usuario
    if (userId) {
      try {
        await this.conversationRepository.update(
          { sessionId },
          { 
            messages: conversation.messages,
            updatedAt: new Date()
          }
        );
      } catch (error) {
        this.logger.error(`Error al añadir mensaje en BD: ${error.message}`);
      }
    }
  }

  // Obtiene el prompt completo
  getFullPrompt(sessionId: string): string {
    const conversation = this.conversations.get(sessionId);
    if (!conversation) {
      throw new Error(`Conversación con ID ${sessionId} no encontrada`);
    }

    let fullPrompt = conversation.originalRequirements + "\n\n";
    
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
  
  // Obtiene todas las conversaciones de un usuario
  async getUserConversations(userId: number): Promise<Conversation[]> {
    try {
      return await this.conversationRepository.find({
        where: { userId },
        order: { updatedAt: 'DESC' }
      });
    } catch (error) {
      this.logger.error(`Error al obtener conversaciones del usuario ${userId}: ${error.message}`);
      return [];
    }
  }
  
  // Genera un título para la conversación
  private generateTitle(requirements: string): string {
    // Extraer las primeras palabras significativas
    const words = requirements.split(' ').slice(0, 5).join(' ');
    return words.length > 30 ? words.substring(0, 30) + '...' : words;
  }

  // src/conversation/conversation.service.ts
async createOrUpdateConversation(
  sessionId: string,
  originalRequirements: string,
  userId: number,
  requirements?: any[],
  diagrams?: any[]
): Promise<void> {
  try {
    // Verificar si ya existe la conversación
    const existingConversation = await this.conversationRepository.findOne({
      where: { sessionId, userId }
    });
    
    if (existingConversation) {
      // Actualizar la conversación existente
      await this.conversationRepository.update(
        { id: existingConversation.id },
        {
          requirements: requirements || existingConversation.requirements,
          diagrams: diagrams || existingConversation.diagrams,
          updatedAt: new Date()
        }
      );
      this.logger.log(`Conversación ${sessionId} actualizada para usuario ${userId}`);
    } else {
      // Crear una nueva conversación
      const conversation = this.conversationRepository.create({
        sessionId,
        title: this.generateTitle(originalRequirements),
        originalRequirements,
        requirements: requirements || [],
        diagrams: diagrams || [],
        messages: [
          {
            role: 'user',
            content: originalRequirements
          }
        ],
        userId
      });
      
      await this.conversationRepository.save(conversation);
      this.logger.log(`Nueva conversación ${sessionId} guardada para usuario ${userId}`);
    }
    
    // Actualizar el caché en memoria también
    this.conversations.set(sessionId, {
      originalRequirements,
      requirements: requirements || [],
      diagrams: diagrams || [],
      messages: [
        {
          role: 'user',
          content: originalRequirements
        }
      ]
    });
  } catch (error) {
    this.logger.error(`Error guardando conversación: ${error.message}`);
    throw error;
  }
}
}

