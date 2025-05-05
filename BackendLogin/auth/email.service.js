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
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = require("nodemailer");
let EmailService = EmailService_1 = class EmailService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(EmailService_1.name);
        const user = this.configService.get('EMAIL_USER');
        const pass = this.configService.get('EMAIL_PASSWORD');
        this.logger.debug(`Configurando servicio de email con usuario: ${user}`);
        this.transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user,
                pass,
            },
            debug: true,
            logger: true,
        });
        this.verifyConnection();
    }
    async verifyConnection() {
        try {
            await this.transporter.verify();
            this.logger.log('Conexión con el servidor de correo establecida');
        }
        catch (error) {
            this.logger.error('Error al conectar con el servidor de correo:', error);
        }
    }
    async sendConfirmationEmail(to, token) {
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
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Confirma tu correo electrónico</h2>
            <p>Gracias por registrarte. Por favor, haz clic en el siguiente enlace para confirmar tu correo electrónico:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationLink}" 
                 style="background-color: #4CAF50; 
                        color: white; 
                        padding: 12px 25px; 
                        text-decoration: none; 
                        border-radius: 5px;
                        font-weight: bold;">
                Confirmar correo electrónico
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">Si no creaste esta cuenta, puedes ignorar este correo.</p>
            <hr style="border: 1px solid #eee; margin: 20px 0;">
            <p style="color: #999; font-size: 12px;">Este es un correo automático, por favor no respondas a este mensaje.</p>
          </div>
        `
            });
            this.logger.log(`Email enviado exitosamente a ${to}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Error al enviar email: ${error.message}`);
            this.logger.error('Detalles del error:', error);
            throw error;
        }
    }
    async sendPasswordResetEmail(to, token) {
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
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Recuperación de contraseña</h2>
            <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" 
                 style="background-color: #4CAF50; 
                        color: white; 
                        padding: 12px 25px; 
                        text-decoration: none; 
                        border-radius: 5px;
                        font-weight: bold;">
                Restablecer contraseña
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">Este enlace expirará en 1 hora.</p>
            <p style="color: #666; font-size: 14px;">Si no solicitaste este cambio, puedes ignorar este correo.</p>
            <hr style="border: 1px solid #eee; margin: 20px 0;">
            <p style="color: #999; font-size: 12px;">Este es un correo automático, por favor no respondas a este mensaje.</p>
          </div>
        `
            });
            this.logger.log('Email de recuperación enviado a:', to);
        }
        catch (error) {
            this.logger.error('Error al enviar email de recuperación:', error);
            throw new Error('No se pudo enviar el email de recuperación de contraseña');
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
//# sourceMappingURL=email.service.js.map