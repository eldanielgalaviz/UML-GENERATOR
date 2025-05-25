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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var GeminiController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiController = void 0;
const common_1 = require("@nestjs/common");
const jwt_guard_auth_1 = require("../auth/guards/jwt-guard.auth");
const gemini_service_1 = require("./gemini.service");
const analyze_requirements_dto_1 = require("./dto/analyze-requirements.dto");
const generate_code_dto_1 = require("./dto/generate-code.dto");
const conversation_service_1 = require("../conversation/conversation.service");
const uuid_1 = require("uuid");
let GeminiController = GeminiController_1 = class GeminiController {
    constructor(geminiService, conversationService) {
        this.geminiService = geminiService;
        this.conversationService = conversationService;
        this.logger = new common_1.Logger(GeminiController_1.name);
    }
    async analyzeRequirements(dto, sessionId, req) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
            console.log('Usuario autenticado:', userId);
            const currentSessionId = sessionId || (0, uuid_1.v4)();
            let fullPrompt = dto.requirements;
            if (sessionId) {
                const conversation = this.conversationService.getConversation(sessionId);
                if (conversation) {
                    await this.conversationService.addMessage(sessionId, 'user', dto.requirements, userId);
                    fullPrompt = this.conversationService.getFullPrompt(sessionId);
                }
                else {
                    await this.conversationService.createConversation(currentSessionId, dto.requirements, userId);
                }
            }
            else {
                await this.conversationService.createConversation(currentSessionId, dto.requirements, userId);
            }
            const analysis = await this.geminiService.analyzeRequirements(fullPrompt);
            analysis.diagrams = analysis.diagrams.filter(diagram => {
                try {
                    return diagram && diagram.code && diagram.code.trim().length > 0;
                }
                catch (error) {
                    this.logger.warn(`Diagrama ${diagram === null || diagram === void 0 ? void 0 : diagram.type} inválido, omitiendo...`);
                    return false;
                }
            });
            await this.conversationService.updateConversation(currentSessionId, analysis.requirements, analysis.diagrams, userId);
            return Object.assign(Object.assign({}, analysis), { sessionId: currentSessionId });
        }
        catch (error) {
            this.logger.error('Error in analyzeRequirements:', error);
            throw new common_1.HttpException({
                status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async generateCode(dto, sessionId, req) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
            this.logger.log(`Generando código para usuario: ${userId}`);
            const requirements = dto.requirements.map(req => (Object.assign(Object.assign({}, req), { dependencies: req.dependencies || [] })));
            const generatedCode = await this.geminiService.generateCode(dto.diagrams, requirements);
            if (sessionId && userId) {
                const conversation = this.conversationService.getConversation(sessionId);
                if (conversation) {
                    await this.conversationService.updateConversation(sessionId, requirements, dto.diagrams, userId);
                    this.conversationService.updateGeneratedCode(sessionId, generatedCode);
                    await this.conversationService.saveGeneratedCode(sessionId, userId, generatedCode);
                }
            }
            return generatedCode;
        }
        catch (error) {
            this.logger.error('Error in generateCode:', error);
            throw new common_1.HttpException({
                status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async downloadProject(response, sessionId) {
        try {
            this.logger.log(`Iniciando descarga del proyecto para sessionId: ${sessionId}`);
            if (!sessionId) {
                this.logger.error('Se intentó descargar sin sessionId');
                response.status(400).send('Se requiere un ID de sesión para la descarga');
                return;
            }
            let generatedCode = null;
            const conversation = this.conversationService.getConversation(sessionId);
            if (!conversation) {
                this.logger.warn(`No se encontró conversación con ID: ${sessionId}`);
                try {
                    const dbConversation = await this.conversationService.findConversationById(sessionId);
                    if (dbConversation) {
                        generatedCode = dbConversation.generatedCode;
                    }
                }
                catch (error) {
                    this.logger.error(`Error buscando conversación en BD: ${error.message}`);
                }
            }
            else if (conversation.generatedCode) {
                generatedCode = conversation.generatedCode;
            }
            else if (conversation.diagrams && conversation.requirements) {
                this.logger.log('Generando código a partir de diagramas y requerimientos existentes');
                generatedCode = await this.geminiService.generateCode(conversation.diagrams, conversation.requirements);
                if (generatedCode) {
                    this.conversationService.updateGeneratedCode(sessionId, generatedCode);
                }
            }
            if (!generatedCode) {
                this.logger.error('No hay código generado para descargar');
                response.status(404).send('No hay código generado para este proyecto. Primero debes generar diagramas y código.');
                return;
            }
            response.setHeader('Access-Control-Allow-Origin', '*');
            response.setHeader('Access-Control-Allow-Methods', 'GET');
            response.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
            this.logger.log('Generando archivo ZIP...');
            await this.geminiService.generateProjectZip(generatedCode, response);
            this.logger.log('Archivo ZIP enviado correctamente');
        }
        catch (error) {
            this.logger.error(`Error en downloadProject: ${error.message}`);
            response.status(500).send(`Error al generar el proyecto: ${error.message}`);
        }
    }
    async continueConversation(dto, sessionId, req) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
            if (!sessionId) {
                throw new common_1.HttpException('Se requiere session-id para continuar la conversación', common_1.HttpStatus.BAD_REQUEST);
            }
            const conversation = this.conversationService.getConversation(sessionId);
            if (!conversation) {
                throw new common_1.HttpException(`Conversación con ID ${sessionId} no encontrada`, common_1.HttpStatus.NOT_FOUND);
            }
            await this.conversationService.addMessage(sessionId, 'user', dto.message, userId);
            const fullPrompt = this.conversationService.getFullPrompt(sessionId);
            const analysis = await this.geminiService.analyzeRequirements(fullPrompt);
            analysis.diagrams = analysis.diagrams.filter(diagram => {
                try {
                    return diagram && diagram.code && diagram.code.trim().length > 0;
                }
                catch (error) {
                    this.logger.warn(`Diagrama ${diagram === null || diagram === void 0 ? void 0 : diagram.type} inválido, omitiendo...`);
                    return false;
                }
            });
            await this.conversationService.updateConversation(sessionId, analysis.requirements, analysis.diagrams, userId);
            return Object.assign(Object.assign({}, analysis), { sessionId });
        }
        catch (error) {
            this.logger.error('Error in continueConversation:', error);
            throw new common_1.HttpException({
                status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.GeminiController = GeminiController;
__decorate([
    (0, common_1.UseGuards)(jwt_guard_auth_1.JwtAuthGuard),
    (0, common_1.Post)('analyze'),
    __param(0, (0, common_1.Body)(new common_1.ValidationPipe({ transform: true }))),
    __param(1, (0, common_1.Headers)('session-id')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [analyze_requirements_dto_1.AnalyzeRequirementsDto, String, Object]),
    __metadata("design:returntype", Promise)
], GeminiController.prototype, "analyzeRequirements", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_auth_1.JwtAuthGuard),
    (0, common_1.Post)('generate-code'),
    __param(0, (0, common_1.Body)(new common_1.ValidationPipe({ transform: true }))),
    __param(1, (0, common_1.Headers)('session-id')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [generate_code_dto_1.GenerateCodeDto, String, Object]),
    __metadata("design:returntype", Promise)
], GeminiController.prototype, "generateCode", null);
__decorate([
    (0, common_1.Get)('download-project'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Query)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], GeminiController.prototype, "downloadProject", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_auth_1.JwtAuthGuard),
    (0, common_1.Post)('continue'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('session-id')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], GeminiController.prototype, "continueConversation", null);
exports.GeminiController = GeminiController = GeminiController_1 = __decorate([
    (0, common_1.Controller)('api/gemini'),
    __metadata("design:paramtypes", [gemini_service_1.GeminiService,
        conversation_service_1.ConversationService])
], GeminiController);
//# sourceMappingURL=gemini.controller.js.map