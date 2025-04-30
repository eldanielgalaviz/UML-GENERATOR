// // src/gemini/gemini.service.ts  sk-6c78c5aec9ab4a37a9ce74719c6e6be4

// import { Injectable, Logger } from '@nestjs/common';
// import { GoogleGenerativeAI } from '@google/generative-ai';
// import { ConfigService } from '@nestjs/config';
// import { 
//   MermaidDiagram, 
//   DiagramType, 
//   IEEE830Requirement, 
//   AnalysisResponse,
//   GeneratedCode,
//   NestJSBackend,
//   AngularFrontend,
//   NestJSModule,
//   AngularModule,
//   NestJSFile,
//   AngularFile,
//   NestJSFileType,
//   AngularFileType,
//   EntityDefinition ,
//   FlowDefinition 
// } from './interfaces/code-generation.interface';

// @Injectable()
// export class GeminiService {
//   private readonly genAI: GoogleGenerativeAI;
//   private readonly model: any;
//   private readonly logger = new Logger(GeminiService.name);
//   private readonly MAX_RETRIES = 3;
//   private readonly RETRY_DELAY = 1000

//   constructor(private configService: ConfigService) {
//     const apiKey = this.configService.get<string>('GEMINI_API_KEY')!;
//     if (!apiKey) {
//       throw new Error('GEMINI_API_KEY no está configurada');
//     }
//     this.genAI = new GoogleGenerativeAI(apiKey);
//     this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
//   }

//   private delay(ms: number) {
//     return new Promise(resolve => setTimeout(resolve, ms));
//   }

//   private async retryOperation<T>(
//     operation: () => Promise<T>,
//     retryCount = 0
//   ): Promise<T> {
//     try {
//       return await operation();
//     } catch (error) {
//       if (retryCount >= this.MAX_RETRIES) {
//         throw error;
//       }
//       await this.delay(this.RETRY_DELAY * (retryCount + 1));
//       return this.retryOperation(operation, retryCount + 1);
//     }
//   }

//   async analyzeRequirements(requirements: string): Promise<AnalysisResponse> {
//     try {
//       this.logger.log('Iniciando análisis de requerimientos...');
      
//       // Primero obtenemos los requerimientos IEEE830
//       const ieee830Requirements = await this.analyzeIEEE830(requirements);
      
//       // Luego generamos los diagramas
//       const diagrams = await this.generateAllDiagrams(requirements, ieee830Requirements);
      
//       return {
//         requirements: ieee830Requirements,
//         diagrams
//       };
//     } catch (error) {
//       this.logger.error(`Error en el análisis: ${error.message}`);
//       throw new Error(`Error en el análisis: ${error.message}`);
//     }
//   }

//     // Step 2: Separate endpoint for code generation
//     async generateCode(diagrams: MermaidDiagram[], requirements: IEEE830Requirement[]): Promise<GeneratedCode> {
//       try {
//         this.logger.log('Iniciando generación de código...<3');
        
//         // Generar código de backend y frontend en paralelo para mejorar el rendimiento
//         const [backendCode, frontendCode] = await Promise.all([
//           this.generateBackendCode(diagrams, requirements),
//           this.generateFrontendCode(diagrams, requirements)
//         ]);
  
//         return {
//           backend: backendCode,
//           frontend: frontendCode
//         };
//       } catch (error) {
//         this.logger.error(`Error generando código: ${error.message}`);
//         throw new Error(`Error generando código: ${error.message}`);
//       }
//     }


   
//     private async generateBackendCode(diagrams: MermaidDiagram[], requirements: IEEE830Requirement[]) {
//       try {
//         const classDiagram = diagrams.find(d => d.type === 'classDiagram');
//         const sequenceDiagram = diagrams.find(d => d.type === 'sequenceDiagram');
        
//         const entities = this.extractEntitiesFromDiagram(classDiagram?.code || '');
//         const flows = this.extractFlowsFromDiagram(sequenceDiagram?.code || '');
        
//         const prompt = `
//         GENERA EXACTAMENTE ESTE JSON con la implementación completa del backend NestJS.
//         IMPORTANTE: NO incluyas explicaciones ni comentarios, SOLO el JSON.
    
//         {
//           "modules": [
//             {
//               "name": "string",
//               "files": [
//                 {
//                   "path": "string",
//                   "content": "string",
//                   "type": "string"
//                 }
//               ],
//               "cliCommands": ["string"]
//             }
//           ],
//           "commonFiles": [],
//           "cliCommands": []
//         }
    
//         ESTRUCTURA DE ARCHIVOS REQUERIDA:
    
//         1. Configuración Base:
//            - src/main.ts (Configuración de la app)
//            - src/app.module.ts (Módulo principal)
//            - src/config/database.config.ts (Configuración TypeORM)
//            - src/config/swagger.config.ts (Configuración Swagger)
//            - src/common/decorators/roles.decorator.ts
//            - src/common/guards/roles.guard.ts
//            - src/common/filters/http-exception.filter.ts
//            - src/common/interceptors/transform.interceptor.ts
//            - src/common/interfaces/pagination.interface.ts
    
//         2. Auth Module (src/auth/):
//            - auth.module.ts
//            - auth.controller.ts (login, register)
//            - auth.service.ts
//            - strategies/jwt.strategy.ts
//            - strategies/local.strategy.ts
//            - guards/jwt-auth.guard.ts
//            - guards/local-auth.guard.ts
//            - dto/login.dto.ts
//            - dto/register.dto.ts
//            - interfaces/jwt-payload.interface.ts
    
//         3. Users Module (src/users/):
//            - users.module.ts
//            - users.controller.ts (CRUD)
//            - users.service.ts
//            - entities/user.entity.ts
//            - dto/create-user.dto.ts
//            - dto/update-user.dto.ts
//            - interfaces/user.interface.ts
    
//         4. Projects Module (src/projects/):
//            - projects.module.ts
//            - projects.controller.ts (CRUD)
//            - projects.service.ts
//            - entities/project.entity.ts
//            - dto/create-project.dto.ts
//            - dto/update-project.dto.ts
//            - interfaces/project.interface.ts
    
//         5. Tasks Module (src/tasks/):
//            - tasks.module.ts
//            - tasks.controller.ts (CRUD)
//            - tasks.service.ts
//            - entities/task.entity.ts
//            - dto/create-task.dto.ts
//            - dto/update-task.dto.ts
//            - interfaces/task.interface.ts
    
//         CADA ARCHIVO DEBE INCLUIR:
    
//         1. Entidades:
//            - Decoradores TypeORM (@Entity, @Column, etc)
//            - Relaciones (@ManyToOne, @OneToMany, etc)
//            - Índices y constraints
//            - Timestamps y soft delete
//            - Validadores class-validator
//            - Documentación Swagger
    
//         2. DTOs:
//            - Validadores class-validator
//            - Documentación Swagger
//            - Tipos TypeScript
//            - Transformadores class-transformer
    
//         3. Controladores:
//            - Rutas y métodos HTTP
//            - Guards y roles
//            - Validación de parámetros
//            - Documentación Swagger
//            - Manejo de errores
//            - Paginación y filtros
    
//         4. Servicios:
//            - Métodos CRUD completos
//            - Manejo de transacciones
//            - Validaciones de negocio
//            - Manejo de errores
//            - TypeORM QueryBuilder
//            - Relaciones y joins
    
//         RELACIONES REQUERIDAS:
    
//         1. User:
//            - hasMany Project (owner)
//            - hasMany Task (assignee)
//            - hasOne Role
    
//         2. Project:
//            - belongsTo User (owner)
//            - hasMany Task
//            - hasMany User (members)
    
//         3. Task:
//            - belongsTo Project
//            - belongsTo User (assignee)
    
//         CÓDIGO BASE:
//         ${entities}
    
//         FLUJOS DE NEGOCIO:
//         ${flows}
    
//         DIAGRAMAS:
//         ${classDiagram?.code || 'No proporcionado'}
//         ${sequenceDiagram?.code || 'No proporcionado'}
    
//         REQUISITOS TÉCNICOS:
//         1. PostgreSQL con TypeORM
//         2. JWT Authentication
//         3. Role-based access control
//         4. Class-validator y DTOs
//         5. Swagger documentation
//         6. Error handling
//         7. Soft delete
//         8. Timestamps
//         9. Paginación
//         10. Filtros y búsqueda`;
    
//         const result = await this.model.generateContent([{ text: prompt }]);
//         const response = result.response.text();
    
//         try {
//           const validJson = this.validateAndRepairJson(response);
//           const parsed = JSON.parse(validJson);
//           return this.processJsonResponse(parsed);
//         } catch (error) {
//           this.logger.error('Error procesando JSON del backend:', error);
//           return this.getDefaultBackendStructure();
//         }
//       } catch (error) {
//         this.logger.error('Error en generateBackendCode:', error);
//         return this.getDefaultBackendStructure();
//       }
//     }
    
//     // Método auxiliar para extraer entidades del diagrama de clases
// // Primero definimos las interfaces necesarias


// // Luego modificamos los métodos
// private extractEntitiesFromDiagram(classDiagram: string): string {
//   const entities: EntityDefinition[] = [];
//   const lines = classDiagram.split('\n');

//   let currentEntity: EntityDefinition | null = null;
  
//   for (const line of lines) {
//     if (line.includes('class ')) {
//       const entityName = line.split('class ')[1].split(' ')[0];
//       currentEntity = {
//         name: entityName,
//         attributes: [],
//         methods: []
//       };
//       entities.push(currentEntity);
//     } else if (currentEntity && line.includes(':')) {
//       const trimmedLine = line.trim();
//       if (line.includes('()')) {
//         currentEntity.methods.push(trimmedLine);
//       } else {
//         currentEntity.attributes.push(trimmedLine);
//       }
//     }
//   }

//   return JSON.stringify(entities, null, 2);
// }

// private extractFlowsFromDiagram(sequenceDiagram: string): string {
//   const flows: FlowDefinition[] = [];
//   const lines = sequenceDiagram.split('\n');

//   for (const line of lines) {
//     if (line.includes('->') || line.includes('->>')) {
//       const parts = line.split(/->|->>/).map(part => part.trim());
//       if (parts.length >= 2) {
//         const [from, rest] = parts;
//         const [to, ...actionParts] = rest.split(':');
        
//         flows.push({
//           from: from,
//           to: to.trim(),
//           action: actionParts.join(':').trim()
//         });
//       }
//     }
//   }

//   return JSON.stringify(flows, null, 2);
// }
    
//     // Método auxiliar para limpiar y validar JSON
//     private cleanAndValidateJson(text: string): string {
//       let cleaned = text
//         .replace(/```json\s*/g, '')
//         .replace(/```\s*/g, '')
//         .trim();
    
//       const start = cleaned.indexOf('{');
//       const end = cleaned.lastIndexOf('}') + 1;
    
//       if (start === -1 || end === -1) {
//         throw new Error('No se encontró estructura JSON válida');
//       }
    
//       cleaned = cleaned.substring(start, end);
    
