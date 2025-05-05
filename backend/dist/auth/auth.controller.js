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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AuthController_1;
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const create_user_dto_1 = require("../users/dto/create-user.dto");
const users_service_1 = require("../users/users.service");
const jwt_guard_auth_1 = require("./guards/jwt-guard.auth");
let AuthController = AuthController_1 = class AuthController {
    constructor(authService, usersService) {
        this.authService = authService;
        this.usersService = usersService;
        this.logger = new common_1.Logger(AuthController_1.name);
    }
    async register(createUserDto) {
        this.logger.debug('Recibida petición de registro:', createUserDto.email);
        try {
            const result = await this.authService.register(createUserDto);
            this.logger.debug('Registro exitoso');
            return result;
        }
        catch (error) {
            this.logger.error('Error en registro:', error);
            throw error;
        }
    }
    async forgotPassword(body) {
        console.log('Solicitud de recuperación de contraseña para:', body.email);
        try {
            const result = await this.authService.forgotPassword(body.email);
            return result;
        }
        catch (error) {
            console.error('Error completo en forgot-password:', error);
            if (error instanceof common_1.NotFoundException) {
                return { message: 'Si el email existe, recibirás un enlace para restablecer tu contraseña' };
            }
            throw new common_1.BadRequestException('Error en la solicitud de recuperación de contraseña');
        }
    }
    async resetPassword(body) {
        try {
            console.log('Solicitando reseteo de contraseña');
            console.log('Token recibido:', body.token);
            const result = await this.authService.resetPassword(body.token, body.newPassword);
            return result;
        }
        catch (error) {
            console.error('Error en reset-password:', error);
            if (error instanceof common_1.UnauthorizedException) {
                throw new common_1.UnauthorizedException('Token inválido o expirado');
            }
            throw new common_1.BadRequestException('Error al restablecer la contraseña');
        }
    }
    async login(loginDto) {
        const user = await this.authService.validateUser(loginDto.username, loginDto.password);
        if (!user) {
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        }
        return this.authService.login({
            username: loginDto.username,
            password: loginDto.password
        });
    }
    async confirmEmail(token) {
        this.logger.debug('Recibida petición de confirmación de email');
        return this.authService.confirmEmail(token);
    }
    getProfile(req) {
        return req.user;
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof create_user_dto_1.CreateUserDto !== "undefined" && create_user_dto_1.CreateUserDto) === "function" ? _c : Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('forgot-password'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, common_1.Post)('reset-password'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Get)('confirm'),
    __param(0, (0, common_1.Query)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "confirmEmail", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_auth_1.JwtAuthGuard),
    (0, common_1.Get)('profile'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "getProfile", null);
exports.AuthController = AuthController = AuthController_1 = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [typeof (_a = typeof auth_service_1.AuthService !== "undefined" && auth_service_1.AuthService) === "function" ? _a : Object, typeof (_b = typeof users_service_1.UsersService !== "undefined" && users_service_1.UsersService) === "function" ? _b : Object])
], AuthController);
//# sourceMappingURL=auth.controller.js.map