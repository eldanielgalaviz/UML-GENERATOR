import React, { useState, useEffect } from 'react';

interface CodeFile {
  path: string;
  content: string;
  type: string;
}

interface CodeModule {
  name: string;
  files: CodeFile[];
  cliCommands?: string[];
}

interface CodeSection {
  modules: CodeModule[];
  commonFiles: CodeFile[];
  cliCommands?: string[];
}

interface GeneratedCode {
  backend?: CodeSection;
  frontend?: CodeSection;
}

interface CodeViewerProps {
  generatedCode?: GeneratedCode;
}

const CodeViewer: React.FC<CodeViewerProps> = ({ generatedCode }) => {
  const [activeTab, setActiveTab] = useState<'backend' | 'frontend'>('backend');
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  useEffect(() => {
    const currentSection = generatedCode?.[activeTab];
    if (currentSection?.modules && currentSection.modules.length > 0) {
      const firstModule = currentSection.modules[0];
      setSelectedModule(firstModule.name);
      if (firstModule.files && firstModule.files.length > 0) {
        setSelectedFile(firstModule.files[0].path);
      }
    } else {
      setSelectedModule('');
      setSelectedFile(null);
    }
  }, [generatedCode, activeTab]);

  if (!generatedCode) {
    return (
      <div className="p-4 text-center text-gray-500">
        No hay código generado. Por favor, genera primero los diagramas.
      </div>
    );
  }

  const currentSection = generatedCode[activeTab] ?? {
    modules: [],
    commonFiles: [],
    cliCommands: []
  };

  const modules = currentSection.modules ?? [];
  const commonFiles = currentSection.commonFiles ?? [];
  const cliCommands = currentSection.cliCommands ?? [];

  const getSelectedModule = (): CodeModule | undefined => 
    modules.find(m => m.name === selectedModule);

  const getCurrentFiles = (): CodeFile[] => {
    if (selectedModule === 'common') {
      return commonFiles;
    }
    return getSelectedModule()?.files ?? [];
  };

  const getFileContent = (): string | null => {
    if (!selectedFile) return null;
    
    const allFiles = [...getCurrentFiles(), ...commonFiles];
    const selectedFileContent = allFiles.find(f => f.path === selectedFile)?.content;
    return selectedFileContent ?? null;
  };

  const renderModuleList = () => (
    <div className="col-span-3">
      <h3 className="font-bold mb-2">Módulos:</h3>
      <div className="space-y-2">
        {modules.map((module) => (
          <button
            key={module.name}
            onClick={() => {
              setSelectedModule(module.name);
              const firstFile = module.files[0];
              if (firstFile) {
                setSelectedFile(firstFile.path);
              }
            }}
            className={`w-full text-left p-2 rounded ${
              selectedModule === module.name ? 'bg-[#27282e]' : 'hover:bg-[#27282e]'
            }`}
          >
            {module.name}
          </button>
        ))}
        {commonFiles.length > 0 && (
          <button
            onClick={() => {
              setSelectedModule('common');
              const firstCommonFile = commonFiles[0];
              if (firstCommonFile) {
                setSelectedFile(firstCommonFile.path);
              }
            }}
            className={`w-full text-left p-2 rounded ${
              selectedModule === 'common' ? 'bg-[#27282e]' : 'hover:bg-[#27282e]'
            }`}
          >
            Archivos Comunes
          </button>
        )}
      </div>
    </div>
  );

  const renderFileList = () => {
    const files = getCurrentFiles();
    
    return (
      <div className="col-span-3">
        <h3 className="font-bold mb-2">Archivos:</h3>
        <div className="space-y-2">
          {files.map((file) => (
            <button
              key={file.path}
              onClick={() => setSelectedFile(file.path)}
              className={`w-full text-left p-2 rounded ${
                selectedFile === file.path ? 'bg-[#27282e]' : 'hover:bg-[#27282e]'
              }`}
            >
              {file.path.split('/').pop() ?? 'Sin nombre'}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderCode = () => (
    <div className="col-span-6">
      <h3 className="font-bold mb-2">Código:</h3>
      {selectedFile ? (
        <pre className="bg-[#27282e] p-4 rounded overflow-auto max-h-[600px] whitespace-pre-wrap">
          <code>{getFileContent() ?? ''}</code>
        </pre>
      ) : (
        <div className="text-gray-500">
          Selecciona un archivo para ver su código
        </div>
      )}
    </div>
  );

  const renderCliCommands = () => {
    if (!cliCommands || cliCommands.length === 0) return null;
    
    return (
      <div className="mb-4">
        <h3 className="font-bold mb-2">Comandos CLI:</h3>
        <pre className="bg-[#27282e] p-4 rounded overflow-auto">
          {cliCommands.join('\n')}
        </pre>
      </div>
    );
  };

  return (
    <div className="p-4">
      <div className="flex mb-4 gap-2">
        <button
          onClick={() => setActiveTab('backend')}
          className={`px-4 py-2 rounded ${
            activeTab === 'backend' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          Backend (NestJS)
        </button>
        <button
          onClick={() => setActiveTab('frontend')}
          className={`px-4 py-2 rounded ${
            activeTab === 'frontend' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          Frontend (Angular)
        </button>
      </div>

      {renderCliCommands()}

      <div className="grid grid-cols-12 gap-4">
        {renderModuleList()}
        {renderFileList()}
        {renderCode()}
      </div>
    </div>
  );
};

export default CodeViewer;