//       // Validar estructura JSON
//       try {
//         JSON.parse(cleaned);
//         return cleaned;
//       } catch (error) {
//         // Intentar reparar JSON
//         return this.fixBrokenJson(cleaned);
//       }
//     }





    
//     private fixBrokenJson(jsonStr: string): string {
//       // 1. Normalizar saltos de línea y espacios
//       let fixed = jsonStr
//         .replace(/\r\n/g, '\n')
//         .replace(/\r/g, '\n')
//         .replace(/\t/g, '    ');
    
//       // 2. Remover caracteres especiales y no imprimibles
//       fixed = fixed.replace(/[^\x20-\x7E\n]/g, '');
    
//       // 3. Asegurar que las propiedades tienen valores válidos
//       fixed = fixed
//         .replace(/:\s*,/g, ':null,')
//         .replace(/:\s*\}/g, ':null}')
//         .replace(/:\s*\]/g, ':null]');
    
//       // 4. Balancear estructuras
//       const stack: string[] = [];
//       let chars: string[] = [];
//       let inString = false;
//       let escaped = false;
    
//       for (const char of fixed) {
//         if (escaped) {
//           chars.push(char);
//           escaped = false;
//           continue;
//         }
    
//         if (char === '\\') {
//           chars.push(char);
//           escaped = true;
//           continue;
//         }
    
//         if (char === '"' && !escaped) {
//           inString = !inString;
//           chars.push(char);
//           continue;
//         }
    
//         if (inString) {
//           chars.push(char);
//           continue;
//         }
    
//         switch (char) {
//           case '{':
//           case '[':
//             stack.push(char);
//             chars.push(char);
//             break;
//           case '}':
//           case ']':
//             if (stack.length > 0 && 
//                ((char === '}' && stack[stack.length - 1] === '{') ||
//                 (char === ']' && stack[stack.length - 1] === '['))) {
//               stack.pop();
//             }
//             chars.push(char);
//             break;
//           default:
//             chars.push(char);
//         }
//       }
    
//       // Cerrar estructuras pendientes
//       while (stack.length > 0) {
//         const last = stack.pop()!;
//         chars.push(last === '{' ? '}' : ']');
//       }
    
//       // 5. Limpieza final
//       return chars.join('')
//         .replace(/,\s*([}\]])/g, '$1')
//         .replace(/([{\[]),\s*([}\]])/g, '$1$2')
//         .replace(/,+/g, ',')
//         .replace(/\s+/g, ' ')
//         .trim();
//     }
    
//     private getDefaultBackendStructure(): NestJSBackend {
//       return {
//         modules: [
//           {
//             name: 'auth',
//             files: [
//               {
//                 path: 'src/auth/auth.module.ts',
//                 content: 'import { Module } from \'@nestjs/common\';\nimport { JwtModule } from \'@nestjs/jwt\';\nimport { PassportModule } from \'@nestjs/passport\';\nimport { AuthService } from \'./auth.service\';\nimport { AuthController } from \'./auth.controller\';\nimport { JwtStrategy } from \'./jwt.strategy\';\n\n@Module({\n  imports: [\n    PassportModule,\n    JwtModule.register({\n      secret: process.env.JWT_SECRET,\n      signOptions: { expiresIn: \'1h\' },\n    }),\n  ],\n  providers: [AuthService, JwtStrategy],\n  controllers: [AuthController],\n  exports: [AuthService]\n})\nexport class AuthModule {}',
//                 type: 'module'
//               },
//               {
//                 path: 'src/auth/auth.service.ts',
//                 content: 'import { Injectable } from \'@nestjs/common\';\nimport { JwtService } from \'@nestjs/jwt\';\n\n@Injectable()\nexport class AuthService {\n  constructor(private jwtService: JwtService) {}\n\n  async validateUser(username: string, password: string): Promise<any> {\n    // Implementación de validación\n  }\n\n  async login(user: any) {\n    const payload = { username: user.username, sub: user.userId };\n    return {\n      access_token: this.jwtService.sign(payload),\n    };\n  }\n}',
//                 type: 'service'
//               }
//             ],
//             cliCommands: ['nest g module auth', 'nest g service auth', 'nest g controller auth']
//           }
//         ],
//         commonFiles: [
//           {
//             path: 'src/main.ts',
//             content: 'import { NestFactory } from \'@nestjs/core\';\nimport { SwaggerModule, DocumentBuilder } from \'@nestjs/swagger\';\nimport { ValidationPipe } from \'@nestjs/common\';\nimport { AppModule } from \'./app.module\';\n\nasync function bootstrap() {\n  const app = await NestFactory.create(AppModule);\n\n  const config = new DocumentBuilder()\n    .setTitle(\'API\')\n    .setDescription(\'API description\')\n    .setVersion(\'1.0\')\n    .addBearerAuth()\n    .build();\n\n  const document = SwaggerModule.createDocument(app, config);\n  SwaggerModule.setup(\'api\', app, document);\n\n  app.useGlobalPipes(new ValidationPipe());\n  app.enableCors();\n\n  await app.listen(3000);\n}\nbootstrap();',
//             type: 'config'
//           }
//         ],
//         cliCommands: ['nest new backend']
//       };
//     }


//     private async generateFrontendCode(diagrams: MermaidDiagram[], requirements: IEEE830Requirement[]) {
//       try {
//         const componentDiagram = diagrams.find(d => d.type === 'componentDiagram');
//         const classDiagram = diagrams.find(d => d.type === 'classDiagram');
        
//         const prompt = `
//         GENERA UN JSON con la implementación completa de un frontend Angular.
//         IMPORTANTE: USAR SOLO COMILLAS DOBLES CON ESCAPE (\\"") PARA TODO EL CONTENIDO.
//         NO USES COMILLAS SIMPLES NI BACKTICKS.
//         El JSON debe seguir EXACTAMENTE esta estructura y contener TODOS los archivos necesarios:
    
//         {
//           "modules": [
//             {
//               "name": "string",
//               "files": [
//                 {
//                   "path": "string",
//                   "content": "string",
//                   "type": "string"
//                 }
//               ],
//               "cliCommands": ["string"]
//             }
//           ],
//           "commonFiles": [],
//           "cliCommands": []
//         }
    
//         ESTRUCTURA DE ARCHIVOS REQUERIDA:
    
//         1. Configuración Principal:
//            - src/app/app.module.ts (Módulo principal)
//            - src/app/app-routing.module.ts (Configuración de rutas)
//            - src/app/app.component.ts/html/scss
//            - src/environments/environment.ts
//            - src/environments/environment.prod.ts
    
//         2. Core Module (src/app/core/):
//            - core.module.ts
//            - interceptors/
//              - jwt.interceptor.ts (Manejo de tokens)
//              - error.interceptor.ts (Manejo de errores)
//              - loading.interceptor.ts (Estado de carga)
//            - guards/
//              - auth.guard.ts (Protección de rutas)
//              - role.guard.ts (Manejo de roles)
//            - services/
//              - auth.service.ts (Autenticación)
//              - error.service.ts (Manejo de errores)
//              - loading.service.ts (Estado de carga)
//            - models/
//              - user.model.ts
//              - project.model.ts
//              - task.model.ts
    
//         3. Shared Module (src/app/shared/):
//            - shared.module.ts
//            - material.module.ts
//            - components/
//              - header/
//                - header.component.ts/html/scss
//              - footer/
//                - footer.component.ts/html/scss
//              - loading/
//                - loading.component.ts/html/scss
//              - error/
//                - error.component.ts/html/scss
    
//         4. Auth Module (src/app/auth/):
//            - auth.module.ts
//            - auth-routing.module.ts
//            - pages/
//              - login/
//                - login.component.ts/html/scss
//              - register/
//                - register.component.ts/html/scss
//            - components/
//              - auth-form/
//                - auth-form.component.ts/html/scss
    
//         5. Projects Module (src/app/projects/):
//            - projects.module.ts
//            - projects-routing.module.ts
//            - services/
//              - project.service.ts
//            - models/
//              - project.model.ts
//            - pages/
//              - project-list/
//                - project-list.component.ts/html/scss
//              - project-create/
//                - project-create.component.ts/html/scss
//              - project-detail/
//                - project-detail.component.ts/html/scss
//            - components/
//              - project-form/
//                - project-form.component.ts/html/scss
//              - project-card/
//                - project-card.component.ts/html/scss
    
//         6. Tasks Module (src/app/tasks/):
//            - tasks.module.ts
//            - tasks-routing.module.ts
//            - services/
//              - task.service.ts
//            - models/
//              - task.model.ts
//            - pages/
//              - task-list/
//                - task-list.component.ts/html/scss
//              - task-create/
//                - task-create.component.ts/html/scss
//              - task-detail/
//                - task-detail.component.ts/html/scss
//            - components/
//              - task-form/
//                - task-form.component.ts/html/scss
//              - task-card/
//                - task-card.component.ts/html/scss
    
//         CADA ARCHIVO DEBE INCLUIR:
    
//         1. Componentes:
//            - Importaciones completas
//            - Decorador @Component con selector, templateUrl y styleUrls
//            - Implements OnInit, OnDestroy cuando sea necesario
//            - Constructor con inyección de dependencias
//            - Variables tipadas
//            - Métodos claros y tipados
//            - Manejo de suscripciones
//            - Manejo de errores try/catch
//            - Loading states
//            - Comentarios explicativos
    
//         2. Servicios:
//            - Decorador @Injectable providedIn: 'root'
//            - Métodos HTTP tipados
//            - Manejo de errores con catchError
//            - Transformación de datos con map
//            - Tipado de respuestas
//            - Métodos para CRUD completo
//            - Manejo de estado si es necesario
    
//         3. Guards:
//            - Implementación de CanActivate
//            - Chequeo de autenticación
//            - Redirección en caso de error
//            - Manejo de roles si es necesario
    
//         4. Interceptors:
//            - Implementación de HttpInterceptor
//            - Manejo de headers
//            - Manejo de errores
//            - Manejo de loading states
//            - Transformación de respuestas
    
//         5. Templates HTML:
//            - Estructura semántica
//            - Componentes Material Design
//            - Forms reactivos
//            - Validaciones
//            - Mensajes de error
//            - Loading spinners
//            - Responsive design
//            - Accesibilidad
    
//         6. Estilos SCSS:
//            - Variables globales
//            - Mixins reutilizables
//            - Media queries
//            - Themes Material
//            - Clases utilitarias
//            - Responsive design
//            - Animaciones
    
//         DIAGRAMAS BASE:
//         ${componentDiagram?.code || 'No proporcionado'}
//         ${classDiagram?.code || 'No proporcionado'}
    
//         REQUISITOS TÉCNICOS:
//         1. Implementación:
//            - Lazy loading para módulos
//            - Routing con child routes
//            - Guards en rutas protegidas
//            - Interceptors para JWT y errores
//            - Forms reactivos con validaciones
//            - Manejo de estado con servicios
//            - Arquitectura por módulos
//            - Componentes reutilizables
    
//         2. Material Design:
//            - Componentes Material
//            - Temas personalizados
//            - Responsive design
//            - Animaciones
//            - Dialogs
//            - Snackbars
//            - Loading spinners
    
