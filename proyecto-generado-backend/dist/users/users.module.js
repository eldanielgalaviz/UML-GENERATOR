"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const users_service_1 = require("./users.service");
const users_controller_1 = require("./users.controller");
const user_entity_1 = require("../entities/user.entity");
const jefe_de_grupo_entity_1 = require("./entities/jefe-de-grupo.entity");
const profesor_entity_1 = require("../entities/profesor.entity");
const alumno_entity_1 = require("./entities/alumno.entity");
const horario_entity_1 = require("../horario/entities/horario.entity");
const asistencia_entity_1 = require("../asistencia/entities/asistencia.entity");
const actividad_entity_1 = require("../actividad/entities/actividad.entity");
let UsersModule = class UsersModule {
};
exports.UsersModule = UsersModule;
exports.UsersModule = UsersModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, jefe_de_grupo_entity_1.JefeDeGrupo, profesor_entity_1.Profesor, alumno_entity_1.Alumno, horario_entity_1.Horario, asistencia_entity_1.Asistencia, actividad_entity_1.Actividad])],
        controllers: [users_controller_1.UsersController],
        providers: [users_service_1.UsersService],
        exports: [users_service_1.UsersService],
    })
], UsersModule);
//# sourceMappingURL=users.module.js.map