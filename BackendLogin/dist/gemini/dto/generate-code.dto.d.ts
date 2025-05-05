export declare class MermaidDiagramDto {
    type: 'classDiagram' | 'sequenceDiagram' | 'useCaseDiagram' | 'componentDiagram' | 'packageDiagram';
    title: string;
    code: string;
}
export declare class IEEE830RequirementDto {
    id: string;
    type: 'functional' | 'non-functional';
    description: string;
    priority: 'high' | 'medium' | 'low';
    dependencies: string[];
}
export declare class GenerateCodeDto {
    diagrams: MermaidDiagramDto[];
    requirements: IEEE830RequirementDto[];
}
