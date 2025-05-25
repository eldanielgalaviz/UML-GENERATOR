import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { 
  IEEE830Requirement, 
  MermaidDiagram,
  GeneratedCode
} from '../gemini/interfaces/code-generation.interface';

export interface ConversationState {
  originalRequirements: string;
  requirements: IEEE830Requirement[];
  diagrams: MermaidDiagram[];
  generatedCode?: GeneratedCode;
  messages: {
    role: 'user' | 'system';
    content: string;
  }[];
}

@Injectable()
export class ConversationService {
  private readonly logger = new Logger(ConversationService.name);
  private conversations: Map<string, ConversationState> = new Map();

  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
  ) {}

  // Crear una nueva conversación
// MODIFICAR conversation.service.ts

// Crear una nueva conversación
async createConversation(
  sessionId: string, 
  originalRequirements: string,
  userId?: number
): Promise<void> {
  console.log(`🔄 Creando conversación - SessionId: ${sessionId}, UserId: ${userId}`);
  
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
      console.log(`💾 Guardando conversación en BD para usuario ${userId}`);
      
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
      
      const savedConversation = await this.conversationRepository.save(conversation);
      console.log(`✅ Conversación guardada en BD con ID: ${savedConversation.id}`);
      
      this.logger.log(`Conversación guardada en BD para usuario ${userId} con ID: ${savedConversation.id}`);
    } catch (error) {
      console.error(`❌ Error al guardar conversación en BD: ${error.message}`);
      this.logger.error(`Error al guardar conversación en BD: ${error.message}`);
    }
  } else {
    console.warn(`⚠️ No se proporcionó userId, conversación solo en memoria`);
  }
}

// Actualiza la conversación
async updateConversation(
  sessionId: string, 
  requirements?: IEEE830Requirement[], 
  diagrams?: MermaidDiagram[],
  userId?: number
): Promise<void> {
  console.log(`🔄 Actualizando conversación - SessionId: ${sessionId}, UserId: ${userId}`);
  
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

  // Actualizar en memoria
  this.conversations.set(sessionId, conversation);
  
  // Actualizar en BD si tenemos el ID de usuario
  if (userId) {
    try {
      console.log(`💾 Actualizando conversación en BD para usuario ${userId}`);
      
      const updateResult = await this.conversationRepository.update(
        { sessionId, userId }, // Buscar por sessionId Y userId
        {
          requirements: conversation.requirements,
          diagrams: conversation.diagrams,
          messages: conversation.messages,
          updatedAt: new Date()
        }
      );
      
      console.log(`✅ Conversación actualizada en BD. Filas afectadas: ${updateResult.affected}`);
      
      if (updateResult.affected === 0) {
        console.warn(`⚠️ No se encontró conversación en BD para actualizar: ${sessionId}`);
        // Intentar crear la conversación si no existe
        await this.createOrUpdateConversation(sessionId, conversation.originalRequirements, userId, conversation.requirements, conversation.diagrams);
      }
    } catch (error) {
      console.error(`❌ Error al actualizar conversación en BD: ${error.message}`);
      this.logger.error(`Error al actualizar conversación en BD: ${error.message}`);
    }
  } else {
    console.warn(`⚠️ No se proporcionó userId, actualización solo en memoria`);
  }
}

// Añade un mensaje a la conversación
async addMessage(
  sessionId: string, 
  role: 'user' | 'system', 
  content: string,
  userId?: number
): Promise<void> {
  console.log(`💬 Añadiendo mensaje - SessionId: ${sessionId}, Role: ${role}, UserId: ${userId}`);
  
  const conversation = this.getConversation(sessionId);
  if (!conversation) {
    throw new Error(`Conversación con ID ${sessionId} no encontrada`);
  }

  conversation.messages.push({ role, content });
  this.conversations.set(sessionId, conversation);
  
  // Actualizar en BD si tenemos usuario
  if (userId) {
    try {
      console.log(`💾 Guardando mensaje en BD para usuario ${userId}`);
      
      const updateResult = await this.conversationRepository.update(
        { sessionId, userId },
        { 
          messages: conversation.messages,
          updatedAt: new Date()
        }
      );
      
      console.log(`✅ Mensaje guardado en BD. Filas afectadas: ${updateResult.affected}`);
      
      if (updateResult.affected === 0) {
        console.warn(`⚠️ No se encontró conversación en BD para guardar mensaje: ${sessionId}`);
      }
    } catch (error) {
      console.error(`❌ Error al añadir mensaje en BD: ${error.message}`);
      this.logger.error(`Error al añadir mensaje en BD: ${error.message}`);
    }
  } else {
    console.warn(`⚠️ No se proporcionó userId, mensaje solo en memoria`);
  }
}

  // Actualizar el código generado en la conversación
