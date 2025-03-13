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
exports.JefeDeGrupo = void 0;
const typeorm_1 = require("typeorm");
const usuario_entity_1 = require("./usuario.entity");
const horario_entity_1 = require("./horario.entity");
const asistencia_entity_1 = require("./asistencia.entity");
const actividad_entity_1 = require("./actividad.entity");
let JefeDeGrupo = class JefeDeGrupo {
};
exports.JefeDeGrupo = JefeDeGrupo;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], JefeDeGrupo.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => usuario_entity_1.Usuario, (usuario) => usuario.jefesDeGrupo),
    (0, typeorm_1.JoinColumn)({ name: 'usuarioId' }),
    __metadata("design:type", usuario_entity_1.Usuario)
], JefeDeGrupo.prototype, "usuario", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => horario_entity_1.Horario, (horario) => horario.jefeDeGrupo),
    __metadata("design:type", Array)
], JefeDeGrupo.prototype, "horarios", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => asistencia_entity_1.Asistencia, (asistencia) => asistencia.jefeDeGrupo),
    __metadata("design:type", Array)
], JefeDeGrupo.prototype, "asistencias", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => actividad_entity_1.Actividad, (actividad) => actividad.jefeDeGrupo),
    __metadata("design:type", Array)
], JefeDeGrupo.prototype, "actividades", void 0);
exports.JefeDeGrupo = JefeDeGrupo = __decorate([
    (0, typeorm_1.Entity)()
], JefeDeGrupo);
//# sourceMappingURL=jefe-de-grupo.entity.js.map