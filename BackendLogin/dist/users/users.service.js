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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
const password_validator_1 = require("../auth/password.validator");
const bcrypt = require("bcrypt");
let UsersService = class UsersService {
    constructor(usersRepository) {
        this.usersRepository = usersRepository;
    }
    async create(createUserDto) {
        try {
            const existingEmail = await this.usersRepository.findOne({
                where: { email: createUserDto.email },
            });
            if (existingEmail) {
                throw new common_1.ConflictException('El email ya está registrado');
            }
            const existingUsername = await this.usersRepository.findOne({
                where: { username: createUserDto.username },
            });
            if (existingUsername) {
                throw new common_1.ConflictException('El nombre de usuario ya está en uso');
            }
            if (createUserDto.password !== createUserDto.confirmPassword) {
                console.log('Password:', createUserDto.password);
                console.log('Confirm Password:', createUserDto.confirmPassword);
                throw new common_1.BadRequestException('Las contraseñas no coinciden');
            }
            password_validator_1.PasswordValidator.validate(createUserDto.password);
            const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
            const { confirmPassword } = createUserDto, userData = __rest(createUserDto, ["confirmPassword"]);
            const user = this.usersRepository.create(Object.assign(Object.assign({}, userData), { password: hashedPassword, isEmailConfirmed: false }));
            return await this.usersRepository.save(user);
        }
        catch (error) {
            if (error instanceof common_1.ConflictException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Error al crear el usuario');
        }
    }
    async findOne(id) {
        try {
            const user = await this.usersRepository.findOne({
                where: { id },
                select: ['id', 'email', 'username', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'fechaNacimiento', 'isEmailConfirmed']
            });
            if (!user) {
                throw new common_1.NotFoundException(`Usuario con ID ${id} no encontrado`);
            }
            return user;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Error al buscar el usuario');
        }
    }
    async findByUsername(username) {
        try {
            const user = await this.usersRepository.findOne({ where: { username }, select: ['id', 'email', 'username', 'password', 'nombre', 'isEmailConfirmed'] });
            if (!user) {
                throw new common_1.NotFoundException('Usuario no encontrado');
            }
            return user;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Error al buscar el usuario');
        }
    }
    async findByEmail(email) {
        try {
            const user = await this.usersRepository.findOne({ where: { email } });
            if (!user) {
                throw new common_1.NotFoundException('Usuario no encontrado');
            }
            return user;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Error al buscar el usuario');
        }
    }
    async findByConfirmationToken(token) {
        try {
            const user = await this.usersRepository.findOne({
                where: { confirmationToken: token }
            });
            if (!user) {
                throw new common_1.NotFoundException('Token de confirmación inválido');
            }
            return user;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Error al verificar el token');
        }
    }
    async findByResetToken(token) {
        try {
            const user = await this.usersRepository.findOne({
                where: {
                    passwordResetToken: token,
                    passwordResetExpires: (0, typeorm_2.MoreThan)(new Date())
                }
            });
            if (!user) {
                throw new common_1.NotFoundException('Token de recuperación inválido o expirado');
            }
            return user;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Error al verificar el token');
        }
    }
    async update(id, updateData) {
        try {
            const result = await this.usersRepository.update(id, updateData);
            if (result.affected === 0) {
                throw new common_1.NotFoundException('Usuario no encontrado');
            }
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Error al actualizar el usuario');
        }
    }
    async updateProfile(userId, updateProfileDto) {
        try {
            if (updateProfileDto.username) {
                const existingUser = await this.usersRepository.findOne({
                    where: {
                        username: updateProfileDto.username,
                        id: (0, typeorm_2.Not)(userId)
                    }
                });
                if (existingUser) {
                    throw new common_1.ConflictException('El nombre de usuario ya está en uso');
                }
            }
            await this.usersRepository.update(userId, updateProfileDto);
            const updatedUser = await this.usersRepository.findOne({
                where: { id: userId },
                select: ['id', 'username', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'fechaNacimiento']
            });
            if (!updatedUser) {
                throw new common_1.NotFoundException('Usuario no encontrado');
            }
            return updatedUser;
        }
        catch (error) {
            if (error instanceof common_1.ConflictException || error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Error al actualizar el perfil');
        }
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map