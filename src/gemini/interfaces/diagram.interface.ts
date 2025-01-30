// src/gemini/interfaces/diagram.interface.ts

export interface DiagramElement {
    id: string;
    type: string;
    name: string;
    attributes?: string[];
    methods?: string[];
    properties?: Record<string, any>;
  }
  
  export interface DiagramRelationship {
    id: string;
    type: string;
    source: string;
    target: string;
    label?: string;
    properties?: Record<string, any>;
  }
  
  export interface Diagram {
    type: DiagramType;
    title: string;
    description: string;
    elements: DiagramElement[];
    relationships: DiagramRelationship[];
  }
  
  export type DiagramType = 
    // Diagramas estructurales
    | 'class'
    | 'component'
    | 'deployment'
    | 'object'
    | 'profile'
    // Diagramas de comportamiento
    | 'activity'
    | 'useCase'
    | 'sequence'
    | 'communication'
    | 'timing';
  
  export interface IEEE830Requirement {
    id: string;
    type: 'functional' | 'non-functional';
    description: string;
    priority: 'high' | 'medium' | 'low';
    dependencies?: string[];
  }
  
  export interface AnalysisResponse {
    requirements: IEEE830Requirement[];
    diagrams: Diagram[];
  }