//         3. Funcionalidad:
//            - Autenticación completa
//            - CRUD de proyectos
//            - CRUD de tareas
//            - Filtros y búsqueda
//            - Paginación
//            - Sorting
//            - Exportación de datos
//            - Carga de archivos`;
    
//         const result = await this.model.generateContent([{ text: prompt }]);
//         const response = result.response.text();
    
//         try {
//           const validJson = this.validateAndRepairJson(response);
//           const parsed = JSON.parse(validJson);
//           return this.processAngularJsonResponse(parsed);
//         } catch (error) {
//           this.logger.error('Error procesando JSON del frontend:', error);
//           return this.getDefaultFrontendStructure();
//         }
//       } catch (error) {
//         this.logger.error('Error en generateFrontendCode:', error);
//         return this.getDefaultFrontendStructure();
//       }
//     }

    
    


//     private cleanInitialResponse(response: string): string {
//       return response
//         .replace(/```json\s*/g, '')
//         .replace(/```\s*/g, '')
//         .replace(/[\u200B-\u200D\uFEFF]/g, '') // Eliminar caracteres de ancho cero
//         .replace(/\r\n/g, '\n')
//         .trim();
//     }

//     private extractJsonStructure(text: string): string | null {
//       const jsonStart = text.indexOf('{');
//       const jsonEnd = text.lastIndexOf('}') + 1;
      
//       if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) {
//         return null;
//       }

//       return text.substring(jsonStart, jsonEnd);
//     }

//     private repairJsonStrings(text: string): string {
//       // 1. Primero limpiamos el texto base
//       let result = text.replace(/```[a-z]*\s*/g, '')
//                       .replace(/```/g, '')
//                       .replace(/[\u200B-\u200D\uFEFF]/g, '')
//                       .trim();
    
//       // 2. Encontrar el JSON principal
//       const start = result.indexOf('{');
//       const end = result.lastIndexOf('}') + 1;
//       if (start === -1 || end === -1) {
//         throw new Error('No se encontró estructura JSON válida');
//       }
//       result = result.substring(start, end);
    
//       // 3. Procesamiento caracter por caracter
//       let processed = '';
//       let inString = false;
//       let currentString = '';
//       let escapeNext = false;
//       let stringStartChar = '';
//       let depth = 0;
//       let stringStartPos = -1;
    
//       for (let i = 0; i < result.length; i++) {
//         const char = result[i];
        
//         if (escapeNext) {
//           if (inString) {
//             currentString += '\\' + char;
//           } else {
//             processed += '\\' + char;
//           }
//           escapeNext = false;
//           continue;
//         }
    
//         if (char === '\\') {
//           escapeNext = true;
//           continue;
//         }
    
//         if ((char === '"' || char === "'") && !escapeNext) {
//           if (!inString) {
//             // Iniciar string
//             inString = true;
//             stringStartChar = char;
//             stringStartPos = i;
//             currentString = '';
//           } else if (char === stringStartChar) {
//             // Cerrar string si coincide con el carácter de apertura
//             inString = false;
//             processed += '"' + this.escapeJsonString(currentString) + '"';
//             currentString = '';
//           } else {
//             // Comilla diferente dentro del string
//             currentString += char;
//           }
//           continue;
//         }
    
//         if (inString) {
//           currentString += char;
          
//           // Verificar strings excesivamente largos
//           if (currentString.length > 50000) {
//             this.logger.warn(`String muy largo detectado en pos ${stringStartPos}, forzando cierre`);
//             inString = false;
//             processed += '"' + this.escapeJsonString(currentString) + '"';
//             currentString = '';
//           }
//         } else {
//           if (char === '{' || char === '[') depth++;
//           if (char === '}' || char === ']') depth--;
//           processed += char;
//         }
//       }
    
//       // 4. Cerrar cualquier string pendiente
//       if (inString) {
//         processed += '"' + this.escapeJsonString(currentString) + '"';
//       }
    
//       // 5. Cerrar estructuras no balanceadas
//       while (depth > 0) {
//         processed += '}';
//         depth--;
//       }
//       while (depth < 0) {
//         processed = '{' + processed;
//         depth++;
//       }
    
//       // 6. Limpieza final
//       return this.cleanJsonStructure(processed);
//     }
//     private escapeJsonString(str: string): string {
//       return str
//         .replace(/\\/g, '\\\\')    // Escapa backslashes primero
//         .replace(/"/g, '\\"')      // Escapa comillas dobles
//         .replace(/\n/g, '\\n')     // Escapa saltos de línea
//         .replace(/\r/g, '\\r')     // Escapa retornos de carro
//         .replace(/\t/g, '\\t')     // Escapa tabulaciones
//         .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Elimina caracteres de control
//         .replace(/\u2028/g, '\\u2028') // Escapa separadores de línea Unicode
//         .replace(/\u2029/g, '\\u2029'); // Escapa separadores de párrafo Unicode
//     }
    
//     private cleanJsonStructure(json: string): string {
//       return json
//         .replace(/,\s*}/g, '}')          // Elimina comas finales en objetos
//         .replace(/,\s*\]/g, ']')         // Elimina comas finales en arrays
//         .replace(/}\s*{/g, '},{')        // Corrige objetos adyacentes
//         .replace(/]\s*\[/g, '],[')       // Corrige arrays adyacentes
//         .replace(/,+/g, ',')             // Elimina comas múltiples
//         .replace(/:\s*,/g, ':null,')     // Añade null en valores faltantes
//         .replace(/:\s*}/g, ':null}')     // Añade null en último valor faltante
//         .replace(/"\s*:/g, '":')         // Normaliza espacios antes de :
//         .replace(/:\s*"/g, ':"')         // Normaliza espacios después de :
//         .replace(/\s+/g, ' ')            // Normaliza espacios múltiples
//         .trim();
//     }

//     private repairUnterminatedStrings(text: string): string {
//       let result = '';
//       let inString = false;
//       let currentString = '';
//       let escaped = false;
//       let depth = 0;
//       const stack: string[] = [];

//       // Procesar caracter por caracter
//       for (let i = 0; i < text.length; i++) {
//         const char = text[i];
        
//         // Manejar caracteres escapados
//         if (escaped) {
//           if (inString) currentString += '\\' + char;
//           else result += '\\' + char;
//           escaped = false;
//           continue;
//         }

//         // Detectar escape
//         if (char === '\\') {
//           escaped = true;
//           continue;
//         }

//         // Manejar comillas
//         if (char === '"' && !escaped) {
//           if (inString) {
//             // Cerrar string
//             result += '"' + currentString + '"';
//             currentString = '';
//             inString = false;
//           } else {
//             // Iniciar string
//             inString = true;
//             currentString = '';
//           }
//           continue;
//         }

//         // Acumular caracteres
//         if (inString) {
//           currentString += char;
//         } else {
//           // Manejar estructura JSON
//           if (char === '{' || char === '[') {
//             depth++;
//             stack.push(char);
//           } else if (char === '}' || char === ']') {
//             depth--;
//             if (stack.length > 0) stack.pop();
//           }
//           result += char;
//         }

//         // Verificar strings muy largos o posiblemente no terminados
//         if (inString && currentString.length > 10000) {
//           this.logger.warn(`String muy largo detectado en posición ${i}, forzando cierre`);
//           result += '"' + currentString + '"';
//           currentString = '';
//           inString = false;
//         }
//       }

//       // Cerrar cualquier string pendiente
//       if (inString) {
//         result += '"' + currentString + '"';
//       }

//       // Cerrar estructuras pendientes
//       while (stack.length > 0) {
//         const bracket = stack.pop();
//         result += bracket === '{' ? '}' : ']';
//       }

//       // Limpieza final
//       return this.finalCleanup(result);
//     }


//     private finalCleanup(json: string): string {
//       return json
//         .replace(/,\s*}/g, '}')
//         .replace(/,\s*\]/g, ']')
//         .replace(/}\s*{/g, '},{')
//         .replace(/]\s*\[/g, '],[')
//         .replace(/,+/g, ',')
//         .replace(/:\s*,/g, ':null,')
//         .replace(/:\s*}/g, ':null}')
//         .replace(/"\s*:/g, '":')
//         .replace(/:\s*"/g, ':"')
//         .replace(/\s+/g, ' ')
//         .trim();
//     }


//     private preprocessJsonString(text: string): string {
//       // Step 1: Handle String Delimiters
//       let processed = text
//         .replace(/(?<!\\)'([^']*)'(?=\s*:)/g, '"$1"') // Replace single quotes in property names
//         .replace(/:\s*'([^']*?)'/g, ':"$1"') // Replace single quotes in property values
//         .replace(/`([^`]*)`/g, '"$1"') // Replace backticks
//         .replace(/\\\\/g, '\\') // Fix double escapes
//         .replace(/\\"/g, '"') // Unescape quotes
//         .replace(/"{2,}/g, '"') // Fix multiple quotes
//         .replace(/(?<!\\)"/g, '\\"'); // Escape unescaped quotes
    
//       // Step 2: Fix Structural Issues
//       processed = processed
//         .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
//         .replace(/([{\[,])\s*([}\]])/g, '$1null$2') // Add null for empty structures
//         .replace(/:\s*,/g, ':null,') // Add null for empty values
//         .replace(/:\s*}/g, ':null}') // Add null for last empty value
//         .replace(/{\s*,/g, '{') // Remove initial comma in objects
//         .replace(/\[\s*,/g, '[') // Remove initial comma in arrays
//         .replace(/,\s*$/g, ''); // Remove trailing comma
    
//       // Step 3: Balance Structures
//       const stack: string[] = [];
//       let inString = false;
//       let escaped = false;
//       const chars: string[] = [];
    
//       for (const char of processed) {
//         if (escaped) {
//           chars.push(char);
//           escaped = false;
//           continue;
//         }
    
//         if (char === '\\') {
//           chars.push(char);
//           escaped = true;
//           continue;
//         }
    
//         if (char === '"' && !escaped) {
//           inString = !inString;
//         }
    
//         if (!inString) {
//           if (char === '{' || char === '[') {
//             stack.push(char);
//           } else if (char === '}' || char === ']') {
//             if (stack.length > 0) {
//               const last = stack[stack.length - 1];
//               if ((char === '}' && last === '{') || (char === ']' && last === '[')) {
//                 stack.pop();
//               }
//             }
//           }
//         }
    
//         chars.push(char);
//       }
    
//       // Close any unclosed structures
//       while (stack.length > 0) {
//         const last = stack.pop()!;
//         chars.push(last === '{' ? '}' : ']');
//       }
    
//       return chars.join('');
//     }
    



