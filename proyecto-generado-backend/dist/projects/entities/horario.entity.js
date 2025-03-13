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
exports.Horario = void 0;
const typeorm_1 = require("typeorm");
const jefe_de_grupo_entity_1 = require("./jefe-de-grupo.entity");
const profesor_entity_1 = require("./profesor.entity");
let Horario = class Horario {
};
exports.Horario = Horario;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Horario.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Horario.prototype, "grupo", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Horario.prototype, "clase", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Horario.prototype, "horaInicio", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Horario.prototype, "horaFin", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => jefe_de_grupo_entity_1.JefeDeGrupo, (jefeDeGrupo) => jefeDeGrupo.horarios),
    (0, typeorm_1.JoinColumn)({ name: 'jefeDeGrupoId' }),
    __metadata("design:type", jefe_de_grupo_entity_1.JefeDeGrupo)
], Horario.prototype, "jefeDeGrupo", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => profesor_entity_1.Profesor, (profesor) => profesor.horarios),
    (0, typeorm_1.JoinColumn)({ name: 'profesorId' }),
    __metadata("design:type", profesor_entity_1.Profesor)
], Horario.prototype, "profesor", void 0);
exports.Horario = Horario = __decorate([
    (0, typeorm_1.Entity)()
], Horario);
//# sourceMappingURL=horario.entity.js.map