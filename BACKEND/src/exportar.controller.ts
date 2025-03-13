import { Controller, Get, Res, Logger } from '@nestjs/common';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import * as archiver from 'archiver';
import { CodeStorageService } from './code-storage.service';

@Controller('api/exportar')
export class ExportarController {
  private readonly logger = new Logger(ExportarController.name);

  constructor(private codeStorageService: CodeStorageService) {}

  @Get('codigo')
  async exportarCodigo(@Res() res: Response): Promise<void> {
    // Verificar si hay código generado
    const codigoGenerado = this.codeStorageService.obtenerUltimoCodigoGenerado();
    if (!codigoGenerado) {
      res.status(404).json({ mensaje: 'No hay código generado para exportar' });
      return; // Añade return para evitar el error TS2322
    }

    // Crear directorios temporales
    const dirTemp = path.join(process.cwd(), 'temp-export');
    const dirBackend = path.join(dirTemp, 'proyecto-generado-backend');
    const dirFrontend = path.join(dirTemp, 'proyecto-generado-frontend');
    
    // Crear directorios temporales
    if (!fs.existsSync(dirTemp)) fs.mkdirSync(dirTemp, { recursive: true });
    if (!fs.existsSync(dirBackend)) fs.mkdirSync(dirBackend, { recursive: true });
    if (!fs.existsSync(dirFrontend)) fs.mkdirSync(dirFrontend, { recursive: true });
    
    try {
      // Función para asegurar que un directorio existe
      const asegurarDirectorioExiste = (rutaArchivo: string) => {
        const dirname = path.dirname(rutaArchivo);
        if (!fs.existsSync(dirname)) {
          fs.mkdirSync(dirname, { recursive: true });
        }
      };
      
      // Escribir archivos del backend
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
        let scriptConfiguracionBackend = '#!/bin/bash\n\n';
        scriptConfiguracionBackend += '# Script de configuración para el backend NestJS\n';
        scriptConfiguracionBackend += '# Generado por la herramienta UML-to-Code\n\n';
        
        if (codigoGenerado.backend.cliCommands && codigoGenerado.backend.cliCommands.length > 0) {
          scriptConfiguracionBackend += '# Comandos de configuración del proyecto\n';
          for (const cmd of codigoGenerado.backend.cliCommands) {
            scriptConfiguracionBackend += `${cmd}\n`;
          }
          scriptConfiguracionBackend += '\n';
        } else {
          // Si no hay comandos CLI, agregar al menos la instalación de dependencias
          scriptConfiguracionBackend += '# Comandos de configuración del proyecto\n';
          scriptConfiguracionBackend += 'npm install\n\n';
        }
        
        // Añadir comandos para iniciar el backend
        scriptConfiguracionBackend += '# Iniciar el backend\n';
        scriptConfiguracionBackend += 'npm run start:dev\n';
        
        const rutaScript = path.join(dirBackend, 'configurar.sh');
        fs.writeFileSync(rutaScript, scriptConfiguracionBackend);
      }
      
      // Escribir archivos del frontend
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
        let scriptConfiguracionFrontend = '#!/bin/bash\n\n';
        scriptConfiguracionFrontend += '# Script de configuración para el frontend Angular\n';
        scriptConfiguracionFrontend += '# Generado por la herramienta UML-to-Code\n\n';
        
        if (codigoGenerado.frontend.cliCommands && codigoGenerado.frontend.cliCommands.length > 0) {
          scriptConfiguracionFrontend += '# Comandos de configuración del proyecto\n';
          for (const cmd of codigoGenerado.frontend.cliCommands) {
            scriptConfiguracionFrontend += `${cmd}\n`;
          }
          scriptConfiguracionFrontend += '\n';
        } else {
          // Si no hay comandos CLI, agregar al menos la instalación de dependencias
          scriptConfiguracionFrontend += '# Comandos de configuración del proyecto\n';
          scriptConfiguracionFrontend += 'npm install\n\n';
        }
        
        // Añadir comandos para iniciar el frontend
        scriptConfiguracionFrontend += '# Iniciar el frontend\n';
        scriptConfiguracionFrontend += 'ng serve\n';
        
        const rutaScript = path.join(dirFrontend, 'configurar.sh');
        fs.writeFileSync(rutaScript, scriptConfiguracionFrontend);
      }
      
      // Crear README principal
      const rutaReadme = path.join(dirTemp, 'README.md');
      let contenidoReadme = '# Proyecto Generado UML-to-Code\n\n';
      contenidoReadme += 'Este proyecto fue generado automáticamente a partir de diagramas UML.\n\n';
      
      contenidoReadme += '## Estructura del Proyecto\n\n';
      contenidoReadme += '- `proyecto-generado-backend/`: Proyecto backend NestJS\n';
      contenidoReadme += '- `proyecto-generado-frontend/`: Proyecto frontend Angular\n\n';
      
      contenidoReadme += '## Instrucciones de Configuración\n\n';
      contenidoReadme += '### Backend (NestJS)\n\n';
      contenidoReadme += '1. Navega al directorio del backend: `cd proyecto-generado-backend`\n';
      contenidoReadme += '2. Haz el script de configuración ejecutable: `chmod +x configurar.sh`\n';
      contenidoReadme += '3. Ejecuta el script de configuración: `./configurar.sh`\n\n';
      
      contenidoReadme += '### Frontend (Angular)\n\n';
      contenidoReadme += '1. Navega al directorio del frontend: `cd proyecto-generado-frontend`\n';
      contenidoReadme += '2. Haz el script de configuración ejecutable: `chmod +x configurar.sh`\n';
      contenidoReadme += '3. Ejecuta el script de configuración: `./configurar.sh`\n\n';
      
      fs.writeFileSync(rutaReadme, contenidoReadme);
      
      // Crear un archivo ZIP
      const archivo = archiver('zip', {
        zlib: { level: 9 } // Máxima compresión
      });
      
      const rutaZip = path.join(process.cwd(), 'proyecto-exportado.zip');
      const output = fs.createWriteStream(rutaZip);
      
      output.on('close', () => {
        this.logger.log(`Archivo creado: ${archivo.pointer()} bytes`);
        
        // Enviar el archivo
        res.download(rutaZip, 'proyecto-generado.zip', (err) => {
          if (err) {
            this.logger.error(`Error enviando zip: ${err.message}`);
          }
          
          // Limpieza
          try {
            fs.unlinkSync(rutaZip);
            this.limpiarDirTemp(dirTemp);
          } catch (errorLimpieza) {
            this.logger.error(`Error de limpieza: ${errorLimpieza.message}`);
          }
        });
      });
      
      archivo.on('error', (err) => {
        this.logger.error(`Error de archivo: ${err.message}`);
        res.status(500).send({ error: 'Error al crear el archivo' });
        this.limpiarDirTemp(dirTemp);
      });
      
      archivo.pipe(output);
      archivo.directory(dirTemp, false);
      archivo.finalize();
      
    } catch (error) {
      this.logger.error(`Error de exportación: ${error.message}`);
      res.status(500).send({ error: 'Error al exportar código' });
      this.limpiarDirTemp(dirTemp);
    }
  }
  
  private limpiarDirTemp(dirTemp: string): void {
    try {
      if (fs.existsSync(dirTemp)) {
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
        
        eliminarDirectorioRecursivo(dirTemp);
      }
    } catch (error) {
      this.logger.error(`Error al limpiar: ${error.message}`);
    }
  }
}