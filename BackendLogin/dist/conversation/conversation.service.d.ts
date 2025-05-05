import { IEEE830Requirement, MermaidDiagram } from '../gemini/interfaces/code-generation.interface';
interface ConversationState {
    originalRequirements: string;
    requirements: IEEE830Requirement[];
    diagrams: MermaidDiagram[];
    messages: {
        role: 'user' | 'system';
        content: string;
    }[];
}
export declare class ConversationService {
    private readonly logger;
    private conversations;
    createConversation(sessionId: string, originalRequirements: string): void;
    getConversation(sessionId: string): ConversationState | null;
    updateConversation(sessionId: string, requirements?: IEEE830Requirement[], diagrams?: MermaidDiagram[]): void;
    addMessage(sessionId: string, role: 'user' | 'system', content: string): void;
    getFullPrompt(sessionId: string): string;
}
export {};
