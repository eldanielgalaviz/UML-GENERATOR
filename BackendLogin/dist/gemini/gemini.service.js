"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var GeminiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiService = void 0;
const JSZip = require("jszip");
const common_1 = require("@nestjs/common");
const generative_ai_1 = require("@google/generative-ai");
const config_1 = require("@nestjs/config");
let GeminiService = GeminiService_1 = class GeminiService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(GeminiService_1.name);
        this.MAX_RETRIES = 3;
        this.RETRY_DELAY = 1000;
        const apiKey = this.configService.get('GEMINI_API_KEY');
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY no está configurada');
        }
        this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    async retryOperation(operation, retryCount = 0) {
        try {
            return await operation();
        }
        catch (error) {
            if (retryCount >= this.MAX_RETRIES) {
                throw error;
            }
            await this.delay(this.RETRY_DELAY * (retryCount + 1));
            return this.retryOperation(operation, retryCount + 1);
        }
    }
    async analyzeRequirements(requirements) {
        try {
            this.logger.log('Iniciando análisis de requerimientos...');
            const ieee830Requirements = await this.analyzeIEEE830(requirements);
            const diagrams = await this.generateAllDiagrams(requirements, ieee830Requirements);
            return {
                requirements: ieee830Requirements,
                diagrams
            };
        }
        catch (error) {
            this.logger.error(`Error en el análisis: ${error.message}`);
            throw new Error(`Error en el análisis: ${error.message}`);
        }
    }
    async analyzeIEEE830(requirements) {
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
            const start = cleaned.indexOf('{');
            const end = cleaned.lastIndexOf('}');
            if (start === -1 || end === -1) {
                throw new Error('No se encontró un JSON válido en la respuesta');
            }
            cleaned = cleaned.substring(start, end + 1);
            const parsed = JSON.parse(cleaned);
            if (!parsed.requirements || !Array.isArray(parsed.requirements)) {
                throw new Error('La respuesta no contiene un array de requerimientos');
            }
            const validatedRequirements = parsed.requirements.map((req, index) => {
                var _a;
                return ({
                    id: ((_a = req.id) === null || _a === void 0 ? void 0 : _a.match(/^REQ-\d{3}$/)) ? req.id : `REQ-${String(index + 1).padStart(3, '0')}`,
                    type: ['functional', 'non-functional'].includes(req.type) ? req.type : 'functional',
                    description: (req.description || 'No description provided').trim(),
                    priority: ['high', 'medium', 'low'].includes(req.priority) ? req.priority : 'medium',
                    dependencies: Array.isArray(req.dependencies) ? req.dependencies : []
                });
            });
            return validatedRequirements;
        }
        catch (error) {
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
    async generateAllDiagrams(originalRequirements, ieee830Requirements) {
        const diagramTypes = [
            'classDiagram',
            'sequenceDiagram',
            'useCaseDiagram',
            'componentDiagram',
            'packageDiagram'
        ];
        const diagrams = await Promise.all(diagramTypes.map(type => this.generateMermaidDiagram(type, originalRequirements, ieee830Requirements)));
        return diagrams.filter(d => d !== null);
    }
    async generateMermaidDiagram(type, originalRequirements, ieee830Requirements) {
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
        }
        catch (error) {
            this.logger.error(`Error generando diagrama ${type}:`, error);
            return null;
        }
    }
    buildMermaidPrompt(type, originalRequirements, ieee830Requirements) {
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
    validateMermaidCode(code, type) {
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
        if (!code.startsWith(startTokens[type])) {
            code = startTokens[type] + '\n' + code;
        }
        const elements = requiredElements[type];
        if (elements && !elements.some(elem => code.includes(elem))) {
            this.logger.warn(`Advertencia: Pueden faltar elementos en el diagrama ${type}`);
        }
        code = code.split('\n')
            .map(line => line.trimRight())
            .join('\n')
            .trim();
        return code;
    }
    extractMermaidCode(text, type) {
        try {
            let code = text.replace(/```mermaid\n?/g, '')
                .replace(/```\n?/g, '')
                .replace(/\r\n/g, '\n')
                .trim();
            const startToken = type === 'classDiagram' ? 'classDiagram' :
                type === 'sequenceDiagram' ? 'sequenceDiagram' :
                    'graph TD';
            const startIndex = code.indexOf(startToken);
            if (startIndex === -1) {
                throw new Error(`No se encontró el inicio del diagrama ${type}`);
            }
            code = code.substring(startIndex);
            const hasOpenBraces = code.includes('{');
            const hasCloseBraces = code.includes('}');
            if (type === 'classDiagram' && hasOpenBraces !== hasCloseBraces) {
                throw new Error('Las llaves no están balanceadas');
            }
            return code;
        }
        catch (error) {
            this.logger.error('Error procesando código Mermaid:', error);
            throw new Error(`Error en la sintaxis del diagrama: ${error.message}`);
        }
    }
    getDiagramTitle(type) {
        const titles = {
            classDiagram: 'Diagrama de Clases',
            sequenceDiagram: 'Diagrama de Secuencia',
            useCaseDiagram: 'Diagrama de Casos de Uso',
            componentDiagram: 'Diagrama de Componentes',
            packageDiagram: 'Diagrama de Paquetes'
        };
        return titles[type];
    }
    async generateCode(diagrams, requirements) {
        try {
            this.logger.log('Iniciando generación de código modular...');
            const backend = await this.generateBackend(diagrams, requirements);
            const frontend = await this.generateFrontend(diagrams, requirements);
            const sqlScripts = await this.generateDatabaseScripts(diagrams, requirements);
            return {
                backend,
                frontend,
                database: {
                    scripts: sqlScripts
                }
            };
        }
        catch (error) {
            this.logger.error(`Error en generación de código: ${error.message}`);
            throw new Error(`Error en generación de código: ${error.message}`);
        }
    }
    async generateBackend(diagrams, requirements) {
        try {
            const classDiagram = diagrams.find(d => d.type === 'classDiagram');
            if (!classDiagram) {
                throw new Error('Se requiere un diagrama de clases para generar el backend');
            }
            const moduleNames = ['AppModule', 'AuthModule', 'UsersModule', 'ProjectsModule', 'TasksModule'];
            const result = {
                modules: [],
                commonFiles: [],
                cliCommands: []
            };
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
                }
                catch (error) {
                    this.logger.error(`Error generando módulo ${moduleName}:`, error);
                }
            }
            if (result.modules.length === 0) {
                throw new Error('No se pudo generar ningún módulo para el backend');
            }
            return result;
        }
        catch (error) {
            this.logger.error('Error generando backend:', error);
            throw new Error(`Error generando backend: ${error.message}`);
        }
    }
    buildBackendBasePrompt(classDiagram, allDiagrams, requirements) {
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
    buildBackendModulePrompt(moduleName, classDiagram, allDiagrams, requirements) {
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
    async generateFrontend(diagrams, requirements) {
        var _a;
        try {
            const componentDiagram = diagrams.find(d => d.type === 'componentDiagram');
            const classDiagram = diagrams.find(d => d.type === 'classDiagram');
            if (!componentDiagram) {
                this.logger.warn('No se encontró diagrama de componentes. Usando diagrama predeterminado.');
            }
            if (!classDiagram) {
                this.logger.warn('No se encontró diagrama de clases. Usando diagrama predeterminado.');
            }
            const moduleNames = this.extractFrontendModuleNamesFromRequirements(requirements);
            this.logger.log(`Módulos a generar para el frontend: ${moduleNames.join(', ')}`);
            const result = {
                modules: [],
                commonFiles: [],
                cliCommands: []
            };
            this.logger.log('Generando estructura básica de frontend y archivos comunes...');
            const basePrompt = this.buildFrontendBasePrompt(componentDiagram || this.generateDefaultComponentDiagram(), classDiagram || this.generateDefaultClassDiagram(), requirements);
            const baseResponse = await this.retryOperation(async () => {
                const result = await this.model.generateContent([{ text: basePrompt }]);
                return result.response.text();
            });
            const baseStructure = this.extractJsonFromResponse(baseResponse);
            if (baseStructure && baseStructure.commonFiles) {
                result.commonFiles = baseStructure.commonFiles;
                this.logger.log(`Generados ${baseStructure.commonFiles.length} archivos comunes para el frontend`);
            }
            if (baseStructure && baseStructure.cliCommands) {
                result.cliCommands = baseStructure.cliCommands;
                this.logger.log(`Generados ${baseStructure.cliCommands.length} comandos CLI para el frontend`);
            }
            for (const moduleName of moduleNames) {
                try {
                    this.logger.log(`Generando módulo frontend: ${moduleName}...`);
                    const modulePrompt = this.buildFrontendModulePrompt(moduleName, componentDiagram || this.generateDefaultComponentDiagram(), classDiagram || this.generateDefaultClassDiagram(), requirements);
                    const moduleResponse = await this.retryOperation(async () => {
                        const result = await this.model.generateContent([{ text: modulePrompt }]);
                        return result.response.text();
                    });
                    const moduleStructure = this.extractJsonFromResponse(moduleResponse);
                    if (moduleStructure && moduleStructure.module) {
                        result.modules.push(moduleStructure.module);
                        this.logger.log(`Módulo frontend ${moduleName} generado correctamente con ${((_a = moduleStructure.module.files) === null || _a === void 0 ? void 0 : _a.length) || 0} archivos`);
                    }
                    else {
                        throw new Error(`No se pudo extraer la estructura del módulo ${moduleName}`);
                    }
                }
                catch (error) {
                    this.logger.error(`Error generando módulo frontend ${moduleName}:`, error);
                    try {
                        this.logger.log(`Reintentando generación de módulo frontend ${moduleName} con prompt simplificado...`);
                        const simplePrompt = this.buildSimpleFrontendModulePrompt(moduleName, requirements);
                        const simpleResponse = await this.retryOperation(async () => {
                            const result = await this.model.generateContent([{ text: simplePrompt }]);
                            return result.response.text();
                        });
                        const moduleStructure = this.extractJsonFromResponse(simpleResponse);
                        if (moduleStructure && moduleStructure.module) {
                            result.modules.push(moduleStructure.module);
                            this.logger.log(`Módulo frontend ${moduleName} generado con prompt simplificado`);
                        }
                        else {
                            this.logger.error(`No se pudo generar el módulo frontend ${moduleName}, incluso con prompt simplificado`);
                        }
                    }
                    catch (retryError) {
                        this.logger.error(`Error en segundo intento para módulo frontend ${moduleName}:`, retryError);
                    }
                }
            }
            if (result.modules.length === 0) {
                throw new Error('No se pudo generar ningún módulo para el frontend');
            }
            this.logger.log('Validando estructura del frontend generado...');
            this.validateFrontendStructure(result);
            return result;
        }
        catch (error) {
            this.logger.error('Error generando frontend:', error);
            throw new Error(`Error generando frontend: ${error.message}`);
        }
    }
    generateCommonFrontendFile(fileName) {
        switch (fileName) {
            case 'angular.json':
                return {
                    path: 'angular.json',
                    content: `{\n  "$schema": "./node_modules/@angular/cli/lib/config/schema.json",\n  "version": 1,\n  "newProjectRoot": "projects",\n  "projects": {\n    "frontend": {\n      "projectType": "application",\n      "schematics": {\n        "@schematics/angular:component": {\n          "style": "scss"\n        }\n      },\n      "root": "",\n      "sourceRoot": "src",\n      "prefix": "app",\n      "architect": {\n        "build": {\n          "builder": "@angular-devkit/build-angular:browser",\n          "options": {\n            "outputPath": "dist/frontend",\n            "index": "src/index.html",\n            "main": "src/main.ts",\n            "polyfills": ["zone.js"],\n            "tsConfig": "tsconfig.app.json",\n            "inlineStyleLanguage": "scss",\n            "assets": ["src/favicon.ico", "src/assets"],\n            "styles": [\n              "@angular/material/prebuilt-themes/indigo-pink.css",\n              "src/styles.scss"\n            ],\n            "scripts": []\n          },\n          "configurations": {\n            "production": {\n              "budgets": [\n                {\n                  "type": "initial",\n                  "maximumWarning": "500kb",\n                  "maximumError": "1mb"\n                },\n                {\n                  "type": "anyComponentStyle",\n                  "maximumWarning": "2kb",\n                  "maximumError": "4kb"\n                }\n              ],\n              "outputHashing": "all"\n            },\n            "development": {\n              "buildOptimizer": false,\n              "optimization": false,\n              "vendorChunk": true,\n              "extractLicenses": false,\n              "sourceMap": true,\n              "namedChunks": true\n            }\n          },\n          "defaultConfiguration": "production"\n        },\n        "serve": {\n          "builder": "@angular-devkit/build-angular:dev-server",\n          "configurations": {\n            "production": {\n              "browserTarget": "frontend:build:production"\n            },\n            "development": {\n              "browserTarget": "frontend:build:development"\n            }\n          },\n          "defaultConfiguration": "development"\n        },\n        "extract-i18n": {\n          "builder": "@angular-devkit/build-angular:extract-i18n",\n          "options": {\n            "browserTarget": "frontend:build"\n          }\n        },\n        "test": {\n          "builder": "@angular-devkit/build-angular:karma",\n          "options": {\n            "polyfills": ["zone.js", "zone.js/testing"],\n            "tsConfig": "tsconfig.spec.json",\n            "inlineStyleLanguage": "scss",\n            "assets": ["src/favicon.ico", "src/assets"],\n            "styles": [\n              "@angular/material/prebuilt-themes/indigo-pink.css",\n              "src/styles.scss"\n            ],\n            "scripts": []\n          }\n        }\n      }\n    }\n  },\n  "cli": {\n    "analytics": false\n  }\n}`,
                    type: 'json'
                };
            case 'tsconfig.json':
                return {
                    path: 'tsconfig.json',
                    content: `{\n  "compileOnSave": false,\n  "compilerOptions": {\n    "baseUrl": "./",\n    "outDir": "./dist/out-tsc",\n    "forceConsistentCasingInFileNames": true,\n    "strict": true,\n    "noImplicitOverride": true,\n    "noPropertyAccessFromIndexSignature": true,\n    "noImplicitReturns": true,\n    "noFallthroughCasesInSwitch": true,\n    "sourceMap": true,\n    "declaration": false,\n    "downlevelIteration": true,\n    "experimentalDecorators": true,\n    "moduleResolution": "node",\n    "importHelpers": true,\n    "target": "es2022",\n    "module": "es2022",\n    "lib": ["es2022", "dom"]\n  },\n  "angularCompilerOptions": {\n    "enableI18nLegacyMessageIdFormat": false,\n    "strictInjectionParameters": true,\n    "strictInputAccessModifiers": true,\n    "strictTemplates": true\n  }\n}`,
                    type: 'json'
                };
            case 'package.json':
                return {
                    path: 'package.json',
                    content: `{\n  "name": "frontend",\n  "version": "0.0.0",\n  "scripts": {\n    "ng": "ng",\n    "start": "ng serve",\n    "build": "ng build",\n    "watch": "ng build --watch --configuration development",\n    "test": "ng test"\n  },\n  "private": true,\n  "dependencies": {\n    "@angular/animations": "^18.0.0",\n    "@angular/cdk": "^18.0.0",\n    "@angular/common": "^18.0.0",\n    "@angular/compiler": "^18.0.0",\n    "@angular/core": "^18.0.0",\n    "@angular/forms": "^18.0.0",\n    "@angular/material": "^18.0.0",\n    "@angular/platform-browser": "^18.0.0",\n    "@angular/platform-browser-dynamic": "^18.0.0",\n    "@angular/router": "^18.0.0",\n    "rxjs": "~7.8.0",\n    "tslib": "^2.3.0",\n    "zone.js": "~0.14.0"\n  },\n  "devDependencies": {\n    "@angular-devkit/build-angular": "^18.0.0",\n    "@angular/cli": "^18.0.0",\n    "@angular/compiler-cli": "^18.0.0",\n    "@types/jasmine": "~5.1.0",\n    "jasmine-core": "~5.1.0",\n    "karma": "~6.4.0",\n    "karma-chrome-launcher": "~3.2.0",\n    "karma-coverage": "~2.2.0",\n    "karma-jasmine": "~5.1.0",\n    "karma-jasmine-html-reporter": "~2.1.0",\n    "typescript": "~5.3.0"\n  }\n}`,
                    type: 'json'
                };
            case 'src/index.html':
                return {
                    path: 'src/index.html',
                    content: `<!doctype html>\n<html lang="en">\n<head>\n  <meta charset="utf-8">\n  <title>Frontend</title>\n  <base href="/">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <link rel="icon" type="image/x-icon" href="favicon.ico">\n  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500&display=swap" rel="stylesheet">\n  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">\n</head>\n<body class="mat-typography">\n  <app-root></app-root>\n</body>\n</html>`,
                    type: 'html'
                };
            case 'src/styles.scss':
                return {
                    path: 'src/styles.scss',
                    content: `/* You can add global styles to this file, and also import other style files */\n\nhtml, body { height: 100%; }\nbody { margin: 0; font-family: Roboto, "Helvetica Neue", sans-serif; }\n`,
                    type: 'style'
                };
            case 'src/environments/environment.ts':
                return {
                    path: 'src/environments/environment.ts',
                    content: `export const environment = {\n  production: false,\n  apiUrl: 'http://localhost:3000/api'\n};\n`,
                    type: 'typescript'
                };
            case 'src/environments/environment.prod.ts':
                return {
                    path: 'src/environments/environment.prod.ts',
                    content: `export const environment = {\n  production: true,\n  apiUrl: '/api'\n};\n`,
                    type: 'typescript'
                };
            default:
                return null;
        }
    }
    validateFrontendStructure(frontend) {
        try {
            this.logger.log('Validando estructura del frontend...');
            const essentialCommonFiles = [
                'angular.json',
                'tsconfig.json',
                'package.json',
                'src/index.html',
                'src/styles.scss',
                'src/environments/environment.ts'
            ];
            const missingCommonFiles = essentialCommonFiles.filter(file => !frontend.commonFiles.some(f => f.path.endsWith(file) || f.path === file));
            if (missingCommonFiles.length > 0) {
                this.logger.warn(`Faltan archivos comunes esenciales en el frontend: ${missingCommonFiles.join(', ')}`);
                for (const missingFile of missingCommonFiles) {
                    this.logger.log(`Generando archivo común faltante: ${missingFile}`);
                    const generatedFile = this.generateCommonFrontendFile(missingFile);
                    if (generatedFile) {
                        frontend.commonFiles.push(generatedFile);
                    }
                }
            }
            const essentialModules = ['AppModule', 'CoreModule', 'SharedModule'];
            const existingModules = frontend.modules.map(m => m.name);
            const missingModules = essentialModules.filter(module => !existingModules.includes(module));
            if (missingModules.length > 0) {
                this.logger.warn(`Faltan módulos esenciales en el frontend: ${missingModules.join(', ')}`);
            }
            if (frontend.modules.some(m => m.name === 'AppModule')) {
                this.validateAppModule(frontend);
            }
            if (frontend.modules.some(m => m.name === 'CoreModule')) {
                this.validateCoreModule(frontend);
            }
            if (frontend.modules.some(m => m.name === 'SharedModule')) {
                this.validateSharedModule(frontend);
            }
            this.logger.log('Validación de estructura del frontend completada');
        }
        catch (error) {
            this.logger.error(`Error validando estructura del frontend: ${error.message}`);
        }
    }
    validateAppModule(frontend) {
        const appModule = frontend.modules.find(m => m.name === 'AppModule');
        if (!appModule)
            return;
        const essentialFiles = [
            'app.module.ts',
            'app-routing.module.ts',
            'app.component.ts',
            'app.component.html',
            'app.component.scss'
        ];
        const missingFiles = essentialFiles.filter(file => !appModule.files.some(f => f.path.endsWith(file)));
        if (missingFiles.length > 0) {
            this.logger.warn(`Faltan archivos esenciales en AppModule: ${missingFiles.join(', ')}`);
        }
        const moduleFile = appModule.files.find(f => f.path.endsWith('app.module.ts'));
        if (!moduleFile)
            return;
        const essentialImports = [
            'BrowserModule',
            'AppRoutingModule',
            'BrowserAnimationsModule',
            'HttpClientModule'
        ];
        const missingImports = essentialImports.filter(imp => !moduleFile.content.includes(imp));
        if (missingImports.length > 0) {
            this.logger.warn(`Faltan importaciones esenciales en app.module.ts: ${missingImports.join(', ')}`);
        }
    }
    validateCoreModule(frontend) {
        const coreModule = frontend.modules.find(m => m.name === 'CoreModule');
        if (!coreModule)
            return;
        const essentialFolders = [
            'services',
            'guards',
            'interceptors',
            'models'
        ];
        for (const folder of essentialFolders) {
            const hasFolder = coreModule.files.some(f => f.path.includes(`/core/${folder}/`) || f.path.includes(`/core/${folder}s/`));
            if (!hasFolder) {
                this.logger.warn(`No se encontró la carpeta ${folder} en CoreModule`);
            }
        }
        const essentialServices = [
            'auth.service.ts'
        ];
        const missingServices = essentialServices.filter(service => !coreModule.files.some(f => f.path.includes(service)));
        if (missingServices.length > 0) {
            this.logger.warn(`Faltan servicios esenciales en CoreModule: ${missingServices.join(', ')}`);
        }
    }
    buildFrontendBasePrompt(componentDiagram, classDiagram, requirements) {
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
  - Comandos para agregar Angular 18
  - Cualquier otro comando necesario para configurar el proyecto

  ⚠️ VERIFICA QUE TU JSON SEA 100% VÁLIDO Y TENGA ESCAPE CORRECTO ANTES DE RESPONDER ⚠️
  
  SOLO DEVUELVE EL JSON, sin explicaciones ni comentarios adicionales.
  `;
    }
    buildFrontendModulePrompt(moduleName, componentDiagram, classDiagram, requirements) {
        return `
  GENERA UN JSON con la implementación del módulo "${moduleName}" para un frontend Angular 18.
  
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
    buildBackendPrompt(classDiagram, allDiagrams, requirements) {
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
    buildFrontendPrompt(componentDiagram, classDiagram, requirements) {
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
    async generateDatabaseScripts(diagrams, requirements) {
        try {
            this.logger.log('Generando scripts SQL para PostgreSQL basados en el diagrama de clases...');
            const classDiagram = diagrams.find(d => d.type === 'classDiagram');
            if (!classDiagram) {
                throw new Error('Se requiere un diagrama de clases para generar scripts SQL');
            }
            const entities = this.extractEntitiesFromClassDiagram(classDiagram.code);
            const prompt = `
    GENERA SCRIPTS SQL COMPLETOS para PostgreSQL basados en estas entidades extraídas del diagrama de clases:
    ${JSON.stringify(entities, null, 2)}
    
    Y estos requisitos:
    ${JSON.stringify(requirements, null, 2)}
    
    GENERA LOS SIGUIENTES SCRIPTS SQL:
    
    1. Script de creación de base de datos
    2. Scripts de creación de tablas con:
       - Tipos de datos PostgreSQL apropiados (usa TEXT, INTEGER, BOOLEAN, TIMESTAMP, etc.)
       - Usa nombres de tablas en minúsculas y plural (users, profiles, etc.)
       - Claves primarias (usa id SERIAL PRIMARY KEY para IDs auto-incrementales)
       - Claves foráneas (implementa las relaciones del diagrama de clases)
       - Restricciones de integridad (NOT NULL, UNIQUE donde sea apropiado)
       - Índices necesarios para mejorar el rendimiento
    3. Scripts para timestamps automáticos (created_at, updated_at)
       - Crea un trigger para actualizar automáticamente updated_at
    4. Scripts para datos iniciales si son necesarios según los requisitos
    
    IMPORTANTE:
    - Asegúrate que los scripts sean compatibles con el código backend NestJS que usará TypeORM
    - Los nombres de las tablas deben coincidir con los nombres de entidades en el código (pero en snake_case)
    - Toda propiedad String en las entidades debe ser TEXT o VARCHAR en PostgreSQL
    - Implementa todas las relaciones del diagrama (one-to-many, many-to-many, etc.)
    - Usa ON DELETE CASCADE donde tenga sentido para mantener la integridad referencial
    - Genera scripts idempotentes (DROP IF EXISTS)
    - Incluye comentarios explicativos
    
    FORMATO:
    -- Archivo: 01_database.sql
    CREATE DATABASE app_database;
    
    -- Archivo: 02_tables.sql
    CREATE TABLE users (...);
    
    -- Archivo: 03_functions.sql
    CREATE OR REPLACE FUNCTION update_timestamp() ...
    
    -- Archivo: 04_seed_data.sql
    INSERT INTO users (...) VALUES (...);
    `;
            const response = await this.retryOperation(async () => {
                const result = await this.model.generateContent([{ text: prompt }]);
                return result.response.text();
            });
            return this.extractSqlScriptsByFile(response);
        }
        catch (error) {
            this.logger.error(`Error generando scripts SQL: ${error.message}`);
            return this.generateBasicSqlFromEntities(diagrams);
        }
    }
    extractEntitiesFromClassDiagram(classDiagramCode) {
        const entities = [];
        const lines = classDiagramCode.split('\n');
        let currentEntity = null;
        for (const line of lines) {
            const classMatch = line.match(/class\s+(\w+)/);
            if (classMatch) {
                if (currentEntity) {
                    entities.push(currentEntity);
                }
                currentEntity = {
                    name: classMatch[1],
                    attributes: [],
                    methods: [],
                    relations: []
                };
                continue;
            }
            if (currentEntity) {
                const attributeMatch = line.match(/\s*(\+|-)?\s*(\w+)\s*:\s*(\w+)/);
                if (attributeMatch) {
                    currentEntity.attributes.push({
                        name: attributeMatch[2],
                        type: attributeMatch[3],
                        isPrivate: attributeMatch[1] === '-'
                    });
                    continue;
                }
                const methodMatch = line.match(/\s*(\+|-)?\s*(\w+)\(\)/);
                if (methodMatch) {
                    currentEntity.methods.push({
                        name: methodMatch[2],
                        isPrivate: methodMatch[1] === '-'
                    });
                    continue;
                }
            }
            const relationMatch = line.match(/(\w+)\s+("[\w\*]+")\s*(--|-->|<--|<-->\s*)\s*("[\w\*]+")\s*(\w+)(?:\s*:\s*(.+))?/);
            if (relationMatch) {
                const relation = {
                    from: relationMatch[1],
                    fromCardinality: relationMatch[2].replace(/"/g, ''),
                    type: relationMatch[3].trim(),
                    toCardinality: relationMatch[4].replace(/"/g, ''),
                    to: relationMatch[5],
                    label: relationMatch[6] || ''
                };
                const fromEntity = entities.find(e => e.name === relation.from);
                if (fromEntity) {
                    fromEntity.relations.push(relation);
                }
                else if (currentEntity && currentEntity.name === relation.from) {
                    currentEntity.relations.push(relation);
                }
            }
        }
        if (currentEntity) {
            entities.push(currentEntity);
        }
        return entities;
    }
    async generateProjectZip(generatedCode, response) {
        try {
            this.logger.log('Generando archivo ZIP del proyecto completo...');
            const zip = new JSZip();
            const frontendFolder = zip.folder('frontend');
            const backendFolder = zip.folder('backend');
            const databaseFolder = zip.folder('database');
            if (!frontendFolder || !backendFolder || !databaseFolder) {
                throw new Error('Error al crear carpetas en el archivo ZIP');
            }
            if (generatedCode.backend) {
                if (generatedCode.backend.commonFiles) {
                    this.addFilesToZip(backendFolder, generatedCode.backend.commonFiles);
                }
                if (generatedCode.backend.modules) {
                    for (const module of generatedCode.backend.modules) {
                        if (module.files) {
                            this.addFilesToZip(backendFolder, module.files);
                        }
                    }
                }
                if (generatedCode.backend.cliCommands && generatedCode.backend.cliCommands.length > 0) {
                    backendFolder.file('README.md', `# Backend - Comandos CLI\n\n` +
                        generatedCode.backend.cliCommands.map(cmd => `\`\`\`\n${cmd}\n\`\`\``).join('\n\n'));
                }
            }
            if (generatedCode.frontend) {
                if (generatedCode.frontend.commonFiles) {
                    this.addFilesToZip(frontendFolder, generatedCode.frontend.commonFiles);
                }
                if (generatedCode.frontend.modules) {
                    for (const module of generatedCode.frontend.modules) {
                        if (module.files) {
                            this.addFilesToZip(frontendFolder, module.files);
                        }
                    }
                }
                if (generatedCode.frontend.cliCommands && generatedCode.frontend.cliCommands.length > 0) {
                    frontendFolder.file('README.md', `# Frontend - Comandos CLI\n\n` +
                        generatedCode.frontend.cliCommands.map(cmd => `\`\`\`\n${cmd}\n\`\`\``).join('\n\n'));
                }
            }
            if (generatedCode.database && generatedCode.database.scripts) {
                for (let i = 0; i < generatedCode.database.scripts.length; i++) {
                    const script = generatedCode.database.scripts[i];
                    const scriptName = this.extractScriptName(script, i);
                    databaseFolder.file(scriptName, script);
                }
            }
            zip.file('README.md', this.generateReadme(generatedCode));
            const zipContent = await zip.generateAsync({ type: 'nodebuffer' });
            response.setHeader('Content-Disposition', 'attachment; filename=proyecto-generado.zip');
            response.setHeader('Content-Type', 'application/zip');
            response.send(zipContent);
            this.logger.log('Archivo ZIP generado y enviado correctamente');
        }
        catch (error) {
            this.logger.error(`Error generando archivo ZIP: ${error.message}`);
            throw new Error(`Error generando archivo ZIP: ${error.message}`);
        }
    }
    addFilesToZip(folder, files) {
        if (!files || !Array.isArray(files))
            return;
        for (const file of files) {
            if (!file.path || !file.content)
                continue;
            const pathParts = file.path.split('/');
            const fileName = pathParts.pop() || '';
            let currentFolder = folder;
            for (const part of pathParts) {
                if (part) {
                    const newFolder = currentFolder.folder(part);
                    if (newFolder) {
                        currentFolder = newFolder;
                    }
                }
            }
            currentFolder.file(fileName, file.content);
        }
    }
    extractScriptName(script, index) {
        const fileNameMatch = script.match(/-- Archivo: (\w+\.sql)/);
        if (fileNameMatch && fileNameMatch[1]) {
            return fileNameMatch[1];
        }
        return `script_${index + 1}.sql`;
    }
    generateReadme(generatedCode) {
        var _a, _b, _c, _d;
        return `# Proyecto Generado

Este proyecto ha sido generado automáticamente a partir de diagramas UML y requisitos.

## Estructura del Proyecto

El proyecto se divide en tres partes principales:

### Frontend (Angular)

La carpeta \`frontend\` contiene un proyecto Angular completo con los siguientes módulos:

${((_b = (_a = generatedCode.frontend) === null || _a === void 0 ? void 0 : _a.modules) === null || _b === void 0 ? void 0 : _b.map(m => `- ${m.name}`).join('\n')) || 'No se han generado módulos de frontend'}

Para ejecutar el frontend:

1. Navega a la carpeta \`frontend\`
2. Instala las dependencias: \`npm install\`
3. Inicia el servidor de desarrollo: \`ng serve\`
4. Abre tu navegador en \`http://localhost:4200\`

### Backend (NestJS)

La carpeta \`backend\` contiene un proyecto NestJS completo con los siguientes módulos:

${((_d = (_c = generatedCode.backend) === null || _c === void 0 ? void 0 : _c.modules) === null || _d === void 0 ? void 0 : _d.map(m => `- ${m.name}`).join('\n')) || 'No se han generado módulos de backend'}

Para ejecutar el backend:

1. Navega a la carpeta \`backend\`
2. Instala las dependencias: \`npm install\`
3. Inicia el servidor de desarrollo: \`npm run start:dev\`
4. El API estará disponible en \`http://localhost:3000\`

### Base de Datos (PostgreSQL)

La carpeta \`database\` contiene scripts SQL para crear y configurar la base de datos PostgreSQL.

Para configurar la base de datos:

1. Instala PostgreSQL si aún no lo tienes
2. Crea una nueva base de datos
3. Ejecuta los scripts SQL en el siguiente orden:
   - Primero: script de creación de base de datos
   - Segundo: script de creación de tablas
   - Tercero: script de relaciones
   - Cuarto: script de funciones y triggers
   - Quinto: script de datos iniciales (si existe)

## Configuración

Asegúrate de configurar las variables de entorno en los archivos \`.env\` en ambos proyectos.

## Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.
`;
    }
    extractSqlScriptsByFile(response) {
        const scripts = [];
        let cleanedResponse = response.replace(/```sql\s*/g, '')
            .replace(/```\s*/g, '');
        const fileRegex = /-- Archivo: (\w+\.sql)/g;
        let match;
        let lastIndex = 0;
        const positions = [];
        while ((match = fileRegex.exec(cleanedResponse)) !== null) {
            positions.push(match.index);
        }
        if (positions.length === 0) {
            scripts.push(cleanedResponse);
            return scripts;
        }
        for (let i = 0; i < positions.length; i++) {
            const start = positions[i];
            const end = i < positions.length - 1 ? positions[i + 1] : cleanedResponse.length;
            const scriptContent = cleanedResponse.substring(start, end).trim();
            if (scriptContent) {
                scripts.push(scriptContent);
            }
        }
        return scripts;
    }
    generateBasicSqlFromEntities(diagrams) {
        try {
            const classDiagram = diagrams.find(d => d.type === 'classDiagram');
            if (!classDiagram) {
                return this.getDefaultSqlScripts();
            }
            const entities = this.extractEntitiesFromClassDiagram(classDiagram.code);
            if (!entities || entities.length === 0) {
                return this.getDefaultSqlScripts();
            }
            let tableScripts = '';
            let relationScripts = '';
            entities.forEach(entity => {
                const tableName = this.pluralize(this.toSnakeCase(entity.name));
                tableScripts += `-- Tabla para la entidad ${entity.name}\n`;
                tableScripts += `CREATE TABLE IF NOT EXISTS ${tableName} (\n`;
                tableScripts += `  id SERIAL PRIMARY KEY,\n`;
                entity.attributes.forEach((attr) => {
                    const columnName = this.toSnakeCase(attr.name);
                    const columnType = this.mapTypeToPostgres(attr.type);
                    tableScripts += `  ${columnName} ${columnType},\n`;
                });
                tableScripts += `  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n`;
                tableScripts += `  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n`;
                tableScripts += `);\n\n`;
                tableScripts += `-- Índices para la tabla ${tableName}\n`;
                entity.attributes.forEach((attr) => {
                    if (attr.name.endsWith('Id') || attr.name === 'email' || attr.name === 'username') {
                        const columnName = this.toSnakeCase(attr.name);
                        tableScripts += `CREATE INDEX IF NOT EXISTS idx_${tableName}_${columnName} ON ${tableName}(${columnName});\n`;
                    }
                });
                tableScripts += '\n';
                entity.relations.forEach((relation) => {
                    if (relation.type.includes('-->')) {
                        const sourceTable = this.pluralize(this.toSnakeCase(entity.name));
                        const targetTable = this.pluralize(this.toSnakeCase(relation.to));
                        const foreignKeyColumn = this.toSnakeCase(this.singularize(relation.to)) + '_id';
                        if (relation.toCardinality === '1') {
                            relationScripts += `-- Relación: ${entity.name} -> ${relation.to}\n`;
                            relationScripts += `ALTER TABLE ${sourceTable} ADD COLUMN IF NOT EXISTS ${foreignKeyColumn} INTEGER REFERENCES ${targetTable}(id)`;
                            if (relation.fromCardinality === '1') {
                                relationScripts += ' UNIQUE';
                            }
                            relationScripts += ' ON DELETE CASCADE;\n\n';
                        }
                        else if (relation.toCardinality === '*' && relation.fromCardinality === '*') {
                            const junctionTable = `${this.toSnakeCase(entity.name)}_${this.toSnakeCase(relation.to)}`;
                            relationScripts += `-- Relación muchos a muchos: ${entity.name} <-> ${relation.to}\n`;
                            relationScripts += `CREATE TABLE IF NOT EXISTS ${junctionTable} (\n`;
                            relationScripts += `  ${this.toSnakeCase(this.singularize(entity.name))}_id INTEGER REFERENCES ${sourceTable}(id) ON DELETE CASCADE,\n`;
                            relationScripts += `  ${this.toSnakeCase(this.singularize(relation.to))}_id INTEGER REFERENCES ${targetTable}(id) ON DELETE CASCADE,\n`;
                            relationScripts += `  PRIMARY KEY (${this.toSnakeCase(this.singularize(entity.name))}_id, ${this.toSnakeCase(this.singularize(relation.to))}_id)\n`;
                            relationScripts += `);\n\n`;
                        }
                    }
                });
            });
            const timestampFunction = `-- Función para actualizar automáticamente updated_at
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
`;
            let triggerScripts = '';
            entities.forEach(entity => {
                const tableName = this.pluralize(this.toSnakeCase(entity.name));
                triggerScripts += `-- Trigger para actualizar updated_at en ${tableName}\n`;
                triggerScripts += `DROP TRIGGER IF EXISTS update_${tableName}_timestamp ON ${tableName};\n`;
                triggerScripts += `CREATE TRIGGER update_${tableName}_timestamp\n`;
                triggerScripts += `BEFORE UPDATE ON ${tableName}\n`;
                triggerScripts += `FOR EACH ROW\n`;
                triggerScripts += `EXECUTE FUNCTION update_timestamp();\n\n`;
            });
            return [
                `-- Archivo: 01_database.sql
-- Creación de la base de datos
CREATE DATABASE app_database;
\\c app_database;`,
                `-- Archivo: 02_tables.sql
-- Creación de tablas
${tableScripts}`,
                `-- Archivo: 03_relationships.sql
-- Relaciones entre tablas
${relationScripts}`,
                `-- Archivo: 04_functions_and_triggers.sql
-- Funciones y triggers
${timestampFunction}
${triggerScripts}`
            ];
        }
        catch (error) {
            this.logger.error(`Error generando scripts SQL básicos: ${error.message}`);
            return this.getDefaultSqlScripts();
        }
    }
    mapTypeToPostgres(type) {
        const mapping = {
            'String': 'TEXT',
            'Number': 'INTEGER',
            'Boolean': 'BOOLEAN',
            'Date': 'TIMESTAMP',
            'Object': 'JSONB',
            'Array': 'JSONB',
            'ID': 'INTEGER',
            'Int': 'INTEGER',
            'Float': 'NUMERIC',
            'Double': 'NUMERIC(15,2)',
            'Long': 'BIGINT',
            'Decimal': 'NUMERIC(15,2)',
            'BigDecimal': 'NUMERIC(20,6)',
            'Char': 'CHAR(1)',
            'BigInteger': 'BIGINT'
        };
        return mapping[type] || 'TEXT';
    }
    toSnakeCase(str) {
        return str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
    }
    getDefaultSqlScripts() {
        return [
            `-- Archivo: 01_database.sql
-- Database creation script
CREATE DATABASE app_database;
\\c app_database;`,
            `-- Archivo: 02_tables.sql
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`,
            `-- Archivo: 03_functions_and_triggers.sql
-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
CREATE TRIGGER update_users_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Trigger for profiles table
CREATE TRIGGER update_profiles_timestamp
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();`
        ];
    }
    extractJsonFromResponse(response) {
        try {
            let jsonStr = response.replace(/```json\s*/g, '')
                .replace(/```\s*/g, '')
                .trim();
            const start = jsonStr.indexOf('{');
            const end = jsonStr.lastIndexOf('}');
            if (start === -1 || end === -1) {
                throw new Error('No se encontró un JSON válido en la respuesta');
            }
            jsonStr = jsonStr.substring(start, end + 1);
            try {
                return JSON.parse(jsonStr);
            }
            catch (parseError) {
                this.logger.warn(`Error al parsear JSON: ${parseError.message}. Intentando reparar...`);
                jsonStr = jsonStr
                    .replace(/'/g, '"')
                    .replace(/,(\s*[\]}])/g, '$1')
                    .replace(/([}\]])\s*([{\[])/g, '$1,$2')
                    .replace(/([}\]])\s*"([^"]+)"/g, '$1,"$2"')
                    .replace(/"([^"]+)"\s*([{\[])/g, '"$1":$2')
                    .replace(/\\n/g, '\\n')
                    .replace(/\\"/g, '\\"');
                try {
                    return JSON.parse(jsonStr);
                }
                catch (error) {
                    this.logger.warn(`Reparación básica fallida: ${error.message}. Intentando extracción de emergencia...`);
                    this.logger.warn('Utilizando método de extracción de emergencia para el código generado');
                    return this.extractCodeEmergency(jsonStr);
                }
            }
        }
        catch (error) {
            this.logger.error('Error extrayendo JSON de la respuesta:', error);
            try {
                return this.extractCodeEmergency(response);
            }
            catch (emergencyError) {
                this.logger.error('Extracción de emergencia fallida:', emergencyError);
                return {
                    modules: [],
                    commonFiles: [],
                    cliCommands: []
                };
            }
        }
    }
    extractCodeEmergency(jsonStr) {
        this.logger.warn('Realizando extracción de emergencia del código generado...');
        try {
            const result = {
                modules: [],
                commonFiles: [],
                cliCommands: []
            };
            const moduleRegex = /"name"\s*:\s*"([^"]+)"[\s\S]*?"files"\s*:\s*\[([\s\S]*?)\]\s*,\s*"cliCommands"/g;
            let moduleMatch;
            while ((moduleMatch = moduleRegex.exec(jsonStr)) !== null) {
                const moduleName = moduleMatch[1];
                const filesContent = moduleMatch[2];
                const files = [];
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
                result.modules.push({
                    name: moduleName,
                    files,
                    cliCommands: []
                });
            }
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
            const cliCommandsRegex = /"cliCommands"\s*:\s*\[([\s\S]*?)\]\s*}/;
            const cliCommandsMatch = cliCommandsRegex.exec(jsonStr);
            if (cliCommandsMatch) {
                const cliCommandsContent = cliCommandsMatch[1];
                const commands = cliCommandsContent.match(/"([^"]+)"/g) || [];
                result.cliCommands = commands.map(cmd => cmd.replace(/"/g, ''));
            }
            this.logger.log(`Extracción de emergencia completada: ${result.modules.length} módulos, ${result.commonFiles.length} archivos comunes, ${result.cliCommands.length} comandos CLI`);
            return result;
        }
        catch (error) {
            this.logger.error('Error en extracción de emergencia:', error);
            return {
                modules: [],
                commonFiles: [],
                cliCommands: []
            };
        }
    }
    extractFrontendModuleNamesFromRequirements(requirements) {
        var _a;
        const moduleNames = new Set(['AppModule', 'CoreModule', 'SharedModule', 'AuthModule']);
        const entities = new Set();
        const concepts = new Set();
        for (const req of requirements) {
            const description = req.description;
            const words = description.split(/\s+/);
            for (let i = 0; i < words.length; i++) {
                const word = words[i].trim().replace(/[.,;:!?()]/g, '');
                if (word.length <= 2)
                    continue;
                if (i > 0 && /^[A-Z][a-z]+$/.test(word)) {
                    entities.add(word);
                }
                const managementVerbs = ['gestionar', 'administrar', 'manejar', 'controlar', 'mantener', 'manage', 'control', 'handle'];
                if (managementVerbs.includes((_a = words[i - 1]) === null || _a === void 0 ? void 0 : _a.toLowerCase()) && word.length > 3) {
                    concepts.add(word);
                }
            }
        }
        for (const entity of entities) {
            if (entity.endsWith('s')) {
                moduleNames.add(`${entity}Module`);
            }
            else {
                moduleNames.add(`${entity}sModule`);
            }
        }
        for (const concept of concepts) {
            if (concept.endsWith('s')) {
                moduleNames.add(`${concept}Module`);
            }
            else {
                moduleNames.add(`${concept}sModule`);
            }
        }
        const modulePatterns = [
            { pattern: /(autenticación|login|iniciar sesión|acceso|authentication|sign in)/i, module: 'AuthModule' },
            { pattern: /(usuarios|users|perfiles|accounts|cuentas)/i, module: 'UsersModule' },
            { pattern: /(permisos|roles|autorización|authorization|accesos)/i, module: 'RolesModule' },
            { pattern: /(dashboard|panel|metrics|métricas|statistics|estadísticas)/i, module: 'DashboardModule' },
            { pattern: /(reportes|reports|informes)/i, module: 'ReportsModule' },
            { pattern: /(notificaciones|notifications|alerts|alertas)/i, module: 'NotificationsModule' },
            { pattern: /(mensajes|messages|chat|comunicación|communication)/i, module: 'MessagesModule' },
            { pattern: /(comments|comentarios|feedback)/i, module: 'CommentsModule' },
            { pattern: /(files|archivos|documentos|documents)/i, module: 'FilesModule' },
            { pattern: /(media|multimedia|images|imágenes|videos)/i, module: 'MediaModule' },
            { pattern: /(settings|configuración|preferences|preferencias)/i, module: 'SettingsModule' },
            { pattern: /(profiles|perfil|profiles)/i, module: 'ProfilesModule' },
            { pattern: /(products|productos|items|artículos)/i, module: 'ProductsModule' },
            { pattern: /(categorías|categories|tags|etiquetas)/i, module: 'CategoriesModule' },
            { pattern: /(orders|pedidos|órdenes)/i, module: 'OrdersModule' },
            { pattern: /(proyectos|projects)/i, module: 'ProjectsModule' },
            { pattern: /(tareas|tasks|actividades|activities)/i, module: 'TasksModule' },
            { pattern: /(clientes|customers|clients)/i, module: 'CustomersModule' }
        ];
        for (const req of requirements) {
            for (const { pattern, module } of modulePatterns) {
                if (pattern.test(req.description)) {
                    moduleNames.add(module);
                }
            }
        }
        return Array.from(moduleNames);
    }
    generateDefaultComponentDiagram() {
        return {
            type: 'componentDiagram',
            title: 'Diagrama de Componentes',
            code: `graph TD
    subgraph Frontend
        UI[Interfaz Usuario]
        Auth[Autenticación]
        Data[Gestión Datos]
    end
    
    subgraph Backend
        API[API REST]
        Srv[Servicios]
        DB[(Base Datos)]
    end
    
    UI --> Auth
    UI --> Data
    Auth --> API
    Data --> API
    API --> Srv
    Srv --> DB`
        };
    }
    generateDefaultClassDiagram() {
        return {
            type: 'classDiagram',
            title: 'Diagrama de Clases',
            code: `classDiagram
    class Entity {
        +id: Number
        +createdAt: Date
        +updatedAt: Date
        +create()
        +update()
        +delete()
    }
    
    class User {
        +username: String
        +email: String
        +password: String
        +login()
        +logout()
    }
    
    class Profile {
        +userId: Number
        +displayName: String
        +updateProfile()
    }
    
    User "1" --> "1" Profile : has
    Entity <|-- User : extends
    Entity <|-- Profile : extends`
        };
    }
    buildSimpleFrontendModulePrompt(moduleName, requirements) {
        const baseModuleName = moduleName.replace('Module', '');
        const relatedRequirements = requirements.filter(req => {
            const baseNames = [
                baseModuleName.toLowerCase(),
                this.singularize(baseModuleName).toLowerCase(),
                this.pluralize(baseModuleName).toLowerCase()
            ];
            return baseNames.some(name => req.description.toLowerCase().includes(name));
        });
        const isAppModule = moduleName === 'AppModule';
        const isAuthModule = moduleName === 'AuthModule';
        const isCoreModule = moduleName === 'CoreModule';
        const isSharedModule = moduleName === 'SharedModule';
        let specificStructure = '';
        if (isAppModule) {
            specificStructure = `
    Archivos a incluir:
    - app.module.ts (con imports para BrowserModule, HttpClientModule, AppRoutingModule)
    - app-routing.module.ts (con rutas principales)
    - app.component.ts/html/scss (componente principal)`;
        }
        else if (isAuthModule) {
            specificStructure = `
    Archivos a incluir:
    - auth.module.ts
    - auth-routing.module.ts
    - login/login.component.ts/html/scss
    - register/register.component.ts/html/scss
    - auth.service.ts (servicio con métodos login, register, logout)`;
        }
        else if (isCoreModule) {
            specificStructure = `
    Archivos a incluir:
    - core.module.ts
    - guards/auth.guard.ts
    - interceptors/auth.interceptor.ts
    - services/api.service.ts
    - models/ (modelos necesarios)`;
        }
        else if (isSharedModule) {
            specificStructure = `
    Archivos a incluir:
    - shared.module.ts
    - material.module.ts (con imports de Angular Material)
    - components/header/header.component.ts/html/scss
    - components/footer/footer.component.ts/html/scss
    - components/loading/loading.component.ts/html/scss`;
        }
        else {
            const featureName = this.singularize(baseModuleName.toLowerCase());
            specificStructure = `
    Archivos a incluir:
    - ${this.kebabCase(baseModuleName)}.module.ts
    - ${this.kebabCase(baseModuleName)}-routing.module.ts
    - components/ (componentes necesarios)
    - pages/
      - ${featureName}-list/${featureName}-list.component.ts/html/scss
      - ${featureName}-detail/${featureName}-detail.component.ts/html/scss
      - ${featureName}-form/${featureName}-form.component.ts/html/scss
    - services/${this.kebabCase(baseModuleName)}.service.ts
    - models/${this.kebabCase(featureName)}.model.ts`;
        }
        return `
  GENERA UN JSON con la implementación básica del módulo "${moduleName}" para un frontend Angular.
  
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
  
  Requerimientos relacionados:
  ${relatedRequirements.length > 0
            ? JSON.stringify(relatedRequirements, null, 2)
            : "No hay requerimientos específicos para este módulo"}
  
  IMPORTANTE:
  - Genera código básico para el módulo Angular "${moduleName}"
  - ${specificStructure}
  - Usa código TypeScript correcto y completo
  - Incluye imports necesarios
  - Sigue las convenciones de nombres de Angular
  - Implementa componentes básicos pero funcionales
  - Incluye formularios reactivos donde sea apropiado
  - Conecta con la API backend en los servicios

  ⚠️ VERIFICA QUE TU JSON SEA 100% VÁLIDO Y TENGA ESCAPE CORRECTO ANTES DE RESPONDER ⚠️
  
  SOLO DEVUELVE EL JSON, sin explicaciones ni comentarios adicionales.
  `;
    }
    async generateNewModule(resource, endpoints) {
        try {
            this.logger.log(`Generando nuevo módulo para ${resource} con ${endpoints.length} endpoints`);
            const hasGetAll = endpoints.some(e => e.startsWith('get:') && !e.includes(':id'));
            const hasGetOne = endpoints.some(e => e.startsWith('get:') && e.includes(':id'));
            const hasCreate = endpoints.some(e => e.startsWith('post:'));
            const hasUpdate = endpoints.some(e => e.startsWith('put:') || e.startsWith('patch:'));
            const hasDelete = endpoints.some(e => e.startsWith('delete:'));
            const prompt = `
    Genera un módulo NestJS completo para el recurso "${resource}" que implemente estos endpoints específicos:
    ${endpoints.map(e => `- ${e}`).join('\n')}
    
    Incluye todos estos archivos:
    1. ${resource}.module.ts
    2. ${resource}.controller.ts
    3. ${resource}.service.ts
    4. entities/${this.singularize(resource)}.entity.ts
    5. dto/create-${this.singularize(resource)}.dto.ts
    ${hasUpdate ? `6. dto/update-${this.singularize(resource)}.dto.ts` : ''}
    
    Implementa estas operaciones CRUD según los endpoints:
    ${hasGetAll ? '- Buscar todos los registros' : ''}
    ${hasGetOne ? '- Buscar un registro por ID' : ''}
    ${hasCreate ? '- Crear un nuevo registro' : ''}
    ${hasUpdate ? '- Actualizar un registro existente' : ''}
    ${hasDelete ? '- Eliminar un registro' : ''}
    
    Devuelve el resultado en JSON con este formato exacto:
    {
      "name": "${this.capitalizeFirstLetter(resource)}Module",
      "files": [
        {
          "path": "src/${resource}/${resource}.module.ts",
          "content": "...",
          "type": "module"
        },
        {
          "path": "src/${resource}/${resource}.controller.ts",
          "content": "...",
          "type": "controller"
        },
        ...etc para todos los archivos
      ],
      "cliCommands": []
    }
    
    IMPORTANTE:
    - Implementa TypeORM para la entidad
    - Usa class-validator para los DTOs
    - Asegúrate que los métodos del controlador coincidan con los endpoints solicitados
    - Asegúrate que los nombres de los archivos sigan las convenciones de NestJS
    - El código debe ser TypeScript válido y seguir las mejores prácticas de NestJS
    `;
            const result = await this.retryOperation(async () => {
                const response = await this.model.generateContent([{ text: prompt }]);
                return response.response.text();
            });
            const moduleData = this.extractJsonFromResponse(result);
            if (!moduleData || !moduleData.name || !moduleData.files || !Array.isArray(moduleData.files)) {
                throw new Error('No se pudo extraer la información del módulo generado');
            }
            for (const file of moduleData.files) {
                if (!file.path || !file.content) {
                    this.logger.warn(`Archivo incompleto en el módulo ${resource}`);
                }
            }
            this.logger.log(`Módulo para ${resource} generado con ${moduleData.files.length} archivos`);
            return moduleData;
        }
        catch (error) {
            this.logger.error(`Error generando nuevo módulo para ${resource}: ${error.message}`);
            return this.generateBasicModule(resource, endpoints);
        }
    }
    capitalizeFirstLetter(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    singularize(str) {
        if (str.endsWith('ies')) {
            return str.slice(0, -3) + 'y';
        }
        else if (str.endsWith('s') && !str.endsWith('ss')) {
            return str.slice(0, -1);
        }
        return str;
    }
    pluralize(str) {
        if (str.endsWith('y') && !['a', 'e', 'i', 'o', 'u'].includes(str.charAt(str.length - 2))) {
            return str.slice(0, -1) + 'ies';
        }
        else if (!str.endsWith('s')) {
            return str + 's';
        }
        return str;
    }
    kebabCase(str) {
        return str.replace(/([a-z])([A-Z])/g, '$1-$2')
            .replace(/\s+/g, '-')
            .toLowerCase();
    }
    generateBasicModule(resource, endpoints) {
        const singularResource = this.singularize(resource);
        const capitalizedResource = this.capitalizeFirstLetter(singularResource);
        const moduleName = `${this.capitalizeFirstLetter(resource)}Module`;
        const hasFindAll = endpoints.some(e => e.startsWith('get:') && !e.includes(':id'));
        const hasFindOne = endpoints.some(e => e.startsWith('get:') && e.includes(':id'));
        const hasCreate = endpoints.some(e => e.startsWith('post:'));
        const hasUpdate = endpoints.some(e => e.startsWith('put:') || e.startsWith('patch:'));
        const hasRemove = endpoints.some(e => e.startsWith('delete:'));
        const moduleContent = `import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ${capitalizedResource}Controller } from './${resource}.controller';
import { ${capitalizedResource}Service } from './${resource}.service';
import { ${capitalizedResource} } from './entities/${singularResource}.entity';

@Module({
  imports: [TypeOrmModule.forFeature([${capitalizedResource}])],
  controllers: [${capitalizedResource}Controller],
  providers: [${capitalizedResource}Service],
  exports: [${capitalizedResource}Service]
})
export class ${moduleName} {}`;
        const entityContent = `import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class ${capitalizedResource} {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}`;
        const createDtoContent = `import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class Create${capitalizedResource}Dto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}`;
        const updateDtoContent = `import { PartialType } from '@nestjs/mapped-types';
import { Create${capitalizedResource}Dto } from './create-${singularResource}.dto';

export class Update${capitalizedResource}Dto extends PartialType(Create${capitalizedResource}Dto) {}`;
        const serviceMethods = [];
        if (hasCreate) {
            serviceMethods.push(`async create(create${capitalizedResource}Dto: Create${capitalizedResource}Dto): Promise<${capitalizedResource}> {
      const ${singularResource} = this.${singularResource}Repository.create(create${capitalizedResource}Dto);
      return this.${singularResource}Repository.save(${singularResource});
    }`);
        }
        if (hasFindAll) {
            serviceMethods.push(`async findAll(): Promise<${capitalizedResource}[]> {
    return this.${singularResource}Repository.find();
  }`);
        }
        if (hasFindOne) {
            serviceMethods.push(`async findOne(id: number): Promise<${capitalizedResource}> {
    const ${singularResource} = await this.${singularResource}Repository.findOneBy({ id });
    if (!${singularResource}) {
      throw new NotFoundException(\`${capitalizedResource} #\${id} not found\`);
    }
    return ${singularResource};
  }`);
        }
        if (hasUpdate) {
            serviceMethods.push(`async update(id: number, update${capitalizedResource}Dto: Update${capitalizedResource}Dto): Promise<${capitalizedResource}> {
    const ${singularResource} = await this.findOne(id);
    const updated = Object.assign(${singularResource}, update${capitalizedResource}Dto);
    return this.${singularResource}Repository.save(updated);
  }`);
        }
        if (hasRemove) {
            serviceMethods.push(`async remove(id: number): Promise<void> {
    const ${singularResource} = await this.findOne(id);
    await this.${singularResource}Repository.remove(${singularResource});
  }`);
        }
        const serviceContent = `import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ${capitalizedResource} } from './entities/${singularResource}.entity';
import { Create${capitalizedResource}Dto } from './dto/create-${singularResource}.dto';
${hasUpdate ? `import { Update${capitalizedResource}Dto } from './dto/update-${singularResource}.dto';` : ''}

@Injectable()
export class ${capitalizedResource}Service {
  constructor(
    @InjectRepository(${capitalizedResource})
    private ${singularResource}Repository: Repository<${capitalizedResource}>,
  ) {}

  ${serviceMethods.join('\n\n  ')}
}`;
        const controllerMethods = [];
        if (hasCreate) {
            controllerMethods.push(`@Post()
  create(@Body() create${capitalizedResource}Dto: Create${capitalizedResource}Dto) {
    return this.${singularResource}Service.create(create${capitalizedResource}Dto);
  }`);
        }
        if (hasFindAll) {
            controllerMethods.push(`@Get()
  findAll() {
    return this.${singularResource}Service.findAll();
  }`);
        }
        if (hasFindOne) {
            controllerMethods.push(`@Get(':id')
  findOne(@Param('id') id: string) {
    return this.${singularResource}Service.findOne(+id);
  }`);
        }
        if (hasUpdate) {
            controllerMethods.push(`@Patch(':id')
  update(@Param('id') id: string, @Body() update${capitalizedResource}Dto: Update${capitalizedResource}Dto) {
    return this.${singularResource}Service.update(+id, update${capitalizedResource}Dto);
  }`);
        }
        if (hasRemove) {
            controllerMethods.push(`@Delete(':id')
  remove(@Param('id') id: string) {
    return this.${singularResource}Service.remove(+id);
  }`);
        }
        const controllerContent = `import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ${capitalizedResource}Service } from './${resource}.service';
import { Create${capitalizedResource}Dto } from './dto/create-${singularResource}.dto';
${hasUpdate ? `import { Update${capitalizedResource}Dto } from './dto/update-${singularResource}.dto';` : ''}

@Controller('${resource}')
export class ${capitalizedResource}Controller {
  constructor(private readonly ${singularResource}Service: ${capitalizedResource}Service) {}

  ${controllerMethods.join('\n\n  ')}
}`;
        const files = [
            {
                path: `src/${resource}/${resource}.module.ts`,
                content: moduleContent,
                type: 'module'
            },
            {
                path: `src/${resource}/${resource}.controller.ts`,
                content: controllerContent,
                type: 'controller'
            },
            {
                path: `src/${resource}/${resource}.service.ts`,
                content: serviceContent,
                type: 'service'
            },
            {
                path: `src/${resource}/entities/${singularResource}.entity.ts`,
                content: entityContent,
                type: 'entity'
            },
            {
                path: `src/${resource}/dto/create-${singularResource}.dto.ts`,
                content: createDtoContent,
                type: 'dto'
            }
        ];
        if (hasUpdate) {
            files.push({
                path: `src/${resource}/dto/update-${singularResource}.dto.ts`,
                content: updateDtoContent,
                type: 'dto'
            });
        }
        return {
            name: moduleName,
            files,
            cliCommands: []
        };
    }
    validateSharedModule(frontend) {
        const sharedModule = frontend.modules.find(m => m.name === 'SharedModule');
        if (!sharedModule)
            return;
        const hasMaterialModule = sharedModule.files.some(f => f.path.includes('material.module.ts'));
        if (!hasMaterialModule) {
            this.logger.warn('No se encontró material.module.ts en SharedModule');
            const materialModulePath = this.getModuleBasePath(sharedModule) + '/material.module.ts';
            sharedModule.files.push({
                path: materialModulePath,
                content: this.generateMaterialModuleContent(),
                type: 'typescript'
            });
            this.logger.log('Generado material.module.ts en SharedModule');
        }
        const essentialComponents = [
            'loading',
            'error'
        ];
        for (const component of essentialComponents) {
            const hasComponent = sharedModule.files.some(f => f.path.includes(`/shared/components/${component}/`) ||
                f.path.includes(`/shared/${component}/`));
            if (!hasComponent) {
                this.logger.warn(`No se encontró el componente ${component} en SharedModule`);
            }
        }
    }
    generateMaterialModuleContent() {
        return `import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  exports: [
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSidenavModule,
    MatSnackBarModule,
    MatTableModule,
    MatToolbarModule,
    MatTooltipModule
  ]
})
export class MaterialModule {}
`;
    }
    getModuleBasePath(module) {
        try {
            const moduleFile = module.files.find((f) => f.path.includes('.module.ts'));
            if (moduleFile) {
                const path = moduleFile.path;
                return path.substring(0, path.lastIndexOf('/'));
            }
            if (module.files.length > 0) {
                const path = module.files[0].path;
                return path.substring(0, path.lastIndexOf('/'));
            }
            return `src/app/${this.kebabCase(module.name.replace('Module', ''))}`;
        }
        catch (error) {
            this.logger.error(`Error obteniendo ruta base del módulo: ${error.message}`);
            return `src/app/${this.kebabCase(module.name.replace('Module', ''))}`;
        }
    }
};
exports.GeminiService = GeminiService;
exports.GeminiService = GeminiService = GeminiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], GeminiService);
//# sourceMappingURL=gemini.service.js.map