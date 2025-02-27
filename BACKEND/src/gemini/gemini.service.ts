// src/gemini/gemini.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';
import { 
  MermaidDiagram, 
  DiagramType, 
  IEEE830Requirement, 
  AnalysisResponse,
  GeneratedCode,
  NestJSBackend,
  AngularFrontend
} from './interfaces/code-generation.interface';

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
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
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
      
      // Primero obtenemos los requerimientos IEEE830
      const ieee830Requirements = await this.analyzeIEEE830(requirements);
      
      // Luego generamos los diagramas
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
    try {
      const prompt = `
      GENERA UN JSON VÁLIDO CON ESTE FORMATO EXACTO para los requerimientos IEEE 830:
      {
        "requirements": [
          {
            "id": "REQ-001",
            "type": "functional",
            "description": "descripción corta y clara",
            "priority": "high",
            "dependencies": []
          }
        ]
      }
  
      REGLAS:
      1. SOLO responde con el JSON
      2. NO agregues texto adicional ni markdown
      3. Los tipos válidos son: "functional" o "non-functional"
      4. Las prioridades válidas son: "high", "medium", "low"
      5. Las descripciones deben ser claras y concisas
      6. Los IDs deben seguir el formato REQ-XXX
  
      REQUERIMIENTOS:
      ${requirements}`;
  
      const result = await this.model.generateContent([
        { text: prompt }
      ]);
  
      const response = result.response.text();
      let cleaned = response
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .trim();
  
      // Encontrar el JSON
      const start = cleaned.indexOf('{');
      const end = cleaned.lastIndexOf('}');
      
      if (start === -1 || end === -1) {
        throw new Error('No se encontró un JSON válido en la respuesta');
      }
  
      cleaned = cleaned.substring(start, end + 1);
  
      // Intentar parsear
      const parsed = JSON.parse(cleaned);
  
      // Validar estructura
      if (!parsed.requirements || !Array.isArray(parsed.requirements)) {
        throw new Error('La respuesta no contiene un array de requerimientos');
      }
  
      // Validar y limpiar cada requerimiento
      const validatedRequirements = parsed.requirements.map((req, index) => ({
        id: req.id?.match(/^REQ-\d{3}$/) ? req.id : `REQ-${String(index + 1).padStart(3, '0')}`,
        type: ['functional', 'non-functional'].includes(req.type) ? req.type : 'functional',
        description: (req.description || 'No description provided').trim(),
        priority: ['high', 'medium', 'low'].includes(req.priority) ? req.priority : 'medium',
        dependencies: Array.isArray(req.dependencies) ? req.dependencies : []
      }));
  
      return validatedRequirements;
    } catch (error) {
      this.logger.error('Error en analyzeIEEE830:', error);
      return [{
        id: 'REQ-001',
        type: 'functional',
        description: 'Requerimiento general del sistema',
        priority: 'high',
        dependencies: []
      }];
    }
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
        const result = await this.model.generateContent([{ text: prompt }]);
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
      classDiagram: ['class'],
      sequenceDiagram: ['actor'],
      useCaseDiagram: ['[', ']'],
      componentDiagram: ['subgraph'],
      packageDiagram: ['subgraph']
    };
  
    // Verificar inicio correcto
    if (!code.startsWith(startTokens[type])) {
      code = startTokens[type] + '\n' + code;
    }
  
    // Verificar elementos requeridos
    const elements = requiredElements[type];
    if (elements && !elements.some(elem => code.includes(elem))) {
      this.logger.warn(`Advertencia: Pueden faltar elementos en el diagrama ${type}`);
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
//##################################################################################################################################################################################
//##################################################################################################################################################################################
//##################################################################################################################################################################################
//##################################################################################################################################################################################
//##################################################################################################################################################################################
//#####################################################################             GENERADOR DE CODIGO             ################################################################
//##################################################################################################################################################################################
//##################################################################################################################################################################################
//##################################################################################################################################################################################
//##################################################################################################################################################################################
//##################################################################################################################################################################################



  // Nuevo método para generar código a partir de diagramas y requisitos
// src/gemini/gemini.service.ts (método generateCode actualizado)

async generateCode(
  diagrams: MermaidDiagram[],
  requirements: IEEE830Requirement[]
): Promise<GeneratedCode> {
  try {
    this.logger.log('Iniciando generación de código modular...');
    
    // Generar el backend
    const backend = await this.generateBackend(diagrams, requirements);
    
    // Generar el frontend
    const frontend = await this.generateFrontend(diagrams, requirements);
    
    return {
      backend,
      frontend
    };
  } catch (error) {
    this.logger.error(`Error en generación de código: ${error.message}`);
    throw new Error(`Error en generación de código: ${error.message}`);
  }
}

// Generar código backend en NestJS
private async generateBackend(
  diagrams: MermaidDiagram[],
  requirements: IEEE830Requirement[]
): Promise<NestJSBackend> {
  try {
    // Encontrar el diagrama de clases para extraer entidades
    const classDiagram = diagrams.find(d => d.type === 'classDiagram');
    if (!classDiagram) {
      throw new Error('Se requiere un diagrama de clases para generar el backend');
    }

    // Lista de módulos a generar
    const moduleNames = ['AppModule', 'AuthModule', 'UsersModule', 'ProjectsModule', 'TasksModule'];
    const result: NestJSBackend = {
      modules: [],
      commonFiles: [],
      cliCommands: []
    };

    // Generar estructura básica y archivos comunes
    this.logger.log('Generando estructura básica de backend y archivos comunes...');
    const basePrompt = this.buildBackendBasePrompt(classDiagram, diagrams, requirements);
    const baseResponse = await this.retryOperation(async () => {
      const result = await this.model.generateContent([{ text: basePrompt }]);
      return result.response.text();
    });
    
    const baseStructure = this.extractJsonFromResponse(baseResponse);
    if (baseStructure && baseStructure.commonFiles) {
      result.commonFiles = baseStructure.commonFiles;
    }
    if (baseStructure && baseStructure.cliCommands) {
      result.cliCommands = baseStructure.cliCommands;
    }

    // Generar cada módulo individualmente
    for (const moduleName of moduleNames) {
      try {
        this.logger.log(`Generando módulo backend: ${moduleName}...`);
        const modulePrompt = this.buildBackendModulePrompt(moduleName, classDiagram, diagrams, requirements);
        
        const moduleResponse = await this.retryOperation(async () => {
          const result = await this.model.generateContent([{ text: modulePrompt }]);
          return result.response.text();
        });
        
        const moduleStructure = this.extractJsonFromResponse(moduleResponse);
        if (moduleStructure && moduleStructure.module) {
          result.modules.push(moduleStructure.module);
        }
      } catch (error) {
        this.logger.error(`Error generando módulo ${moduleName}:`, error);
        // Continuar con el siguiente módulo en caso de error
      }
    }

    if (result.modules.length === 0) {
      throw new Error('No se pudo generar ningún módulo para el backend');
    }

    return result;
  } catch (error) {
    this.logger.error('Error generando backend:', error);
    throw new Error(`Error generando backend: ${error.message}`);
  }
}


private buildBackendBasePrompt(
  classDiagram: MermaidDiagram,
  allDiagrams: MermaidDiagram[],
  requirements: IEEE830Requirement[]
): string {
  return `
  GENERA UN JSON con los archivos comunes y comandos CLI para un backend NestJS.
  
  ⚠️ ALERTA DE FORMATO JSON ⚠️
  
  Genera un JSON completamente válido sin errores de sintaxis. Es CRÍTICO para el funcionamiento del sistema.
  
  REGLAS DE FORMATO JSON (ESTRICTAS):
  1. Usa SOLO comillas dobles para nombres de propiedades y valores string
  2. Todos los strings deben tener escape correcto: usa \\" para comillas dobles dentro de strings
  3. Usa \\n para saltos de línea dentro de strings
  4. Usa \\\\ para representar backslash
  5. Coloca comas entre elementos de array y propiedades de objeto, pero NO después del último elemento
  6. Asegúrate de que todos los corchetes y llaves estén correctamente cerrados y balanceados
  7. No uses abreviaciones como "..." o "etc" dentro del JSON

  Estructura exacta del JSON:
  
  {
    "commonFiles": [
      {
        "path": "ruta/al/archivo",
        "content": "contenido del archivo con escape correcto",
        "type": "tipo de archivo"
      }
    ],
    "cliCommands": ["comando1", "comando2"]
  }
  
  Basado en el siguiente diagrama de clases:
  ${classDiagram.code}
  
  Y los siguientes requisitos:
  ${JSON.stringify(requirements, null, 2)}
  
  Archivos comunes a incluir:
  - package.json
  - tsconfig.json
  - .env (con variables de entorno de ejemplo)
  - nest-cli.json
  - main.ts (inicialización de la aplicación)
  
  Comandos CLI a incluir:
  - Comandos para instalar dependencias
  - Comandos para ejecutar migraciones si es necesario
  - Cualquier otro comando necesario para configurar el proyecto

  ⚠️ VERIFICA QUE TU JSON SEA 100% VÁLIDO Y TENGA ESCAPE CORRECTO ANTES DE RESPONDER ⚠️
  
  SOLO DEVUELVE EL JSON, sin explicaciones ni comentarios adicionales.
  `;
}

private buildBackendModulePrompt(
  moduleName: string,
  classDiagram: MermaidDiagram,
  allDiagrams: MermaidDiagram[],
  requirements: IEEE830Requirement[]
): string {
  return `
  GENERA UN JSON con la implementación del módulo "${moduleName}" para un backend NestJS.
  
  ⚠️ ALERTA DE FORMATO JSON ⚠️
  
  Genera un JSON completamente válido sin errores de sintaxis. Es CRÍTICO para el funcionamiento del sistema.
  
  REGLAS DE FORMATO JSON (ESTRICTAS):
  1. Usa SOLO comillas dobles para nombres de propiedades y valores string
  2. Todos los strings deben tener escape correcto: usa \\" para comillas dobles dentro de strings
  3. Usa \\n para saltos de línea dentro de strings
  4. Usa \\\\ para representar backslash
  5. Coloca comas entre elementos de array y propiedades de objeto, pero NO después del último elemento
  6. Asegúrate de que todos los corchetes y llaves estén correctamente cerrados y balanceados
  7. No uses abreviaciones como "..." o "etc" dentro del JSON

  Estructura exacta del JSON:
  
  {
    "module": {
      "name": "${moduleName}",
      "files": [
        {
          "path": "ruta/al/archivo",
          "content": "contenido del archivo con escape correcto",
          "type": "tipo de archivo"
        }
      ],
      "cliCommands": []
    }
  }
  
  Basado en el siguiente diagrama de clases:
  ${classDiagram.code}
  
  Y los siguientes requisitos:
  ${JSON.stringify(requirements, null, 2)}
  
  IMPORTANTE:
  - Genera código real y funcional específico para el módulo "${moduleName}"
  - Implementa todas las relaciones del diagrama de clases
  - El código debe ser modular y seguir buenas prácticas
  - Usa TypeORM para la interacción con la base de datos
  - No omitas código importante, cada archivo debe estar completo
  - Define todos los endpoints RESTful necesarios

  ⚠️ VERIFICA QUE TU JSON SEA 100% VÁLIDO Y TENGA ESCAPE CORRECTO ANTES DE RESPONDER ⚠️
  
  SOLO DEVUELVE EL JSON, sin explicaciones ni comentarios adicionales.
  `;
}

// Generar código frontend en Angular
private async generateFrontend(
  diagrams: MermaidDiagram[],
  requirements: IEEE830Requirement[]
): Promise<AngularFrontend> {
  try {
    // Encontrar los diagramas necesarios
    const componentDiagram = diagrams.find(d => d.type === 'componentDiagram');
    const classDiagram = diagrams.find(d => d.type === 'classDiagram');
    
    if (!componentDiagram || !classDiagram) {
      throw new Error('Se requieren diagramas de componentes y clases para generar el frontend');
    }

    // Lista de módulos a generar
    const moduleNames = ['AppModule', 'CoreModule', 'SharedModule', 'AuthModule', 'ProjectsModule', 'TasksModule'];
    const result: AngularFrontend = {
      modules: [],
      commonFiles: [],
      cliCommands: []
    };

    // Generar estructura básica y archivos comunes
    this.logger.log('Generando estructura básica de frontend y archivos comunes...');
    const basePrompt = this.buildFrontendBasePrompt(componentDiagram, classDiagram, requirements);
    const baseResponse = await this.retryOperation(async () => {
      const result = await this.model.generateContent([{ text: basePrompt }]);
      return result.response.text();
    });
    
    const baseStructure = this.extractJsonFromResponse(baseResponse);
    if (baseStructure && baseStructure.commonFiles) {
      result.commonFiles = baseStructure.commonFiles;
    }
    if (baseStructure && baseStructure.cliCommands) {
      result.cliCommands = baseStructure.cliCommands;
    }

    // Generar cada módulo individualmente
    for (const moduleName of moduleNames) {
      try {
        this.logger.log(`Generando módulo frontend: ${moduleName}...`);
        const modulePrompt = this.buildFrontendModulePrompt(moduleName, componentDiagram, classDiagram, requirements);
        
        const moduleResponse = await this.retryOperation(async () => {
          const result = await this.model.generateContent([{ text: modulePrompt }]);
          return result.response.text();
        });
        
        const moduleStructure = this.extractJsonFromResponse(moduleResponse);
        if (moduleStructure && moduleStructure.module) {
          result.modules.push(moduleStructure.module);
        }
      } catch (error) {
        this.logger.error(`Error generando módulo ${moduleName}:`, error);
        // Continuar con el siguiente módulo en caso de error
      }
    }

    if (result.modules.length === 0) {
      throw new Error('No se pudo generar ningún módulo para el frontend');
    }

    return result;
  } catch (error) {
    this.logger.error('Error generando frontend:', error);
    throw new Error(`Error generando frontend: ${error.message}`);
  }
}

private buildFrontendBasePrompt(
  componentDiagram: MermaidDiagram,
  classDiagram: MermaidDiagram,
  requirements: IEEE830Requirement[]
): string {
  return `
  GENERA UN JSON con los archivos comunes y comandos CLI para un frontend Angular.
  
  ⚠️ ALERTA DE FORMATO JSON ⚠️
  
  Genera un JSON completamente válido sin errores de sintaxis. Es CRÍTICO para el funcionamiento del sistema.
  
  REGLAS DE FORMATO JSON (ESTRICTAS):
  1. Usa SOLO comillas dobles para nombres de propiedades y valores string
  2. Todos los strings deben tener escape correcto: usa \\" para comillas dobles dentro de strings
  3. Usa \\n para saltos de línea dentro de strings
  4. Usa \\\\ para representar backslash
  5. Coloca comas entre elementos de array y propiedades de objeto, pero NO después del último elemento
  6. Asegúrate de que todos los corchetes y llaves estén correctamente cerrados y balanceados
  7. No uses abreviaciones como "..." o "etc" dentro del JSON

  Estructura exacta del JSON:
  
  {
    "commonFiles": [
      {
        "path": "ruta/al/archivo",
        "content": "contenido del archivo con escape correcto",
        "type": "tipo de archivo"
      }
    ],
    "cliCommands": ["comando1", "comando2"]
  }
  
  Basado en los siguientes diagramas:
  Diagrama de componentes:
  ${componentDiagram.code}
  
  Diagrama de clases:
  ${classDiagram.code}
  
  Y los siguientes requisitos:
  ${JSON.stringify(requirements, null, 2)}
  
  Archivos comunes a incluir:
  - package.json
  - angular.json
  - tsconfig.json
  - index.html
  - styles.scss
  - environments/environment.ts y environment.prod.ts
  
  Comandos CLI a incluir:
  - Comandos para instalar dependencias
  - Comandos para agregar Angular Material
  - Cualquier otro comando necesario para configurar el proyecto

  ⚠️ VERIFICA QUE TU JSON SEA 100% VÁLIDO Y TENGA ESCAPE CORRECTO ANTES DE RESPONDER ⚠️
  
  SOLO DEVUELVE EL JSON, sin explicaciones ni comentarios adicionales.
  `;
}

private buildFrontendModulePrompt(
  moduleName: string,
  componentDiagram: MermaidDiagram,
  classDiagram: MermaidDiagram,
  requirements: IEEE830Requirement[]
): string {
  return `
  GENERA UN JSON con la implementación del módulo "${moduleName}" para un frontend Angular.
  
  ⚠️ ALERTA DE FORMATO JSON ⚠️
  
  Genera un JSON completamente válido sin errores de sintaxis. Es CRÍTICO para el funcionamiento del sistema.
  
  REGLAS DE FORMATO JSON (ESTRICTAS):
  1. Usa SOLO comillas dobles para nombres de propiedades y valores string
  2. Todos los strings deben tener escape correcto: usa \\" para comillas dobles dentro de strings
  3. Usa \\n para saltos de línea dentro de strings
  4. Usa \\\\ para representar backslash
  5. Coloca comas entre elementos de array y propiedades de objeto, pero NO después del último elemento
  6. Asegúrate de que todos los corchetes y llaves estén correctamente cerrados y balanceados
  7. No uses abreviaciones como "..." o "etc" dentro del JSON

  Estructura exacta del JSON:
  
  {
    "module": {
      "name": "${moduleName}",
      "files": [
        {
          "path": "ruta/al/archivo",
          "content": "contenido del archivo con escape correcto",
          "type": "tipo de archivo"
        }
      ],
      "cliCommands": []
    }
  }
  
  Basado en los siguientes diagramas:
  Diagrama de componentes:
  ${componentDiagram.code}
  
  Diagrama de clases:
  ${classDiagram.code}
  
  Y los siguientes requisitos:
  ${JSON.stringify(requirements, null, 2)}
  
  IMPORTANTE:
  - Genera código real y funcional específico para el módulo "${moduleName}"
  - Para el AppModule, incluye app.module.ts, app-routing.module.ts, app.component.ts/html/scss
  - Para CoreModule, incluye servicios, guards, interceptors y modelos
  - Para SharedModule, incluye componentes compartidos y material.module.ts
  - Para AuthModule, incluye login y registro
  - Para ProjectsModule y TasksModule, incluye componentes CRUD
  - Implementa las relaciones entre componentes según el diagrama
  - Usa Angular Material para componentes de UI
  - Sigue las buenas prácticas de Angular: reactive forms, servicios inyectables, etc.

  ⚠️ VERIFICA QUE TU JSON SEA 100% VÁLIDO Y TENGA ESCAPE CORRECTO ANTES DE RESPONDER ⚠️
  
  SOLO DEVUELVE EL JSON, sin explicaciones ni comentarios adicionales.
  `;
}
// src/gemini/gemini.service.ts (solo la función buildBackendPrompt)

// Función buildBackendPrompt mejorada
private buildBackendPrompt(
  classDiagram: MermaidDiagram,
  allDiagrams: MermaidDiagram[],
  requirements: IEEE830Requirement[]
): string {
  return `
  GENERA UN JSON con la implementación completa de un backend NestJS.
  
  ⚠️ ALERTA DE FORMATO JSON ⚠️
  
  Genera un JSON completamente válido sin errores de sintaxis. Es CRÍTICO para el funcionamiento del sistema.
  
  REGLAS DE FORMATO JSON (ESTRICTAS):
  1. Usa SOLO comillas dobles para nombres de propiedades y valores string
  2. Todos los strings deben tener escape correcto: usa \\" para comillas dobles dentro de strings
  3. Usa \\n para saltos de línea dentro de strings
  4. Usa \\\\ para representar backslash
  5. Coloca comas entre elementos de array y propiedades de objeto, pero NO después del último elemento
  6. Asegúrate de que todos los corchetes y llaves estén correctamente cerrados y balanceados
  7. No uses abreviaciones como "..." o "etc" dentro del JSON

  Estructura exacta del JSON:
  
  {
    "modules": [
      {
        "name": "NombreModulo",
        "files": [
          {
            "path": "ruta/al/archivo",
            "content": "contenido del archivo con escape correcto",
            "type": "tipo de archivo"
          }
        ],
        "cliCommands": ["comando1", "comando2"]
      }
    ],
    "commonFiles": [
      {
        "path": "ruta/al/archivo",
        "content": "contenido del archivo con escape correcto",
        "type": "tipo de archivo"
      }
    ],
    "cliCommands": ["comando1", "comando2"]
  }
  
  Basado en el siguiente diagrama de clases:
  ${classDiagram.code}
  
  Y los siguientes requisitos:
  ${JSON.stringify(requirements, null, 2)}
  
  El backend debe incluir:
  
  1. Módulos:
     - AppModule (principal)
     - AuthModule (autenticación con JWT)
     - UsersModule
     - ProjectsModule
     - TasksModule
     
  2. Cada módulo debe tener:
     - Controller
     - Service
     - Entity (cuando corresponda)
     - DTOs (Create/Update)
     - Repository (opcional)
     
  3. Funcionalidades:
     - CRUD completo para entidades
     - Validación con class-validator
     - Autenticación JWT
     - Manejo de permisos y roles
     - Relaciones correctas entre entidades
     - Transacciones para operaciones complejas
     
  4. Estructura limpia:
     - Inyección de dependencias
     - Manejo de errores
     - Tipado completo
     - Comentarios explicativos
     
  IMPORTANTE:
  - Genera código real y funcional
  - Implementa todas las relaciones del diagrama de clases
  - El código debe ser modular y seguir buenas prácticas
  - Usa TypeORM para la interacción con la base de datos
  - No omitas código importante, cada archivo debe estar completo
  - Define todos los endpoints RESTful necesarios

  ⚠️ VERIFICA QUE TU JSON SEA 100% VÁLIDO Y TENGA ESCAPE CORRECTO ANTES DE RESPONDER ⚠️
  
  SOLO DEVUELVE EL JSON, sin explicaciones ni comentarios adicionales.
  `;
}

// Función buildFrontendPrompt mejorada
private buildFrontendPrompt(
  componentDiagram: MermaidDiagram,
  classDiagram: MermaidDiagram,
  requirements: IEEE830Requirement[]
): string {
  return `
  GENERA UN JSON con la implementación completa de un frontend Angular.
  
  ⚠️ ALERTA DE FORMATO JSON ⚠️
  
  Genera un JSON completamente válido sin errores de sintaxis. Es CRÍTICO para el funcionamiento del sistema.
  
  REGLAS DE FORMATO JSON (ESTRICTAS):
  1. Usa SOLO comillas dobles para nombres de propiedades y valores string
  2. Todos los strings deben tener escape correcto: usa \\" para comillas dobles dentro de strings
  3. Usa \\n para saltos de línea dentro de strings
  4. Usa \\\\ para representar backslash
  5. Coloca comas entre elementos de array y propiedades de objeto, pero NO después del último elemento
  6. Asegúrate de que todos los corchetes y llaves estén correctamente cerrados y balanceados
  7. No uses abreviaciones como "..." o "etc" dentro del JSON

  Estructura exacta del JSON:
  
  {
    "modules": [
      {
        "name": "NombreModulo",
        "files": [
          {
            "path": "ruta/al/archivo",
            "content": "contenido del archivo con escape correcto",
            "type": "tipo de archivo"
          }
        ],
        "cliCommands": ["comando1", "comando2"]
      }
    ],
    "commonFiles": [
      {
        "path": "ruta/al/archivo",
        "content": "contenido del archivo con escape correcto",
        "type": "tipo de archivo"
      }
    ],
    "cliCommands": ["comando1", "comando2"]
  }

  ESTRUCTURA DE ARCHIVOS REQUERIDA:

  1. Configuración Principal:
     - src/app/app.module.ts (Módulo principal)
     - src/app/app-routing.module.ts (Configuración de rutas)
     - src/app/app.component.ts/html/scss
     - src/environments/environment.ts
     - src/environments/environment.prod.ts

  2. Core Module (src/app/core/):
     - core.module.ts
     - interceptors/
       - jwt.interceptor.ts (Manejo de tokens)
       - error.interceptor.ts (Manejo de errores)
       - loading.interceptor.ts (Estado de carga)
     - guards/
       - auth.guard.ts (Protección de rutas)
       - role.guard.ts (Manejo de roles)
     - services/
       - auth.service.ts (Autenticación)
       - error.service.ts (Manejo de errores)
       - loading.service.ts (Estado de carga)
     - models/
       - user.model.ts
       - project.model.ts
       - task.model.ts

  3. Shared Module (src/app/shared/):
     - shared.module.ts
     - material.module.ts (Todos los imports de Angular Material)
     - components/
       - header/
         - header.component.ts
         - header.component.html
         - header.component.scss
       - footer/
         - footer.component.ts
         - footer.component.html
         - footer.component.scss
       - loading/
         - loading.component.ts
         - loading.component.html
         - loading.component.scss
       - error/
         - error.component.ts
         - error.component.html
         - error.component.scss

  4. Auth Module (src/app/auth/):
     - auth.module.ts
     - auth-routing.module.ts
     - pages/
       - login/
         - login.component.ts
         - login.component.html
         - login.component.scss
       - register/
         - register.component.ts
         - register.component.html
         - register.component.scss
     - components/
       - auth-form/
         - auth-form.component.ts
         - auth-form.component.html
         - auth-form.component.scss

  5. Projects Module (src/app/projects/):
     - projects.module.ts
     - projects-routing.module.ts
     - services/
       - project.service.ts
     - models/
       - project.model.ts
     - pages/
       - project-list/
         - project-list.component.ts
         - project-list.component.html
         - project-list.component.scss
       - project-create/
         - project-create.component.ts
         - project-create.component.html
         - project-create.component.scss
       - project-detail/
         - project-detail.component.ts
         - project-detail.component.html
         - project-detail.component.scss
     - components/
       - project-form/
         - project-form.component.ts
         - project-form.component.html
         - project-form.component.scss
       - project-card/
         - project-card.component.ts
         - project-card.component.html
         - project-card.component.scss

  6. Tasks Module (src/app/tasks/):
     - tasks.module.ts
     - tasks-routing.module.ts
     - services/
       - task.service.ts
     - models/
       - task.model.ts
     - pages/
       - task-list/
         - task-list.component.ts
         - task-list.component.html
         - task-list.component.scss
       - task-create/
         - task-create.component.ts
         - task-create.component.html
         - task-create.component.scss
       - task-detail/
         - task-detail.component.ts
         - task-detail.component.html
         - task-detail.component.scss
     - components/
       - task-form/
         - task-form.component.ts
         - task-form.component.html
         - task-form.component.scss
       - task-card/
         - task-card.component.ts
         - task-card.component.html
         - task-card.component.scss

  Basado en los siguientes diagramas:
  Diagrama de componentes:
  ${componentDiagram.code}
  
  Diagrama de clases:
  ${classDiagram.code}
  
  Y los siguientes requisitos:
  ${JSON.stringify(requirements, null, 2)}

  ⚠️ VERIFICA QUE TU JSON SEA 100% VÁLIDO Y TENGA ESCAPE CORRECTO ANTES DE RESPONDER ⚠️
  
  SOLO DEVUELVE EL JSON, sin explicaciones ni comentarios adicionales.
  `;
}

// src/gemini/gemini.service.ts (solo la función extractJsonFromResponse)

// src/gemini/gemini.service.ts (función extractJsonFromResponse actualizada)

private extractJsonFromResponse(response: string): any {
  try {
    // Intentar limpiar y parsear el JSON normalmente
    // Limpiar la respuesta para extraer solo el JSON
    let jsonStr = response.replace(/```json\s*/g, '')
                         .replace(/```\s*/g, '')
                         .trim();
    
    // Encontrar el JSON
    const start = jsonStr.indexOf('{');
    const end = jsonStr.lastIndexOf('}');
    
    if (start === -1 || end === -1) {
      throw new Error('No se encontró un JSON válido en la respuesta');
    }
    
    jsonStr = jsonStr.substring(start, end + 1);
    
    // Intentar parsear el JSON
    try {
      return JSON.parse(jsonStr);
    } catch (parseError) {
      this.logger.warn(`Error al parsear JSON: ${parseError.message}. Intentando reparar...`);
      
      // Intentar reparaciones básicas
      jsonStr = jsonStr
        .replace(/'/g, '"') // Reemplazar comillas simples por dobles
        .replace(/,(\s*[\]}])/g, '$1') // Eliminar comas al final de arrays y objetos
        .replace(/([}\]])\s*([{\[])/g, '$1,$2') // Agregar comas entre objetos/arrays consecutivos
        .replace(/([}\]])\s*"([^"]+)"/g, '$1,"$2"') // Agregar comas entre objeto y propiedad
        .replace(/"([^"]+)"\s*([{\[])/g, '"$1":$2') // Arreglar formato de propiedades con arrays/objetos
        .replace(/\\n/g, '\\n') // Normalizar saltos de línea
        .replace(/\\"/g, '\\"'); // Normalizar comillas escapadas
      
      try {
        return JSON.parse(jsonStr);
      } catch (error) {
        this.logger.warn(`Reparación básica fallida: ${error.message}. Intentando extracción de emergencia...`);
        
        // Como último recurso, utilizar la extracción de emergencia
        this.logger.warn('Utilizando método de extracción de emergencia para el código generado');
        return this.extractCodeEmergency(jsonStr);
      }
    }
  } catch (error) {
    this.logger.error('Error extrayendo JSON de la respuesta:', error);
    
    // Si todo falla, intentar con la extracción de emergencia
    try {
      return this.extractCodeEmergency(response);
    } catch (emergencyError) {
      this.logger.error('Extracción de emergencia fallida:', emergencyError);
      
      // Devolver una estructura vacía si todo falla
      return {
        modules: [],
        commonFiles: [],
        cliCommands: []
      };
    }
  }
}


