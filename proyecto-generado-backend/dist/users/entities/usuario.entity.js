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
exports.User = void 0;
const typeorm_1 = require("typeorm");
const jefe_de_grupo_entity_1 = require("./jefe-de-grupo.entity");
const profesor_entity_1 = require("./profesor.entity");
const alumno_entity_1 = require("./alumno.entity");
let User = class User {
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], User.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({
        unique: true,
    }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => jefe_de_grupo_entity_1.JefeDeGrupo, (jefeDeGrupo) => jefeDeGrupo.user),
    __metadata("design:type", Array)
], User.prototype, "jefeDeGrupo", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => profesor_entity_1.Profesor, (profesor) => profesor.user),
    __metadata("design:type", Array)
], User.prototype, "profesor", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => alumno_entity_1.Alumno, (alumno) => alumno.user),
    __metadata("design:type", Array)
], User.prototype, "alumno", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)()
], User);
//# sourceMappingURL=usuario.entity.js.map