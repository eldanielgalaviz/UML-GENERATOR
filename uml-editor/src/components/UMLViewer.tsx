// src/components/UMLViewer.tsx (VERSIÓN FINAL CORREGIDA)
import React, { useState, useEffect, useRef } from 'react'; // ✅ AGREGAR useRef
import { FileText } from 'lucide-react';
import { analyzeRequirements, generateCode } from '../services/api.service';

interface DiagramType {
  type: 'classDiagram' | 'sequenceDiagram' | 'useCaseDiagram' | 'componentDiagram' | 'packageDiagram';
  title: string;
  code: string;
}

interface AnalysisResponse {
  requirements: any[];
  diagrams: DiagramType[];
  generatedCode?: any;
  sessionId?: string;
}

interface UMLViewerProps {
  onAnalysisComplete?: (response: AnalysisResponse) => void;
  sessionId?: string | null;
  initialDiagrams?: any[];
  initialRequirements?: any[];
  hideRequirementsInput?: boolean;
  isExistingConversation?: boolean;
}

// ✅ COMPONENTE MERMAID COMPLETAMENTE CORREGIDO
const MermaidDiagram: React.FC<{ code: string }> = ({ code }) => {
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [diagramId] = useState(() => `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const diagramRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const renderDiagram = async () => {
      if (!diagramRef.current || !code.trim()) return;
      
      setIsLoading(true);
      setError('');
      
      try {
        console.log('🔄 Iniciando renderizado de diagrama:', diagramId);
        
        // @ts-ignore
        if (!window.mermaid) {
          throw new Error('Mermaid no está disponible');
        }

        // ✅ LIMPIAR COMPLETAMENTE EL CONTENEDOR
        diagramRef.current.innerHTML = '';
        
        // ✅ VERIFICAR SI EL CÓDIGO ES VÁLIDO
        if (!code.includes('Diagram') && !code.includes('graph') && !code.includes('sequenceDiagram')) {
          throw new Error('Código de diagrama no válido');
        }
        
        // ✅ CREAR ELEMENTO CON ID ÚNICO
        const diagramElement = document.createElement('div');
        diagramElement.id = diagramId;
        diagramElement.className = 'mermaid-diagram';
        diagramElement.style.visibility = 'hidden'; // Ocultar hasta que esté renderizado
        
        // ✅ LIMPIAR Y PREPARAR EL CÓDIGO
        const cleanCode = code.trim();
        diagramElement.textContent = cleanCode;
        
        // ✅ AGREGAR AL DOM
        diagramRef.current.appendChild(diagramElement);
        
        console.log('📝 Código a renderizar:', cleanCode);
        
        // ✅ RENDERIZAR CON MERMAID USANDO EL ID ESPECÍFICO
        // @ts-ignore
        const { svg } = await window.mermaid.render(diagramId + '-svg', cleanCode);
        
        // ✅ INSERTAR EL SVG RENDERIZADO
        diagramElement.innerHTML = svg;
        diagramElement.style.visibility = 'visible';
        
        console.log('✅ Diagrama renderizado exitosamente:', diagramId);
        setIsLoading(false);
        
      } catch (err: any) {
        console.error('❌ Error al renderizar diagrama:', err);
        setError(err.message || 'Error desconocido');
        setIsLoading(false);
        
        // ✅ MOSTRAR CÓDIGO COMO FALLBACK
        if (diagramRef.current) {
          diagramRef.current.innerHTML = `
            <div class="fallback-code bg-gray-100 p-4 rounded border">
              <div class="text-sm text-red-600 mb-2 font-semibold">Error al renderizar diagrama</div>
              <pre class="text-xs font-mono whitespace-pre-wrap text-gray-800 overflow-auto max-h-96">${code}</pre>
            </div>
          `;
        }
      }
    };

    // ✅ DELAY PARA ASEGURAR QUE MERMAID ESTÉ LISTO
    const timer = setTimeout(renderDiagram, 200);
    
    return () => {
      clearTimeout(timer);
      // ✅ CLEANUP AL DESMONTAR
      if (diagramRef.current) {
        diagramRef.current.innerHTML = '';
      }
    };
  }, [code, diagramId]);

  return (
    <div className="diagram-container border rounded-lg p-4 bg-white min-h-[300px]">
      {/* ✅ LOADING STATE */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
            <p className="text-gray-600 text-sm">Renderizando diagrama...</p>
          </div>
        </div>
      )}
      
      {/* ✅ ERROR STATE */}
      {error && !isLoading && (
        <div className="text-red-500 mb-4 p-4 bg-red-50 rounded border border-red-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold">⚠️ Error de renderizado:</span>
            <span>{error}</span>
          </div>
          <details className="mt-3">
            <summary className="cursor-pointer text-sm hover:text-red-700">
              Ver código del diagrama
            </summary>
            <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-auto max-h-64 border">
              {code}
            </pre>
          </details>
        </div>
      )}
      
      {/* ✅ CONTENEDOR DEL DIAGRAMA */}
      <div 
        ref={diagramRef}
        className={`mermaid-container ${isLoading ? 'hidden' : 'block'}`}
        style={{ 
          minHeight: isLoading ? '0' : '200px',
          textAlign: 'center'
        }}
      />
    </div>
  );
};

// ✅ COMPONENTE PRINCIPAL UMLVIEWER
const UMLViewer: React.FC<UMLViewerProps> = ({ 
  onAnalysisComplete, 
  sessionId, 
  initialDiagrams,
  initialRequirements,
  hideRequirementsInput = false,
  isExistingConversation = false
}) => {
  const [requirements, setRequirements] = useState('');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [diagrams, setDiagrams] = useState<DiagramType[]>([]);
  const [selectedDiagram, setSelectedDiagram] = useState<DiagramType | null>(null);
  const [analysisResponse, setAnalysisResponse] = useState<AnalysisResponse | null>(null);
  const [mermaidLoaded, setMermaidLoaded] = useState(false);
  
  // ✅ CARGAR DIAGRAMAS INICIALES
  useEffect(() => {
    if (initialDiagrams && initialDiagrams.length > 0) {
      console.log('📊 Cargando diagramas iniciales:', initialDiagrams.length);
      setDiagrams(initialDiagrams);
      setSelectedDiagram(initialDiagrams[0]);
      
      setAnalysisResponse({
        requirements: initialRequirements || [],
        diagrams: initialDiagrams,
        sessionId: sessionId || undefined
      });
    }
  }, [initialDiagrams, initialRequirements, sessionId]);

  // ✅ CARGAR MERMAID CON MEJOR CONFIGURACIÓN
  useEffect(() => {
    const loadMermaid = async () => {
      try {
        // ✅ VERIFICAR SI YA ESTÁ CARGADO
        // @ts-ignore
        if (window.mermaid) {
          console.log('✅ Mermaid ya estaba cargado');
          setMermaidLoaded(true);
          return;
        }

        console.log('🔄 Cargando Mermaid...');
        
        // ✅ CREAR Y CARGAR SCRIPT
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10.6.1/dist/mermaid.min.js';
        script.async = true;

        script.onload = () => {
          console.log('📦 Script de Mermaid cargado');
          
          try {
            // ✅ CONFIGURACIÓN MEJORADA DE MERMAID
            // @ts-ignore
            window.mermaid.initialize({
              startOnLoad: false, // ✅ IMPORTANTE: No auto-inicializar
              theme: 'default',
              securityLevel: 'loose',
              flowchart: {
                useMaxWidth: true,
                htmlLabels: true
              },
              sequence: {
                diagramMarginX: 50,
                diagramMarginY: 10,
                actorMargin: 50,
                width: 150,
                height: 65,
                boxMargin: 10,
                boxTextMargin: 5,
                noteMargin: 10,
                messageMargin: 35,
                mirrorActors: true,
                bottomMarginAdj: 1,
                useMaxWidth: true,
                rightAngles: false,
                showSequenceNumbers: false
              },
              er: {
                diagramPadding: 20,
                layoutDirection: 'TB',
                minEntityWidth: 100,
                minEntityHeight: 75,
                entityPadding: 15,
                stroke: 'gray',
                fill: 'honeydew',
                fontSize: 12,
                useMaxWidth: true
              }
            });
            
            setMermaidLoaded(true);
            console.log('✅ Mermaid inicializado correctamente');
            
          } catch (initError) {
            console.error('❌ Error al inicializar Mermaid:', initError);
            setError('Error al inicializar Mermaid');
          }
        };

        script.onerror = (e) => {
          console.error('❌ Error al cargar script de Mermaid:', e);
          setError('Error al cargar la librería de diagramas');
        };

        document.head.appendChild(script);
        
      } catch (err) {
        console.error('❌ Error general en loadMermaid:', err);
        setError('Error al configurar la librería de diagramas');
      }
    };

    loadMermaid();
  }, []);

  // ✅ RESTO DE FUNCIONES SIN CAMBIOS
  const handleAnalyze = async () => {
    if (!requirements.trim()) {
      setError('Por favor ingresa los requerimientos');
      return;
    }

    try {
      setLoading(true);
      setError('');
      console.log('📤 Enviando requerimientos al servidor...');

      const data = await analyzeRequirements(requirements.trim(), sessionId);
      console.log('📥 Datos recibidos:', data);

      if (data.diagrams && Array.isArray(data.diagrams)) {
        setDiagrams(data.diagrams);
        setAnalysisResponse(data);
        
        // ✅ GUARDAR SESSION ID
        if (data.sessionId) {
          localStorage.setItem('currentSessionId', data.sessionId);
          console.log('💾 SessionId guardado:', data.sessionId);
        }
        
        if (data.diagrams.length > 0) {
          setSelectedDiagram(data.diagrams[0]);
        }
        
        setRequirements('');
        
        if (onAnalysisComplete) {
          onAnalysisComplete(data);
        }
      } else {
        throw new Error('No se recibieron diagramas válidos');
      }
    } catch (err: any) {
      console.error('❌ Error en análisis:', err);
      setError(err.message || 'Error al analizar los requerimientos');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCode = async () => {
    if (diagrams.length === 0) {
      setError('No hay diagramas disponibles para generar código');
      return;
    }

    try {
      setGenerating(true);
      setError('');
      console.log('⚙️ Generando código...');
      
      const diagramsToUse = analysisResponse?.diagrams || diagrams;
      const requirementsToUse = analysisResponse?.requirements || [];
      const currentSessionId = sessionId || localStorage.getItem('currentSessionId');

      const codeData = await generateCode(
        diagramsToUse,
        requirementsToUse,
        currentSessionId
      );

      const updatedAnalysis = {
        requirements: requirementsToUse,
        diagrams: diagramsToUse,
        generatedCode: codeData,
        sessionId: currentSessionId
      };

      setAnalysisResponse(updatedAnalysis);
      
      if (onAnalysisComplete) {
        onAnalysisComplete(updatedAnalysis);
      }
    } catch (err: any) {
      console.error('❌ Error generando código:', err);
      setError(err.message || 'Error al generar el código');
    } finally {
      setGenerating(false);
    }
  };

  // ✅ FUNCIÓN PARA CAMBIAR DIAGRAMA CON LOGS
  const handleDiagramChange = (diagram: DiagramType) => {
    console.log('🔄 Cambiando a diagrama:', diagram.title);
    setSelectedDiagram(diagram);
  };

  return (
    <div className="p-4">
      {/* ✅ DEBUG INFO - SOLO EN DESARROLLO */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-3 bg-gray-100 rounded text-sm border-l-4 border-blue-500">
          <p className="text-gray-700 mb-1">
            🎯 <strong>Debug:</strong> Mermaid {mermaidLoaded ? '✅ Cargado' : '❌ No cargado'}
          </p>
          <p className="text-blue-700 mb-1">
            🆔 <strong>SessionId:</strong> {sessionId || localStorage.getItem('currentSessionId') || 'No disponible'}
          </p>
          <p className="text-purple-700">
            📊 <strong>Diagramas:</strong> {diagrams.length} | <strong>Seleccionado:</strong> {selectedDiagram?.title || 'Ninguno'}
          </p>
        </div>
      )}

      {/* ✅ FORMULARIO DE REQUERIMIENTOS */}
      {!hideRequirementsInput && (
        <div className="mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {isExistingConversation ? 'Nuevos requerimientos' : 'Requerimientos del sistema'}
            </label>
            <textarea
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder={isExistingConversation ? 
                "Agrega nuevos requerimientos para expandir o modificar los diagramas..." : 
                "Describe los requerimientos de tu sistema aquí..."
              }
              className="w-full p-4 border border-gray-600 rounded-lg min-h-[120px] bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
              disabled={loading}
            />
          </div>

          <div className="flex gap-4 items-center">
            <button
              onClick={handleAnalyze}
              disabled={loading || !mermaidLoaded || !requirements.trim()}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Procesando...
                </>
              ) : (
                <>
                  {isExistingConversation ? 'Actualizar Diagramas' : 'Generar Diagramas'}
                </>
              )}
            </button>

            <button
              onClick={handleGenerateCode}
              disabled={generating || diagrams.length === 0}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-500 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              {generating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Generando...
                </>
              ) : (
                'Generar Código'
              )}
            </button>
          </div>
        </div>
      )}

      {/* ✅ BOTÓN DE GENERAR CÓDIGO CUANDO ESTÁN OCULTOS LOS REQUERIMIENTOS */}
      {hideRequirementsInput && diagrams.length > 0 && (
        <div className="mb-6">
          <button
            onClick={handleGenerateCode}
            disabled={generating}
            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-500 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            {generating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Generando código...
              </>
            ) : (
              'Generar Código'
            )}
          </button>
        </div>
      )}

      {/* ✅ ERROR DISPLAY */}
      {error && (
        <div className="mb-4 text-red-400 p-4 border border-red-600 rounded-lg bg-red-900/20">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* ✅ MENSAJE PARA CONVERSACIONES EXISTENTES SIN DIAGRAMAS */}
      {isExistingConversation && diagrams.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-medium mb-2 text-gray-300">Conversación cargada</h3>
            <p className="text-gray-400">Use el campo de arriba para continuar la conversación o agregar nuevos requerimientos.</p>
          </div>
        </div>
      )}

      {/* ✅ VISUALIZACIÓN DE DIAGRAMAS */}
      {diagrams.length > 0 && (
        <div className="grid grid-cols-12 gap-6">
          {/* ✅ LISTA DE DIAGRAMAS */}
          <div className="col-span-12 lg:col-span-3">
            <h3 className="font-bold mb-4 text-gray-300">
              Diagramas generados ({diagrams.length}):
            </h3>
            <div className="space-y-2">
              {diagrams.map((diagram, index) => (
                <button
                  key={`${diagram.type}-${index}`}
                  onClick={() => handleDiagramChange(diagram)}
                  className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                    selectedDiagram === diagram 
                      ? 'bg-blue-500 text-white shadow-lg scale-105' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:scale-102'
                  }`}
                >
                  <div className="font-medium">{diagram.title}</div>
                  <div className="text-xs opacity-75 mt-1">{diagram.type}</div>
                </button>
              ))}
            </div>
          </div>

          {/* ✅ VISUALIZACIÓN DEL DIAGRAMA SELECCIONADO */}
          <div className="col-span-12 lg:col-span-9">
            {selectedDiagram && (
              <div className="border border-gray-600 rounded-lg p-6 bg-gray-800">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xl text-gray-200 mb-1">
                      {selectedDiagram.title}
                    </h4>
                    <span className="text-sm text-gray-400 bg-gray-700 px-3 py-1 rounded-full">
                      {selectedDiagram.type}
                    </span>
                  </div>
                  
                  {/* ✅ INDICADOR DE ESTADO */}
                  <div className="text-xs text-gray-500">
                    Diagrama {diagrams.findIndex(d => d === selectedDiagram) + 1} de {diagrams.length}
                  </div>
                </div>
                
                {/* ✅ COMPONENTE MERMAID MEJORADO */}
                <MermaidDiagram 
                  key={`${selectedDiagram.type}-${selectedDiagram.title}-${Date.now()}`}
                  code={selectedDiagram.code} 
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UMLViewer;