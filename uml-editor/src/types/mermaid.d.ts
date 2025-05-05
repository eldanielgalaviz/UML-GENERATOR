// src/types/mermaid.d.ts

interface MermaidAPI {
    render: (id: string, text: string) => Promise<{ svg: string }>;
    run: (options: { nodes: HTMLElement[] }) => Promise<void>;
    initialize: (config: any) => void;
    init: (config: any, nodes?: HTMLElement[] | string) => void;
    contentLoaded: () => void;
    parse: (text: string) => void;
    setParseErrorHandler: (handler: (error: any) => void) => void;
  }
  
  declare global {
    interface Window {
      mermaid: MermaidAPI;
    }
  }
  
  export {};