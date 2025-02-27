// src/gemini/dto/generate-code.dto.ts

import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsString, IsNotEmpty, ValidateNested } from 'class-validator';
import {
  MermaidDiagram,
  DiagramType,
  IEEE830Requirement
} from '../interfaces/code-generation.interface';

export class MermaidDiagramDto {
  @IsEnum(['classDiagram', 'sequenceDiagram', 'useCaseDiagram', 'componentDiagram', 'packageDiagram'])
  @IsNotEmpty()
  type: 'classDiagram' | 'sequenceDiagram' | 'useCaseDiagram' | 'componentDiagram' | 'packageDiagram';
  
  @IsString()
  @IsNotEmpty()
  title: string;
  
  @IsString()
  @IsNotEmpty()
  code: string;
}

export class IEEE830RequirementDto {
  @IsString()
  @IsNotEmpty()
  id: string;
  
  @IsEnum(['functional', 'non-functional'])
  @IsNotEmpty()
  type: 'functional' | 'non-functional';
  
  @IsString()
  @IsNotEmpty()
  description: string;
  
  @IsEnum(['high', 'medium', 'low'])
  @IsNotEmpty()
  priority: 'high' | 'medium' | 'low';
  
  @IsArray()
  @IsString({ each: true })
  dependencies: string[] = []; // Valor predeterminado como array vacío
}

export class GenerateCodeDto {
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => MermaidDiagramDto)
  diagrams: MermaidDiagramDto[];

  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => IEEE830RequirementDto)
  requirements: IEEE830RequirementDto[];
}