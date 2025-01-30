// src/gemini/gemini.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';
import { 
  Diagram, 
  DiagramType, 
  IEEE830Requirement, 
  AnalysisResponse 
} from './interfaces/diagram.interface';

@Injectable()
export class GeminiService {
  private readonly genAI: GoogleGenerativeAI;
  private readonly model: any;
  private readonly logger = new Logger(GeminiService.name);
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000; // 1 segundo

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY')!;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY no está configurada en las variables de entorno');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async retryOperation<T>(
    operation: () => Promise<T>,
    retryCount = 0
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (retryCount >= this.MAX_RETRIES) {
        throw error;
      }

      this.logger.warn(
        `Intento ${retryCount + 1} fallido. Reintentando en ${this.RETRY_DELAY}ms...`
      );
      
      await this.delay(this.RETRY_DELAY * (retryCount + 1));
      return this.retryOperation(operation, retryCount + 1);
    }
  }

  private async generateContent(prompt: string) {
    return this.retryOperation(async () => {
      const result = await this.model.generateContent({
        contents: [{ 
          role: 'user', 
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          }
        ]
      });

      if (!result.response) {
        throw new Error('No se recibió respuesta del modelo');
      }

      return result.response.text();
    });
  }

  async analyzeRequirements(requirements: string): Promise<AnalysisResponse> {
    try {
      this.logger.log('Iniciando análisis de requerimientos...');
      
      // Paso 1: Analizar requisitos según IEEE 830
      this.logger.log('Analizando requisitos IEEE 830...');
      const ieee830Requirements = await this.analyzeIEEE830(requirements);
      
      // Paso 2: Generar todos los diagramas UML
      this.logger.log('Generando diagramas UML...');
      const diagrams = await this.generateAllDiagrams(ieee830Requirements);

      this.logger.log('Análisis completado exitosamente');
      return {
        requirements: ieee830Requirements,
        diagrams
      };
    } catch (error) {
      this.logger.error(`Error en el análisis de requerimientos: ${error.message}`);
      throw new Error(`Error en el análisis: ${error.message}`);
    }
  }

  private async analyzeIEEE830(requirements: string): Promise<IEEE830Requirement[]> {
    const prompt = `
    Analiza los siguientes requerimientos según el estándar IEEE 830.
    Identifica y clasifica los requerimientos funcionales y no funcionales.
    IMPORTANTE: Responde SOLO con JSON válido, sin formato adicional.

    Estructura esperada:
    {
      "requirements": [
        {
          "id": "REQ-001",
          "type": "functional",
          "description": "descripción del requerimiento",
          "priority": "high",
          "dependencies": []
        }
      ]
    }

    Requerimientos:
    ${requirements}
    `;

    try {
      const response = await this.generateContent(prompt);
      const cleanedJson = this.cleanJsonResponse(response);
      return JSON.parse(cleanedJson).requirements;
    } catch (error) {
      this.logger.error('Error en el análisis IEEE 830:', error);
      throw new Error('Error al analizar los requerimientos IEEE 830');
    }
  }

  private cleanJsonResponse(text: string): string {
    try {
      // Eliminar cualquier texto antes del primer '{'
      let cleaned = text.substring(text.indexOf('{'));
      
      // Eliminar cualquier texto después del último '}'
      cleaned = cleaned.substring(0, cleaned.lastIndexOf('}') + 1);
      
      // Eliminar bloques de código markdown
      cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      // Eliminar espacios en blanco al inicio y final
      cleaned = cleaned.trim();
      
      return cleaned;
    } catch (error) {
      throw new Error('Error al limpiar la respuesta JSON');
    }
  }

  private async generateAllDiagrams(requirements: IEEE830Requirement[]): Promise<Diagram[]> {
    // Empezamos con los diagramas más importantes
    const priorityDiagrams: DiagramType[] = [
      'class',
      'useCase',
      'sequence',
      'activity'
    ];

    try {
      const diagrams = await Promise.all(
        priorityDiagrams.map(type => this.generateDiagram(type, requirements))
      );
      return diagrams;
    } catch (error) {
      this.logger.error('Error generando diagramas:', error);
      throw new Error('Error al generar los diagramas UML');
    }
  }

  private async generateDiagram(type: DiagramType, requirements: IEEE830Requirement[]): Promise<Diagram> {
    const prompt = this.buildDiagramPrompt(type, requirements);
    
    try {
      const response = await this.generateContent(prompt);
      const cleanedJson = this.cleanJsonResponse(response);
      return JSON.parse(cleanedJson);
    } catch (error) {
      this.logger.error(`Error generando diagrama ${type}:`, error);
      throw new Error(`Error al generar el diagrama ${type}`);
    }
  }

  private buildDiagramPrompt(type: DiagramType, requirements: IEEE830Requirement[]): string {
    const promptInstructions = {
      class: 'Identifica las clases principales, sus atributos, métodos y relaciones entre clases',
      useCase: 'Identifica los actores del sistema y sus casos de uso principales',
      sequence: 'Muestra la interacción entre los objetos para el proceso de registro y creación de proyectos',
      activity: 'Describe el flujo de trabajo para la gestión de tareas en un proyecto'
    };

    return `
    Genera un diagrama UML de tipo ${type} para un sistema de gestión de proyectos.
    ${promptInstructions[type]}.
    IMPORTANTE: Responde SOLO con JSON válido, sin formato adicional.

    El JSON debe tener esta estructura:
    {
      "type": "${type}",
      "title": "string",
      "description": "string",
      "elements": [
        {
          "id": "string",
          "type": "string",
          "name": "string",
          "attributes": ["string"],
          "methods": ["string"]
        }
      ],
      "relationships": [
        {
          "id": "string",
          "type": "string",
          "source": "string",
          "target": "string",
          "label": "string"
        }
      ]
    }

    Requerimientos:
    ${JSON.stringify(requirements, null, 2)}
    `;
  }
}