// Actualizar el código generado en la conversación
updateGeneratedCode(sessionId: string, generatedCode: GeneratedCode): void {
  const conversation = this.getConversation(sessionId);
  if (!conversation) {
    throw new Error(`Conversación con ID ${sessionId} no encontrada`);
  }

  // Actualizar el código generado en la conversación en memoria
  conversation.generatedCode = generatedCode;
  this.conversations.set(sessionId, conversation);
  this.logger.log(`Código generado actualizado para sesión: ${sessionId}`);
}

  // Guardar el código generado en la base de datos
async saveGeneratedCode(
  sessionId: string,
  userId: number,
  generatedCode: GeneratedCode
): Promise<void> {
  try {
    const conversation = await this.conversationRepository.findOne({
      where: { sessionId, userId }
    });
    
    if (!conversation) {
      this.logger.warn(`No se encontró conversación ${sessionId} para guardar código`);
      return;
    }
    
    // Actualizar con el código generado
    // Convertimos generatedCode a un objeto plano para evitar problemas de tipo con TypeORM
    await this.conversationRepository.update(
      { id: conversation.id },
      { 
        generatedCode: generatedCode as any, // Usar 'as any' para evitar el error de tipo
        updatedAt: new Date()
      }
    );
    
    this.logger.log(`Código generado guardado para conversación ${sessionId}`);
  } catch (error) {
    this.logger.error(`Error al guardar código generado: ${error.message}`);
    throw error;
  }
}

  // Obtiene una conversación
  getConversation(sessionId: string): ConversationState | null {
    // Primero buscar en memoria
    const memoryConversation = this.conversations.get(sessionId);
    if (memoryConversation) {
      return memoryConversation;
    }
    
    // Si no está en memoria, devolver null (ya que el método es sincrónico)
    return null;
  }

  // Buscar conversación en la base de datos
  async findConversationById(sessionId: string): Promise<any> {
    try {
      // Buscar en BD
      const dbConversation = await this.conversationRepository.findOne({
        where: { sessionId }
      });
      
      if (dbConversation) {
        // Cargar en memoria para uso futuro
        const conversationState: ConversationState = {
          originalRequirements: dbConversation.originalRequirements,
          requirements: dbConversation.requirements || [],
          diagrams: dbConversation.diagrams || [],
          messages: dbConversation.messages || [],
          generatedCode: dbConversation.generatedCode
        };
        
        this.conversations.set(sessionId, conversationState);
        return conversationState;
      }
      
      return null;
    } catch (error) {
      this.logger.error(`Error al buscar conversación en BD: ${error.message}`);
      return null;
    }
  }


  // Obtiene el prompt completo
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

  // Crear o actualizar una conversación
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

  // Obtener detalles completos de una conversación
  async getConversationWithDetails(sessionId: string, userId: number): Promise<any> {
    try {
      // Buscar la conversación en la base de datos
      const conversation = await this.conversationRepository.findOne({
        where: { 
          sessionId,
          userId
        }
      });
      
      if (!conversation) {
        this.logger.warn(`Conversación ${sessionId} no encontrada para usuario ${userId}`);
        return null;
      }
      
      // Estructurar la respuesta similar a lo que devuelve el análisis
      const response = {
        sessionId,
        requirements: conversation.requirements || [],
        diagrams: conversation.diagrams || [],
        generatedCode: conversation.generatedCode || null,
        originalRequirements: conversation.originalRequirements,
        messages: conversation.messages || []
      };
      
      this.logger.log(`Recuperados detalles de conversación ${sessionId} con ${response.diagrams?.length || 0} diagramas`);
      
      // También actualizar el caché en memoria
      this.conversations.set(sessionId, {
        originalRequirements: conversation.originalRequirements,
        requirements: conversation.requirements || [],
        diagrams: conversation.diagrams || [],
        messages: conversation.messages || [],
        generatedCode: conversation.generatedCode
      });
      
      return response;
    } catch (error) {
      this.logger.error(`Error al obtener detalles de conversación ${sessionId}: ${error.message}`);
      throw error;
    }
  }
}