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
exports.GenerateCodeDto = exports.IEEE830RequirementDto = exports.MermaidDiagramDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class MermaidDiagramDto {
}
exports.MermaidDiagramDto = MermaidDiagramDto;
__decorate([
    (0, class_validator_1.IsEnum)(['classDiagram', 'sequenceDiagram', 'useCaseDiagram', 'componentDiagram', 'packageDiagram']),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], MermaidDiagramDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], MermaidDiagramDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], MermaidDiagramDto.prototype, "code", void 0);
class IEEE830RequirementDto {
    constructor() {
        this.dependencies = [];
    }
}
exports.IEEE830RequirementDto = IEEE830RequirementDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], IEEE830RequirementDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['functional', 'non-functional']),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], IEEE830RequirementDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], IEEE830RequirementDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['high', 'medium', 'low']),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], IEEE830RequirementDto.prototype, "priority", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], IEEE830RequirementDto.prototype, "dependencies", void 0);
class GenerateCodeDto {
}
exports.GenerateCodeDto = GenerateCodeDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => MermaidDiagramDto),
    __metadata("design:type", Array)
], GenerateCodeDto.prototype, "diagrams", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => IEEE830RequirementDto),
    __metadata("design:type", Array)
], GenerateCodeDto.prototype, "requirements", void 0);
//# sourceMappingURL=generate-code.dto.js.map