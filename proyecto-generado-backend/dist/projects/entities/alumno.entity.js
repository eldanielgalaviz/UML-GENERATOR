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
exports.Alumno = void 0;
const typeorm_1 = require("typeorm");
const usuario_entity_1 = require("./usuario.entity");
const horario_entity_1 = require("./horario.entity");
let Alumno = class Alumno {
};
exports.Alumno = Alumno;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Alumno.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => usuario_entity_1.Usuario, (usuario) => usuario.alumnos),
    (0, typeorm_1.JoinColumn)({ name: 'usuarioId' }),
    __metadata("design:type", usuario_entity_1.Usuario)
], Alumno.prototype, "usuario", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => horario_entity_1.Horario),
    (0, typeorm_1.JoinTable)(),
    __metadata("design:type", horario_entity_1.Horario)
], Alumno.prototype, "horario", void 0);
exports.Alumno = Alumno = __decorate([
    (0, typeorm_1.Entity)()
], Alumno);
//# sourceMappingURL=alumno.entity.js.map