//     private getDefaultFrontendStructure(): AngularFrontend {
//       return {
//         modules: [
//           // Core Module
//           {
//             name: 'core',
//             files: [
//               {
//                 path: 'src/app/core/core.module.ts',
//                 content: "import { NgModule, Optional, SkipSelf } from '@angular/core';\nimport { CommonModule } from '@angular/common';\nimport { HTTP_INTERCEPTORS } from '@angular/common/http';\nimport { JwtInterceptor } from './interceptors/jwt.interceptor';\nimport { ErrorInterceptor } from './interceptors/error.interceptor';\n\n@NgModule({\n  imports: [CommonModule],\n  providers: [\n    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },\n    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }\n  ]\n})\nexport class CoreModule {\n  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {\n    if (parentModule) {\n      throw new Error('CoreModule is already loaded. Import it in the AppModule only.');\n    }\n  }\n}",
//                 type: 'module'
//               },
//               {
//                 path: 'src/app/core/interceptors/jwt.interceptor.ts',
//                 content: "import { Injectable } from '@angular/core';\nimport { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';\nimport { Observable } from 'rxjs';\nimport { AuthService } from '../services/auth.service';\n\n@Injectable()\nexport class JwtInterceptor implements HttpInterceptor {\n  constructor(private authService: AuthService) {}\n\n  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {\n    const token = this.authService.getToken();\n    if (token) {\n      request = request.clone({\n        setHeaders: { Authorization: `Bearer ${token}` }\n      });\n    }\n    return next.handle(request);\n  }\n}",
//                 type: 'interceptor'
//               }
//             ],
//             cliCommands: ['ng g module core']
//           },
//           // Auth Module
//           {
//             name: 'auth',
//             files: [
//               {
//                 path: 'src/app/auth/auth.module.ts',
//                 content: "import { NgModule } from '@angular/core';\nimport { CommonModule } from '@angular/common';\nimport { ReactiveFormsModule } from '@angular/forms';\nimport { RouterModule } from '@angular/router';\nimport { MaterialModule } from '../shared/material.module';\nimport { LoginComponent } from './components/login/login.component';\nimport { RegisterComponent } from './components/register/register.component';\n\n@NgModule({\n  declarations: [LoginComponent, RegisterComponent],\n  imports: [\n    CommonModule,\n    ReactiveFormsModule,\n    MaterialModule,\n    RouterModule.forChild([\n      { path: 'login', component: LoginComponent },\n      { path: 'register', component: RegisterComponent }\n    ])\n  ]\n})\nexport class AuthModule { }",
//                 type: 'module'
//               }
//             ],
//             cliCommands: ['ng g module auth']
//           }
//         ],
//         commonFiles: [
//           {
//             path: 'src/app/app.module.ts',
//             content: "import { NgModule } from '@angular/core';\nimport { BrowserModule } from '@angular/platform-browser';\nimport { BrowserAnimationsModule } from '@angular/platform-browser/animations';\nimport { HttpClientModule } from '@angular/common/http';\nimport { AppRoutingModule } from './app-routing.module';\nimport { AppComponent } from './app.component';\nimport { CoreModule } from './core/core.module';\nimport { SharedModule } from './shared/shared.module';\n\n@NgModule({\n  declarations: [AppComponent],\n  imports: [\n    BrowserModule,\n    BrowserAnimationsModule,\n    HttpClientModule,\n    AppRoutingModule,\n    CoreModule,\n    SharedModule\n  ],\n  bootstrap: [AppComponent]\n})\nexport class AppModule { }",
//             type: 'module'
//           },
//           {
//             path: 'src/app/app-routing.module.ts',
//             content: "import { NgModule } from '@angular/core';\nimport { RouterModule, Routes } from '@angular/router';\nimport { AuthGuard } from './core/guards/auth.guard';\n\nconst routes: Routes = [\n  {\n    path: 'auth',\n    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)\n  },\n  {\n    path: 'projects',\n    canActivate: [AuthGuard],\n    loadChildren: () => import('./projects/projects.module').then(m => m.ProjectsModule)\n  },\n  { path: '', redirectTo: '/projects', pathMatch: 'full' }\n];\n\n@NgModule({\n  imports: [RouterModule.forRoot(routes)],\n  exports: [RouterModule]\n})\nexport class AppRoutingModule { }",
//             type: 'module'
//           }
//         ],
//         cliCommands: [
//           'ng new frontend --style=scss --routing=true',
//           'ng add @angular/material'
//         ]
//       };
//     }


//     private validateAndRepairJson(text: string): string {
//       // 1. Limpieza inicial
//       let result = text.replace(/```[a-z]*\s*/g, '')
//                       .replace(/```/g, '')
//                       .replace(/[\u200B-\u200D\uFEFF]/g, '')
//                       .trim();
    
//       // 2. Encontrar estructura JSON
//       const start = result.indexOf('{');
//       const end = result.lastIndexOf('}') + 1;
//       if (start === -1 || end === -1) {
//         throw new Error('No se encontró estructura JSON válida');
//       }
//       result = result.substring(start, end);
    
//       // 3. Estado del parser
//       const stack: Array<{char: string; pos: number}> = [];
//       let output = '';
//       let inString = false;
//       let inArray = false;
//       let currentString = '';
//       let escaped = false;
//       let elementCount = 0;
//       let expectingComma = false;
    
//       // 4. Procesar caracter por caracter
//       for (let i = 0; i < result.length; i++) {
//         const char = result[i];
    
//         // Manejar escapes
//         if (escaped) {
//           if (inString) currentString += '\\' + char;
//           else output += '\\' + char;
//           escaped = false;
//           continue;
//         }
    
//         if (char === '\\') {
//           escaped = true;
//           continue;
//         }
    
//         // Manejar strings
//         if (char === '"' && !escaped) {
//           if (inString) {
//             output += '"' + this.escapeSpecialChars(currentString) + '"';
//             currentString = '';
//             inString = false;
//             if (inArray) expectingComma = true;
//           } else {
//             inString = true;
//             if (inArray && expectingComma) {
//               output += ',';
//               expectingComma = false;
//             }
//           }
//           continue;
//         }
    
//         if (inString) {
//           currentString += char;
//           continue;
//         }
    
//         // Manejar estructura
//         switch (char) {
//           case '{':
//           case '[':
//             if (inArray && expectingComma) {
//               output += ',';
//               expectingComma = false;
//             }
//             stack.push({char, pos: output.length});
//             inArray = char === '[';
//             elementCount = 0;
//             output += char;
//             break;
    
//           case '}':
//           case ']':
//             const matching = stack[stack.length - 1];
//             if (matching && ((char === '}' && matching.char === '{') ||
//                             (char === ']' && matching.char === '['))) {
//               stack.pop();
//               inArray = stack.some(item => item.char === '[');
//               output += char;
//               if (inArray) expectingComma = true;
//             }
//             break;
    
//           case ',':
//             if (inArray) {
//               expectingComma = false;
//               elementCount++;
//             }
//             output += char;
//             break;
    
//           case ' ':
//           case '\n':
//           case '\t':
//           case '\r':
//             // Solo agregar espacio si no está en array o si no espera coma
//             if (!inArray || !expectingComma) {
//               output += ' ';
//             }
//             break;
    
//           default:
//             if (inArray && expectingComma) {
//               output += ',';
//               expectingComma = false;
//             }
//             output += char;
//             break;
//         }
    
//         // Verificar longitud máxima de string
//         if (currentString.length > 50000) {
//           this.logger.warn(`String muy largo detectado en posición ${i}, forzando cierre`);
//           output += '"' + this.escapeSpecialChars(currentString) + '"';
//           currentString = '';
//           inString = false;
//           if (inArray) expectingComma = true;
//         }
//       }
    
//       // 5. Cerrar strings pendientes
//       if (inString) {
//         output += '"' + this.escapeSpecialChars(currentString) + '"';
//       }
    
//       // 6. Cerrar estructuras pendientes
//       while (stack.length > 0) {
//         const last = stack.pop()!;
//         output += last.char === '{' ? '}' : ']';
//       }
    
//       // 7. Limpieza final
//       return this.finalCleanup(output);
//     }

//     private escapeSpecialChars(str: string): string {
//       return str
//         .replace(/\\/g, '\\\\')
//         .replace(/"/g, '\\"')
//         .replace(/\n/g, '\\n')
//         .replace(/\r/g, '\\r')
//         .replace(/\t/g, '\\t')
//         .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
//         .replace(/\u2028/g, '\\u2028')
//         .replace(/\u2029/g, '\\u2029');
//     }

//     private extractValidJson(text: string): string {
//       const jsonStart = text.indexOf('{');
//       const jsonEnd = text.lastIndexOf('}') + 1;
      
//       if (jsonStart === -1 || jsonEnd === -1) {
//         throw new Error('No se encontró estructura JSON válida');
//       }
    
//       return text.substring(jsonStart, jsonEnd);
//     }
    
//     private sanitizeJsonResponse(text: string): string {
//       // 1. Eliminar cualquier texto antes del primer {
//       const startIndex = text.indexOf('{');
//       const endIndex = text.lastIndexOf('}') + 1;
//       if (startIndex === -1 || endIndex === -1) {
//         throw new Error('JSON inválido: no se encontraron delimitadores');
//       }
    
//       let json = text.substring(startIndex, endIndex);
    
//       // 2. Normalizar saltos de línea y espacios
//       json = json
//         .replace(/\\n/g, '\n')
//         .replace(/\\t/g, '\t')
//         .replace(/\\r/g, '\r');
    
//       // 3. Asegurar que las comillas estén bien escapadas
//       let inString = false;
//       let escaped = false;
//       let result = '';
    
//       for (let i = 0; i < json.length; i++) {
//         const char = json[i];
    
//         if (escaped) {
//           if (char === "'") {
//             result += '"'; // Reemplazar comillas simples escapadas por dobles
//           } else {
//             result += '\\' + char; // Mantener otros caracteres escapados
//           }
//           escaped = false;
//           continue;
//         }
    
//         if (char === '\\') {
//           escaped = true;
//           continue;
//         }
    
//         if (char === '"') {
//           inString = !inString;
//           result += char;
//           continue;
//         }
    
//         if (inString) {
//           // Dentro de strings, escapar comillas y mantener el resto
//           if (char === "'") {
//             result += '"';
//           } else {
//             result += char;
//           }
//         } else {
//           // Fuera de strings, normalizar espacios y formato
//           if (!/\s/.test(char)) {
//             result += char;
//           }
//         }
//       }
    
//       // 4. Asegurar que el JSON está bien formado
//       try {
//         const parsed = JSON.parse(result);
//         return JSON.stringify(parsed);
//       } catch (error) {
//         // Si el parsing falla, intentar reparación final
//         return this.repairJsonString(result);
//       }
//     }
    
//     private repairJsonString(text: string): string {
//       let result = text;
    
//       // Remove any non-printable characters
//       result = result.replace(/[^\x20-\x7E\n]/g, '');
    
//       // Ensure all property names are properly quoted
//       result = result.replace(/(\w+)(?=\s*:)/g, '"$1"');
    
//       // Fix common JSON syntax issues
//       result = result
//         .replace(/,\s*([}\]])/g, '$1') // Remove trailing commas
//         .replace(/([{\[,]\s*),/g, '$1') // Remove extra commas
//         .replace(/,+/g, ',') // Remove multiple commas
//         .replace(/:\s*([}\]])/g, ':null$1') // Add null for empty values
//         .replace(/{\s*}/g, '{}') // Fix empty objects
//         .replace(/\[\s*\]/g, '[]'); // Fix empty arrays
    
//       // Balance braces and brackets
//       let depth = 0;
//       let inString = false;
//       let escaped = false;
//       const chars: string[] = [];
    
