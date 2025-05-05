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
                await this.conversationRepository.save(conversation);
                this.logger.log(`Conversación guardada en BD para usuario ${userId} con ID: ${conversation.id}`);
            }
            catch (error) {
                this.logger.error(`Error al guardar conversación en BD: ${error.message}`);
            }
        }
    }
    async getConversation(sessionId) {
        const memoryConversation = this.conversations.get(sessionId);
        if (memoryConversation) {
            return memoryConversation;
        }
        try {
            const dbConversation = await this.conversationRepository.findOne({
                where: { sessionId }
            });
            if (dbConversation) {
                this.conversations.set(sessionId, {
                    originalRequirements: dbConversation.originalRequirements,
                    requirements: dbConversation.requirements || [],
                    diagrams: dbConversation.diagrams || [],
                    messages: dbConversation.messages || []
                });
                return this.conversations.get(sessionId);
            }
        }
        catch (error) {
            this.logger.error(`Error al buscar conversación en BD: ${error.message}`);
        }
        return null;
    }
    async updateConversation(sessionId, requirements, diagrams, userId) {
        const conversation = await this.getConversation(sessionId);
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
                await this.conversationRepository.update({ sessionId }, {
                    requirements: conversation.requirements,
                    diagrams: conversation.diagrams,
                    messages: conversation.messages,
                    updatedAt: new Date()
                });
            }
            catch (error) {
                this.logger.error(`Error al actualizar conversación en BD: ${error.message}`);
            }
        }
    }
    async addMessage(sessionId, role, content, userId) {
        const conversation = await this.getConversation(sessionId);
        if (!conversation) {
            throw new Error(`Conversación con ID ${sessionId} no encontrada`);
        }
        conversation.messages.push({ role, content });
        this.conversations.set(sessionId, conversation);
        if (userId) {
            try {
                await this.conversationRepository.update({ sessionId }, {
                    messages: conversation.messages,
                    updatedAt: new Date()
                });
            }
            catch (error) {
                this.logger.error(`Error al añadir mensaje en BD: ${error.message}`);
            }
        }
    }
    getFullPrompt(sessionId) {
        const conversation = this.conversations.get(sessionId);
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
};
exports.ConversationService = ConversationService;
exports.ConversationService = ConversationService = ConversationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(conversation_entity_1.Conversation)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ConversationService);
//# sourceMappingURL=conversation.service.js.map