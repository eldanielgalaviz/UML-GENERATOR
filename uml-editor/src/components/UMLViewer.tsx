// src/components/UMLViewer.tsx (VERSIÓN MEJORADA)
import React, { useState, useEffect } from 'react';
import { FileText } from 'lucide-react'; // ✅ IMPORTAR EL ICONO FALTANTE
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
  // ✅ NUEVAS PROPS PARA CONTROLAR LA INTERFAZ
  hideRequirementsInput?: boolean;
  isExistingConversation?: boolean;
}

const MermaidDiagram: React.FC<{ code: string }> = ({ code }) => {
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const renderDiagram = async () => {
      try {
        // @ts-ignore
        if (window.mermaid) {
          console.log('Intentando renderizar diagrama');
          // @ts-ignore
          await window.mermaid.run();
          console.log('Diagrama renderizado exitosamente');
        } else {
          console.log('Mermaid no está disponible');
          setError('Mermaid no está cargado');
        }
      } catch (err) {
        console.error('Error al renderizar:', err);
        setError(`Error al renderizar: ${err}`);
      }
    };

    renderDiagram();
  }, [code]);

  return (
    <div className="border rounded p-4">
      {error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="mermaid bg-white">
          {code}
        </div>
      )}
    </div>
  );
};

const UMLViewer: React.FC<UMLViewerProps> = ({ 
  onAnalysisComplete, 
  sessionId, 
  initialDiagrams,
  initialRequirements,
  hideRequirementsInput = false, // ✅ Nueva prop
  isExistingConversation = false // ✅ Nueva prop
}) => {
  const [requirements, setRequirements] = useState('');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [diagrams, setDiagrams] = useState<DiagramType[]>([]);
  const [selectedDiagram, setSelectedDiagram] = useState<DiagramType | null>(null);
  const [analysisResponse, setAnalysisResponse] = useState<AnalysisResponse | null>(null);
  const [mermaidLoaded, setMermaidLoaded] = useState(false);
  
  // Actualización mejorada para inicializar correctamente con los datos iniciales
  useEffect(() => {
    if (initialDiagrams && initialDiagrams.length > 0) {
      setDiagrams(initialDiagrams);
      if (initialDiagrams.length > 0) {
        setSelectedDiagram(initialDiagrams[0]);
      }
      
      // Actualizar el estado de analysisResponse para que el botón se active
      setAnalysisResponse({
        requirements: initialRequirements || [],
        diagrams: initialDiagrams
      });
      
      console.log("Diagramas iniciales cargados:", initialDiagrams.length);
    }
  }, [initialDiagrams, initialRequirements]);

  useEffect(() => {
    const loadMermaid = async () => {
      try {
        console.log('Intentando cargar Mermaid...');
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mermaid/10.6.1/mermaid.min.js';
        script.async = true;

        script.onload = () => {
          console.log('Script de Mermaid cargado');
          // @ts-ignore
          window.mermaid.initialize({
            startOnLoad: true,
            theme: 'default'
          });
          setMermaidLoaded(true);
          console.log('Mermaid inicializado');
        };

        script.onerror = (e) => {
          console.error('Error al cargar Mermaid:', e);
          setError('Error al cargar la librería de diagramas');
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

      const data = await analyzeRequirements(requirements.trim(), sessionId);
      console.log('Datos recibidos completos:', data);

      if (data.diagrams && Array.isArray(data.diagrams)) {
        setDiagrams(data.diagrams);
        setAnalysisResponse(data);
        
        // CRÍTICO! Guardar el sessionId en localStorage
        if (data.sessionId) {
          localStorage.setItem('currentSessionId', data.sessionId);
          console.log('🔥 SessionId guardado en localStorage:', data.sessionId);
          
          // También guardarlo como backup con otra clave
          localStorage.setItem('lastSessionId', data.sessionId);
          localStorage.setItem('projectSessionId', data.sessionId);
          
          // Mostrar alerta de confirmación para debug
          console.log('✅ CONFIRMADO: SessionId guardado:', {
            sessionId: data.sessionId,
            saved: localStorage.getItem('currentSessionId')
          });
        } else {
          console.warn('⚠️ No se recibió sessionId en la respuesta');
        }
        
        if (data.diagrams.length > 0) {
          setSelectedDiagram(data.diagrams[0]);
        }
        
        // ✅ Limpiar el textarea después de procesar
        setRequirements('');
        
        if (onAnalysisComplete) {
          onAnalysisComplete(data);
        }
      } else {
        throw new Error('No se recibieron diagramas válidos');
      }
    } catch (err: any) {
      console.error('Error en handleAnalyze:', err);
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
      console.log('Generando código...');
      
      const diagramsToUse = analysisResponse?.diagrams || diagrams;
      const requirementsToUse = analysisResponse?.requirements || [];
      const currentSessionId = sessionId || localStorage.getItem('currentSessionId');
      
      console.log('Usando diagrams:', diagramsToUse.length);
      console.log('Usando requirements:', requirementsToUse.length);
      console.log('Usando sessionId:', currentSessionId);

      const codeData = await generateCode(
        diagramsToUse,
        requirementsToUse,
        currentSessionId
      );
      
      console.log('Código generado:', codeData);

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
      console.error('Error generando código:', err);
      setError(err.message || 'Error al generar el código');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="p-4">
      {/* ✅ MOSTRAR INFO DE DEBUG SOLO EN DESARROLLO */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-3 bg-gray-100 rounded text-sm">
          <p className="text-gray-600 mb-1">
            Estado de Mermaid: {mermaidLoaded ? '✅ Cargado' : '❌ No cargado'}
          </p>
          <p className="text-blue-600 mb-1">
            SessionId: {sessionId || localStorage.getItem('currentSessionId') || 'No disponible'}
          </p>
          <p className="text-purple-600">
            Modo: {isExistingConversation ? 'Conversación existente' : 'Nueva conversación'}
          </p>
        </div>
      )}

      {/* ✅ FORMULARIO DE REQUERIMIENTOS - SOLO SI NO ESTÁ OCULTO */}
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
            {isExistingConversation && (
              <p className="text-xs text-gray-400 mt-2">
                Los nuevos requerimientos se combinarán con los existentes para actualizar los diagramas.
              </p>
            )}
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

      {/* ✅ SOLO MOSTRAR BOTÓN DE GENERAR CÓDIGO SI ESTÁN OCULTOS LOS REQUERIMIENTOS */}
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

      {/* Error Display */}
      {error && (
        <div className="mb-4 text-red-400 p-4 border border-red-600 rounded-lg bg-red-900/20">
          {error}
        </div>
      )}

      {/* ✅ MENSAJE PARA CONVERSACIONES EXISTENTES SIN DIAGRAMAS */}
      {isExistingConversation && diagrams.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-medium mb-2">Conversación cargada</h3>
            <p>Use el campo de arriba para continuar la conversación o agregar nuevos requerimientos.</p>
          </div>
        </div>
      )}

      {/* Diagrams Display */}
      {diagrams.length > 0 && (
        <div className="grid grid-cols-12 gap-6">
          {/* Lista de diagramas */}
          <div className="col-span-12 lg:col-span-3">
            <h3 className="font-bold mb-4 text-gray-300">Diagramas generados:</h3>
            <div className="space-y-2">
              {diagrams.map((diagram, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedDiagram(diagram)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedDiagram === diagram 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <div className="font-medium">{diagram.title}</div>
                  <div className="text-xs opacity-75 mt-1">{diagram.type}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Visualización del diagrama */}
          <div className="col-span-12 lg:col-span-9">
            {selectedDiagram && (
              <div className="border border-gray-600 rounded-lg p-6 bg-gray-800">
                <div className="mb-4">
                  <h4 className="font-bold text-xl text-gray-200 mb-2">{selectedDiagram.title}</h4>
                  <span className="text-sm text-gray-400 bg-gray-700 px-2 py-1 rounded">
                    {selectedDiagram.type}
                  </span>
                </div>
                <MermaidDiagram code={selectedDiagram.code} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UMLViewer;