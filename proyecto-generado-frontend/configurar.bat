@echo off

REM Script de configuración para frontend Angular
REM Generado por la herramienta UML-to-Code

REM Comandos de configuración del proyecto
npm install
ng add @angular/core@18
ng add @angular/router@18
ng generate component component-name
ng generate service service-name
ng build
ng serve

REM Iniciar el frontend
ng serve
