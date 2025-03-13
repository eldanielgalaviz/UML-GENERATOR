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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Usuario = void 0;
const typeorm_1 = require("typeorm");
const jefe_de_grupo_entity_1 = require("./jefe-de-grupo.entity");
const profesor_entity_1 = require("./profesor.entity");
const alumno_entity_1 = require("./alumno.entity");
let Usuario = class Usuario {
};
exports.Usuario = Usuario;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Usuario.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Usuario.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({
        unique: true,
    }),
    __metadata("design:type", String)
], Usuario.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Usuario.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => jefe_de_grupo_entity_1.JefeDeGrupo, (jefeDeGrupo) => jefeDeGrupo.usuario),
    __metadata("design:type", Array)
], Usuario.prototype, "jefesDeGrupo", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => profesor_entity_1.Profesor, (profesor) => profesor.usuario),
    __metadata("design:type", Array)
], Usuario.prototype, "profesores", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => alumno_entity_1.Alumno, (alumno) => alumno.usuario),
    __metadata("design:type", Array)
], Usuario.prototype, "alumnos", void 0);
exports.Usuario = Usuario = __decorate([
    (0, typeorm_1.Entity)()
], Usuario);
//# sourceMappingURL=usuario.entity.js.map