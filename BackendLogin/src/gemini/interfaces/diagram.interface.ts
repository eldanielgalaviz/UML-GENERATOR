// src/gemini/interfaces/diagram.interface.ts

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
  
// src/gemini/interfaces/diagram.interface.ts
  export type DiagramType =
    | 'sequenceDiagram'
    | 'classDiagram'
    | 'packageDiagram'
    | 'useCaseDiagram'
    | 'componentDiagram';
  
  export interface AnalysisResponse {
    requirements: IEEE830Requirement[];
    diagrams: MermaidDiagram[];
  }