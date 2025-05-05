"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ConversationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationService = void 0;
const common_1 = require("@nestjs/common");
let ConversationService = ConversationService_1 = class ConversationService {
    constructor() {
        this.logger = new common_1.Logger(ConversationService_1.name);
        this.conversations = new Map();
    }
    createConversation(sessionId, originalRequirements) {
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
        this.logger.log(`Conversación creada con ID: ${sessionId}`);
    }
    getConversation(sessionId) {
        return this.conversations.get(sessionId) || null;
    }
    updateConversation(sessionId, requirements, diagrams) {
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
        this.logger.log(`Conversación actualizada: ${sessionId}`);
    }
    addMessage(sessionId, role, content) {
        const conversation = this.getConversation(sessionId);
        if (!conversation) {
            throw new Error(`Conversación con ID ${sessionId} no encontrada`);
        }
        conversation.messages.push({ role, content });
        this.conversations.set(sessionId, conversation);
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
};
exports.ConversationService = ConversationService;
exports.ConversationService = ConversationService = ConversationService_1 = __decorate([
    (0, common_1.Injectable)()
], ConversationService);
//# sourceMappingURL=conversation.service.js.map