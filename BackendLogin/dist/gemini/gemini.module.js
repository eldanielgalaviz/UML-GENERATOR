"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const gemini_controller_1 = require("./gemini.controller");
const gemini_service_1 = require("./gemini.service");
const conversation_service_1 = require("../conversation/conversation.service");
const conversation_entity_1 = require("../conversation/entities/conversation.entity");
let GeminiModule = class GeminiModule {
};
exports.GeminiModule = GeminiModule;
exports.GeminiModule = GeminiModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            typeorm_1.TypeOrmModule.forFeature([conversation_entity_1.Conversation])
        ],
        controllers: [gemini_controller_1.GeminiController],
        providers: [gemini_service_1.GeminiService, conversation_service_1.ConversationService],
    })
], GeminiModule);
//# sourceMappingURL=gemini.module.js.map