//       for (const char of result) {
//         if (escaped) {
//           chars.push(char);
//           escaped = false;
//           continue;
//         }
    
//         if (char === '\\') {
//           chars.push(char);
//           escaped = true;
//           continue;
//         }
    
//         if (char === '"' && !escaped) {
//           inString = !inString;
//         }
    
//         if (!inString) {
//           if (char === '{' || char === '[') depth++;
//           if (char === '}' || char === ']') depth--;
//         }
    
//         chars.push(char);
//       }
    
//       // Close any unclosed structures
//       while (depth > 0) {
//         chars.push('}');
//         depth--;
//       }
    
//       try {
//         // Validate the repaired JSON
//         JSON.parse(chars.join(''));
//         return chars.join('');
//       } catch (error) {
//         // If still invalid, return a minimal valid JSON structure
//         return '{"modules":[],"commonFiles":[],"cliCommands":[]}';
//       }
//     }

// //#########################################################################################
// //#########################################################################################
// //#########################################################################################
// //#########################################################################################
// //#########################################################################################
// //#########################################################################################
// //#########################################################################################
// //#########################################################################################
// //#########################################################################################
// //#########################################################################################
// //#########################################################################################


//     private processJsonResponse(parsed: any): NestJSBackend {
//       try {
//         const result: NestJSBackend = {
//           modules: [],
//           commonFiles: [],
//           cliCommands: []
//         };
    
//         // Procesar módulos
//         if (Array.isArray(parsed.modules)) {
//           result.modules = parsed.modules
//             .filter(module => module && typeof module === 'object')
//             .map(module => ({
//               name: String(module?.name || '').trim() || 'unnamed-module',
//               files: Array.isArray(module?.files) 
//                 ? module.files
//                     .filter(file => file && typeof file === 'object')
//                     .map(file => ({
//                       path: String(file?.path || '').trim() || 'unknown.ts',
//                       content: this.normalizeString(String(file?.content || '')),
//                       type: this.validateNestJSFileType(file?.type, String(file?.path || ''))
//                     }))
//                 : [],
//               cliCommands: Array.isArray(module?.cliCommands)
//                 ? module.cliCommands
//                     .filter(cmd => cmd)
//                     .map(cmd => String(cmd).trim())
//                 : []
//             }));
//         }
    
//         // Procesar archivos comunes
//         if (Array.isArray(parsed.commonFiles)) {
//           result.commonFiles = parsed.commonFiles
//             .filter(file => file && typeof file === 'object')
//             .map(file => ({
//               path: String(file?.path || '').trim() || 'unknown.ts',
//               content: this.normalizeString(String(file?.content || '')),
//               type: this.validateNestJSFileType(file?.type, String(file?.path || ''))
//             }));
//         }
    
//         // Procesar comandos CLI
//         if (Array.isArray(parsed.cliCommands)) {
//           result.cliCommands = parsed.cliCommands
//             .filter(cmd => cmd)
//             .map(cmd => String(cmd).trim());
//         }
    
//         return result;
//       } catch (error) {
//         this.logger.error('Error processing JSON response:', error);
//         return {
//           modules: [],
//           commonFiles: [],
//           cliCommands: []
//         };
//       }
//     }
    
//     private normalizeString(text: string): string {
//       return text
//         .replace(/\\n/g, '\n')
//         .replace(/\\t/g, '\t')
//         .replace(/\\"/g, '"')
//         .replace(/\\\\/g, '\\')
//         .trim();
//     }


//     private fixAndCompleteJson(text: string): string {
//       try {
//         // 1. Limpiar el texto inicial
//         const cleanedText = text
//           .replace(/```[a-z]*\s*/g, '')
//           .replace(/```\s*/g, '')
//           .replace(/\\`/g, '`')
//           .replace(/\r\n/g, '\n')
//           .trim();
    
//         // 2. Buscar el JSON más externo
//         const jsonRegex = /\{[\s\S]*\}/g;
//         const matches = cleanedText.match(jsonRegex);
        
//         if (!matches || matches.length === 0) {
//           throw new Error('No se encontró estructura JSON válida');
//         }
    
//         // 3. Obtener el JSON más largo (probablemente el más completo)
//         let jsonStr = matches.reduce((a, b) => a.length > b.length ? a : b);
    
//         // 4. Procesar el JSON para arreglar problemas comunes
//         const processJson = (input: string): string => {
//           // Array para construir el JSON limpio
//           const chars: string[] = [];
//           let braceCount = 0;
//           let inString = false;
//           let escaped = false;
//           let lastCharWasColon = false;
//           let lastCharWasComma = false;
    
//           // Procesar cada carácter
//           for (let i = 0; i < input.length; i++) {
//             const char = input[i];
            
//             // Manejar caracteres escapados
//             if (escaped) {
//               chars.push(char);
//               escaped = false;
//               continue;
//             }
    
//             // Detectar escape
//             if (char === '\\') {
//               chars.push(char);
//               escaped = true;
//               continue;
//             }
    
//             // Manejar strings
//             if (char === '"' && !escaped) {
//               inString = !inString;
//               chars.push(char);
//               continue;
//             }
    
//             // Dentro de un string, aceptar todo
//             if (inString) {
//               chars.push(char);
//               continue;
//             }
    
//             // Fuera de strings, manejar estructura
//             switch (char) {
//               case '{':
//                 braceCount++;
//                 chars.push(char);
//                 lastCharWasColon = false;
//                 lastCharWasComma = false;
//                 break;
    
//               case '}':
//                 // Evitar cerrar más llaves de las que abrimos
//                 if (braceCount > 0) {
//                   braceCount--;
//                   chars.push(char);
//                 }
//                 lastCharWasColon = false;
//                 lastCharWasComma = false;
//                 break;
    
//               case ':':
//                 // Evitar colones duplicados
//                 if (!lastCharWasColon) {
//                   chars.push(char);
//                   lastCharWasColon = true;
//                 }
//                 lastCharWasComma = false;
//                 break;
    
//               case ',':
//                 // Evitar comas duplicadas
//                 if (!lastCharWasComma) {
//                   chars.push(char);
//                   lastCharWasComma = true;
//                 }
//                 lastCharWasColon = false;
//                 break;
    
//               // Espacios y saltos de línea
//               case ' ':
//               case '\n':
//               case '\t':
//                 // Mantener solo si no estamos después de : o ,
//                 if (!lastCharWasColon && !lastCharWasComma) {
//                   chars.push(char);
//                 }
//                 break;
    
//               default:
//                 chars.push(char);
//                 lastCharWasColon = false;
//                 lastCharWasComma = false;
//             }
//           }
    
//           // Cerrar strings abiertos
//           if (inString) {
//             chars.push('"');
//           }
    
//           // Cerrar llaves faltantes
//           while (braceCount > 0) {
//             chars.push('}');
//             braceCount--;
//           }
    
//           return chars.join('');
//         };
    
//         // 5. Procesar el JSON
//         const processedJson = processJson(jsonStr);
    
//         // 6. Validar el resultado
//         try {
//           JSON.parse(processedJson);
//           return processedJson;
//         } catch (e) {
//           // Si falla, intentar una limpieza más agresiva
//           const cleanerJson = processedJson
//             .replace(/,\s*}/g, '}')  // Eliminar comas antes de cerrar objetos
//             .replace(/,\s*\]/g, ']') // Eliminar comas antes de cerrar arrays
//             .replace(/\}\s*,\s*\}/g, '}}') // Arreglar comas entre llaves de cierre
//             .replace(/\]\s*,\s*\]/g, ']]'); // Arreglar comas entre corchetes de cierre
    
//           // Intentar parsear una última vez
//           JSON.parse(cleanerJson);
//           return cleanerJson;
//         }
//       } catch (error) {
//         this.logger.error('Error fixing JSON:', error);
//         throw new Error(`Error procesando JSON: ${error.message}`);
//       }
//     }




//     private cleanRawJson(text: string): string {
//       try {
//         // 1. Logging inicial para debug
//         this.logger.debug('Input text:', text);
    
//         // 2. Limpieza inicial más agresiva
//         let cleanedText = text
//           .replace(/```[a-z]*\s*/g, '')
//           .replace(/```/g, '')
//           .replace(/\\`/g, '`')
//           .replace(/\r\n/g, '\n')
//           .replace(/[\u200B-\u200D\uFEFF]/g, '')
//           .trim();
    
//         // 3. Buscar todas las posibles estructuras JSON
//         const possibleJsons: string[] = [];
//         let currentDepth = 0;
//         let start = -1;
//         let inString = false;
//         let escaped = false;
    
//         // Primera pasada: recolectar todas las estructuras JSON posibles
//         for (let i = 0; i < cleanedText.length; i++) {
//           const char = cleanedText[i];
    
//           if (escaped) {
//             escaped = false;
//             continue;
//           }
    
//           if (char === '\\') {
//             escaped = true;
//             continue;
//           }
    
//           if (char === '"' && !escaped) {
//             inString = !inString;
//             continue;
//           }
    
//           if (!inString) {
//             if (char === '{') {
//               if (currentDepth === 0) start = i;
//               currentDepth++;
//             } else if (char === '}') {
//               currentDepth--;
//               if (currentDepth === 0 && start !== -1) {
//                 possibleJsons.push(cleanedText.substring(start, i + 1));
//                 start = -1;
//               }
//             }
//           }
//         }
    
//         // 4. Si no encontramos estructuras JSON, intentar una búsqueda más permisiva
//         if (possibleJsons.length === 0) {
//           const matches = cleanedText.match(/\{[^]*\}/g);
//           if (matches) {
//             possibleJsons.push(...matches);
//           } else {
//             // Último intento: buscar cualquier cosa entre llaves
//             const firstBrace = cleanedText.indexOf('{');
//             const lastBrace = cleanedText.lastIndexOf('}');
//             if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
//               possibleJsons.push(cleanedText.substring(firstBrace, lastBrace + 1));
//             }
//           }
//         }
    
//         // 5. Logging de las estructuras encontradas
//         this.logger.debug('Found JSON structures:', possibleJsons);
    
//         // 6. Si aún no encontramos nada, lanzar error
//         if (possibleJsons.length === 0) {
//           this.logger.error('No JSON structures found in:', cleanedText);
//           throw new Error('No se encontró estructura JSON válida');
//         }
    
//         // 7. Intentar procesar cada estructura encontrada
//         let validJson: string | undefined = undefined;
//         for (const jsonStr of possibleJsons) {
//           try {
//             // Limpiar y normalizar la estructura
//             const normalized = this.normalizeJsonStructure(jsonStr);
//             // Intentar parsear
//             JSON.parse(normalized);
//             // Si llegamos aquí, es un JSON válido
//             validJson = normalized;
//             break;
//           } catch (e) {
//             this.logger.debug('Failed to parse JSON structure:', e);
//             continue;
//           }
//         }
    
//         // 8. Si no encontramos ningún JSON válido, intentar reparar el más prometedor
//         if (!validJson) {
//           // Tomar el JSON más largo como el más prometedor
//           const bestCandidate = possibleJsons.reduce((a, b) => 
//             (a || '').length >= (b || '').length ? a : b
//           );
//           if (bestCandidate) {
//             validJson = this.repairJson(bestCandidate);
//           }
//         }
    
