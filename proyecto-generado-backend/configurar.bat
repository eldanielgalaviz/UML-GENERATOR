@echo off

REM Script de configuración para backend NestJS
REM Generado por la herramienta UML-to-Code

REM Comandos de configuración del proyecto
npm install
npm install -g @nestjs/cli
nest new project-name
npm run start:dev
npm run build
npm run start:prod
npm install --save @nestjs/typeorm typeorm pg class-validator class-transformer @nestjs/config
npm install --save-dev @types/node ts-node

REM Iniciar el backend
npm run start:dev
