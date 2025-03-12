// src/components/DescargaCodigo.tsx
import React, { useState } from 'react';
import axios from 'axios';

interface DescargarCodigoProps {
  codigoGenerado: any;
}

const DescargaCodigo: React.FC<DescargarCodigoProps> = ({ codigoGenerado }) => {
  const [descargando, setDescargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exportado, setExportado] = useState(false);

  const descargarCodigo = async () => {
    if (!codigoGenerado) {
      setError('No hay código generado para descargar.');
      return;
    }

    setDescargando(true);
    setError(null);
    
    try {
      // Convertir el código generado a un archivo JSON y descargarlo
      const blob = new Blob([JSON.stringify(codigoGenerado, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'codigo-generado.json');
      document.body.appendChild(link);
      
      link.click();
      
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setExportado(true);
      setTimeout(() => setExportado(false), 3000); // Mensaje de éxito desaparece después de 3 segundos
    } catch (error) {
      console.error('Error al descargar el código:', error);
      setError('Error al descargar el código. Por favor, inténtalo de nuevo.');
    } finally {
      setDescargando(false);
    }
  };
  
  return (
    <div className="p-4 bg-white rounded shadow mb-4">
      <h2 className="text-xl font-bold mb-4">Exportar Código Generado</h2>
      <p className="mb-4">
        Descarga el código generado como un archivo JSON que podrás usar con nuestro script extractor 
        para crear automáticamente la estructura del proyecto.
      </p>
      
      <button
        onClick={descargarCodigo}
        disabled={descargando || !codigoGenerado}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-blue-300"
      >
        {descargando ? 'Descargando...' : 'Descargar Código'}
      </button>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {exportado && (
        <div className="mt-4 p-3 bg-green-100 text-green-700 rounded">
          ¡Código descargado exitosamente! Ahora ejecuta el script extractor.
        </div>
      )}
      
      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Instrucciones:</strong></p>
        <ol className="list-decimal pl-5 mt-2">
          <li>Descarga el código generado usando el botón de arriba</li>
          <li>Descarga el <a href="#" className="text-blue-500 underline">script extractor</a></li>
          <li>Ejecuta el script con Node.js pasando la ruta al archivo JSON descargado:</li>
          <code className="block bg-gray-100 p-2 mt-1 rounded">
            node extractorCodigo.js ./codigo-generado.json
          </code>
          <li>El script creará la estructura completa del proyecto con todos los archivos necesarios</li>
        </ol>
      </div>
    </div>
  );
};

export default DescargaCodigo;