//         if (!validJson) {
//           throw new Error('No se pudo procesar ninguna estructura JSON válida');
//         }
    
//         return validJson;
//       } catch (error) {
//         this.logger.error('Error en cleanRawJson:', error);
//         throw error;
//       }
//     }
    
//     private normalizeJsonStructure(jsonStr: string): string {
//       // 1. Procesar el string carácter por carácter
//       const chars: string[] = [];
//       let inString = false;
//       let escaped = false;
    
//       for (let i = 0; i < jsonStr.length; i++) {
//         const char = jsonStr[i];
    
//         // Manejar escapes
//         if (escaped) {
//           switch (char) {
//             case 'n': chars.push('\\n'); break;
//             case 't': chars.push('\\t'); break;
//             case 'r': chars.push('\\r'); break;
//             case '"': chars.push('\\"'); break;
//             case '\\': chars.push('\\\\'); break;
//             default: chars.push(char);
//           }
//           escaped = false;
//           continue;
//         }
    
//         if (char === '\\') {
//           escaped = true;
//           continue;
//         }
    
//         // Manejar strings
//         if (char === '"') {
//           inString = !inString;
//         }
    
//         if (inString) {
//           chars.push(char);
//         } else {
//           // Fuera de strings, normalizar espacios y formato
//           switch (char) {
//             case ' ':
//             case '\n':
//             case '\t':
//             case '\r':
//               // Ignorar espacios fuera de strings
//               break;
//             default:
//               chars.push(char);
//           }
//         }
//       }
    
//       // 2. Asegurar que los strings están cerrados
//       if (inString) {
//         chars.push('"');
//       }
    
//       return chars.join('');
//     }
    
//     private repairJson(jsonStr: string): string {
//       try {
//         // 1. Remover caracteres inválidos
//         let cleaned = jsonStr.replace(/[^\x20-\x7E]/g, '');
    
//         // 2. Asegurar que las propiedades tienen valores
//         cleaned = cleaned
//           .replace(/:\s*,/g, ':null,')
//           .replace(/:\s*}/g, ':null}')
//           .replace(/:\s*\]/g, ':null]');
    
//         // 3. Remover comas extra
//         cleaned = cleaned
//           .replace(/,\s*}/g, '}')
//           .replace(/,\s*\]/g, ']')
//           .replace(/,+/g, ',');
    
//         // 4. Balancear estructuras
//         let depth = 0;
//         let inString = false;
//         let escaped = false;
//         const chars: string[] = [];
    
//         for (const char of cleaned) {
//           if (escaped) {
//             chars.push(char);
//             escaped = false;
//             continue;
//           }
    
//           if (char === '\\') {
//             chars.push(char);
//             escaped = true;
//             continue;
//           }
    
//           if (char === '"' && !escaped) {
//             inString = !inString;
//           }
    
//           if (!inString) {
//             if (char === '{') depth++;
//             if (char === '}') depth--;
//           }
    
//           chars.push(char);
//         }
    
//         // Cerrar estructuras abiertas
//         while (depth > 0) {
//           chars.push('}');
//           depth--;
//         }
    
//         // 5. Intentar parsear y retornar
//         const result = chars.join('');
//         JSON.parse(result); // Validar que es JSON válido
//         return result;
//       } catch (error) {
//         this.logger.error('Error reparando JSON:', error);
//         throw error;
//       }
//     }

    



    
//     private processNestJSFile(file: any, validTypes: NestJSFileType[]): NestJSFile {
//       if (!file || typeof file !== 'object') {
//         return {
//           path: 'unknown/path.ts',
//           content: '',
//           type: 'module'
//         };
//       }
    
//       const path = typeof file.path === 'string' ? file.path.trim() : 'unknown/path.ts';
//       let content = '';
    
//       if (typeof file.content === 'string') {
//         content = file.content
//           .replace(/\\n/g, '\n')
//           .replace(/\\t/g, '\t')
//           .replace(/\\"/g, '"')
//           .replace(/\\\\/g, '\\')
//           .trim();
//       }
    
//       let type: NestJSFileType = 'module';
//       if (typeof file.type === 'string' && validTypes.includes(file.type as NestJSFileType)) {
//         type = file.type as NestJSFileType;
//       } else {
//         // Inferir tipo por el path
//         if (path.includes('.controller.')) type = 'controller';
//         else if (path.includes('.service.')) type = 'service';
//         else if (path.includes('.entity.')) type = 'entity';
//         else if (path.includes('.dto.')) type = 'dto';
//         else if (path.includes('.guard.')) type = 'guard';
//         else if (path.includes('.filter.')) type = 'filter';
//         else if (path.includes('.strategy.')) type = 'strategy';
//       }
    
//       return { path, content, type };
//     }
    

//     private fixJson(text: string): string {
//       if (typeof text !== 'string') {
//         this.logger.warn('fixJson recibió un tipo no string:', typeof text);
//         return JSON.stringify({
//           modules: [],
//           commonFiles: [],
//           cliCommands: []
//         });
//       }
    
//       // Limpiar el texto de marcadores y espacios
//       let content = text
//         .replace(/```[a-z]*\s*/g, '')
//         .replace(/```\s*/g, '')
//         .replace(/\r\n/g, '\n')
//         .trim();
    
//       try {
//         // Intentar parsear primero
//         JSON.parse(content);
//         return content;
//       } catch (error) {
//         // Si falla, aplicar reparaciones
//         return this.repairJsonString(content);
//       }
//     }    

//     private validateAngularStructure(data: any): AngularFrontend {
//       // Asegurar que tenemos la estructura básica
//       const result: AngularFrontend = {
//         modules: [],
//         commonFiles: [],
//         cliCommands: []
//       };
    
//       // Validar y procesar módulos
//       if (Array.isArray(data.modules)) {
//         result.modules = data.modules
//           .filter(module => module && typeof module === 'object')
//           .map(module => ({
//             name: String(module?.name || '').trim() || 'unnamed-module',
//             files: Array.isArray(module?.files) 
//               ? module.files
//                   .filter(file => file && typeof file === 'object')
//                   .map(file => ({
//                     path: String(file?.path || '').trim() || 'unknown.ts',
//                     content: String(file?.content || '').trim(),
//                     type: this.validateAngularFileType(file?.type, String(file?.path || ''))
//                   }))
//               : [],
//             cliCommands: Array.isArray(module?.cliCommands)
//               ? module.cliCommands.map(cmd => String(cmd).trim())
//               : []
//           }));
//       }
    
//       // Validar y procesar archivos comunes
//       if (Array.isArray(data.commonFiles)) {
//         result.commonFiles = data.commonFiles
//           .filter(file => file && typeof file === 'object')
//           .map(file => ({
//             path: String(file?.path || '').trim() || 'unknown.ts',
//             content: String(file?.content || '').trim(),
//             type: this.validateAngularFileType(file?.type, String(file?.path || ''))
//           }));
//       }
    
//       // Validar y procesar comandos CLI
//       if (Array.isArray(data.cliCommands)) {
//         result.cliCommands = data.cliCommands
//           .filter(cmd => cmd)
//           .map(cmd => String(cmd).trim());
//       }
    
//       return result;
//     }    

    
//     private processAngularJsonResponse(text: any): AngularFrontend {
//       try {
//         // 1. Validar el tipo de entrada
//         if (typeof text === 'object' && text !== null) {
//           // Ya es un objeto, solo necesitamos validarlo
//           return this.validateAngularStructure(text);
//         }
    
//         // 2. Si es string, procesarlo
//         if (typeof text === 'string') {
//           const fixedJson = this.fixJson(text);
//           const parsed = JSON.parse(fixedJson);
//           return this.validateAngularStructure(parsed);
//         }
    
//         // 3. Si no es ni objeto ni string, usar estructura por defecto
//         this.logger.warn('Tipo de entrada no válido, usando estructura por defecto');
//         return this.getDefaultFrontendStructure();
//       } catch (error) {
//         this.logger.error('Error procesando JSON Angular:', error);
//         this.logger.debug('Texto original:', text);
//         return this.getDefaultFrontendStructure();
//       }
//     }
    
//     private validateNestJSFileType(type: string | undefined, path: string): NestJSFileType {
//       const validTypes: NestJSFileType[] = [
//         'controller',
//         'service',
//         'entity',
//         'dto',
//         'module',
//         'config',
//         'filter',
//         'guard',
//         'strategy'
//       ];
    
//       if (typeof type === 'string' && validTypes.includes(type as NestJSFileType)) {
//         return type as NestJSFileType;
//       }
    
//       // Inferir tipo del path
//       if (path.includes('.controller.')) return 'controller';
//       if (path.includes('.service.')) return 'service';
//       if (path.includes('.entity.')) return 'entity';
//       if (path.includes('.dto.')) return 'dto';
//       if (path.includes('.guard.')) return 'guard';
//       if (path.includes('.filter.')) return 'filter';
//       if (path.includes('.strategy.')) return 'strategy';
//       if (path.includes('.config.')) return 'config';
    
//       return 'module';
//     }
    
//     private validateAngularFileType(type: string | undefined, path: string): AngularFileType {
//       const validTypes: AngularFileType[] = [
//         'component',
//         'service',
//         'module',
//         'guard',
//         'interceptor',
//         'model',
//         'interface',
//         'config',
//         'material',
//         'class'
//       ];
    
//       if (typeof type === 'string' && validTypes.includes(type as AngularFileType)) {
//         return type as AngularFileType;
//       }
    
//       // Inferir tipo del path
//       if (path.includes('.component.')) return 'component';
//       if (path.includes('.service.')) return 'service';
//       if (path.includes('.guard.')) return 'guard';
//       if (path.includes('.interceptor.')) return 'interceptor';
//       if (path.includes('.interface.') || path.includes('.model.')) return 'model';
//       if (path.includes('.module.')) return 'module';
//       if (path.includes('material')) return 'material';
    
//       return 'component';
//     }






    


//     private processAngularFile(file: any): AngularFile {
//       if (!file || typeof file !== 'object') {
//         return {
//           path: 'unknown/path.ts',
//           content: '',
//           type: 'component'
//         };
//       }
    
//       const path = typeof file.path === 'string' ? file.path.trim() : 'unknown/path.ts';
//       const content = typeof file.content === 'string' ? this.normalizeString(file.content) : '';
//       const type = this.normalizeAngularType(String(file.type || ''), path);
    
//       return { path, content, type };
//     }
    
//     private processAngularModule(module: any): AngularModule {
//       return {
//         name: typeof module?.name === 'string' ? module.name.trim() : 'unnamed-module',
//         files: Array.isArray(module?.files) 
//           ? module.files.map(file => this.processAngularFile(file))
//           : [],
//         cliCommands: Array.isArray(module?.cliCommands)
//           ? module.cliCommands.map(cmd => String(cmd).trim())
//           : []
//       };
//     }
    


    
    

