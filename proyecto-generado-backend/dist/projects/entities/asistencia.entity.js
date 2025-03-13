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
exports.Asistencia = void 0;
const typeorm_1 = require("typeorm");
const jefe_de_grupo_entity_1 = require("./jefe-de-grupo.entity");
const profesor_entity_1 = require("./profesor.entity");
let Asistencia = class Asistencia {
};
exports.Asistencia = Asistencia;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Asistencia.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], Asistencia.prototype, "fecha", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], Asistencia.prototype, "presente", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => jefe_de_grupo_entity_1.JefeDeGrupo, (jefeDeGrupo) => jefeDeGrupo.asistencias),
    (0, typeorm_1.JoinColumn)({ name: 'jefeDeGrupoId' }),
    __metadata("design:type", jefe_de_grupo_entity_1.JefeDeGrupo)
], Asistencia.prototype, "jefeDeGrupo", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => profesor_entity_1.Profesor, (profesor) => profesor.asistencias),
    (0, typeorm_1.JoinColumn)({ name: 'profesorId' }),
    __metadata("design:type", profesor_entity_1.Profesor)
], Asistencia.prototype, "profesor", void 0);
exports.Asistencia = Asistencia = __decorate([
    (0, typeorm_1.Entity)()
], Asistencia);
//# sourceMappingURL=asistencia.entity.js.map