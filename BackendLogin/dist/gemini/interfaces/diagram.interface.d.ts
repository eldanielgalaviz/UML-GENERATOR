export interface IEEE830Requirement {
    id: string;
    type: 'functional' | 'non-functional';
    description: string;
    priority: 'high' | 'medium' | 'low';
    dependencies?: string[];
}
export interface MermaidDiagram {
    type: DiagramType;
    title: string;
    code: string;
}
export type DiagramType = 'classDiagram' | 'sequenceDiagram' | 'useCaseDiagram' | 'componentDiagram' | 'packageDiagram';
export interface AnalysisResponse {
    requirements: IEEE830Requirement[];
    diagrams: MermaidDiagram[];
}