//   private cleanJsonText(text: string): string {
//     return text
//       .replace(/```[a-z]*\s*/g, '')
//       .replace(/```/g, '')
//       .replace(/\\`/g, '`')
//       .replace(/\r\n/g, '\n')
//       .trim();
//   }

//   private normalizeAngularType(type: string, path: string): AngularFileType {
//     const validTypes: AngularFileType[] = [
//       'component',
//       'service',
//       'module',
//       'guard',
//       'interceptor',
//       'model',
//       'interface',
//       'config',
//       'material',
//       'class'
//     ];

//     const normalizedType = type.toLowerCase() as AngularFileType;
//     if (validTypes.includes(normalizedType)) {
//       return normalizedType;
//     }

//     // Mapeo inteligente basado en el path
//     if (path.includes('.service.')) return 'service';
//     if (path.includes('.guard.')) return 'guard';
//     if (path.includes('.interceptor.')) return 'interceptor';
//     if (path.includes('.interface.') || path.includes('.model.')) return 'model';
//     if (path.includes('.module.')) return 'module';
//     if (path.includes('material')) return 'material';

//     return 'component';
//   }
//     private validateAngularFrontend(frontend: AngularFrontend): void {
//       // 1. Validar estructura básica
//       if (!frontend || typeof frontend !== 'object') {
//         throw new Error('Estructura AngularFrontend inválida');
//       }
    
//       // 2. Validar módulos
//       if (!Array.isArray(frontend.modules)) {
//         throw new Error('Los módulos deben ser un array');
//       }
    
//       // 3. Validar archivos comunes
//       if (!Array.isArray(frontend.commonFiles)) {
//         throw new Error('Los archivos comunes deben ser un array');
//       }
    
//       // 4. Validar comandos CLI
//       if (!Array.isArray(frontend.cliCommands)) {
//         throw new Error('Los comandos CLI deben ser un array');
//       }
    
//       // 5. Validar que al menos haya un módulo o archivo común
//       if (frontend.modules.length === 0 && frontend.commonFiles.length === 0) {
//         throw new Error('Debe haber al menos un módulo o archivo común');
//       }
    
//       // 6. Validar que cada módulo tenga un nombre único
//       const moduleNames = new Set();
//       frontend.modules.forEach(module => {
//         if (moduleNames.has(module.name)) {
//           throw new Error(`Nombre de módulo duplicado: ${module.name}`);
//         }
//         moduleNames.add(module.name);
//       });
    
//       // 7. Validar que las rutas de archivos sean únicas
//       const filePaths = new Set();
//       const checkFilePath = (path: string) => {
//         if (filePaths.has(path)) {
//           throw new Error(`Ruta de archivo duplicada: ${path}`);
//         }
//         filePaths.add(path);
//       };
    
//       frontend.modules.forEach(module => {
//         module.files.forEach(file => checkFilePath(file.path));
//       });
//       frontend.commonFiles.forEach(file => checkFilePath(file.path));
//     }



    
//     private processNestJSModule(module: any, validTypes: NestJSFileType[]): NestJSModule {
//       return {
//         name: typeof module?.name === 'string' ? module.name.trim() : 'unnamed-module',
//         files: Array.isArray(module?.files)
//           ? module.files.map(file => this.processNestJSFile(file, validTypes))
//           : [],
//         cliCommands: Array.isArray(module?.cliCommands)
//           ? module.cliCommands.map(cmd => String(cmd).trim())
//           : []
//       };
//     }
    



//     private validateNestJSFile(file: any): NestJSFile {
//       const validTypes: NestJSFileType[] = [
//         'controller',
//         'service',
//         'entity',
//         'dto',
//         'module',
//         'config',
//         'filter',
//         'guard',
//         'strategy'
//       ];
  
//       return {
//         path: String(file.path || ''),
//         content: String(file.content || '').trim(),
//         type: validTypes.includes(file.type as NestJSFileType) ? 
//           file.type as NestJSFileType : 
//           'module'
//       };
//     }

    
//     private validateAngularGeneratedCode(code: any): AngularFrontend {
//       if (!code || typeof code !== 'object') {
//         throw new Error('El código generado debe ser un objeto');
//       }
    
//       const validatedCode: AngularFrontend = {
//         modules: Array.isArray(code.modules) ? code.modules.map(module => ({
//           name: String(module.name || ''),
//           files: (module.files || []).map(file => ({
//             path: String(file.path || ''),
//             content: String(file.content || '').trim(),
//             type: (file.type as AngularFileType) || 'component'
//           })),
//           cliCommands: Array.isArray(module.cliCommands) ? module.cliCommands.map(String) : []
//         })) : [],
//         commonFiles: Array.isArray(code.commonFiles) ? code.commonFiles.map(file => ({
//           path: String(file.path || ''),
//           content: String(file.content || '').trim(),
//           type: (file.type as AngularFileType) || 'component'
//         })) : [],
//         cliCommands: Array.isArray(code.cliCommands) ? code.cliCommands.map(String) : []
//       };
    
//       return validatedCode;
//     }
    

    
//     private validateGeneratedCode(code: any) {
//       // Validación más robusta
//       if (!code || typeof code !== 'object') {
//         throw new Error('El código generado debe ser un objeto');
//       }
  
//       // Asegurar propiedades necesarias
//       code.modules = Array.isArray(code.modules) ? code.modules : [];
//       code.commonFiles = Array.isArray(code.commonFiles) ? code.commonFiles : [];
//       code.cliCommands = Array.isArray(code.cliCommands) ? code.cliCommands : [];
  
//       // Validar módulos
//       code.modules.forEach(module => {
//         if (!module || typeof module !== 'object') {
//           throw new Error('Cada módulo debe ser un objeto');
//         }
  
//         if (!Array.isArray(module.files)) {
//           module.files = [];
//         }
  
//         if (!Array.isArray(module.cliCommands)) {
//           module.cliCommands = [];
//         }
  
//         // Validar archivos
//         module.files.forEach(file => {
//           if (!file || typeof file !== 'object') {
//             throw new Error('Cada archivo debe ser un objeto');
//           }
  
//           if (!file.path || typeof file.path !== 'string') {
//             throw new Error('Cada archivo debe tener una ruta válida');
//           }
  
//           if (!file.content || typeof file.content !== 'string') {
//             file.content = '';
//           }
  
//           file.content = file.content.trim();
//         });
//       });
  
//       return code;
//     }



//     private async analyzeIEEE830(requirements: string): Promise<IEEE830Requirement[]> {
//       try {
//         const prompt = `
//         GENERA UN JSON VÁLIDO CON ESTE FORMATO EXACTO para los requerimientos IEEE 830:
//         {
//           "requirements": [
//             {
//               "id": "REQ-001",
//               "type": "functional",
//               "description": "descripción corta y clara",
//               "priority": "high",
//               "dependencies": []
//             }
//           ]
//         }
    
//         REGLAS:
//         1. SOLO responde con el JSON
//         2. NO agregues texto adicional ni markdown
//         3. Los tipos válidos son: "functional" o "non-functional"
//         4. Las prioridades válidas son: "high", "medium", "low"
//         5. Las descripciones deben ser claras y concisas
//         6. Los IDs deben seguir el formato REQ-XXX
    
//         REQUERIMIENTOS:
//         ${requirements}`;
    
//         const result = await this.model.generateContent([
//           { text: prompt }
//         ]);
    
//         const response = result.response.text();
//         let cleaned = response
//           .replace(/```json\s*/g, '')
//           .replace(/```\s*/g, '')
//           .trim();
    
//         // Encontrar el JSON
//         const start = cleaned.indexOf('{');
//         const end = cleaned.lastIndexOf('}');
        
//         if (start === -1 || end === -1) {
//           throw new Error('No se encontró un JSON válido en la respuesta');
//         }
    
//         cleaned = cleaned.substring(start, end + 1);
    
//         // Intentar parsear
//         const parsed = JSON.parse(cleaned);
    
//         // Validar estructura
//         if (!parsed.requirements || !Array.isArray(parsed.requirements)) {
//           throw new Error('La respuesta no contiene un array de requerimientos');
//         }
    
//         // Validar y limpiar cada requerimiento
//         const validatedRequirements = parsed.requirements.map((req, index) => ({
//           id: req.id?.match(/^REQ-\d{3}$/) ? req.id : `REQ-${String(index + 1).padStart(3, '0')}`,
//           type: ['functional', 'non-functional'].includes(req.type) ? req.type : 'functional',
//           description: (req.description || 'No description provided').trim(),
//           priority: ['high', 'medium', 'low'].includes(req.priority) ? req.priority : 'medium',
//           dependencies: Array.isArray(req.dependencies) ? req.dependencies : []
//         }));
    
//         return validatedRequirements;
//       } catch (error) {
//         this.logger.error('Error en analyzeIEEE830:', error);
//         return [{
//           id: 'REQ-001',
//           type: 'functional',
//           description: 'Requerimiento general del sistema',
//           priority: 'high',
//           dependencies: []
//         }];
//       }
//     }



//   private async generateAllDiagrams(
//     originalRequirements: string,
//     ieee830Requirements: IEEE830Requirement[]
//   ): Promise<MermaidDiagram[]> {
//     const diagramTypes: DiagramType[] = [
//       'classDiagram',
//       'sequenceDiagram',
//       'useCaseDiagram',
//       'componentDiagram',
//       'packageDiagram'
//     ];

//     const diagrams = await Promise.all(
//       diagramTypes.map(type => 
//         this.generateMermaidDiagram(type, originalRequirements, ieee830Requirements)
//       )
//     );

//     return diagrams.filter(d => d !== null);
//   }

//   private async generateMermaidDiagram(
//     type: DiagramType,
//     originalRequirements: string,
//     ieee830Requirements: IEEE830Requirement[]
//   ): Promise<MermaidDiagram | null> {
//     try {
//       const prompt = this.buildMermaidPrompt(type, originalRequirements, ieee830Requirements);
      
//       const response = await this.retryOperation(async () => {
//         const result = await this.model.generateContent([{ text: prompt }]);
//         return result.response.text();
//       });
  
//       const mermaidCode = this.extractMermaidCode(response, type);
//       const validatedCode = this.validateMermaidCode(mermaidCode, type);
  
//       return {
//         type,
//         title: this.getDiagramTitle(type),
//         code: validatedCode
//       };
//     } catch (error) {
//       this.logger.error(`Error generando diagrama ${type}:`, error);
//       return null;
//     }
//   }

//   private buildMermaidPrompt(
//     type: DiagramType, 
//     originalRequirements: string,
//     ieee830Requirements: IEEE830Requirement[]
//   ): string {
//     const templates = {
//       classDiagram: `classDiagram
//     class Usuario {
//         +nombre: String
//         +email: String
//         +password: String
//         +registrar()
//         +login()
//         +crearProyecto()
//     }
//     class Proyecto {
//         +titulo: String
//         +descripcion: String
//         +fechaCreacion: Date
//         +crear()
//         +asignarTarea()
//         +obtenerTareas()
//     }
//     class Tarea {
//         +titulo: String
//         +descripcion: String
//         +estado: String
//         +fechaLimite: Date
//         +actualizarEstado()
//         +obtenerDetalles()
//     }
//     Usuario "1" --> "*" Proyecto : crea
//     Proyecto "1" --> "*" Tarea : contiene`,

