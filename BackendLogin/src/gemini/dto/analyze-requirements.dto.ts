// src/gemini/dto/analyze-requirements.dto.ts

import { IsString, IsNotEmpty } from 'class-validator';

export class AnalyzeRequirementsDto {
  @IsString()
  @IsNotEmpty()
  requirements: string;
}