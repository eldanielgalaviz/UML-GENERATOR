// src/gemini/gemini.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';
import { 
  MermaidDiagram, 
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
  private readonly RETRY_DELAY = 1000;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('AIzaSyDWS0fNScKBQkZawWoDC5zmZsR5YlDLF8E')!;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY no está configurada');
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
      await this.delay(this.RETRY_DELAY * (retryCount + 1));
      return this.retryOperation(operation, retryCount + 1);
    }
  }

  async analyzeRequirements(requirements: string): Promise<AnalysisResponse> {
    try {
      this.logger.log('Iniciando análisis de requerimientos...');
      
      const ieee830Requirements = await this.analyzeIEEE830(requirements);
      const diagrams = await this.generateAllDiagrams(requirements, ieee830Requirements);

      return {
        requirements: ieee830Requirements,
        diagrams
      };
    } catch (error) {
      this.logger.error(`Error en el análisis: ${error.message}`);
      throw new Error(`Error en el análisis: ${error.message}`);
    }
  }

  private async analyzeIEEE830(requirements: string): Promise<IEEE830Requirement[]> {
    const prompt = `
    Analiza los siguientes requerimientos según el estándar IEEE 830.
    Responde solo con JSON válido con esta estructura:
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

    const response = await this.retryOperation(async () => {
      const result = await this.model.generateContent(prompt);
      return result.response.text();
    });

    const cleaned = this.cleanJsonResponse(response);
    return JSON.parse(cleaned).requirements;
  }

  private async generateAllDiagrams(
    originalRequirements: string,
    ieee830Requirements: IEEE830Requirement[]
  ): Promise<MermaidDiagram[]> {
    const diagramTypes: DiagramType[] = [
      'classDiagram',
      'sequenceDiagram',
      'packageDiagram',
      'useCaseDiagram',
      'componentDiagram'
    ];

    const diagrams = await Promise.all(
      diagramTypes.map(type => 
        this.generateMermaidDiagram(type, originalRequirements, ieee830Requirements)
      )
    );

    return diagrams;
  }

  private async generateMermaidDiagram(
    type: DiagramType,
    originalRequirements: string,
    ieee830Requirements: IEEE830Requirement[]
  ): Promise<MermaidDiagram> {
    const prompt = this.buildMermaidPrompt(type, originalRequirements, ieee830Requirements);
    
    try {
      const response = await this.retryOperation(async () => {
        const result = await this.model.generateContent(prompt);
        return result.response.text();
      });

      // Extraer el código Mermaid de la respuesta
      const mermaidCode = this.extractMermaidCode(response);

      return {
        type,
        title: this.getDiagramTitle(type),
        code: mermaidCode
      };
    } catch (error) {
      this.logger.error(`Error generando diagrama ${type}:`, error);
      throw new Error(`Error al generar el diagrama ${type}`);
    }
  }

  private buildMermaidPrompt(
    type: DiagramType, 
    originalRequirements: string,
    ieee830Requirements: IEEE830Requirement[]
): string {
    const promptInstructions = {
        classDiagram: `
        Genera un diagrama de clases Mermaid válido. 
        Asegúrate de incluir:
        - Clases con atributos y métodos 
        - Relaciones entre clases (herencia, composición, agregación) 
        - Cardinalidad en las relaciones 
        - Uso correcto de la sintaxis Mermaid
        
        📌 **Ejemplo de sintaxis correcta:**
        \`\`\`mermaid
        classDiagram
        class ClaseEjemplo {
            + atributo1: Tipo
            - atributoPrivado: Tipo
            # metodoEjemplo(): TipoRetorno
        }
        ClaseEjemplo --|> ClasePadre
        ClaseEjemplo *-- Componente
        \`\`\`
        `,

        sequenceDiagram: `
        Genera un diagrama de secuencia Mermaid que muestre: 
        - El flujo de interacción entre actores y el sistema 
        - Mensajes enviados y recibidos 
        - Uso correcto de Mermaid 
        
        📌 **Ejemplo de sintaxis correcta:**
        \`\`\`mermaid
        sequenceDiagram
        participant Usuario
        participant Sistema
        Usuario->>Sistema: Enviar solicitud
        Sistema-->>Usuario: Respuesta exitosa
        \`\`\`
        `,

        activityDiagram: `
        Genera un diagrama de actividad Mermaid (flowchart) válido. 
        Incluye:
        - El flujo de trabajo para la gestión de tareas
        - Estados de las tareas
        - Decisiones y acciones
        - Uso correcto de Mermaid 
        
        📌 **Ejemplo de sintaxis correcta:**
        \`\`\`mermaid
        flowchart TD
        A[Inicio] -->|Opción 1| B[Tarea Pendiente]
        B --> C[En Proceso]
        C -->|Completado| D[Fin]
        \`\`\`
        `,

        erDiagram: `
        Genera un diagrama de entidad-relación (ER) Mermaid válido. 
        Incluye:
        - Entidades principales 
        - Relaciones y cardinalidad 
        - Uso correcto de Mermaid 
        
        📌 **Ejemplo de sintaxis correcta:**
        \`\`\`mermaid
        erDiagram
        CLIENTE ||--o{ PEDIDO : realiza
        PEDIDO }|--|{ PRODUCTO : contiene
        \`\`\`
        `,

        flowchart: `
        Genera un diagrama de flujo Mermaid válido. 
        Incluye:
        - El proceso de registro y autenticación
        - Creación y gestión de proyectos
        - Uso correcto de Mermaid 
        
        📌 **Ejemplo de sintaxis correcta:**
        \`\`\`mermaid
        flowchart TD
        Inicio --> VerificarDatos
        VerificarDatos -->|Datos Válidos| CrearCuenta
        CrearCuenta --> Fin
        \`\`\`
        `,

        packageDiagram: `
        Genera un diagrama de paquetes Mermaid válido. 
        Asegúrate de:
        - Usar la palabra clave \`package\`
        - Definir correctamente los paquetes con \`{}\`
        - Agregar relaciones si es necesario

        📌 **Ejemplo de sintaxis correcta:**
        \`\`\`mermaid
        packageDiagram
        package SistemaGestion {
            package ModuloUsuarios {}
            package ModuloTareas {}
        }
        ModuloUsuarios --> ModuloTareas
        \`\`\`
        `
    };

    return `
    Genera un diagrama Mermaid de tipo ${type} para un sistema de gestión de proyectos.
    
    ${promptInstructions[type]}

    ⚠️ **IMPORTANTE:**  
    - Usa **SOLO** la sintaxis de Mermaid  
    - El diagrama debe comenzar con \`${type}\`  
    - No incluyas texto explicativo, solo el código del diagrama  
    - Asegúrate de que la sintaxis sea **válida** y sin errores  
    - Para relaciones en Mermaid, usa correctamente:  
      - \`--\` Asociación  
      - \`--|>\` Herencia  
      - \`*--\` Composición  
      - \`o--\` Agregación  

    Requerimientos originales:  
    ${originalRequirements}

    Requerimientos IEEE 830:  
    ${JSON.stringify(ieee830Requirements, null, 2)}
    `;
}


  private getDiagramTitle(type: DiagramType): string {
    const titles = {
      classDiagram: 'Diagrama de Clases',
      sequenceDiagram: 'Diagrama de Secuencia',
      activityDiagram: 'Diagrama de Actividades',
      erDiagram: 'Diagrama Entidad-Relación',
      flowchart: 'Diagrama de Flujo'
    };
    return titles[type];
  }

  private cleanJsonResponse(text: string): string {
    let cleaned = text.substring(text.indexOf('{'));
    cleaned = cleaned.substring(0, cleaned.lastIndexOf('}') + 1);
    cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    return cleaned.trim();
  }

  private extractMermaidCode(text: string): string {
    // Eliminar cualquier texto antes del tipo de diagrama
    const diagramTypes = ['classDiagram', 'sequenceDiagram', 'flowchart', 'erDiagram'];
    let code = text;
    
    for (const type of diagramTypes) {
      const startIndex = code.indexOf(type);
      if (startIndex !== -1) {
        code = code.substring(startIndex);
        break;
      }
    }

    // Limpiar formato markdown si existe
    code = code.replace(/```mermaid\n?/g, '').replace(/```\n?/g, '');
    
    return code.trim();
  }
}