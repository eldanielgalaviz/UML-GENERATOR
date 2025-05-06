import React, { useState, useEffect } from 'react';
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
}

interface UMLViewerProps {
  onAnalysisComplete?: (response: AnalysisResponse) => void;
  sessionId?: string | null;
  initialDiagrams?: any[];
  initialRequirements?: any[];
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
  initialRequirements
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
      console.log('Datos recibidos:', data);

      if (data.diagrams && Array.isArray(data.diagrams)) {
        setDiagrams(data.diagrams);
        setAnalysisResponse(data);
        if (data.diagrams.length > 0) {
          setSelectedDiagram(data.diagrams[0]);
        }
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
    // Verificamos si hay diagramas, pero cambiamos la condición para que sea más simple
    if (diagrams.length === 0) {
      setError('No hay diagramas disponibles para generar código');
      return;
    }

    try {
      setGenerating(true);
      setError('');
      console.log('Generando código...');
      
      // Aseguramos que estamos usando los datos correctos
      const diagramsToUse = analysisResponse?.diagrams || diagrams;
      const requirementsToUse = analysisResponse?.requirements || [];
      
      console.log('Usando diagrams:', diagramsToUse.length);
      console.log('Usando requirements:', requirementsToUse.length);

      const codeData = await generateCode(
        diagramsToUse,
        requirementsToUse,
        sessionId
      );
      
      console.log('Código generado:', codeData);

      // Actualizar el análisis con el código generado
      const updatedAnalysis = {
        requirements: requirementsToUse,
        diagrams: diagramsToUse,
        generatedCode: codeData
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
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          Estado de Mermaid: {mermaidLoaded ? 'Cargado' : 'No cargado'}
        </p>
      </div>

      <div className="mb-4">
        <textarea
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
          placeholder="Ingresa los requerimientos aquí..."
          className="w-full p-2 border rounded min-h-[100px]"
        />
      </div>

      <div className="mb-4 flex gap-4">
        <button
          onClick={handleAnalyze}
          disabled={loading || !mermaidLoaded}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? 'Analizando...' : 'Generar Diagramas'}
        </button>

        <button
          onClick={handleGenerateCode}
          // Modificada la condición para que funcione cuando hay diagramas cargados
          disabled={generating || diagrams.length === 0}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
        >
          {generating ? 'Generando código...' : 'Generar Código'}
        </button>
      </div>

      {error && (
        <div className="mb-4 text-red-500 p-2 border border-red-300 rounded">
          {error}
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
                  key={index}
                  onClick={() => setSelectedDiagram(diagram)}
                  className={`w-full text-left p-2 rounded ${
                    selectedDiagram === diagram ? 'bg-blue-100' : 'hover:bg-gray-100'
                  }`}
                >
                  {diagram.title}
                </button>
              ))}
            </div>
          </div>

          {/* Visualización del diagrama */}
          <div className="col-span-9">
            {selectedDiagram && (
              <div className="border rounded-lg p-4 bg-white">
                <h4 className="font-bold mb-2">{selectedDiagram.title}</h4>
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