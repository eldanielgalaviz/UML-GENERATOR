export type NestJSFileType = 'controller' | 'service' | 'entity' | 'dto' | 'module' | 'config' | 'filter' | 'guard' | 'strategy';
export type AngularFileType = 'component' | 'service' | 'module' | 'guard' | 'interceptor' | 'model' | 'interface' | 'config' | 'material' | 'class' | 'typescript';
export interface NestJSFile {
    path: string;
    content: string;
    type: NestJSFileType;
}
export interface AngularFile {
    path: string;
    content: string;
    type: AngularFileType;
}
export interface NestJSModule {
    name: string;
    files: NestJSFile[];
    cliCommands: string[];
}
export interface AngularModule {
    name: string;
    files: AngularFile[];
    cliCommands: string[];
}
export interface NestJSBackend {
    modules: NestJSModule[];
    commonFiles: NestJSFile[];
    cliCommands: string[];
}
export interface AngularFrontend {
    modules: AngularModule[];
    commonFiles: AngularFile[];
    cliCommands: string[];
}
export interface GeneratedCode {
    backend: NestJSBackend;
    frontend: AngularFrontend;
}
export type DiagramType = 'classDiagram' | 'sequenceDiagram' | 'useCaseDiagram' | 'componentDiagram' | 'packageDiagram';
export interface IEEE830Requirement {
    id: string;
    type: 'functional' | 'non-functional';
    description: string;
    priority: 'high' | 'medium' | 'low';
    dependencies: string[];
}
export interface MermaidDiagram {
    type: DiagramType;
    title: string;
    code: string;
}
export interface AnalysisResponse {
    requirements: IEEE830Requirement[];
    diagrams: MermaidDiagram[];
}
export interface EntityDefinition {
    name: string;
    attributes: string[];
    methods: string[];
}
export interface FlowDefinition {
    from: string;
    to: string;
    action: string;
}
