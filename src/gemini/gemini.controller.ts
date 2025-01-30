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
  //api
  
  @Controller('api/gemini')
  export class GeminiController {
    private readonly logger = new Logger(GeminiController.name);
  
    constructor(private readonly geminiService: GeminiService) {}
  
    @Post('analyze')
    async analyzeRequirements(
      @Body(new ValidationPipe()) dto: AnalyzeRequirementsDto
    ) {
      try {
        const analysis = await this.geminiService.analyzeRequirements(dto.requirements);
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
  }