//       sequenceDiagram: `sequenceDiagram
//     actor U as Usuario
//     participant S as Sistema
//     participant BD as BaseDatos

//     U->>S: Solicita registro
//     S-->>U: Formulario registro
//     U->>S: Envía datos
//     S->>BD: Valida datos
//     BD-->>S: Datos válidos
//     S-->>U: Registro exitoso

//     U->>S: Solicita login
//     S-->>U: Formulario login
//     U->>S: Envía credenciales
//     S->>BD: Verifica credenciales
//     BD-->>S: Credenciales válidas
//     S-->>U: Acceso concedido`,

//       useCaseDiagram: `graph TD
//     Usuario((Usuario))
//     CU1[Registrarse]
//     CU2[Iniciar Sesión]
//     CU3[Crear Proyecto]
//     CU4[Gestionar Tareas]
//     CU5[Asignar Tareas]
//     CU6[Actualizar Estado]
    
//     Usuario-->CU1
//     Usuario-->CU2
//     Usuario-->CU3
//     Usuario-->CU4
//     CU4-->CU5
//     CU4-->CU6`,

//       componentDiagram: `graph TD
//     subgraph Frontend
//         UI[Interfaz Usuario]
//         Auth[Autenticación]
//         PM[Gestión Proyectos]
//         TM[Gestión Tareas]
//     end
    
//     subgraph Backend
//         API[API REST]
//         Srv[Servicios]
//         DB[(Base Datos)]
//     end
    
//     UI --> Auth
//     UI --> PM
//     UI --> TM
//     Auth --> API
//     PM --> API
//     TM --> API
//     API --> Srv
//     Srv --> DB`,

// packageDiagram: `graph TD
//     subgraph Presentacion
//         Views[Vistas]
//         Components[Componentes]
//         State[Estado]
//     end
    
//     subgraph Dominio
//         Usuarios[Usuarios]
//         Proyectos[Proyectos]
//         Tareas[Tareas]
//     end
    
//     subgraph Datos
//         RepoUsuarios[Repositorio_Usuarios]
//         RepoProyectos[Repositorio_Proyectos]
//         RepoTareas[Repositorio_Tareas]
//     end
    
//     Presentacion --> Dominio
//     Dominio --> Datos`,
//     };

//     const rules = {
//       classDiagram: `REGLAS:
// - Inicia con 'classDiagram'
// - Define clases usando: class NombreClase
// - Atributos: +nombre: tipo
// - Métodos: +nombre()
// - Relaciones: --> para asociación
// - Cardinalidad: "1" --> "*"`,
      
//       sequenceDiagram: `REGLAS:
// - Inicia con 'sequenceDiagram'
// - Define: actor A as Usuario
// - Flechas: ->> para solicitud
// - Flechas: -->> para respuesta
// - Mantén el orden cronológico`,
      
//       useCaseDiagram: `REGLAS:
// - Inicia con 'graph TD'
// - Actor: Usuario((nombre))
// - Casos: CU[nombre]
// - Conexiones: -->`,
      
//       componentDiagram: `REGLAS:
// - Inicia con 'graph TD'
// - Usa subgraph para módulos
// - Componentes: [nombre]
// - Base datos: [(nombre)]
// - Conexiones: -->`,
      
//       packageDiagram: `REGLAS:
// - Inicia con 'graph TD'
// - Define subgraph para capas
// - Elementos: [nombre]
// - Conexiones: -->`
//     };

//     return `
// Genera un diagrama Mermaid de tipo ${type} para estos requerimientos:

// ${originalRequirements}

// ${rules[type]}

// Usa EXACTAMENTE esta estructura base (solo cambia el contenido, no la sintaxis):

// ${templates[type]}

// IMPORTANTE:
// 1. NO incluyas explicaciones ni comentarios
// 2. El diagrama DEBE empezar con la declaración correcta
// 3. Mantén la identación y formato exactos
// 4. Usa solo caracteres ASCII
// `;
//   }

//   private validateMermaidCode(code: string, type: DiagramType): string {
//     const startTokens = {
//       classDiagram: 'classDiagram',
//       sequenceDiagram: 'sequenceDiagram',
//       useCaseDiagram: 'graph TD',
//       componentDiagram: 'graph TD',
//       packageDiagram: 'graph TD'
//     };
  
//     const requiredElements = {
//       classDiagram: ['class'],  // Simplificamos los requerimientos
//       sequenceDiagram: ['actor'], // Solo requerimos el actor
//       useCaseDiagram: ['[', ']'],
//       componentDiagram: ['subgraph'],
//       packageDiagram: ['subgraph']
//     };
  
//     // Verificar inicio correcto
//     if (!code.startsWith(startTokens[type])) {
//       code = startTokens[type] + '\n' + code;
//     }
  
//     // Verificar elementos requeridos
//     const elements = requiredElements[type];
//     if (elements && !elements.some(elem => code.includes(elem))) { // Cambiamos every por some
//       this.logger.warn(`Advertencia: Pueden faltar elementos en el diagrama ${type}`);
//       // No lanzamos error, solo advertimos
//     }
  
//     // Limpiar formato
//     code = code.split('\n')
//                .map(line => line.trimRight())
//                .join('\n')
//                .trim();
  
//     return code;
//   }

//   private extractMermaidCode(text: string, type: DiagramType): string {
//     try {
//       // Limpiar markdown y espacios
//       let code = text.replace(/```mermaid\n?/g, '')
//                     .replace(/```\n?/g, '')
//                     .replace(/\r\n/g, '\n')
//                     .trim();

//       // Extraer el código del diagrama
//       const startToken = type === 'classDiagram' ? 'classDiagram' :
//                         type === 'sequenceDiagram' ? 'sequenceDiagram' : 
//                         'graph TD';
                        
//       const startIndex = code.indexOf(startToken);
//       if (startIndex === -1) {
//         throw new Error(`No se encontró el inicio del diagrama ${type}`);
//       }

//       code = code.substring(startIndex);

//       // Validar estructura básica
//       const hasOpenBraces = code.includes('{');
//       const hasCloseBraces = code.includes('}');
//       if (type === 'classDiagram' && hasOpenBraces !== hasCloseBraces) {
//         throw new Error('Las llaves no están balanceadas');
//       }

//       return code;
//     } catch (error) {
//       this.logger.error('Error procesando código Mermaid:', error);
//       throw new Error(`Error en la sintaxis del diagrama: ${error.message}`);
//     }
//   }

//   private getDiagramTitle(type: DiagramType): string {
//     const titles = {
//       classDiagram: 'Diagrama de Clases',
//       sequenceDiagram: 'Diagrama de Secuencia',
//       useCaseDiagram: 'Diagrama de Casos de Uso',
//       componentDiagram: 'Diagrama de Componentes',
//       packageDiagram: 'Diagrama de Paquetes'
//     };
//     return titles[type];
//   }






//   private buildCodePrompt(diagrams: MermaidDiagram[]): string {
//     const classDiagram = diagrams.find(d => d.type === 'classDiagram');
//     const sequenceDiagram = diagrams.find(d => d.type === 'sequenceDiagram');
//     const useCaseDiagram = diagrams.find(d => d.type === 'useCaseDiagram');
//     const componentDiagram = diagrams.find(d => d.type === 'componentDiagram');
//     const packageDiagram = diagrams.find(d => d.type === 'packageDiagram');

//     return `
// Genera un proyecto completo con NestJS (backend) y Angular (frontend) basado en estos diagramas UML.
// Proporciona el código completo y los comandos CLI necesarios.

// IMPORTANTE: El código debe estar en un JSON válido. Usa comillas simples para el contenido de los archivos.

// DIAGRAMAS:

// Diagrama de Clases:
// ${classDiagram?.code}

// Diagrama de Secuencia:
// ${sequenceDiagram?.code}

// Diagrama de Casos de Uso:
// ${useCaseDiagram?.code}

// Diagrama de Componentes:
// ${componentDiagram?.code}

// Diagrama de Paquetes:
// ${packageDiagram?.code}

// GENERA UN JSON CON ESTA ESTRUCTURA:
// {
//   "backend": {
//     "modules": [
//       {
//         "name": "users",
//         "files": [
//           {
//             "path": "src/users/user.controller.ts",
//             "content": "import { Controller } from '@nestjs/common';\\n\\n@Controller('users')\\nexport class UserController {}",
//             "type": "controller"
//           }
//         ],
//         "cliCommands": ["nest g module users"]
//       }
//     ],
//     "commonFiles": [
//       {
//         "path": "src/app.module.ts",
//         "content": "import { Module } from '@nestjs/common';\\n\\n@Module({})\\nexport class AppModule {}",
//         "type": "module"
//       }
//     ],
//     "cliCommands": ["nest new backend"]
//   }
// }

// REGLAS IMPORTANTES:
// 1. Use comillas dobles (") para las claves JSON
// 2. Use comillas dobles (") para los valores de content
// 3. Use \\n para saltos de línea
// 4. Use \\t para tabulaciones
// 5. Escape las comillas dentro del código con \\
// 6. NO use backticks (´) ni comillas simples (')
// 7. El JSON debe ser válido y completo

// REGLAS DE FORMATO:
// 1. Todo el código debe estar dentro de comillas simples
// 2. NO uses backticks en ningún lugar
// 3. Usa \\n para saltos de línea
// 4. Escapa las comillas simples con \\
// 5. Estructura el JSON exactamente así:
// {
//   "modules": [
//     {
//       "name": "nombre-modulo",
//       "files": [
//         {
//           "path": "ruta/archivo",
//           "content": 'código aquí con comillas simples escapadas',
//           "type": "tipo-archivo"
//         }
//       ]
//     }
//   ]
// }

//   REGLAS JSON:
//   1. USA SIEMPRE comillas simples (') para el contenido de los archivos
//   2. NO uses backticks (´) en ningún lugar
//   3. Escapa las comillas simples dentro del código con \\
//   4. Usa \\n para saltos de línea
//   5. El JSON debe ser válido y parseable
//   ;

// REQUISITOS BACKEND (NestJS):
// - Usa TypeORM para las entidades
// - Implementa JWT para autenticación
// - Incluye validación con class-validator
// - Agrega documentación Swagger
// - Implementa manejo de errores
// - Usa DTO para las peticiones
// - Configura CORS

// REQUISITOS FRONTEND (Angular):
// - Usa Angular Material
// - Implementa formularios reactivos
// - Agrega interceptores HTTP
// - Usa lazy loading
// - Implementa guards para rutas
// - Usa servicios y observables
// - Agrega manejo de errores
// - Incluye interfaces TypeScript

// IMPORTANTE:
// 1. Genera código TypeScript completo y funcional
// 2. Incluye todas las importaciones necesarias
// 3. Usa decoradores correctamente
// 4. Implementa las relaciones entre entidades
// 5. Agrega validaciones y manejo de errores
// 6. Genera estructura de carpetas clara
// 7. Incluye archivos de configuración
// 8. Proporciona comandos CLI necesarios`;
//   }
// }