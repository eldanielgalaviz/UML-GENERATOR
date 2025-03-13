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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../entities/user.entity");
const jefe_de_grupo_entity_1 = require("./entities/jefe-de-grupo.entity");
const profesor_entity_1 = require("../entities/profesor.entity");
const alumno_entity_1 = require("./entities/alumno.entity");
let UsersService = class UsersService {
    constructor(userRepository, jefeDeGrupoRepository, profesorRepository, alumnoRepository) {
        this.userRepository = userRepository;
        this.jefeDeGrupoRepository = jefeDeGrupoRepository;
        this.profesorRepository = profesorRepository;
        this.alumnoRepository = alumnoRepository;
    }
    async create(createUserDto) {
        const user = this.userRepository.create(createUserDto);
        return this.userRepository.save(user);
    }
    async findAll() {
        return this.userRepository.find();
    }
    async findOne(id) {
        const user = await this.userRepository.findOneBy({ id });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID "${id}" not found`);
        }
        return user;
    }
    async update(id, updateUserDto) {
        const user = await this.findOne(id);
        this.userRepository.merge(user, updateUserDto);
        return this.userRepository.save(user);
    }
    async remove(id) {
        const user = await this.findOne(id);
        await this.userRepository.remove(user);
    }
    async createJefeDeGrupo(createUserDto) {
        const user = await this.create(createUserDto);
        const jefeDeGrupo = this.jefeDeGrupoRepository.create({
            user: user
        });
        return this.jefeDeGrupoRepository.save(jefeDeGrupo);
    }
    async createProfesor(createUserDto) {
        const user = await this.create(createUserDto);
        const profesor = this.profesorRepository.create({
            user: user
        });
        return this.profesorRepository.save(profesor);
    }
    async createAlumno(createUserDto) {
        const user = await this.create(createUserDto);
        const alumno = this.alumnoRepository.create({
            user: user
        });
        return this.alumnoRepository.save(alumno);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(jefe_de_grupo_entity_1.JefeDeGrupo)),
    __param(2, (0, typeorm_1.InjectRepository)(profesor_entity_1.Profesor)),
    __param(3, (0, typeorm_1.InjectRepository)(alumno_entity_1.Alumno)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map