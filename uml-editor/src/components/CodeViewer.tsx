import React, { useState, useEffect } from 'react';
import DownloadProjectButton from './DownloadProjectButton';

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

interface DatabaseSection {
  scripts: string[];
}

interface GeneratedCode {
  backend?: CodeSection;
  frontend?: CodeSection;
  database?: DatabaseScripts;
}

interface DatabaseScripts {
  scripts: string[];
}

interface CodeViewerProps {
  generatedCode?: GeneratedCode;
  sessionId?: string | null;
}

const CodeViewer: React.FC<CodeViewerProps> = ({ generatedCode, sessionId }) => {
  const [activeTab, setActiveTab] = useState<'backend' | 'frontend' | 'database'>('backend');
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [selectedScript, setSelectedScript] = useState<number | null>(null);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [localSessionId, setLocalSessionId] = useState<string | null>(null);

  // Intentar obtener sessionId del localStorage si no se proporciona como prop
  useEffect(() => {
    if (!sessionId) {
      const storedSessionId = localStorage.getItem('currentSessionId');
      if (storedSessionId) {
        console.log("Se encontró sessionId en localStorage:", storedSessionId);
        setLocalSessionId(storedSessionId);
      }
    }
  }, [sessionId]);

  // Añadir logs para depuración
  useEffect(() => {
    const effectiveSessionId = sessionId || localSessionId;
    console.log("CodeViewer - Estado inicial:", {
      sessionId: effectiveSessionId,
      hasGeneratedCode: !!generatedCode,
      hasBackend: !!generatedCode?.backend,
      hasFrontend: !!generatedCode?.frontend,
      hasDatabase: !!generatedCode?.database
    });
  }, [sessionId, localSessionId, generatedCode]);

  // Determinar si el botón de descarga debe estar habilitado
  useEffect(() => {
    const effectiveSessionId = sessionId || localSessionId;
    const shouldBeEnabled = !!effectiveSessionId && !!generatedCode;
    setIsButtonDisabled(!shouldBeEnabled);
    
    console.log("Estado del botón de descarga actualizado:", {
      sessionId: effectiveSessionId,
      hasGeneratedCode: !!generatedCode,
      isButtonDisabled: !shouldBeEnabled
    });
  }, [sessionId, localSessionId, generatedCode]);
  
  useEffect(() => {
    if (activeTab === 'database') {
      // Si estamos en la pestaña de base de datos, seleccionar el primer script
      if (generatedCode?.database?.scripts && generatedCode.database.scripts.length > 0) {
        setSelectedScript(0);
      } else {
        setSelectedScript(null);
      }
      return;
    }

    // Lógica para backend y frontend
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
  
  const handleDownloadProject = async () => {
    const effectiveSessionId = sessionId || localSessionId;
    
    if (!effectiveSessionId) {
      setDownloadError("No hay una sesión activa. Inténtalo de nuevo.");
      return;
    }

    try {
      setIsDownloading(true);
      setDownloadError(null);
      
      // Obtener token del localStorage
      const token = localStorage.getItem('token');
      
      // URL para la descarga directa
      const downloadUrl = `http://localhost:3005/api/gemini/download-project?sessionId=${effectiveSessionId}`;
      
      console.log('Iniciando descarga desde:', downloadUrl);
      
      // Opción 1: Usar un enlace de descarga
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.target = '_blank';
      link.download = 'proyecto-generado.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Opción 2: Usar un iframe como alternativa (si la opción 1 falla)
      setTimeout(() => {
        if (confirm('¿No se inició la descarga? Intentar método alternativo')) {
          const iframe = document.createElement('iframe');
          iframe.style.display = 'none';
          iframe.src = downloadUrl;
          document.body.appendChild(iframe);
          
          // Limpiar después de un tiempo
          setTimeout(() => {
            document.body.removeChild(iframe);
          }, 10000); // 10 segundos para permitir que la descarga comience
        }
        setIsDownloading(false);
      }, 3000);
    } catch (err) {
      console.error('Error en descarga:', err);
      setDownloadError("Error al descargar. Inténtalo de nuevo.");
      setIsDownloading(false);
    }
  };

  // Botón para depurar sesiones (solo desarrollo)
  const showAllSessionIds = () => {
    const items = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        items.push(`${key}: ${value}`);
      }
    }
    console.log('Todos los items en localStorage:', items);
    alert(`Items en localStorage:\n${items.join('\n')}`);
  };

  const currentSection = activeTab !== 'database' ? generatedCode[activeTab] ?? {
    modules: [],
    commonFiles: [],
    cliCommands: []
  } : null;

  const modules = currentSection?.modules ?? [];
  const commonFiles = currentSection?.commonFiles ?? [];
  const cliCommands = currentSection?.cliCommands ?? [];
  const databaseScripts = generatedCode.database?.scripts ?? [];

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

  const getScriptContent = (): string | null => {
    if (selectedScript === null) return null;
    return databaseScripts[selectedScript] || null;
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

  const renderScriptList = () => (
    <div className="col-span-3">
      <h3 className="font-bold mb-2">Scripts SQL:</h3>
      <div className="space-y-2">
        {databaseScripts.map((script, index) => {
          // Extraer nombre del script del comentario
          const nameMatch = script.match(/-- Archivo: (\w+\.sql)/);
          const scriptName = nameMatch ? nameMatch[1] : `Script SQL ${index + 1}`;
          
          return (
            <button
              key={index}
              onClick={() => setSelectedScript(index)}
              className={`w-full text-left p-2 rounded ${
                selectedScript === index ? 'bg-[#27282e]' : 'hover:bg-[#27282e]'
              }`}
            >
              {scriptName}
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderCode = () => (
    <div className="col-span-9">
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

  const renderSqlScript = () => (
    <div className="col-span-9">
      <h3 className="font-bold mb-2">Script SQL:</h3>
      {selectedScript !== null ? (
        <pre className="bg-[#27282e] p-4 rounded overflow-auto max-h-[600px] whitespace-pre-wrap">
          <code>{getScriptContent() ?? ''}</code>
        </pre>
      ) : (
        <div className="text-gray-500">
          Selecciona un script para ver su contenido
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

  // Función para renderizar un mensaje si no hay scripts generados
  const renderNoScripts = () => (
    <div className="p-4 text-center text-gray-500">
      No hay scripts SQL generados. Los scripts de base de datos se generarán automáticamente junto con el código.
    </div>
  );

  // Usar el sessionId de props o el localSessionId
  const effectiveSessionId = sessionId || localSessionId;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
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
          <button
            onClick={() => setActiveTab('database')}
            className={`px-4 py-2 rounded ${
              activeTab === 'database' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Base de Datos (PostgreSQL)
          </button>
        </div>
        
        <div className="flex flex-col items-end">
          {/* Botón de descarga directo */}
          <button
            onClick={handleDownloadProject}
            disabled={isDownloading || !effectiveSessionId}
            className={`flex items-center gap-2 px-4 py-2 rounded mb-1 ${
              isDownloading || !effectiveSessionId
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            } text-white`}
          >
            {isDownloading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Descargando...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Descargar Proyecto
              </>
            )}
          </button>
          
          {downloadError && (
            <div className="text-red-500 text-sm">{downloadError}</div>
          )}
          
          {/* Info de sesión y depuración (oculta en producción) */}
          <div className="text-xs text-gray-500 flex gap-2 items-center">
            <span>Session ID: {effectiveSessionId || 'No disponible'}</span>
            <button 
              onClick={showAllSessionIds}
              className="text-blue-400 hover:underline"
              title="Debug: Mostrar localStorage"
            >
              🐞
            </button>
          </div>
        </div>
      </div>

      {activeTab !== 'database' && renderCliCommands()}

      <div className="grid grid-cols-12 gap-4">
        {activeTab === 'database' ? (
          databaseScripts.length > 0 ? (
            <>
              {renderScriptList()}
              {renderSqlScript()}
            </>
          ) : (
            renderNoScripts()
          )
        ) : (
          <>
            {renderModuleList()}
            {renderFileList()}
            {renderCode()}
          </>
        )}
      </div>
      <button 
  onClick={showAllSessionIds}
  className="text-xs text-gray-500 underline"
>
  Debug: Mostrar Todos los SessionIDs
</button>
    </div>
  );
};

export default CodeViewer;