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
var ConversationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const conversation_entity_1 = require("./entities/conversation.entity");
let ConversationService = ConversationService_1 = class ConversationService {
    constructor(conversationRepository) {
        this.conversationRepository = conversationRepository;
        this.logger = new common_1.Logger(ConversationService_1.name);
        this.conversations = new Map();
    }
    async createConversation(sessionId, originalRequirements, userId) {
        console.log(`🔄 Creando conversación - SessionId: ${sessionId}, UserId: ${userId}`);
        this.conversations.set(sessionId, {
            originalRequirements,
            requirements: [],
            diagrams: [],
            messages: [
                {
                    role: 'user',
                    content: originalRequirements
                }
            ]
        });
        if (userId) {
            try {
                console.log(`💾 Guardando conversación en BD para usuario ${userId}`);
                const conversation = this.conversationRepository.create({
                    sessionId,
                    title: this.generateTitle(originalRequirements),
                    originalRequirements,
                    requirements: [],
                    diagrams: [],
                    messages: [
                        {
                            role: 'user',
                            content: originalRequirements
                        }
                    ],
                    userId
                });
                const savedConversation = await this.conversationRepository.save(conversation);
                console.log(`✅ Conversación guardada en BD con ID: ${savedConversation.id}`);
                this.logger.log(`Conversación guardada en BD para usuario ${userId} con ID: ${savedConversation.id}`);
            }
            catch (error) {
                console.error(`❌ Error al guardar conversación en BD: ${error.message}`);
                this.logger.error(`Error al guardar conversación en BD: ${error.message}`);
            }
        }
        else {
            console.warn(`⚠️ No se proporcionó userId, conversación solo en memoria`);
        }
    }
    async updateConversation(sessionId, requirements, diagrams, userId) {
        console.log(`🔄 Actualizando conversación - SessionId: ${sessionId}, UserId: ${userId}`);
        const conversation = this.getConversation(sessionId);
        if (!conversation) {
            throw new Error(`Conversación con ID ${sessionId} no encontrada`);
        }
        if (requirements) {
            conversation.requirements = requirements;
        }
        if (diagrams) {
            conversation.diagrams = diagrams;
        }
        this.conversations.set(sessionId, conversation);
        if (userId) {
            try {
                console.log(`💾 Actualizando conversación en BD para usuario ${userId}`);
                const updateResult = await this.conversationRepository.update({ sessionId, userId }, {
                    requirements: conversation.requirements,
                    diagrams: conversation.diagrams,
                    messages: conversation.messages,
                    updatedAt: new Date()
                });
                console.log(`✅ Conversación actualizada en BD. Filas afectadas: ${updateResult.affected}`);
                if (updateResult.affected === 0) {
                    console.warn(`⚠️ No se encontró conversación en BD para actualizar: ${sessionId}`);
                    await this.createOrUpdateConversation(sessionId, conversation.originalRequirements, userId, conversation.requirements, conversation.diagrams);
                }
            }
            catch (error) {
                console.error(`❌ Error al actualizar conversación en BD: ${error.message}`);
                this.logger.error(`Error al actualizar conversación en BD: ${error.message}`);
            }
        }
        else {
            console.warn(`⚠️ No se proporcionó userId, actualización solo en memoria`);
        }
    }
    async addMessage(sessionId, role, content, userId) {
        console.log(`💬 Añadiendo mensaje - SessionId: ${sessionId}, Role: ${role}, UserId: ${userId}`);
        const conversation = this.getConversation(sessionId);
        if (!conversation) {
            throw new Error(`Conversación con ID ${sessionId} no encontrada`);
        }
        conversation.messages.push({ role, content });
        this.conversations.set(sessionId, conversation);
        if (userId) {
            try {
                console.log(`💾 Guardando mensaje en BD para usuario ${userId}`);
                const updateResult = await this.conversationRepository.update({ sessionId, userId }, {
                    messages: conversation.messages,
                    updatedAt: new Date()
                });
                console.log(`✅ Mensaje guardado en BD. Filas afectadas: ${updateResult.affected}`);
                if (updateResult.affected === 0) {
                    console.warn(`⚠️ No se encontró conversación en BD para guardar mensaje: ${sessionId}`);
                }
            }
            catch (error) {
                console.error(`❌ Error al añadir mensaje en BD: ${error.message}`);
                this.logger.error(`Error al añadir mensaje en BD: ${error.message}`);
            }
        }
        else {
            console.warn(`⚠️ No se proporcionó userId, mensaje solo en memoria`);
        }
    }
    updateGeneratedCode(sessionId, generatedCode) {
        const conversation = this.getConversation(sessionId);
        if (!conversation) {
            throw new Error(`Conversación con ID ${sessionId} no encontrada`);
        }
        conversation.generatedCode = generatedCode;
        this.conversations.set(sessionId, conversation);
        this.logger.log(`Código generado actualizado para sesión: ${sessionId}`);
    }
    async saveGeneratedCode(sessionId, userId, generatedCode) {
        try {
            const conversation = await this.conversationRepository.findOne({
                where: { sessionId, userId }
            });
            if (!conversation) {
                this.logger.warn(`No se encontró conversación ${sessionId} para guardar código`);
                return;
            }
            await this.conversationRepository.update({ id: conversation.id }, {
                generatedCode: generatedCode,
                updatedAt: new Date()
            });
            this.logger.log(`Código generado guardado para conversación ${sessionId}`);
        }
        catch (error) {
            this.logger.error(`Error al guardar código generado: ${error.message}`);
            throw error;
        }
    }
    getConversation(sessionId) {
        const memoryConversation = this.conversations.get(sessionId);
        if (memoryConversation) {
            return memoryConversation;
        }
        return null;
    }
    async findConversationById(sessionId) {
        try {
            const dbConversation = await this.conversationRepository.findOne({
                where: { sessionId }
            });
            if (dbConversation) {
                const conversationState = {
                    originalRequirements: dbConversation.originalRequirements,
                    requirements: dbConversation.requirements || [],
                    diagrams: dbConversation.diagrams || [],
                    messages: dbConversation.messages || [],
                    generatedCode: dbConversation.generatedCode
                };
                this.conversations.set(sessionId, conversationState);
                return conversationState;
            }
            return null;
        }
        catch (error) {
            this.logger.error(`Error al buscar conversación en BD: ${error.message}`);
            return null;
        }
    }
    getFullPrompt(sessionId) {
        const conversation = this.getConversation(sessionId);
        if (!conversation) {
            throw new Error(`Conversación con ID ${sessionId} no encontrada`);
        }
        let fullPrompt = conversation.originalRequirements + "\n\n";
        for (let i = 1; i < conversation.messages.length; i++) {
            const message = conversation.messages[i];
            if (message.role === 'user') {
                fullPrompt += `Usuario: ${message.content}\n\n`;
            }
            else {
                fullPrompt += `Sistema: ${message.content}\n\n`;
            }
        }
        return fullPrompt;
    }
    async getUserConversations(userId) {
        try {
            return await this.conversationRepository.find({
                where: { userId },
                order: { updatedAt: 'DESC' }
            });
        }
        catch (error) {
            this.logger.error(`Error al obtener conversaciones del usuario ${userId}: ${error.message}`);
            return [];
        }
    }
    generateTitle(requirements) {
        const words = requirements.split(' ').slice(0, 5).join(' ');
        return words.length > 30 ? words.substring(0, 30) + '...' : words;
    }
    async createOrUpdateConversation(sessionId, originalRequirements, userId, requirements, diagrams) {
        try {
            const existingConversation = await this.conversationRepository.findOne({
                where: { sessionId, userId }
            });
            if (existingConversation) {
                await this.conversationRepository.update({ id: existingConversation.id }, {
                    requirements: requirements || existingConversation.requirements,
                    diagrams: diagrams || existingConversation.diagrams,
                    updatedAt: new Date()
                });
                this.logger.log(`Conversación ${sessionId} actualizada para usuario ${userId}`);
            }
            else {
                const conversation = this.conversationRepository.create({
                    sessionId,
                    title: this.generateTitle(originalRequirements),
                    originalRequirements,
                    requirements: requirements || [],
                    diagrams: diagrams || [],
                    messages: [
                        {
                            role: 'user',
                            content: originalRequirements
                        }
                    ],
                    userId
                });
                await this.conversationRepository.save(conversation);
                this.logger.log(`Nueva conversación ${sessionId} guardada para usuario ${userId}`);
            }
            this.conversations.set(sessionId, {
                originalRequirements,
                requirements: requirements || [],
                diagrams: diagrams || [],
                messages: [
                    {
                        role: 'user',
                        content: originalRequirements
                    }
                ]
            });
        }
        catch (error) {
            this.logger.error(`Error guardando conversación: ${error.message}`);
            throw error;
        }
    }
    async getConversationWithDetails(sessionId, userId) {
        var _a;
        try {
            const conversation = await this.conversationRepository.findOne({
                where: {
                    sessionId,
                    userId
                }
            });
            if (!conversation) {
                this.logger.warn(`Conversación ${sessionId} no encontrada para usuario ${userId}`);
                return null;
            }
            const response = {
                sessionId,
                requirements: conversation.requirements || [],
                diagrams: conversation.diagrams || [],
                generatedCode: conversation.generatedCode || null,
                originalRequirements: conversation.originalRequirements,
                messages: conversation.messages || []
            };
            this.logger.log(`Recuperados detalles de conversación ${sessionId} con ${((_a = response.diagrams) === null || _a === void 0 ? void 0 : _a.length) || 0} diagramas`);
            this.conversations.set(sessionId, {
                originalRequirements: conversation.originalRequirements,
                requirements: conversation.requirements || [],
                diagrams: conversation.diagrams || [],
                messages: conversation.messages || [],
                generatedCode: conversation.generatedCode
            });
            return response;
        }
        catch (error) {
            this.logger.error(`Error al obtener detalles de conversación ${sessionId}: ${error.message}`);
            throw error;
        }
    }
};
exports.ConversationService = ConversationService;
exports.ConversationService = ConversationService = ConversationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(conversation_entity_1.Conversation)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ConversationService);
//# sourceMappingURL=conversation.service.js.map