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
exports.Actividad = void 0;
const typeorm_1 = require("typeorm");
const jefe_de_grupo_entity_1 = require("./jefe-de-grupo.entity");
let Actividad = class Actividad {
};
exports.Actividad = Actividad;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Actividad.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Actividad.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Actividad.prototype, "descripcion", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], Actividad.prototype, "fecha", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => jefe_de_grupo_entity_1.JefeDeGrupo, (jefeDeGrupo) => jefeDeGrupo.actividades),
    (0, typeorm_1.JoinColumn)({ name: 'jefeDeGrupoId' }),
    __metadata("design:type", jefe_de_grupo_entity_1.JefeDeGrupo)
], Actividad.prototype, "jefeDeGrupo", void 0);
exports.Actividad = Actividad = __decorate([
    (0, typeorm_1.Entity)()
], Actividad);
//# sourceMappingURL=actividad.entity.js.map