// src/gemini/gemini.service.ts (función de extracción de emergencia)

private extractCodeEmergency(jsonStr: string): any {
  this.logger.warn('Realizando extracción de emergencia del código generado...');
  
  try {
    // Estructura para almacenar el resultado
    const result: any = {
      modules: [],
      commonFiles: [],
      cliCommands: []
    };

    // Extraer módulos con expresiones regulares
    const moduleRegex = /"name"\s*:\s*"([^"]+)"[\s\S]*?"files"\s*:\s*\[([\s\S]*?)\]\s*,\s*"cliCommands"/g;
    let moduleMatch;
    
    while ((moduleMatch = moduleRegex.exec(jsonStr)) !== null) {
      const moduleName = moduleMatch[1];
      const filesContent = moduleMatch[2];
      
      const files: any[] = [];
      
      // Extraer archivos dentro del módulo
      const fileRegex = /"path"\s*:\s*"([^"]+)"[\s\S]*?"content"\s*:\s*"([\s\S]*?)",\s*"type"\s*:\s*"([^"]+)"/g;
      let fileMatch;
      
      while ((fileMatch = fileRegex.exec(filesContent)) !== null) {
        const path = fileMatch[1];
        const content = fileMatch[2].replace(/\\"/g, '"').replace(/\\n/g, '\n');
        const type = fileMatch[3];
        
        files.push({
          path,
          content,
          type
        });
      }
      
      // Agregar el módulo a la lista
      result.modules.push({
        name: moduleName,
        files,
        cliCommands: []
      });
    }
    
    // Extraer archivos comunes
    const commonFilesRegex = /"commonFiles"\s*:\s*\[([\s\S]*?)\]\s*,\s*"cliCommands"/;
    const commonFilesMatch = commonFilesRegex.exec(jsonStr);
    
    if (commonFilesMatch) {
      const commonFilesContent = commonFilesMatch[1];
      
      const fileRegex = /"path"\s*:\s*"([^"]+)"[\s\S]*?"content"\s*:\s*"([\s\S]*?)",\s*"type"\s*:\s*"([^"]+)"/g;
      let fileMatch;
      
      while ((fileMatch = fileRegex.exec(commonFilesContent)) !== null) {
        const path = fileMatch[1];
        const content = fileMatch[2].replace(/\\"/g, '"').replace(/\\n/g, '\n');
        const type = fileMatch[3];
        
        result.commonFiles.push({
          path,
          content,
          type
        });
      }
    }
    
    // Extraer comandos CLI
    const cliCommandsRegex = /"cliCommands"\s*:\s*\[([\s\S]*?)\]\s*}/;
    const cliCommandsMatch = cliCommandsRegex.exec(jsonStr);
    
    if (cliCommandsMatch) {
      const cliCommandsContent = cliCommandsMatch[1];
      const commands = cliCommandsContent.match(/"([^"]+)"/g) || [];
      
      result.cliCommands = commands.map(cmd => cmd.replace(/"/g, ''));
    }
    
    this.logger.log(`Extracción de emergencia completada: ${result.modules.length} módulos, ${result.commonFiles.length} archivos comunes, ${result.cliCommands.length} comandos CLI`);
    
    return result;
  } catch (error) {
    this.logger.error('Error en extracción de emergencia:', error);
    // Retornar una estructura vacía si todo falla
    return {
      modules: [],
      commonFiles: [],
      cliCommands: []
    };
  }
}

//##################################################################################################################################################################################
//##################################################################################################################################################################################
//##################################################################################################################################################################################
//##################################################################################################################################################################################
//##################################################################################################################################################################################
//#####################################################################             GENERADOR DE CODIGO             ################################################################
//##################################################################################################################################################################################
//##################################################################################################################################################################################
//##################################################################################################################################################################################
//##################################################################################################################################################################################
//##################################################################################################################################################################################































}