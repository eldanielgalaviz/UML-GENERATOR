import React, { useEffect, useRef, useState } from 'react';
import ErrorBoundary from './ErrorBoundary';

interface IframeMermaidDiagramProps {
  code: string;
  diagramId?: string;
}

const IframeMermaidDiagram: React.FC<IframeMermaidDiagramProps> = ({ code, diagramId }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!code) {
      setError('No hay código para renderizar');
      setLoading(false);
      return;
    }

    // Función para inicializar el iframe
    const initIframe = () => {
      const iframe = iframeRef.current;
      if (!iframe) return;

      // Generar HTML completo con Mermaid para el iframe
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Mermaid Diagram</title>
          <script src="https://cdn.jsdelivr.net/npm/mermaid@9.3.0/dist/mermaid.min.js"></script>
          <style>
            body { margin: 0; padding: 0; background: white; font-family: sans-serif; }
            .mermaid { width: 100%; }
            .error { color: red; padding: 10px; border: 1px solid red; border-radius: 4px; background-color: #ffeeee; }
          </style>
        </head>
        <body>
          <div class="mermaid">
            ${code}
          </div>
          <script>
            try {
              mermaid.initialize({
                startOnLoad: true,
                theme: 'default',
                securityLevel: 'loose',
                fontFamily: 'sans-serif',
                logLevel: 'error'
              });
              
              // Notificar al padre cuando el diagrama se ha renderizado o ha fallado
              window.addEventListener('load', function() {
                setTimeout(function() {
                  // Verificar si se ha renderizado correctamente
                  const svgElement = document.querySelector('svg');
                  if (svgElement) {
                    window.parent.postMessage({ type: 'mermaid-rendered', success: true }, '*');
                  } else {
                    window.parent.postMessage({ 
                      type: 'mermaid-error', 
                      message: 'No se pudo renderizar el diagrama' 
                    }, '*');
                  }
                }, 500);
              });
              
              // Capturar errores de Mermaid
              mermaid.parseError = function(err, hash) {
                window.parent.postMessage({ 
                  type: 'mermaid-error', 
                  message: err.message || 'Error en la sintaxis del diagrama'
                }, '*');
              };
            } catch (e) {
              document.body.innerHTML = '<div class="error">Error: ' + e.message + '</div>';
              window.parent.postMessage({ 
                type: 'mermaid-error', 
                message: e.message 
              }, '*');
            }
          </script>
        </body>
        </html>
      `;

      // Configurar listeners para mensajes del iframe
      const handleMessage = (event: MessageEvent) => {
        if (event.data.type === 'mermaid-rendered') {
          setLoading(false);
          setError(null);
        } else if (event.data.type === 'mermaid-error') {
          setLoading(false);
          setError(event.data.message || 'Error al renderizar el diagrama');
        }
      };

      window.addEventListener('message', handleMessage);

      // Cargar el contenido en el iframe
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(html);
        iframeDoc.close();
      }

      return () => {
        window.removeEventListener('message', handleMessage);
      };
    };

    // Pequeño retraso para asegurar que el DOM esté listo
    const timer = setTimeout(() => {
      initIframe();
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [code]);

  // Método para reintentar el renderizado
  const handleRetry = () => {
    setError(null);
    setLoading(true);
    const iframe = iframeRef.current;
    if (iframe) {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (iframeDoc) {
        iframeDoc.location.reload();
      }
    }
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
          <div className="bg-white">
            {loading && (
              <div className="flex justify-center items-center h-[200px] absolute left-0 right-0 top-0 bottom-0 bg-white bg-opacity-70 z-10">
                <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}
            <iframe 
              ref={iframeRef}
              className="w-full min-h-[300px] border-0"
              title={`mermaid-diagram-${diagramId || Math.random().toString(36).substring(2, 11)}`}
              sandbox="allow-scripts"
            />
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

export default IframeMermaidDiagram;