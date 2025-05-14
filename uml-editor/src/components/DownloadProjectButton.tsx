import React, { useState, useEffect } from 'react';

interface DownloadProjectButtonProps {
  sessionId?: string | null;
  disabled?: boolean;
}

const DownloadProjectButton: React.FC<DownloadProjectButtonProps> = ({
  sessionId,
  disabled = false
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localSessionId, setLocalSessionId] = useState<string | null>(null);

  useEffect(() => {
    // Intentar obtener el sessionId del localStorage
    const storedSessionId = localStorage.getItem('currentSessionId');
    if (storedSessionId) {
      setLocalSessionId(storedSessionId);
      console.log('ID de sesión obtenido del localStorage:', storedSessionId);
    }
  }, []);

  const handleDownload = async () => {
    // Usar el ID de sesión de props o del localStorage
    const effectiveSessionId = sessionId || localSessionId;
    
    if (!effectiveSessionId) {
      setError("No hay una sesión activa. Primero genera los diagramas.");
      return;
    }

    try {
      setIsDownloading(true);
      setError(null);
      
      // Obtener token del localStorage
      const token = localStorage.getItem('token');
      
      // Construir la URL de descarga
      const downloadUrl = `http://localhost:3005/api/gemini/download-project?sessionId=${effectiveSessionId}`;
      
      console.log('Iniciando descarga desde URL:', downloadUrl);
      
      // Método 1: Descarga directa usando window.location
      // window.location.href = downloadUrl;
      
      // Método 2: Usando un enlace temporal
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      // Agregar headers si es necesario
      if (token) {
        // Intentamos añadir el token como un parámetro de consulta
        link.href += `&token=${encodeURIComponent(token)}`;
      }
      
      link.target = '_blank'; // Abre en una nueva pestaña
      document.body.appendChild(link);
      link.click();
      
      // Limpieza
      setTimeout(() => {
        document.body.removeChild(link);
        setIsDownloading(false);
      }, 1000);
      
    } catch (err) {
      console.error("Error al descargar:", err);
      setError("Error al descargar el proyecto. Inténtalo de nuevo.");
      setIsDownloading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleDownload}
        disabled={isDownloading || (!sessionId && !localSessionId) || disabled}
        className={`flex items-center gap-2 px-4 py-2 rounded ${
          isDownloading || (!sessionId && !localSessionId) || disabled
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600'
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

      {error && (
        <div className="mt-2 text-red-500 text-sm">{error}</div>
      )}
      
      <div className="mt-2 text-xs text-gray-400">
        Session ID: {sessionId || localSessionId || 'No disponible'}
      </div>
    </div>
  );
};

export default DownloadProjectButton;