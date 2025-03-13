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
const usuario_entity_1 = require("../usuario/entities/usuario.entity");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcrypt");
const jwt_1 = require("@nestjs/jwt");
let AuthService = class AuthService {
    constructor(usuarioRepository, jwtService) {
        this.usuarioRepository = usuarioRepository;
        this.jwtService = jwtService;
    }
    async register(registerDto) {
        const { password } = registerDto, userData = __rest(registerDto, ["password"]);
        const usuario = this.usuarioRepository.create(Object.assign(Object.assign({}, userData), { password: bcrypt.hashSync(password, 10) }));
        return this.usuarioRepository.save(usuario);
    }
    async login(loginDto) {
        const { email, password } = loginDto;
        const usuario = await this.usuarioRepository.findOne({
            where: { email },
            select: ['email', 'password', 'id', 'nombre']
        });
        if (!usuario) {
            throw new common_1.UnauthorizedException('Credenciales incorrectas');
        }
        if (!bcrypt.compareSync(password, usuario.password)) {
            throw new common_1.UnauthorizedException('Credenciales incorrectas');
        }
        const payload = { id: usuario.id, email: usuario.email, nombre: usuario.nombre };
        const token = this.jwtService.sign(payload);
        return {
            token: token,
            user: {
                id: usuario.id,
                email: usuario.email,
                nombre: usuario.nombre,
            }
        };
    }
    async validateUser(id) {
        const usuario = await this.usuarioRepository.findOneBy({ id });
        if (!usuario) {
            throw new common_1.UnauthorizedException('Usuario no encontrado');
        }
        delete usuario.password;
        return usuario;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(usuario_entity_1.Usuario)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map