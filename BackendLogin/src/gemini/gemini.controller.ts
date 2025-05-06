// src/gemini/gemini.controller.ts
import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  ValidationPipe,
  Logger,
  Headers,
  Request,
  UseGuards
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-guard.auth';
import { GeminiService } from './gemini.service';
import { AnalyzeRequirementsDto } from './dto/analyze-requirements.dto';
import { GenerateCodeDto } from './dto/generate-code.dto';
import { ConversationService } from '../conversation/conversation.service';
import {
  AnalysisResponse,
  GeneratedCode
} from './interfaces/code-generation.interface';
import { v4 as uuidv4 } from 'uuid';

@Controller('api/gemini')
export class GeminiController {
  private readonly logger = new Logger(GeminiController.name);

  constructor(
    private readonly geminiService: GeminiService,
    private readonly conversationService: ConversationService
  ) {}

  @UseGuards(JwtAuthGuard) // Añadimos el guard de JWT
  @Post('analyze')
  async analyzeRequirements(
    @Body(new ValidationPipe({ transform: true })) dto: AnalyzeRequirementsDto,
    @Headers('session-id') sessionId: string,
    @Request() req: any
  ): Promise<AnalysisResponse & { sessionId: string }> {
    try {
      // Extraer el userId del token JWT (será definido gracias al guard)
      const userId = req.user.userId;
      this.logger.log(`Usuario autenticado: ${userId}`);
      
      // Si no hay ID de sesión, crear uno nuevo
      const currentSessionId = sessionId || uuidv4();
      
      let fullPrompt = dto.requirements;
      
      // Si la sesión ya existe, obtener el historial completo
      if (sessionId) {
        const existingConversation = await this.conversationService.getConversation(sessionId);
        if (existingConversation) {
          // Añadir el mensaje más reciente
          await this.conversationService.addMessage(sessionId, 'user', dto.requirements, userId);
          // Obtener el prompt completo con el historial
          fullPrompt = this.conversationService.getFullPrompt(sessionId);
        } else {
          // Crear una nueva conversación
          await this.conversationService.createConversation(currentSessionId, dto.requirements, userId);
        }
      } else {
        // Crear una nueva conversación
        await this.conversationService.createConversation(currentSessionId, dto.requirements, userId);
      }
      
      // Analizar con el prompt completo que incluye el historial
      const analysis = await this.geminiService.analyzeRequirements(fullPrompt);
      
      // Filtrar diagramas inválidos
      analysis.diagrams = analysis.diagrams.filter(diagram => {
        try {
          return diagram && diagram.code && diagram.code.trim().length > 0;
        } catch (error) {
          this.logger.warn(`Diagrama ${diagram?.type} inválido, omitiendo...`);
          return false;
        }
      });

      // Actualizar el estado de la conversación
      await this.conversationService.updateConversation(
        currentSessionId, 
        analysis.requirements, 
        analysis.diagrams,
        userId
      );
      
      this.logger.log(`Conversación guardada para usuario ${userId}`);
      
      // Añadir el ID de sesión a la respuesta
      return {
        ...analysis,
        sessionId: currentSessionId
      };
    } catch (error) {
      this.logger.error('Error in analyzeRequirements:', error);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('generate-code')
  async generateCode(
    @Body(new ValidationPipe({ transform: true })) dto: GenerateCodeDto,
    @Headers('session-id') sessionId: string,
    @Request() req: any
  ): Promise<GeneratedCode> {
    try {
      const userId = req.user.userId;
      this.logger.log(`Usuario autenticado para generar código: ${userId}`);
      
      
      // Nos aseguramos de que las dependencias sean arrays (no undefined)
      const requirements = dto.requirements.map(req => ({
        ...req,
        dependencies: req.dependencies || []
      }));
      
      // Si hay una sesión, actualizar diagramas
      if (sessionId) {
        const existingConversation = await this.conversationService.getConversation(sessionId);
        if (existingConversation) {
          await this.conversationService.updateConversation(
            sessionId,
            requirements,
            dto.diagrams,
            userId
          );
        }
      }
      
      const generatedCode = await this.geminiService.generateCode(
        dto.diagrams,
        requirements
      );
      
      return generatedCode;
    } catch (error) {
      this.logger.error('Error in generateCode:', error);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  
  // Nuevo endpoint para continuar la conversación
  @UseGuards(JwtAuthGuard)
  @Post('continue')
  async continueConversation(
    @Body() dto: { message: string },
    @Headers('session-id') sessionId: string,
    @Request() req: any
  ): Promise<AnalysisResponse & { sessionId: string }> {
    try {
      const userId = req.user.userId;
      this.logger.log(`Usuario autenticado para continuar: ${userId}`);
      
      if (!sessionId) {
        throw new HttpException(
          'Se requiere session-id para continuar la conversación',
          HttpStatus.BAD_REQUEST
        );
      }
      
      const conversation = await this.conversationService.getConversation(sessionId);
      if (!conversation) {
        throw new HttpException(
          `Conversación con ID ${sessionId} no encontrada`,
          HttpStatus.NOT_FOUND
        );
      }
      
      // Añadir el nuevo mensaje
      await this.conversationService.addMessage(sessionId, 'user', dto.message, userId);
      
      // Obtener el prompt completo con el historial
      const fullPrompt = this.conversationService.getFullPrompt(sessionId);
      
      // Analizar con el prompt completo
      const analysis = await this.geminiService.analyzeRequirements(fullPrompt);
      
      // Filtrar diagramas inválidos
      analysis.diagrams = analysis.diagrams.filter(diagram => {
        try {
          return diagram && diagram.code && diagram.code.trim().length > 0;
        } catch (error) {
          this.logger.warn(`Diagrama ${diagram?.type} inválido, omitiendo...`);
          return false;
        }
      });
      
      // Actualizar el estado de la conversación
      await this.conversationService.updateConversation(
        sessionId, 
        analysis.requirements, 
        analysis.diagrams,
        userId
      );
      
      return {
        ...analysis,
        sessionId
      };
    } catch (error) {
      this.logger.error('Error in continueConversation:', error);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}