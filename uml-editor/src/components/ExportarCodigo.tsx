// src/components/ExportarCodigo.tsx
import React, { useState } from 'react';
import axios from 'axios';

const ExportarCodigo: React.FC = () => {
  const [exportando, setExportando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState(false);

  const handleExportar = async () => {
    setExportando(true);
    setError(null);
    setExito(false);
    
    try {
      // Llamar al endpoint de la API que genera y descarga el archivo ZIP
      const response = await axios.get('http://localhost:3000/api/exportar/codigo', {
        responseType: 'blob', // Importante para datos binarios como archivos ZIP
      });
      
      // Crear una URL blob para los datos de respuesta
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      // Crear un elemento <a> temporal para activar la descarga
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'proyecto-generado.zip');
      document.body.appendChild(link);
      
      // Activar la descarga
      link.click();
      
      // Limpieza
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setExito(true);
    } catch (error) {
      console.error('Error al exportar código:', error);
      setError('No se pudo exportar el código. Por favor, inténtalo de nuevo más tarde.');
    } finally {
      setExportando(false);
    }
  };
  
  return (
    <div className="p-4 bg-white rounded shadow mb-4">
      <h2 className="text-xl font-bold mb-4">Exportar Código Generado</h2>
      <p className="mb-4">
        Descarga el proyecto completo como un archivo ZIP.
        El archivo incluye tanto el backend NestJS como el frontend Angular con scripts de configuración.
      </p>
      
      <button
        onClick={handleExportar}
        disabled={exportando}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-blue-300"
      >
        {exportando ? 'Exportando...' : 'Exportar Proyecto'}
      </button>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {exito && (
        <div className="mt-4 p-3 bg-green-100 text-green-700 rounded">
          ¡Proyecto exportado con éxito! La descarga debería iniciar automáticamente.
        </div>
      )}
      
      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Nota:</strong> El archivo ZIP descargado contendrá:</p>
        <ul className="list-disc pl-5 mt-2">
          <li>Proyecto backend NestJS completo</li>
          <li>Proyecto frontend Angular completo</li>
          <li>Scripts de configuración para ambos proyectos</li>
          <li>README detallado con instrucciones de configuración</li>
        </ul>
      </div>
    </div>
  );
};

export default ExportarCodigo;