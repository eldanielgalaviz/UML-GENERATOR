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
    const apiKey = this.configService.get<string>('GEMINI_API_KEY')!;
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
      'useCaseDiagram',
      'componentDiagram',
      'packageDiagram'
    ];

    const diagrams = await Promise.all(
      diagramTypes.map(type => 
        this.generateMermaidDiagram(type, originalRequirements, ieee830Requirements)
      )
    );

    return diagrams.filter(d => d !== null);
  }

  private async generateMermaidDiagram(
    type: DiagramType,
    originalRequirements: string,
    ieee830Requirements: IEEE830Requirement[]
  ): Promise<MermaidDiagram | null> {
    try {
      const prompt = this.buildMermaidPrompt(type, originalRequirements, ieee830Requirements);
      
      const response = await this.retryOperation(async () => {
        const result = await this.model.generateContent(prompt);
        return result.response.text();
      });

      const mermaidCode = this.extractMermaidCode(response, type);
      const validatedCode = this.validateMermaidCode(mermaidCode, type);

      return {
        type,
        title: this.getDiagramTitle(type),
        code: validatedCode
      };
    } catch (error) {
      this.logger.error(`Error generando diagrama ${type}:`, error);
      return null;
    }
  }

  private buildMermaidPrompt(
    type: DiagramType, 
    originalRequirements: string,
    ieee830Requirements: IEEE830Requirement[]
  ): string {
    const templates = {
      classDiagram: `classDiagram
    class Usuario {
        +nombre: String
        +email: String
        +password: String
        +registrar()
        +login()
        +crearProyecto()
    }
    class Proyecto {
        +titulo: String
        +descripcion: String
        +fechaCreacion: Date
        +crear()
        +asignarTarea()
        +obtenerTareas()
    }
    class Tarea {
        +titulo: String
        +descripcion: String
        +estado: String
        +fechaLimite: Date
        +actualizarEstado()
        +obtenerDetalles()
    }
    Usuario "1" --> "*" Proyecto : crea
    Proyecto "1" --> "*" Tarea : contiene`,

      sequenceDiagram: `sequenceDiagram
    actor U as Usuario
    participant S as Sistema
    participant BD as BaseDatos

    U->>S: Solicita registro
    S-->>U: Formulario registro
    U->>S: Envía datos
    S->>BD: Valida datos
    BD-->>S: Datos válidos
    S-->>U: Registro exitoso

    U->>S: Solicita login
    S-->>U: Formulario login
    U->>S: Envía credenciales
    S->>BD: Verifica credenciales
    BD-->>S: Credenciales válidas
    S-->>U: Acceso concedido`,

      useCaseDiagram: `graph TD
    Usuario((Usuario))
    CU1[Registrarse]
    CU2[Iniciar Sesión]
    CU3[Crear Proyecto]
    CU4[Gestionar Tareas]
    CU5[Asignar Tareas]
    CU6[Actualizar Estado]
    
    Usuario-->CU1
    Usuario-->CU2
    Usuario-->CU3
    Usuario-->CU4
    CU4-->CU5
    CU4-->CU6`,

      componentDiagram: `graph TD
    subgraph Frontend
        UI[Interfaz Usuario]
        Auth[Autenticación]
        PM[Gestión Proyectos]
        TM[Gestión Tareas]
    end
    
    subgraph Backend
        API[API REST]
        Srv[Servicios]
        DB[(Base Datos)]
    end
    
    UI --> Auth
    UI --> PM
    UI --> TM
    Auth --> API
    PM --> API
    TM --> API
    API --> Srv
    Srv --> DB`,

packageDiagram: `graph TD
    subgraph Presentacion
        Views[Vistas]
        Components[Componentes]
        State[Estado]
    end
    
    subgraph Dominio
        Usuarios[Usuarios]
        Proyectos[Proyectos]
        Tareas[Tareas]
    end
    
    subgraph Datos
        RepoUsuarios[Repositorio_Usuarios]
        RepoProyectos[Repositorio_Proyectos]
        RepoTareas[Repositorio_Tareas]
    end
    
    Presentacion --> Dominio
    Dominio --> Datos`,
    };

    const rules = {
      classDiagram: `REGLAS:
- Inicia con 'classDiagram'
- Define clases usando: class NombreClase
- Atributos: +nombre: tipo
- Métodos: +nombre()
- Relaciones: --> para asociación
- Cardinalidad: "1" --> "*"`,
      
      sequenceDiagram: `REGLAS:
- Inicia con 'sequenceDiagram'
- Define: actor A as Usuario
- Flechas: ->> para solicitud
- Flechas: -->> para respuesta
- Mantén el orden cronológico`,
      
      useCaseDiagram: `REGLAS:
- Inicia con 'graph TD'
- Actor: Usuario((nombre))
- Casos: CU[nombre]
- Conexiones: -->`,
      
      componentDiagram: `REGLAS:
- Inicia con 'graph TD'
- Usa subgraph para módulos
- Componentes: [nombre]
- Base datos: [(nombre)]
- Conexiones: -->`,
      
      packageDiagram: `REGLAS:
- Inicia con 'graph TD'
- Define subgraph para capas
- Elementos: [nombre]
- Conexiones: -->`
    };

    return `
Genera un diagrama Mermaid de tipo ${type} para estos requerimientos:

${originalRequirements}

${rules[type]}

Usa EXACTAMENTE esta estructura base (solo cambia el contenido, no la sintaxis):

${templates[type]}

IMPORTANTE:
1. NO incluyas explicaciones ni comentarios
2. El diagrama DEBE empezar con la declaración correcta
3. Mantén la identación y formato exactos
4. Usa solo caracteres ASCII
`;
  }

  private validateMermaidCode(code: string, type: DiagramType): string {
    const startTokens = {
      classDiagram: 'classDiagram',
      sequenceDiagram: 'sequenceDiagram',
      useCaseDiagram: 'graph TD',
      componentDiagram: 'graph TD',
      packageDiagram: 'graph TD'
    };

    const requiredElements = {
      classDiagram: ['class', '{', '}', '-->'],
      sequenceDiagram: ['actor', 'participant', '->>'],
      useCaseDiagram: ['((', '))', '[', ']', '-->'],
      componentDiagram: ['subgraph', '[', ']', '-->'],
      packageDiagram: ['subgraph', '[', ']', '-->']
    };

    // Verificar inicio correcto
    if (!code.startsWith(startTokens[type])) {
      code = startTokens[type] + '\n' + code;
    }

    // Verificar elementos requeridos
    const elements = requiredElements[type];
    if (elements && !elements.every(elem => code.includes(elem))) {
      throw new Error(`Faltan elementos requeridos en el diagrama ${type}`);
    }

    // Limpiar formato
    code = code.split('\n')
               .map(line => line.trimRight())
               .join('\n')
               .trim();

    return code;
  }

  private extractMermaidCode(text: string, type: DiagramType): string {
    try {
      // Limpiar markdown y espacios
      let code = text.replace(/```mermaid\n?/g, '')
                    .replace(/```\n?/g, '')
                    .replace(/\r\n/g, '\n')
                    .trim();

      // Extraer el código del diagrama
      const startToken = type === 'classDiagram' ? 'classDiagram' :
                        type === 'sequenceDiagram' ? 'sequenceDiagram' : 
                        'graph TD';
                        
      const startIndex = code.indexOf(startToken);
      if (startIndex === -1) {
        throw new Error(`No se encontró el inicio del diagrama ${type}`);
      }

      code = code.substring(startIndex);

      // Validar estructura básica
      const hasOpenBraces = code.includes('{');
      const hasCloseBraces = code.includes('}');
      if (type === 'classDiagram' && hasOpenBraces !== hasCloseBraces) {
        throw new Error('Las llaves no están balanceadas');
      }

      return code;
    } catch (error) {
      this.logger.error('Error procesando código Mermaid:', error);
      throw new Error(`Error en la sintaxis del diagrama: ${error.message}`);
    }
  }

  private getDiagramTitle(type: DiagramType): string {
    const titles = {
      classDiagram: 'Diagrama de Clases',
      sequenceDiagram: 'Diagrama de Secuencia',
      useCaseDiagram: 'Diagrama de Casos de Uso',
      componentDiagram: 'Diagrama de Componentes',
      packageDiagram: 'Diagrama de Paquetes'
    };
    return titles[type];
  }

  private cleanJsonResponse(text: string): string {
    let cleaned = text.substring(text.indexOf('{'));
    cleaned = cleaned.substring(0, cleaned.lastIndexOf('}') + 1);
    cleaned = cleaned.replace(/```json\n?/g, '')
                    .replace(/```\n?/g, '')
                    .trim();
    return cleaned;
  }
}