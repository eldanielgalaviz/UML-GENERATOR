import { GeminiService } from './gemini.service';
import { AnalyzeRequirementsDto } from './dto/analyze-requirements.dto';
import { GenerateCodeDto } from './dto/generate-code.dto';
import { ConversationService } from '../conversation/conversation.service';
import { AnalysisResponse, GeneratedCode } from './interfaces/code-generation.interface';
export declare class GeminiController {
    private readonly geminiService;
    private readonly conversationService;
    private readonly logger;
    constructor(geminiService: GeminiService, conversationService: ConversationService);
    analyzeRequirements(dto: AnalyzeRequirementsDto, sessionId: string, req: any): Promise<AnalysisResponse & {
        sessionId: string;
    }>;
    generateCode(dto: GenerateCodeDto, sessionId: string, req: any): Promise<GeneratedCode>;
    continueConversation(dto: {
        message: string;
    }, sessionId: string, req: any): Promise<AnalysisResponse & {
        sessionId: string;
    }>;
}
