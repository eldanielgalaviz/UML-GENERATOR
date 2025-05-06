import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { IEEE830Requirement, MermaidDiagram } from '../gemini/interfaces/diagram.interface';
export declare class ConversationService {
    private conversationRepository;
    private readonly logger;
    private conversations;
    constructor(conversationRepository: Repository<Conversation>);
    createConversation(sessionId: string, originalRequirements: string, userId?: number): Promise<void>;
    saveGeneratedCode(sessionId: string, userId: number, generatedCode: any): Promise<void>;
    getConversation(sessionId: string): Promise<any>;
    updateConversation(sessionId: string, requirements?: IEEE830Requirement[], diagrams?: MermaidDiagram[], userId?: number): Promise<void>;
    addMessage(sessionId: string, role: 'user' | 'system', content: string, userId?: number): Promise<void>;
    getFullPrompt(sessionId: string): string;
    getUserConversations(userId: number): Promise<Conversation[]>;
    private generateTitle;
    createOrUpdateConversation(sessionId: string, originalRequirements: string, userId: number, requirements?: any[], diagrams?: any[]): Promise<void>;
    getConversationWithDetails(sessionId: string, userId: number): Promise<any>;
}
