// src/gemini/exportar.controller.ts
import { Controller, Get, Res, Logger, Inject } from '@nestjs/common';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import * as archiver from 'archiver';
import { GeneratedCode } from './interfaces/code-generation.interface';

/**
 * Este servicio maneja el almacenamiento del último código generado
 */
export class AlmacenamientoCodigo {
  private codigoGenerado: GeneratedCode | null = null;

  almacenarCodigo(codigo: GeneratedCode): void {
    this.codigoGenerado = codigo;
  }

  obtenerUltimoCodigo(): GeneratedCode | null {
    return this.codigoGenerado;
  }
}

@Controller('api/exportar')
export class ExportarController {
  private readonly logger = new Logger(ExportarController.name);

  constructor(private almacenamientoCodigo: AlmacenamientoCodigo) {}

  @Get('codigo')
  async exportarCodigo(@Res() res: Response): Promise<void> {
    // Verificar si hay código generado
    const codigoGenerado = this.almacenamientoCodigo.obtenerUltimoCodigo();
    if (!codigoGenerado) {
      return res.status(404).json({ mensaje: 'No hay código generado para exportar' });
    }

    // Crear directorios temporales
    const dirTemporal = path.join(process.cwd(), 'temp-export');
    const dirBackend = path.join(dirTemporal, 'proyecto-generado-backend');
    const dirFrontend = path.join(dirTemporal, 'proyecto-generado-frontend');
    
    // Crear directorios temporales
    if (fs.existsSync(dirTemporal)) {
      // Limpiar directorio si existe
      this.limpiarDirectorio(dirTemporal);
    }
    fs.mkdirSync(dirTemporal, { recursive: true });
    fs.mkdirSync(dirBackend, { recursive: true });
    fs.mkdirSync(dirFrontend, { recursive: true });
    
    try {
      // Función para asegurar que el directorio exista
      const asegurarDirectorioExiste = (rutaArchivo: string) => {
        const directorio = path.dirname(rutaArchivo);
        if (!fs.existsSync(directorio)) {
          fs.mkdirSync(directorio, { recursive: true });
        }
      };
      
      // Crear archivos del backend
      if (codigoGenerado.backend) {
        // Escribir archivos comunes
        if (codigoGenerado.backend.commonFiles) {
          for (const archivo of codigoGenerado.backend.commonFiles) {
            const rutaArchivo = path.join(dirBackend, archivo.path);
            asegurarDirectorioExiste(rutaArchivo);
            fs.writeFileSync(rutaArchivo, archivo.content);
          }
        }
        
        // Escribir archivos de módulos
        if (codigoGenerado.backend.modules) {
          for (const modulo of codigoGenerado.backend.modules) {
            for (const archivo of modulo.files) {
              const rutaArchivo = path.join(dirBackend, archivo.path);
              asegurarDirectorioExiste(rutaArchivo);
              fs.writeFileSync(rutaArchivo, archivo.content);
            }
          }
        }
        
        // Crear script de configuración
        let scriptBackend = '#!/bin/bash\n\n';
        scriptBackend += '# Script de configuración para backend NestJS\n';
        scriptBackend += '# Generado por la herramienta UML-to-Code\n\n';
        
        if (codigoGenerado.backend.cliCommands && codigoGenerado.backend.cliCommands.length > 0) {
          scriptBackend += '# Comandos de configuración del proyecto\n';
          for (const cmd of codigoGenerado.backend.cliCommands) {
            scriptBackend += `${cmd}\n`;
          }
          scriptBackend += '\n';
        }
        
        const rutaScriptBackend = path.join(dirBackend, 'configurar.sh');
        fs.writeFileSync(rutaScriptBackend, scriptBackend);
      }
      
      // Crear archivos del frontend
      if (codigoGenerado.frontend) {
        // Escribir archivos comunes
        if (codigoGenerado.frontend.commonFiles) {
          for (const archivo of codigoGenerado.frontend.commonFiles) {
            const rutaArchivo = path.join(dirFrontend, archivo.path);
            asegurarDirectorioExiste(rutaArchivo);
            fs.writeFileSync(rutaArchivo, archivo.content);
          }
        }
        
        // Escribir archivos de módulos
        if (codigoGenerado.frontend.modules) {
          for (const modulo of codigoGenerado.frontend.modules) {
            for (const archivo of modulo.files) {
              const rutaArchivo = path.join(dirFrontend, archivo.path);
              asegurarDirectorioExiste(rutaArchivo);
              fs.writeFileSync(rutaArchivo, archivo.content);
            }
          }
        }
        
        // Crear script de configuración
        let scriptFrontend = '#!/bin/bash\n\n';
        scriptFrontend += '# Script de configuración para Angular frontend\n';
        scriptFrontend += '# Generado por la herramienta UML-to-Code\n\n';
        
        if (codigoGenerado.frontend.cliCommands && codigoGenerado.frontend.cliCommands.length > 0) {
          scriptFrontend += '# Comandos de configuración del proyecto\n';
          for (const cmd of codigoGenerado.frontend.cliCommands) {
            scriptFrontend += `${cmd}\n`;
          }
          scriptFrontend += '\n';
        }
        
        const rutaScriptFrontend = path.join(dirFrontend, 'configurar.sh');
        fs.writeFileSync(rutaScriptFrontend, scriptFrontend);
      }
      
      // Crear README principal
      const rutaReadme = path.join(dirTemporal, 'README.md');
      let contenidoReadme = '# Proyecto Generado desde Diagramas UML\n\n';
      contenidoReadme += 'Este proyecto fue generado automáticamente a partir de diagramas UML.\n\n';
      
      contenidoReadme += '## Estructura del Proyecto\n\n';
      contenidoReadme += '- `proyecto-generado-backend/`: Proyecto backend en NestJS\n';
      contenidoReadme += '- `proyecto-generado-frontend/`: Proyecto frontend en Angular\n\n';
      
      contenidoReadme += '## Instrucciones de Configuración\n\n';
      contenidoReadme += '### Backend (NestJS)\n\n';
      contenidoReadme += '1. Navega al directorio del backend: `cd proyecto-generado-backend`\n';
      contenidoReadme += '2. Haz ejecutable el script de configuración: `chmod +x configurar.sh`\n';
      contenidoReadme += '3. Ejecuta el script de configuración: `./configurar.sh`\n\n';
      
      contenidoReadme += '### Frontend (Angular)\n\n';
      contenidoReadme += '1. Navega al directorio del frontend: `cd proyecto-generado-frontend`\n';
      contenidoReadme += '2. Haz ejecutable el script de configuración: `chmod +x configurar.sh`\n';
      contenidoReadme += '3. Ejecuta el script de configuración: `./configurar.sh`\n\n';
      
      fs.writeFileSync(rutaReadme, contenidoReadme);
      
      // Crear archivo ZIP
      const archivador = archiver('zip', {
        zlib: { level: 9 } // Máxima compresión
      });
      
      const rutaZip = path.join(process.cwd(), 'proyecto-exportado.zip');
      const output = fs.createWriteStream(rutaZip);
      
      output.on('close', () => {
        this.logger.log(`Archivo ZIP creado: ${archivador.pointer()} bytes`);
        
        // Enviar el archivo
        res.download(rutaZip, 'proyecto-generado.zip', (err) => {
          if (err) {
            this.logger.error(`Error al enviar el ZIP: ${err.message}`);
          }
          
          // Limpiar
          try {
            fs.unlinkSync(rutaZip);
            this.limpiarDirectorio(dirTemporal);
          } catch (errorLimpieza) {
            this.logger.error(`Error de limpieza: ${errorLimpieza.message}`);
          }
        });
      });
      
      archivador.on('error', (err) => {
        this.logger.error(`Error en el archivador: ${err.message}`);
        res.status(500).send({ error: 'Error al crear el archivo ZIP' });
        this.limpiarDirectorio(dirTemporal);
      });
      
      archivador.pipe(output);
      archivador.directory(dirTemporal, false);
      archivador.finalize();
      
    } catch (error) {
      this.logger.error(`Error en la exportación: ${error.message}`);
      res.status(500).send({ error: 'Error al exportar el código' });
      this.limpiarDirectorio(dirTemporal);
    }
  }
  
  private limpiarDirectorio(dirTemporal: string): void {
    try {
      if (fs.existsSync(dirTemporal)) {
        const eliminarDirectorioRecursivo = (rutaDirectorio: string) => {
          if (fs.existsSync(rutaDirectorio)) {
            fs.readdirSync(rutaDirectorio).forEach((archivo) => {
              const rutaActual = path.join(rutaDirectorio, archivo);
              if (fs.lstatSync(rutaActual).isDirectory()) {
                eliminarDirectorioRecursivo(rutaActual);
              } else {
                fs.unlinkSync(rutaActual);
              }
            });
            fs.rmdirSync(rutaDirectorio);
          }
        };
        
        eliminarDirectorioRecursivo(dirTemporal);
      }
    } catch (error) {
      this.logger.error(`Error en la limpieza: ${error.message}`);
    }
  }
}