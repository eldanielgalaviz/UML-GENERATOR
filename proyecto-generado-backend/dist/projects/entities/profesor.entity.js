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
exports.Profesor = void 0;
const typeorm_1 = require("typeorm");
const usuario_entity_1 = require("./usuario.entity");
const asistencia_entity_1 = require("./asistencia.entity");
const horario_entity_1 = require("./horario.entity");
let Profesor = class Profesor {
};
exports.Profesor = Profesor;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Profesor.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => usuario_entity_1.Usuario, (usuario) => usuario.profesores),
    (0, typeorm_1.JoinColumn)({ name: 'usuarioId' }),
    __metadata("design:type", usuario_entity_1.Usuario)
], Profesor.prototype, "usuario", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => asistencia_entity_1.Asistencia, (asistencia) => asistencia.profesor),
    __metadata("design:type", Array)
], Profesor.prototype, "asistencias", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => horario_entity_1.Horario, (horario) => horario.profesor),
    __metadata("design:type", Array)
], Profesor.prototype, "horarios", void 0);
exports.Profesor = Profesor = __decorate([
    (0, typeorm_1.Entity)()
], Profesor);
//# sourceMappingURL=profesor.entity.js.map