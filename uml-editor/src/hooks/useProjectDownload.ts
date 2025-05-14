// src/hooks/useProjectDownload.ts

import { useState, useEffect } from 'react';
import axios from 'axios';
import { getAuthToken, getStoredSessionId } from '../utils/sessionStorage';

interface UseProjectDownloadProps {
  sessionId?: string | null;
}

interface UseProjectDownloadResult {
  isLoading: boolean;
  isEnabled: boolean;
  error: string | null;
  downloadProject: () => Promise<void>;
  sessionIdInfo: {
    providedSessionId: string | null | undefined;
    storedSessionId: string | null;
    effectiveSessionId: string | null;
  };
}

/**
 * Hook personalizado para manejar la descarga del proyecto
 */
const useProjectDownload = (props: UseProjectDownloadProps): UseProjectDownloadResult => {
  const { sessionId: providedSessionId } = props;
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [storedSessionId, setStoredSessionId] = useState<string | null>(null);
  const [effectiveSessionId, setEffectiveSessionId] = useState<string | null>(null);

  // Inicializar con sessionId almacenado
  useEffect(() => {
    // Obtener sessionId del localStorage si no se proporciona uno
    if (!providedSessionId) {
      const stored = getStoredSessionId();
      setStoredSessionId(stored);
    }
  }, [providedSessionId]);

  // Determinar el sessionId efectivo
  useEffect(() => {
    const effective = providedSessionId || storedSessionId;
    setEffectiveSessionId(effective);
    setIsEnabled(!!effective);
    
    console.log('Estado de descarga actualizado:', {
      providedSessionId,
      storedSessionId,
      effectiveSessionId: effective,
      isEnabled: !!effective
    });
  }, [providedSessionId, storedSessionId]);

  // Función para descargar el proyecto
  const downloadProject = async (): Promise<void> => {
    if (!effectiveSessionId) {
      setError('No hay sessionId disponible para la descarga');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Obtener el token de autenticación
      const token = getAuthToken();
      console.log(`Iniciando descarga para sessionId: ${effectiveSessionId}`);

      // Método 1: Descarga vía Axios
      try {
        const response = await axios({
          url: `http://localhost:3005/api/gemini/download-project?sessionId=${effectiveSessionId}`,
          method: 'GET',
          responseType: 'blob',
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            'session-id': effectiveSessionId
          }
        });

        // Verificar que la respuesta sea un blob válido
        if (!(response.data instanceof Blob) || response.data.size === 0) {
          throw new Error('La respuesta no es un archivo válido');
        }

        // Crear un objeto URL para el blob
        const url = window.URL.createObjectURL(response.data);

        // Crear un elemento a temporal para la descarga
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'proyecto-generado.zip');

        // Agregar al cuerpo, hacer clic, y limpiar
        document.body.appendChild(link);
        link.click();
        
        // Pequeña pausa para asegurar que la descarga comience
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
          document.body.removeChild(link);
          console.log('Descarga completada con éxito');
        }, 100);
      } catch (axiosError) {
        console.warn('Error con Axios, intentando método alternativo:', axiosError);
        // Método 2: Descarga vía ventana
        window.open(`http://localhost:3005/api/gemini/download-project?sessionId=${effectiveSessionId}&token=${token || ''}`);
      }
    } catch (err: any) {
      console.error('Error al descargar el proyecto:', err);
      
      // Mensaje de error más descriptivo
      if (err.response) {
        if (err.response.status === 401) {
          setError('Error de autenticación. Por favor, inicia sesión nuevamente.');
        } else if (err.response.status === 404) {
          setError('Proyecto no encontrado. Es posible que la sesión haya expirado.');
        } else {
          setError(`Error del servidor: ${err.response.status} ${err.response.statusText}`);
        }
      } else if (err.request) {
        setError('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
      } else {
        setError(`Error al descargar: ${err.message || 'Error desconocido'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    isEnabled,
    error,
    downloadProject,
    sessionIdInfo: {
      providedSessionId,
      storedSessionId,
      effectiveSessionId
    }
  };
};

export default useProjectDownload;