import React, { useEffect, useRef, useState } from 'react';
import ErrorBoundary from './ErrorBoundary';

interface MermaidDiagramProps {
  code: string;
  diagramId?: string;
}

const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ code, diagramId }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [key, setKey] = useState(0); // Para forzar re-renderizado si es necesario
  
  useEffect(() => {
    // Generar un ID único para este diagrama si no se proporciona uno
    const id = `mermaid-${diagramId || Math.random().toString(36).substring(2, 11)}`;
    
    // Limpiar el estado
    setError(null);
    setLoading(true);
    
    // Función para cargar la biblioteca Mermaid si aún no está disponible
    const loadMermaid = async () => {
      if (typeof window !== 'undefined' && !window.mermaid) {
        try {
          console.log('Cargando biblioteca Mermaid...');
          await import('mermaid').then((m) => {
            window.mermaid = m.default;
            window.mermaid.initialize({
              startOnLoad: false,
              theme: 'default',
              securityLevel: 'loose',
              fontFamily: 'monospace',
              logLevel: 'error'
            });
            console.log('Mermaid cargado correctamente');
          });
        } catch (err) {
          console.error('Error al cargar Mermaid:', err);
          setError('No se pudo cargar la biblioteca Mermaid');
          setLoading(false);
          return false;
        }
      }
      return true;
    };
    
    // Función que maneja la renderización
    const renderDiagram = async () => {
      if (!code || code.trim() === '') {
        setError('No hay código para renderizar');
        setLoading(false);
        return;
      }
      
      // Asegurarse de que Mermaid esté cargado
      const mermaidLoaded = await loadMermaid();
      if (!mermaidLoaded) return;
      
      try {
        // Crear un nuevo div para renderizar el diagrama
        // Esto evita problemas con nodos que ya no son hijos
        if (containerRef.current) {
          // Importante: limpiar completamente el contenedor
          containerRef.current.innerHTML = '';
          
          // Crear un nuevo div para renderizar
          const renderDiv = document.createElement('div');
          renderDiv.id = id;
          renderDiv.className = 'mermaid-diagram';
          renderDiv.textContent = code;
          containerRef.current.appendChild(renderDiv);
          
          // Intentar renderizar usando diferentes métodos según la versión de Mermaid
          if (window.mermaid.run) {
            console.log('Usando mermaid.run() para renderizar');
            await window.mermaid.run({
              nodes: [renderDiv]
            });
          } else if (window.mermaid.render) {
            console.log('Usando mermaid.render() para renderizar');
            try {
              const { svg } = await window.mermaid.render(id, code);
              // Crear un nuevo div en lugar de modificar el existente
              const svgContainer = document.createElement('div');
              svgContainer.innerHTML = svg;
              containerRef.current.innerHTML = ''; // Limpiar primero
              containerRef.current.appendChild(svgContainer.firstChild);
            } catch (renderError) {
              console.error('Error en mermaid.render:', renderError);
              throw renderError;
            }
          } else if (window.mermaid.init) {
            console.log('Usando mermaid.init() para renderizar');
            window.mermaid.init(undefined, [renderDiv]);
          } else {
            throw new Error('No se encontró un método compatible de Mermaid');
          }
          
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
      // Limpiar el contenedor para evitar problemas con nodos huérfanos
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [code, diagramId, key]);
  
  // Método para forzar un re-renderizado
  const handleRetry = () => {
    setKey(prev => prev + 1);
    setError(null);
    setLoading(true);
  };
  
  return (
    <ErrorBoundary
      fallback={
        <div className="border rounded p-4 bg-red-50">
          <p className="font-bold text-red-600">Error al renderizar el diagrama</p>
          <p className="mb-2">Ha ocurrido un error con el renderizado del diagrama.</p>
          <button
            onClick={handleRetry}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
          >
            Intentar de nuevo
          </button>
          <details className="mt-2">
            <summary className="cursor-pointer text-blue-500">Ver código del diagrama</summary>
            <pre className="mt-2 p-2 bg-gray-100 overflow-auto text-xs">{code}</pre>
          </details>
        </div>
      }
    >
      <div className="border rounded p-4">
        {error ? (
          <div className="p-3 bg-red-50 text-red-500 rounded">
            <p className="font-bold">Error al renderizar el diagrama:</p>
            <p>{error}</p>
            <button
              onClick={handleRetry}
              className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
            >
              Intentar de nuevo
            </button>
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
        <div className="mt-2 text-right">
          <a 
            href={`https://mermaid.live/edit#pako:${encodeURIComponent(code)}`}
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-blue-500 hover:underline"
          >
            Abrir en Mermaid Live Editor
          </a>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default MermaidDiagram;