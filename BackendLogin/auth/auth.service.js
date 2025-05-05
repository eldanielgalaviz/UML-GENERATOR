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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const users_service_1 = require("../users/users.service");
const email_service_1 = require("./email.service");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
let AuthService = class AuthService {
    constructor(usersService, jwtService, emailService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.emailService = emailService;
    }
    async validateToken(token) {
        try {
            return this.jwtService.verify(token);
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Token inválido');
        }
    }
    async register(createUserDto) {
        const confirmationToken = crypto.randomBytes(32).toString('hex');
        console.log('Token generado:', confirmationToken);
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        console.log('Contraseña hasheada:', hashedPassword);
        console.log('Longitud del hash:', hashedPassword.length);
        const user = await this.usersService.create(Object.assign(Object.assign({}, createUserDto), { password: createUserDto.password, confirmationToken, isEmailConfirmed: false }));
        console.log('Usuario creado:', { id: user.id, email: user.email });
        console.log('Intentando enviar email de confirmación');
        await this.emailService.sendConfirmationEmail(user.email, confirmationToken);
        console.log('Email de confirmación enviado');
        return {
            message: 'Por favor, verifica tu correo electrónico para completar el registro',
            userId: user.id
        };
    }
    catch(error) {
        console.error('Error en el proceso de registro:', error);
        throw error;
    }
    async confirmEmail(token) {
        try {
            const user = await this.usersService.findByConfirmationToken(token);
            if (!user) {
                throw new common_1.UnauthorizedException('Token de verificación inválido');
            }
            await this.usersService.update(user.id, {
                isEmailConfirmed: true,
                confirmationToken: null,
            });
            return { message: 'Email verificado correctamente' };
        }
        catch (error) {
            console.error('Error en confirmación de email:', error);
            throw error;
        }
    }
    async forgotPassword(email) {
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            return { message: 'Si el email existe, recibirás un enlace para restablecer tu contraseña' };
        }
        const resetToken = crypto.randomBytes(32).toString('hex');
        const passwordResetExpires = new Date();
        passwordResetExpires.setHours(passwordResetExpires.getHours() + 1);
        await this.usersService.update(user.id, {
            passwordResetToken: resetToken,
            passwordResetExpires,
        });
        await this.emailService.sendPasswordResetEmail(email, resetToken);
        return { message: 'Si el email existe, recibirás un enlace para restablecer tu contraseña' };
    }
    async resetPassword(token, newPassword) {
        const user = await this.usersService.findByResetToken(token);
        if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
            throw new common_1.UnauthorizedException('Token inválido o expirado');
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await this.usersService.update(user.id, {
            password: hashedPassword,
            passwordResetToken: null,
            passwordResetExpires: null
        });
        return { message: 'Contraseña actualizada correctamente' };
    }
    async validateUser(username, password) {
        try {
            console.log('Intentando validar usuario:', username);
            const user = await this.usersService.findByUsername(username);
            console.log('Usuario encontrado:', user);
            if (!user) {
                throw new common_1.UnauthorizedException('Credenciales inválidas');
            }
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                throw new common_1.UnauthorizedException('Credenciales inválidas');
            }
            const { password: _ } = user, result = __rest(user, ["password"]);
            return result;
        }
        catch (error) {
            console.error('Error en validación:', error);
            throw error;
        }
    }
    async login(loginDto) {
        console.log('Datos de login recibidos:', loginDto);
        const user = await this.validateUser(loginDto.username, loginDto.password);
        const payload = {
            email: user.email,
            sub: user.id,
            username: user.username,
            nombre: user.nombre
        };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                nombre: user.nombre
            }
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        email_service_1.EmailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map