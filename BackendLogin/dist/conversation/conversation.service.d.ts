import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { IEEE830Requirement, MermaidDiagram, GeneratedCode } from '../gemini/interfaces/code-generation.interface';
export interface ConversationState {
    originalRequirements: string;
    requirements: IEEE830Requirement[];
    diagrams: MermaidDiagram[];
    generatedCode?: GeneratedCode;
    messages: {
        role: 'user' | 'system';
        content: string;
    }[];
}
export declare class ConversationService {
    private conversationRepository;
    private readonly logger;
    private conversations;
    constructor(conversationRepository: Repository<Conversation>);
    createConversation(sessionId: string, originalRequirements: string, userId?: number): Promise<void>;
    updateConversation(sessionId: string, requirements?: IEEE830Requirement[], diagrams?: MermaidDiagram[], userId?: number): Promise<void>;
    addMessage(sessionId: string, role: 'user' | 'system', content: string, userId?: number): Promise<void>;
    updateGeneratedCode(sessionId: string, generatedCode: GeneratedCode): void;
    saveGeneratedCode(sessionId: string, userId: number, generatedCode: GeneratedCode): Promise<void>;
    getConversation(sessionId: string): ConversationState | null;
    findConversationById(sessionId: string): Promise<any>;
    getFullPrompt(sessionId: string): string;
    getUserConversations(userId: number): Promise<Conversation[]>;
    private generateTitle;
    createOrUpdateConversation(sessionId: string, originalRequirements: string, userId: number, requirements?: any[], diagrams?: any[]): Promise<void>;
    getConversationWithDetails(sessionId: string, userId: number): Promise<any>;
}
