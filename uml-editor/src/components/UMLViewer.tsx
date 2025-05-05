import React, { useState, useEffect, useRef } from 'react';
import { analyzeRequirements, generateCode, continueConversation } from '../services/api.service';
import mermaid from 'mermaid';

interface DiagramType {
  type: 'classDiagram' | 'sequenceDiagram' | 'useCaseDiagram' | 'componentDiagram' | 'packageDiagram';
  title: string;
  code: string;
}

interface AnalysisResponse {
  requirements: any[];
  diagrams: DiagramType[];
  sessionId?: string;
  generatedCode?: any;
}

interface UMLViewerProps {
  onAnalysisComplete?: (response: AnalysisResponse) => void;
}


interface MermaidDiagramProps {
  code: string;
  diagramId?: string;
}

const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ code, diagramId }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Crear un ID único para este diagrama
    const id = `mermaid-${diagramId || Math.random().toString(36).substring(2, 11)}`;
    
    // Limpiar el estado
    setError(null);
    setLoading(true);
    
    // Función que maneja la renderización
    const renderDiagram = async () => {
      if (!code || code.trim() === '') {
        setError('No hay código para renderizar');
        setLoading(false);
        return;
      }
      
      try {
        // Verificar que mermaid esté disponible
        if (typeof window === 'undefined' || !window.mermaid) {
          console.error('Mermaid no está disponible');
          setError('La biblioteca Mermaid no está cargada correctamente');
          setLoading(false);
          return;
        }
        
        // Limpiar el contenedor antes de renderizar
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
          
          // Crear un elemento div temporal para el diagrama
          const tempDiv = document.createElement('div');
          tempDiv.id = id;
          tempDiv.style.width = '100%';
          tempDiv.textContent = code;
          containerRef.current.appendChild(tempDiv);
          
          // Inicializar mermaid
          window.mermaid.initialize({
            startOnLoad: false,
            theme: 'default',
            securityLevel: 'loose',
            fontFamily: 'monospace'
          });
          
          // Renderizar usando mermaidAPI directamente
          await window.mermaid.run({
            nodes: [tempDiv]
          });
          
          setLoading(false);
        }
      } catch (err) {
        console.error('Error al renderizar el diagrama:', err);
        setError(`Error al renderizar: ${err.message || 'Error desconocido'}`);
        setLoading(false);
        
        // Mostrar el código como texto para diagnóstico
        if (containerRef.current) {
          containerRef.current.innerHTML = `<div class="p-3 bg-red-50 text-red-500 rounded">
            <p class="font-bold">Error al renderizar el diagrama</p>
            <pre class="mt-2 text-xs overflow-auto bg-gray-100 p-2">${code}</pre>
          </div>`;
        }
      }
    };
    
    // Pequeño retraso para asegurar que el DOM esté listo
    const timer = setTimeout(() => {
      renderDiagram();
    }, 100);
    
    return () => {
      clearTimeout(timer);
    };
  }, [code, diagramId]);
  
  return (
    <div className="border rounded p-4">
      {error ? (
        <div className="p-3 bg-red-50 text-red-500 rounded">
          <p className="font-bold">Error al renderizar el diagrama:</p>
          <p>{error}</p>
          <details className="mt-2">
            <summary className="cursor-pointer text-blue-500">Ver código del diagrama</summary>
            <pre className="mt-2 p-2 bg-gray-100 overflow-auto text-xs">{code}</pre>
          </details>
        </div>
      ) : (
        <div className="bg-white min-h-[200px]" ref={containerRef}>
          {loading && (
            <div className="flex justify-center items-center h-[200px]">
              <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}
        </div>
      )}
    </div>
  );
};


