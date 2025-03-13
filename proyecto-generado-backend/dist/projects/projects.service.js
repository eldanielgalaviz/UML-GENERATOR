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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const usuario_entity_1 = require("./entities/usuario.entity");
const horario_entity_1 = require("./entities/horario.entity");
let ProjectsService = class ProjectsService {
    constructor(usuarioRepository, horarioRepository) {
        this.usuarioRepository = usuarioRepository;
        this.horarioRepository = horarioRepository;
    }
    async createUsuario(createUsuarioDto) {
        const usuario = this.usuarioRepository.create(createUsuarioDto);
        return this.usuarioRepository.save(usuario);
    }
    async findAllUsuarios() {
        return this.usuarioRepository.find();
    }
    async findUsuarioById(id) {
        const usuario = await this.usuarioRepository.findOneBy({ id });
        if (!usuario) {
            throw new common_1.NotFoundException(`Usuario with ID "${id}" not found`);
        }
        return usuario;
    }
    async updateUsuario(id, updateUsuarioDto) {
        const usuario = await this.findUsuarioById(id);
        Object.assign(usuario, updateUsuarioDto);
        return this.usuarioRepository.save(usuario);
    }
    async removeUsuario(id) {
        const usuario = await this.findUsuarioById(id);
        await this.usuarioRepository.remove(usuario);
    }
    async createHorario(createHorarioDto) {
        const horario = this.horarioRepository.create(createHorarioDto);
        return await this.horarioRepository.save(horario);
    }
    async findAllHorarios() {
        return this.horarioRepository.find();
    }
    async findHorarioById(id) {
        const horario = await this.horarioRepository.findOneBy({ id });
        if (!horario) {
            throw new common_1.NotFoundException(`Horario with ID "${id}" not found`);
        }
        return horario;
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(usuario_entity_1.Usuario)),
    __param(1, (0, typeorm_1.InjectRepository)(horario_entity_1.Horario)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map