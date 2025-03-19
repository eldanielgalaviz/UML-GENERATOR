// src/gemini/gemini.controller.ts

import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  ValidationPipe,
  Logger
} from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { AnalyzeRequirementsDto } from './dto/analyze-requirements.dto';
import { GenerateCodeDto } from './dto/generate-code.dto';
import {
  AnalysisResponse,
  GeneratedCode
} from './interfaces/code-generation.interface';

@Controller('api/gemini')
export class GeminiController {
  private readonly logger = new Logger(GeminiController.name);

  constructor(private readonly geminiService: GeminiService) {}

  @Post('analyze')
  async analyzeRequirements(
    @Body(new ValidationPipe({ transform: true })) dto: AnalyzeRequirementsDto
  ): Promise<AnalysisResponse> {
    try {
      const analysis = await this.geminiService.analyzeRequirements(dto.requirements);
      
      analysis.diagrams = analysis.diagrams.filter(diagram => {
        try {
          return diagram && diagram.code && diagram.code.trim().length > 0;
        } catch (error) {
          this.logger.warn(`Diagrama ${diagram?.type} inválido, omitiendo...`);
          return false;
        }
      });

      return analysis;
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


// src/gemini/gemini.controller.ts (sólo el método generateCode)

@Post('generate-code')
async generateCode(
  @Body(new ValidationPipe({ transform: true })) dto: GenerateCodeDto
): Promise<GeneratedCode> {
  try {
    this.logger.log('Iniciando generación de código...');
    
    // Nos aseguramos de que las dependencias sean arrays (no undefined)
    const requirements = dto.requirements.map(req => ({
      ...req,
      dependencies: req.dependencies || [] // Asegurar que siempre haya un array
    }));
    
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