const UMLViewer: React.FC<UMLViewerProps> = ({ onAnalysisComplete }) => {
  // Estado principal
  const [requirements, setRequirements] = useState('');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [diagrams, setDiagrams] = useState<DiagramType[]>([]);
  const [selectedDiagram, setSelectedDiagram] = useState<DiagramType | null>(null);
  const [analysisResponse, setAnalysisResponse] = useState<AnalysisResponse | null>(null);
  const [mermaidLoaded, setMermaidLoaded] = useState(false);
  
  // Estado para conversación
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [conversationMessage, setConversationMessage] = useState('');
  const [inConversationMode, setInConversationMode] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<{role: 'user' | 'system', content: string}[]>([]);
  
  // Para forzar la recreación de los diagramas
  const [diagramKey, setDiagramKey] = useState(0);

  // Carga de la biblioteca Mermaid
// Añade esta función mejorada en tu componente UMLViewer.tsx
// En UMLViewer.tsx, reemplaza el método de carga de Mermaid
useEffect(() => {
  const loadMermaid = async () => {
    try {
      // Si ya está cargado, no volver a cargar
      if (typeof window !== 'undefined' && window.mermaid) {
        console.log('Mermaid ya está cargado');
        setMermaidLoaded(true);
        return;
      }

      console.log('Cargando Mermaid...');
      
      // Crear script manualmente
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/mermaid@9.4.3/dist/mermaid.min.js'; // Versión estable conocida
      script.async = true;
      script.crossOrigin = 'anonymous';

      // Manejar eventos de carga
      script.onload = () => {
        console.log('Script de Mermaid cargado');
        
        if (typeof window !== 'undefined' && window.mermaid) {
          // Configuración básica
          window.mermaid.initialize({
            startOnLoad: false,
            securityLevel: 'loose',
            theme: 'default'
          });
          
          setMermaidLoaded(true);
          console.log('Mermaid inicializado correctamente');
        } else {
          console.error('Mermaid no disponible después de cargar');
          setError('Error al inicializar Mermaid');
        }
      };

      script.onerror = (e) => {
        console.error('Error al cargar el script de Mermaid:', e);
        
        // Intento alternativo con otro CDN
        const backupScript = document.createElement('script');
        backupScript.src = 'https://cdn.jsdelivr.net/npm/mermaid@9.4.3/dist/mermaid.min.js';
        backupScript.async = true;
        
        backupScript.onload = () => {
          if (typeof window !== 'undefined' && window.mermaid) {
            window.mermaid.initialize({
              startOnLoad: false,
              securityLevel: 'loose',
              theme: 'default'
            });
            setMermaidLoaded(true);
            console.log('Mermaid inicializado correctamente (CDN alternativo)');
          } else {
            setError('Error al inicializar Mermaid');
          }
        };
        
        backupScript.onerror = () => {
          setError('Error al cargar la librería de diagramas');
        };
        
        document.head.appendChild(backupScript);
      };

      document.head.appendChild(script);
    } catch (err) {
      console.error('Error en loadMermaid:', err);
      setError('Error al configurar la librería de diagramas');
    }
  };

  loadMermaid();
}, []);

  const handleAnalyze = async () => {
    if (!requirements.trim()) {
      setError('Por favor ingresa los requerimientos');
      return;
    }

    try {
      setLoading(true);
      setError('');
      console.log('Enviando requerimientos al servidor...');

      // Añadir mensaje a la conversación
      setConversationHistory(prev => [...prev, {
        role: 'user',
        content: requirements
      }]);

      // Llamar al API con el sessionId si existe
      const data = await analyzeRequirements(requirements.trim(), sessionId);
      console.log('Datos recibidos del análisis:', data);

      if (!data) {
        throw new Error('No se recibió respuesta del servidor');
      }

      // Guardar el ID de sesión
      if (data.sessionId) {
        setSessionId(data.sessionId);
        setInConversationMode(true);
      }

      if (data.diagrams && Array.isArray(data.diagrams)) {
        // Validar los diagramas recibidos
        const validDiagrams = data.diagrams.filter(diagram => {
          return diagram && diagram.code && diagram.type && diagram.title;
        });

        if (validDiagrams.length === 0) {
          throw new Error('No se recibieron diagramas válidos');
        }

        console.log('Diagramas válidos:', validDiagrams);
        setDiagrams(validDiagrams);
        
        // Guardar respuesta completa
        setAnalysisResponse({
          ...data,
          diagrams: validDiagrams
        });
        
        // Añadir respuesta a la conversación
        setConversationHistory(prev => [...prev, {
          role: 'system',
          content: `Diagramas generados: ${validDiagrams.map(d => d.title).join(', ')}`
        }]);

        // Establecer el primer diagrama como seleccionado
        setSelectedDiagram(validDiagrams[0]);
        
        // Incrementar diagramKey para forzar recreación
        setDiagramKey(prev => prev + 1);
        
        // Notificar al padre si existe callback
        if (onAnalysisComplete) {
          onAnalysisComplete({
            ...data,
            diagrams: validDiagrams
          });
        }
      } else {
        throw new Error('No se recibieron diagramas válidos del servidor');
      }
    } catch (err: any) {
      console.error('Error en handleAnalyze:', err);
      setError(err.message || 'Error al analizar los requerimientos');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDiagram = (diagram: DiagramType) => {
    // Si es el mismo diagrama, forzar una recreación
    if (selectedDiagram?.type === diagram.type) {
      setSelectedDiagram(null);
      setTimeout(() => setSelectedDiagram(diagram), 10);
    } else {
      setSelectedDiagram(diagram);
    }
  };

  const handleContinueConversation = async () => {
    if (!conversationMessage.trim() || !sessionId) {
      setError('Por favor ingresa un mensaje o inicia una nueva conversación');
      return;
    }

    try {
      setLoading(true);
      setError('');
      console.log('Continuando conversación...');

      // Añadir mensaje a la conversación
      setConversationHistory(prev => [...prev, {
        role: 'user',
        content: conversationMessage
      }]);

      const data = await continueConversation(conversationMessage.trim(), sessionId);
      console.log('Datos recibidos de la continuación:', data);

      if (data.diagrams && Array.isArray(data.diagrams)) {
        // Validar diagramas
        const validDiagrams = data.diagrams.filter(diagram => {
          return diagram && diagram.code && diagram.type && diagram.title;
        });

        if (validDiagrams.length === 0) {
          throw new Error('No se recibieron diagramas válidos');
        }

        setDiagrams(validDiagrams);
        setAnalysisResponse({
          ...data,
          diagrams: validDiagrams
        });
        
        // Añadir respuesta a la conversación
        setConversationHistory(prev => [...prev, {
          role: 'system',
          content: `Diagramas actualizados: ${validDiagrams.map(d => d.title).join(', ')}`
        }]);

        // Establecer diagrama seleccionado
        if (validDiagrams.length > 0) {
          const currentType = selectedDiagram?.type;
          // Intentar mantener el mismo tipo de diagrama seleccionado
          const sameTypeDiagram = validDiagrams.find(d => d.type === currentType);
          setSelectedDiagram(sameTypeDiagram || validDiagrams[0]);
          setDiagramKey(prev => prev + 1);
        }
        
        if (onAnalysisComplete) {
          onAnalysisComplete({
            ...data,
            diagrams: validDiagrams
          });
        }
      } else {
        throw new Error('No se recibieron diagramas válidos');
      }

      // Limpiar el campo de mensaje
      setConversationMessage('');
    } catch (err: any) {
      console.error('Error en handleContinueConversation:', err);
      setError(err.message || 'Error al continuar la conversación');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCode = async () => {
    if (!analysisResponse?.diagrams || diagrams.length === 0) {
      setError('Primero debes generar los diagramas');
      return;
    }

    try {
      setGenerating(true);
      setError('');
      console.log('Generando código...');

      const codeData = await generateCode(
        analysisResponse.diagrams,
        analysisResponse.requirements,
        sessionId
      );
      
      console.log('Código generado:', codeData);

      if (!codeData) {
        throw new Error('No se recibió respuesta del servidor al generar código');
      }

      // Actualizar el análisis con el código generado
      const updatedAnalysis = {
        ...analysisResponse,
        generatedCode: codeData
      };

      setAnalysisResponse(updatedAnalysis);
      
      // Añadir mensaje al historial
      setConversationHistory(prev => [...prev, {
        role: 'system',
        content: 'Código generado correctamente para el backend y frontend.'
      }]);
      
      if (onAnalysisComplete) {
        onAnalysisComplete(updatedAnalysis);
      }
    } catch (err: any) {
      console.error('Error generando código:', err);
      setError(err.message || 'Error al generar el código');
    } finally {
      setGenerating(false);
    }
  };

  const startNewConversation = () => {
    setInConversationMode(false);
    setSessionId(null);
    setDiagrams([]);
    setAnalysisResponse(null);
    setSelectedDiagram(null);
    setRequirements('');
    setConversationMessage('');
    setConversationHistory([]);
    setDiagramKey(0);
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          Estado de Mermaid: {mermaidLoaded ? 
            <span className="text-green-600 font-medium">Cargado ✓</span> : 
            <span className="text-red-600 font-medium">No cargado ✗</span>}
          {sessionId && <span className="ml-2">Sesión activa: {sessionId}</span>}
        </p>
      </div>

      {/* Historial de conversación */}
      {conversationHistory.length > 0 && (
        <div className="mb-4 border rounded p-4 bg-gray-50 max-h-[200px] overflow-y-auto">
          <h3 className="font-bold mb-2">Historial de Conversación:</h3>
          {conversationHistory.map((msg, index) => (
            <div key={index} className={`p-2 mb-2 rounded ${msg.role === 'user' ? 'bg-blue-100' : 'bg-green-100'}`}>
              <strong>{msg.role === 'user' ? 'Usuario: ' : 'Sistema: '}</strong>
              {msg.content}
            </div>
          ))}
        </div>
      )}

      {!inConversationMode ? (
        // Modo inicial de ingreso de requerimientos
        <div className="mb-4">
          <textarea
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            placeholder="Ingresa los requerimientos aquí... (Ej: 'Sistema de gestión de horarios para una universidad')"
            className="w-full p-2 border rounded min-h-[100px]"
          />
        </div>
      ) : (
        // Modo de conversación
        <div className="mb-4">
          <textarea
            value={conversationMessage}
            onChange={(e) => setConversationMessage(e.target.value)}
            placeholder="Escribe tu mensaje para modificar los diagramas... (Ej: 'Agrega un atributo número de cuenta a la clase Estudiante')"
            className="w-full p-2 border rounded min-h-[100px]"
          />
        </div>
      )}

      <div className="mb-4 flex gap-4 flex-wrap">
        {!inConversationMode ? (
          <button
            onClick={handleAnalyze}
            disabled={loading || !mermaidLoaded}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? (
              <>
                <span className="inline-block mr-2">
                  <svg className="animate-spin h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
                Analizando...
              </>
            ) : 'Generar Diagramas'}
          </button>
        ) : (
          <button
            onClick={handleContinueConversation}
            disabled={loading || !mermaidLoaded || !conversationMessage.trim()}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
          >
            {loading ? (
              <>
                <span className="inline-block mr-2">
                  <svg className="animate-spin h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
                Procesando...
              </>
            ) : 'Continuar Conversación'}
          </button>
        )}

        {inConversationMode && (
          <button
            onClick={startNewConversation}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Nueva Conversación
          </button>
        )}

        <button
          onClick={handleGenerateCode}
          disabled={generating || !analysisResponse?.diagrams || diagrams.length === 0}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:bg-gray-400"
        >
          {generating ? (
            <>
              <span className="inline-block mr-2">
                <svg className="animate-spin h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
              Generando código...
            </>
          ) : 'Generar Código'}
        </button>
      </div>

      {error && (
        <div className="mb-4 text-red-500 p-2 border border-red-300 rounded bg-red-50">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {diagrams.length > 0 && (
        <div className="grid grid-cols-12 gap-4">
          {/* Lista de diagramas */}
          <div className="col-span-3">
            <h3 className="font-bold mb-2">Diagramas:</h3>
            <div className="space-y-2">
              {diagrams.map((diagram, index) => (
                <button
                  key={`button-${diagram.type}-${index}`}
                  onClick={() => handleSelectDiagram(diagram)}
                  className={`w-full text-left p-2 rounded ${
                    selectedDiagram?.type === diagram.type ? 'bg-blue-100 border border-blue-300' : 'hover:bg-gray-100'
                  }`}
                >
                  {diagram.title}
                </button>
              ))}
            </div>
          </div>

          {/* Visualización del diagrama */}
          <div className="col-span-9">
            {selectedDiagram ? (
              <div className="border rounded-lg p-4 bg-white">
                <h4 className="font-bold mb-2">{selectedDiagram.title}</h4>
                <MermaidDiagram 
                key={`diagram-${selectedDiagram.type}-${selectedDiagram.title.replace(/\s+/g, '-').toLowerCase()}`} 
                code={selectedDiagram.code} 
                diagramId={`${selectedDiagram.type}-${selectedDiagram.title.replace(/\s+/g, '-').toLowerCase()}`}
              />
              </div>
            ) : (
              <div className="border rounded-lg p-4 bg-white flex items-center justify-center h-[300px] text-gray-500">
                Selecciona un diagrama para visualizarlo
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UMLViewer;