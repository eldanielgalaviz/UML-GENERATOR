import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    const user = this.configService.get('EMAIL_USER');
    const pass = this.configService.get('EMAIL_PASSWORD');

    this.logger.debug(`Configurando servicio de email con usuario: ${user}`);

    this.transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // true para 465, false para otros puertos
        auth: {
          user,
          pass,
        },
        debug: true, // Habilitar logs detallados
        logger: true, // Usar logger incorporado
      });
    this.verifyConnection();
  }

  private async verifyConnection() {
    try {
      await this.transporter.verify();
      this.logger.log('Conexión con el servidor de correo establecida');
    } catch (error) {
      this.logger.error('Error al conectar con el servidor de correo:', error);
      // No lanzamos el error para evitar que la aplicación completa se detenga
      // Solo registramos el problema
    }
  }
  
  async sendConfirmationEmail(to: string, token: string) {
    const frontendUrl = this.configService.get('FRONTEND_URL');
    const verificationLink = `${frontendUrl}/verify-email?token=${token}`;

    this.logger.debug(`Intentando enviar email de confirmación a: ${to}`);
    this.logger.debug(`Link de verificación: ${verificationLink}`);

    try {
      const result = await this.transporter.sendMail({
        from: {
          name: 'UML Generator',
          address: this.configService.get('EMAIL_FROM') || 'generatoruml@gmail.com'
        },
        to,
        subject: 'Confirma tu correo electrónico',
        html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Confirmación de Correo</title>
          <style>
            /* Estilos generales */
            body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
              background-color: #060611;
              color: #ffffff;
            }
            
            .email-container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            
            /* Cabecera del correo */
            .email-header {
              text-align: center;
              padding-bottom: 20px;
            }
            
            .email-header h1 {
              color: #ffffff;
              font-size: 28px;
              margin-bottom: 10px;
            }
            
            .header-underline {
              height: 4px;
              width: 60px;
              background: linear-gradient(90deg, #2D8EFF, #9D4EDD);
              margin: 0 auto;
              border-radius: 2px;
            }
            
            /* Cuerpo del correo */
            .email-body {
              background-color: rgba(32, 33, 35, 0.9);
              border-radius: 12px;
              border: 1px solid rgba(255, 255, 255, 0.1);
              box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
              padding: 30px;
              margin-bottom: 20px;
            }
            
            .email-content {
              text-align: center;
              padding: 20px 0;
            }
            
            .email-content p {
              color: #9ca3af;
              font-size: 16px;
              line-height: 1.6;
              margin-bottom: 20px;
            }
            
            /* Botón de confirmación */
            .button-container {
              text-align: center;
              margin: 30px 0;
            }
            
            .confirmation-button {
              display: inline-block;
              background: linear-gradient(90deg, #2D8EFF, #7349BD);
              color: white !important;
              padding: 14px 30px;
              text-decoration: none;
              border-radius: 50px;
              font-weight: bold;
              font-size: 16px;
              box-shadow: 0 4px 12px rgba(45, 142, 255, 0.3);
              transition: transform 0.2s;
            }
            
            /* Pie de correo */
            .email-footer {
              text-align: center;
              color: #6b7280;
              font-size: 14px;
              padding-top: 20px;
              border-top: 1px solid rgba(107, 114, 128, 0.2);
            }
            
            /* Elementos decorativos */
            .decorative-shapes {
              position: relative;
              height: 200px;
              overflow: hidden;
              margin-bottom: -150px;
              z-index: -1;
            }
            
            .shape {
              position: absolute;
              border-radius: 50%;
              background: linear-gradient(135deg, rgba(0, 119, 255, 0.1), rgba(199, 77, 237, 0.1));
              opacity: 0.4;
            }
            
            .shape-1 {
              width: 150px;
              height: 150px;
              top: 20px;
              left: 10%;
              background: linear-gradient(135deg, rgba(0, 119, 255, 0.2), rgba(0, 58, 237, 0.05));
            }
            
            .shape-2 {
              width: 200px;
              height: 200px;
              top: 50px;
              right: 10%;
              background: linear-gradient(135deg, rgba(199, 77, 237, 0.1), rgba(255, 0, 128, 0.05));
            }
          </style>
        </head>
        <body>
          <!-- Formas decorativas de fondo -->
          <div class="decorative-shapes">
            <div class="shape shape-1"></div>
            <div class="shape shape-2"></div>
          </div>
          
          <div class="email-container">
            <!-- Cabecera -->
            <div class="email-header">
              <h1>UML Generator</h1>
              <div class="header-underline"></div>
            </div>
            
            <!-- Cuerpo del correo -->
            <div class="email-body">
              <div class="email-content">
                <h2 style="color: white; font-size: 24px;">Confirma tu correo electrónico</h2>
                <p>¡Gracias por registrarte en UML Generator! Para completar tu registro y comenzar a utilizar nuestra plataforma, por favor confirma tu dirección de correo electrónico.</p>
                
                <div class="button-container">
                  <a href="${verificationLink}" class="confirmation-button">Confirmar correo electrónico</a>
                </div>
                
                <p style="font-size: 14px;">Si no solicitaste esta cuenta, puedes ignorar este correo.</p>
              </div>
            </div>
            
            <!-- Pie de correo -->
            <div class="email-footer">
              <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
              <p>&copy; 2025 UML Generator. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
        </html>
        `
      });

      this.logger.log(`Email enviado exitosamente a ${to}`);
      return result;
    } catch (error) {
      this.logger.error(`Error al enviar email: ${error.message}`);
      this.logger.error('Detalles del error:', error);
      throw error;
    }
  }

  async sendPasswordResetEmail(to: string, token: string) {
    const frontendUrl = this.configService.get('FRONTEND_URL');
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    try {
      await this.transporter.sendMail({
        from: {
          name: 'UML Generator',
          address: this.configService.get('EMAIL_FROM') || 'generatoruml@gmail.com'
        },
        to: to,
        subject: 'Recuperación de contraseña',
        html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Recuperación de Contraseña</title>
          <style>
            /* Estilos generales */
            body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
              background-color: #060611;
              color: #ffffff;
            }
            
            .email-container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            
            /* Cabecera del correo */
            .email-header {
              text-align: center;
              padding-bottom: 20px;
            }
            
            .email-header h1 {
              color: #ffffff;
              font-size: 28px;
              margin-bottom: 10px;
            }
            
            .header-underline {
              height: 4px;
              width: 60px;
              background: linear-gradient(90deg, #2D8EFF, #9D4EDD);
              margin: 0 auto;
              border-radius: 2px;
            }
            
            /* Cuerpo del correo */
            .email-body {
              background-color: rgba(32, 33, 35, 0.9);
              border-radius: 12px;
              border: 1px solid rgba(255, 255, 255, 0.1);
              box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
              padding: 30px;
              margin-bottom: 20px;
            }
            
            .email-content {
              text-align: center;
              padding: 20px 0;
            }
            
            .email-content p {
              color: #9ca3af;
              font-size: 16px;
              line-height: 1.6;
              margin-bottom: 20px;
            }
            
            /* Botón de recuperación */
            .button-container {
              text-align: center;
              margin: 30px 0;
            }
            
            .reset-button {
              display: inline-block;
              background: linear-gradient(90deg, #2D8EFF, #7349BD);
              color: white !important;
              padding: 14px 30px;
              text-decoration: none;
              border-radius: 50px;
              font-weight: bold;
              font-size: 16px;
              box-shadow: 0 4px 12px rgba(45, 142, 255, 0.3);
              transition: transform 0.2s;
            }
            
            /* Pie de correo */
            .email-footer {
              text-align: center;
              color: #6b7280;
              font-size: 14px;
              padding-top: 20px;
              border-top: 1px solid rgba(107, 114, 128, 0.2);
            }
            
            /* Elementos decorativos */
            .decorative-shapes {
              position: relative;
              height: 200px;
              overflow: hidden;
              margin-bottom: -150px;
              z-index: -1;
            }
            
            .shape {
              position: absolute;
              border-radius: 50%;
              background: linear-gradient(135deg, rgba(0, 119, 255, 0.1), rgba(199, 77, 237, 0.1));
              opacity: 0.4;
            }
            
            .shape-1 {
              width: 150px;
              height: 150px;
              top: 20px;
              left: 10%;
              background: linear-gradient(135deg, rgba(0, 119, 255, 0.2), rgba(0, 58, 237, 0.05));
            }
            
            .shape-2 {
              width: 200px;
              height: 200px;
              top: 50px;
              right: 10%;
              background: linear-gradient(135deg, rgba(199, 77, 237, 0.1), rgba(255, 0, 128, 0.05));
            }
          </style>
        </head>
        <body>
          <!-- Formas decorativas de fondo -->
          <div class="decorative-shapes">
            <div class="shape shape-1"></div>
            <div class="shape shape-2"></div>
          </div>
          
          <div class="email-container">
            <!-- Cabecera -->
            <div class="email-header">
              <h1>UML Generator</h1>
              <div class="header-underline"></div>
            </div>
            
            <!-- Cuerpo del correo -->
            <div class="email-body">
              <div class="email-content">
                <h2 style="color: white; font-size: 24px;">Recuperación de Contraseña</h2>
                <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente botón para crear una nueva:</p>
                
                <div class="button-container">
                  <a href="${resetLink}" class="reset-button">Restablecer contraseña</a>
                </div>
                
                <p style="font-size: 14px;">Este enlace expirará en 1 hora.</p>
                <p style="font-size: 14px;">Si no solicitaste este cambio, puedes ignorar este correo.</p>
              </div>
            </div>
            
            <!-- Pie de correo -->
            <div class="email-footer">
              <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
              <p>&copy; 2025 UML Generator. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
        </html>
        `
      });

      this.logger.log('Email de recuperación enviado a:', to);
    } catch (error) {
      this.logger.error('Error al enviar email de recuperación:', error);
      throw new Error('No se pudo enviar el email de recuperación de contraseña');
    }
  }
}