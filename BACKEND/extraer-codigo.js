// extractorCodigo.js
const fs = require('fs');
const path = require('path');

/**
 * Extrae el código generado y crea la estructura de proyecto
 * @param {Object} codigoGenerado - El objeto con el código generado para backend y frontend
 */
function extraerCodigo(codigoGenerado) {
  // Definir directorios base
  const dirBackend = 'proyecto-generado-backend';
  const dirFrontend = 'proyecto-generado-frontend';

  // Crear directorios base si no existen
  if (!fs.existsSync(dirBackend)) {
    fs.mkdirSync(dirBackend, { recursive: true });
  }
  if (!fs.existsSync(dirFrontend)) {
    fs.mkdirSync(dirFrontend, { recursive: true });
  }

  // Función para asegurar que el directorio exista
  function asegurarDirectorioExiste(rutaArchivo) {
    const directorio = path.dirname(rutaArchivo);
    if (fs.existsSync(directorio)) {
      return true;
    }
    fs.mkdirSync(directorio, { recursive: true });
  }

  // Procesar archivos del backend
  if (codigoGenerado.backend) {
    console.log('==== Procesando archivos del Backend ====');
    
    // Procesar archivos comunes
    if (codigoGenerado.backend.commonFiles) {
      for (const archivo of codigoGenerado.backend.commonFiles) {
        const rutaArchivo = path.join(dirBackend, archivo.path);
        asegurarDirectorioExiste(rutaArchivo);
        fs.writeFileSync(rutaArchivo, archivo.content);
        console.log(`Archivo backend creado: ${archivo.path}`);
      }
    }

    // Procesar archivos de módulos
    if (codigoGenerado.backend.modules) {
      for (const modulo of codigoGenerado.backend.modules) {
        for (const archivo of modulo.files) {
          const rutaArchivo = path.join(dirBackend, archivo.path);
          asegurarDirectorioExiste(rutaArchivo);
          fs.writeFileSync(rutaArchivo, archivo.content);
          console.log(`Archivo de módulo backend creado: ${archivo.path}`);
        }
      }
    }

    // Crear script de configuración para backend
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
    
    // Agregar comandos específicos de módulo
    if (codigoGenerado.backend.modules) {
      for (const modulo of codigoGenerado.backend.modules) {
        if (modulo.cliCommands && modulo.cliCommands.length > 0) {
          scriptBackend += `# Comandos para el módulo ${modulo.name}\n`;
          for (const cmd of modulo.cliCommands) {
            scriptBackend += `${cmd}\n`;
          }
          scriptBackend += '\n';
        }
      }
    }
    
    // Agregar comandos para iniciar el backend
    scriptBackend += '# Iniciar el backend\n';
    scriptBackend += 'npm run start:dev\n';
    
    const rutaScript = path.join(dirBackend, 'configurar.sh');
    fs.writeFileSync(rutaScript, scriptBackend);
    console.log(`Script de configuración backend creado: configurar.sh`);
    
    // Crear un package.json básico si no existe
    const rutaPackageJson = path.join(dirBackend, 'package.json');
    if (!fs.existsSync(rutaPackageJson)) {
      const packageJson = {
        name: "backend-generado",
        version: "1.0.0",
        description: "Backend NestJS generado automáticamente",
        scripts: {
          "start": "nest start",
          "start:dev": "nest start --watch",
          "build": "nest build",
          "test": "jest"
        },
        dependencies: {
          "@nestjs/common": "^10.0.0",
          "@nestjs/core": "^10.0.0",
          "@nestjs/platform-express": "^10.0.0",
          "@nestjs/typeorm": "^10.0.0",
          "class-transformer": "^0.5.1",
          "class-validator": "^0.14.0",
          "reflect-metadata": "^0.1.13",
          "rxjs": "^7.8.1",
          "typeorm": "^0.3.17"
        },
        devDependencies: {
          "@nestjs/cli": "^10.0.0",
          "@types/express": "^4.17.17",
          "@types/node": "^20.3.1",
          "typescript": "^5.1.3"
        }
      };
      fs.writeFileSync(rutaPackageJson, JSON.stringify(packageJson, null, 2));
      console.log(`package.json básico creado para el backend`);
    }
  }

  // Procesar archivos del frontend
  if (codigoGenerado.frontend) {
    console.log('==== Procesando archivos del Frontend ====');
    
    // Procesar archivos comunes
    if (codigoGenerado.frontend.commonFiles) {
      for (const archivo of codigoGenerado.frontend.commonFiles) {
        const rutaArchivo = path.join(dirFrontend, archivo.path);
        asegurarDirectorioExiste(rutaArchivo);
        fs.writeFileSync(rutaArchivo, archivo.content);
        console.log(`Archivo frontend creado: ${archivo.path}`);
      }
    }

    // Procesar archivos de módulos
    if (codigoGenerado.frontend.modules) {
      for (const modulo of codigoGenerado.frontend.modules) {
        for (const archivo of modulo.files) {
          const rutaArchivo = path.join(dirFrontend, archivo.path);
          asegurarDirectorioExiste(rutaArchivo);
          fs.writeFileSync(rutaArchivo, archivo.content);
          console.log(`Archivo de módulo frontend creado: ${archivo.path}`);
        }
      }
    }

    // Crear script de configuración para frontend
    let scriptFrontend = '#!/bin/bash\n\n';
    scriptFrontend += '# Script de configuración para frontend Angular\n';
    scriptFrontend += '# Generado por la herramienta UML-to-Code\n\n';
    
    if (codigoGenerado.frontend.cliCommands && codigoGenerado.frontend.cliCommands.length > 0) {
      scriptFrontend += '# Comandos de configuración del proyecto\n';
      for (const cmd of codigoGenerado.frontend.cliCommands) {
        scriptFrontend += `${cmd}\n`;
      }
      scriptFrontend += '\n';
    }
    
    // Agregar comandos específicos de módulo
    if (codigoGenerado.frontend.modules) {
      for (const modulo of codigoGenerado.frontend.modules) {
        if (modulo.cliCommands && modulo.cliCommands.length > 0) {
          scriptFrontend += `# Comandos para el módulo ${modulo.name}\n`;
          for (const cmd of modulo.cliCommands) {
            scriptFrontend += `${cmd}\n`;
          }
          scriptFrontend += '\n';
        }
      }
    }
    
    // Agregar comandos para iniciar el frontend
    scriptFrontend += '# Iniciar el frontend\n';
    scriptFrontend += 'ng serve\n';
    
    const rutaScript = path.join(dirFrontend, 'configurar.sh');
    fs.writeFileSync(rutaScript, scriptFrontend);
    console.log(`Script de configuración frontend creado: configurar.sh`);
    
    // Crear un package.json básico si no existe
    const rutaPackageJson = path.join(dirFrontend, 'package.json');
    if (!fs.existsSync(rutaPackageJson)) {
      const packageJson = {
        name: "frontend-generado",
        version: "0.0.0",
        scripts: {
          "ng": "ng",
          "start": "ng serve",
          "build": "ng build",
          "watch": "ng build --watch --configuration development",
          "test": "ng test"
        },
        private: true,
        dependencies: {
          "@angular/animations": "^17.0.0",
          "@angular/common": "^17.0.0",
          "@angular/compiler": "^17.0.0",
          "@angular/core": "^17.0.0",
          "@angular/forms": "^17.0.0",
          "@angular/material": "^17.0.0",
          "@angular/platform-browser": "^17.0.0",
          "@angular/platform-browser-dynamic": "^17.0.0",
          "@angular/router": "^17.0.0",
          "rxjs": "~7.8.0",
          "tslib": "^2.3.0",
          "zone.js": "~0.14.2"
        },
        devDependencies: {
          "@angular-devkit/build-angular": "^17.0.0",
          "@angular/cli": "^17.0.0",
          "@angular/compiler-cli": "^17.0.0",
          "@types/jasmine": "~5.1.0",
          "jasmine-core": "~5.1.0",
          "karma": "~6.4.0",
          "typescript": "~5.2.2"
        }
      };
      fs.writeFileSync(rutaPackageJson, JSON.stringify(packageJson, null, 2));
      console.log(`package.json básico creado para el frontend`);
    }
  }

  // Crear un README.md principal con instrucciones
  const rutaReadme = path.join('.', 'README.md');
  let contenidoReadme = '# Proyecto Generado desde Diagramas UML\n\n';
  contenidoReadme += 'Este proyecto fue generado automáticamente a partir de diagramas UML utilizando la herramienta UML-to-Code.\n\n';
  
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
  
  contenidoReadme += '## Notas\n\n';
  contenidoReadme += '- El backend se ejecutará en `http://localhost:3000` por defecto\n';
  contenidoReadme += '- El frontend se ejecutará en `http://localhost:4200` por defecto\n';
  contenidoReadme += '- Es posible que necesites ajustar la configuración CORS en el backend si encuentras problemas\n';
  
  fs.writeFileSync(rutaReadme, contenidoReadme);
  console.log(`README.md principal creado con instrucciones de configuración`);

  console.log('\n¡Archivos del proyecto generados exitosamente!');
}

module.exports = { extraerCodigo };

// Si este script se ejecuta directamente desde la línea de comandos
if (require.main === module) {
  // Verificar si se proporciona una ruta de archivo
  if (process.argv.length < 3) {
    console.error('Por favor, proporciona una ruta al archivo JSON que contiene el código generado.');
    console.error('Uso: node extractorCodigo.js <ruta-al-archivo-json>');
    process.exit(1);
  }

  const rutaArchivoJson = process.argv[2];

  // Verificar si el archivo existe
  if (!fs.existsSync(rutaArchivoJson)) {
    console.error(`Archivo no encontrado: ${rutaArchivoJson}`);
    process.exit(1);
  }

  // Leer y parsear el archivo JSON
  let codigoGenerado;
  try {
    const contenidoJson = fs.readFileSync(rutaArchivoJson, 'utf8');
    codigoGenerado = JSON.parse(contenidoJson);
  } catch (error) {
    console.error(`Error al leer o parsear el archivo JSON: ${error.message}`);
    process.exit(1);
  }

  // Ejecutar la extracción de código
  extraerCodigo(codigoGenerado);
}