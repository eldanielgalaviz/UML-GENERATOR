import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  ValidationPipe,
  Logger,
  Headers,
  Get,
  Query,
  Res
} from '@nestjs/common';
import { Response } from 'express';
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
      if (sessionId) {
        const conversation = this.conversationService.getConversation(sessionId);
        if (conversation) {
          // Añadir el mensaje más reciente
          this.conversationService.addMessage(sessionId, 'user', dto.requirements);
          // Obtener el prompt completo con el historial
          fullPrompt = this.conversationService.getFullPrompt(sessionId);
        } else {
          // Crear una nueva conversación
          this.conversationService.createConversation(currentSessionId, dto.requirements);
        }
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
      
      // Generar código
      const generatedCode = await this.geminiService.generateCode(
        dto.diagrams,
        requirements
      );
      
      // Si hay una sesión, actualizar los datos generados
      if (sessionId) {
        const conversation = this.conversationService.getConversation(sessionId);
        if (conversation) {
          this.conversationService.updateConversation(
            sessionId,
            requirements,
            dto.diagrams
          );
          // Guardar el código generado en la sesión
          this.conversationService.updateGeneratedCode(sessionId, generatedCode);
        }
      }
      
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
  
// En gemini.controller.ts

@Get('download-project')
async downloadProject(
  @Res() response: Response, 
  @Query('sessionId') sessionId?: string
) {
  try {
    this.logger.log(`Iniciando descarga del proyecto para sessionId: ${sessionId}`);
    
    // Si no hay sessionId, mostrar error claro
    if (!sessionId) {
      this.logger.error('Se intentó descargar sin sessionId');
      response.status(400).send('Se requiere un ID de sesión para la descarga');
      return;
    }
    
    // Variable para el código generado
    let generatedCode: GeneratedCode | null = null;
    
    // Primero verificar si existe la conversación
    const conversation = this.conversationService.getConversation(sessionId);
    if (!conversation) {
      this.logger.warn(`No se encontró conversación con ID: ${sessionId}`);
      // En vez de fallar, intentar buscarla en la base de datos si hay un servicio para ello
      try {
        const dbConversation = await this.conversationService.findConversationById(sessionId);
        if (dbConversation) {
          generatedCode = dbConversation.generatedCode;
        }
      } catch (error) {
        this.logger.error(`Error buscando conversación en BD: ${error.message}`);
      }
    } else if (conversation.generatedCode) {
      generatedCode = conversation.generatedCode;
    } else if (conversation.diagrams && conversation.requirements) {
      // Si no hay código generado pero hay diagramas y requerimientos, generar el código
      this.logger.log('Generando código a partir de diagramas y requerimientos existentes');
      generatedCode = await this.geminiService.generateCode(
        conversation.diagrams,
        conversation.requirements
      );
      
      // Actualizar la conversación con el código generado
      if (generatedCode) {
        this.conversationService.updateGeneratedCode(sessionId, generatedCode);
      }
    }
    
    // Si no hay código generado, devolver error
    if (!generatedCode) {
      this.logger.error('No hay código generado para descargar');
      response.status(404).send('No hay código generado para este proyecto. Primero debes generar diagramas y código.');
      return;
    }
    
    // Configurar CORS para la descarga
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET');
    response.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    // Generar y enviar el archivo ZIP
    this.logger.log('Generando archivo ZIP...');
    await this.geminiService.generateProjectZip(generatedCode, response);
    this.logger.log('Archivo ZIP enviado correctamente');
  } catch (error) {
    this.logger.error(`Error en downloadProject: ${error.message}`);
    response.status(500).send(`Error al generar el proyecto: ${error.message}`);
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