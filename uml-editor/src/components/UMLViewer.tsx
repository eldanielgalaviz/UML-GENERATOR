import React, { useState, useEffect } from 'react';
import axios from 'axios';
import mermaid from 'mermaid';

interface Diagram {
  type: string;
  title: string;
  code: string;
}

const DiagramTypeMap: { [key: string]: string } = {
  'classDiagram': 'Diagrama de Clases',
  'sequenceDiagram': 'Diagrama de Secuencia',
  'erDiagram': 'Diagrama Entidad-Relación',
  'flowchart': 'Diagrama de Flujo',
  'stateDiagram': 'Diagrama de Estados',
  'componentDiagram': 'Diagrama de Componentes'
};

const LiveUMLViewer: React.FC = () => {
  const [requirements, setRequirements] = useState('');
  const [diagrams, setDiagrams] = useState<Diagram[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
      flowchart: { 
        useMaxWidth: false,
        htmlLabels: true
      },
      sequence: {
        useMaxWidth: false,
        showSequenceNumbers: true,
        boxMargin: 10,
      },
      er: {
        useMaxWidth: false,
      },
      stateDiagram: {
        useMaxWidth: false,
      }
    });
  }, []);

  const renderDiagram = async (code: string, elementId: string) => {
    try {
      const cleanCode = code.trim();
      if (!cleanCode) {
        console.error('Código de diagrama vacío');
        return;
      }

      console.log('Renderizando diagrama:', elementId, cleanCode);
      
      const element = document.getElementById(elementId);
      if (element) {
        element.innerHTML = cleanCode;
        await mermaid.run({
          nodes: [element]
        });
      }
    } catch (error) {
      console.error('Error al renderizar diagrama:', elementId, error);
    }
  };

  useEffect(() => {
    if (diagrams.length > 0) {
      diagrams.forEach((diagram, index) => {
        renderDiagram(diagram.code, `mermaid-diagram-${index}`);
      });
    }
  }, [diagrams]);

  const analyzeDiagrams = async () => {
    if (!requirements.trim()) {
      setError('Por favor ingresa los requerimientos');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const requestedDiagrams = [
        'sequenceDiagram',
        'classDiagram',
        'erDiagram',
        'componentDiagram'
      ];

      console.log('Enviando requerimientos:', requirements);

      const response = await axios.post('http://localhost:3000/api/gemini/analyze', {
        requirements: requirements.trim(),
        diagramTypes: requestedDiagrams
      });

      console.log('Respuesta del servidor:', response.data);

      if (response.data.diagrams && response.data.diagrams.length > 0) {
        const validDiagrams = response.data.diagrams
          .filter((d: Diagram) => d.code && d.code.trim())
          .map((d: Diagram) => ({
            ...d,
            title: DiagramTypeMap[d.type] || d.title
          }));

        if (validDiagrams.length > 0) {
          setDiagrams(validDiagrams);
        } else {
          setError('No se generaron diagramas válidos');
        }
      } else {
        setError('No se recibieron diagramas del servidor');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 
                         err.response?.data?.message || 
                         err.message || 
                         'Error al analizar los requerimientos';
      setError(errorMessage);
      console.error('Error completo:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <textarea
          className="w-full p-2 border rounded-md"
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
          placeholder="Ingresa tus requerimientos aquí..."
        />
      </div>

      <button
        onClick={analyzeDiagrams}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        {loading ? 'Generando diagramas...' : 'Generar Diagramas'}
      </button>

      {error && (
        <div className="text-red-500 mt-4 p-4 bg-red-50 rounded">
          {error}
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-8">
        {diagrams.map((diagram, index) => (
          <div key={index} className="border rounded-lg p-4 bg-white shadow">
            <h3 className="text-xl font-bold mb-4">{diagram.title}</h3>
            <div className="mermaid-container bg-white p-4 rounded shadow-inner overflow-auto">
              <div 
                id={`mermaid-diagram-${index}`} 
                className="mermaid"
                style={{ minHeight: '200px' }}
              >
                {diagram.code}
              </div>
            </div>
            <details className="mt-2">
              <summary className="cursor-pointer text-sm text-gray-600">Ver código</summary>
              <pre className="mt-2 p-4 bg-gray-100 rounded text-sm overflow-auto">
                {diagram.code}
              </pre>
            </details>
          </div>
        ))}
      </div>

      <details>
        <summary className="cursor-pointer text-sm text-gray-600">Debug Info</summary>
        <pre className="mt-2 p-4 bg-gray-100 rounded text-sm overflow-auto">
          {JSON.stringify({ diagrams }, null, 2)}
        </pre>
      </details>
    </div>
  );
};

export default LiveUMLViewer;