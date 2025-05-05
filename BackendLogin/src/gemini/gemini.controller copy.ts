// BACKEND/src/gemini/gemini.controller.ts
import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  ValidationPipe,
  Logger,
  Headers,
} from '@nestjs/common';
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

  @Post('analyze')
  async analyzeRequirements(
    @Body(new ValidationPipe({ transform: true })) dto: AnalyzeRequirementsDto,
    @Headers('session-id') sessionId: string
  ): Promise<AnalysisResponse & { sessionId: string }> {
    try {
      // Si no hay ID de sesión, crear uno nuevo
      const currentSessionId = sessionId || uuidv4();
      
      let fullPrompt = dto.requirements;
      
      // Si la sesión ya existe, obtener el historial completo
      if (sessionId && this.conversationService.getConversation(sessionId)) {
        // Añadir el mensaje más reciente
        this.conversationService.addMessage(sessionId, 'user', dto.requirements);
        // Obtener el prompt completo con el historial
        fullPrompt = this.conversationService.getFullPrompt(sessionId);
      } else {
        // Crear una nueva conversación
        this.conversationService.createConversation(currentSessionId, dto.requirements);
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
      this.conversationService.updateConversation(
        currentSessionId, 
        analysis.requirements, 
        analysis.diagrams
      );
      
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

  @Post('generate-code')
  async generateCode(
    @Body(new ValidationPipe({ transform: true })) dto: GenerateCodeDto,
    @Headers('session-id') sessionId: string
  ): Promise<GeneratedCode> {
    try {
      this.logger.log('Iniciando generación de código...');
      
      // Nos aseguramos de que las dependencias sean arrays (no undefined)
      const requirements = dto.requirements.map(req => ({
        ...req,
        dependencies: req.dependencies || []
      }));
      
      // Si hay una sesión, actualizar diagramas
      if (sessionId && this.conversationService.getConversation(sessionId)) {
        this.conversationService.updateConversation(
          sessionId,
          requirements,
          dto.diagrams
        );
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
  @Post('continue')
  async continueConversation(
    @Body() dto: { message: string },
    @Headers('session-id') sessionId: string
  ): Promise<AnalysisResponse & { sessionId: string }> {
    try {
      if (!sessionId) {
        throw new HttpException(
          'Se requiere session-id para continuar la conversación',
          HttpStatus.BAD_REQUEST
        );
      }
      
      const conversation = this.conversationService.getConversation(sessionId);
      if (!conversation) {
        throw new HttpException(
          `Conversación con ID ${sessionId} no encontrada`,
          HttpStatus.NOT_FOUND
        );
      }
      
      // Añadir el nuevo mensaje
      this.conversationService.addMessage(sessionId, 'user', dto.message);
      
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
      this.conversationService.updateConversation(
        sessionId, 
        analysis.requirements, 
        analysis.diagrams
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

  // @Post('generate-code')
  // async generateCode(
  //   @Body(new ValidationPipe({ transform: true })) dto: GenerateCodeDto
  // ): Promise<GeneratedCode> {
  //   try {
  //     this.logger.log('Iniciando generación de código...');
      
  //     if (!dto.diagrams?.length || !dto.requirements?.length) {
  //       throw new HttpException(
  //         'Se requieren diagramas y requerimientos válidos',
  //         HttpStatus.BAD_REQUEST
  //       );
  //     }

  //     const formattedRequirements = dto.requirements.map(req => ({
  //       ...req,
  //       dependencies: req.dependencies ?? []  // Si es undefined, asigna un array vacío
  //     }));
      
  //     const generatedCode = await this.geminiService.generateCode(
  //       dto.diagrams,
  //       formattedRequirements
  //     );
      
      
  //     if (!generatedCode?.backend?.modules || !generatedCode?.frontend?.modules) {
  //       throw new HttpException(
  //         'Error al generar el código: estructura inválida',
  //         HttpStatus.INTERNAL_SERVER_ERROR
  //       );
  //     }
      
  //     return generatedCode;
  //   } catch (error) {
  //     this.logger.error('Error in generateCode:', error);
  //     if (error instanceof HttpException) {
  //       throw error;
  //     }
  //     throw new HttpException(
  //       {
  //         status: HttpStatus.INTERNAL_SERVER_ERROR,
  //         error: error.message,
  //       },
  //       HttpStatus.INTERNAL_SERVER_ERROR,
  //     );
  //   }
  // }
