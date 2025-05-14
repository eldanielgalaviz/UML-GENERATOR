// src/utils/apiHelpers.ts

import axios, { AxiosRequestConfig } from 'axios';
import { getAuthToken, storeSessionId } from './sessionStorage';

const API_URL = 'http://localhost:3005/api';

/**
 * Crea un cliente Axios con configuración común
 */
export const createApiClient = () => {
  const token = getAuthToken();
  
  return axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }
  });
};

/**
 * Extrae el sessionId de una respuesta y lo almacena
 */
export const extractAndStoreSessionId = (response: any): string | null => {
  if (response && response.data && response.data.sessionId) {
    const sessionId = response.data.sessionId;
    storeSessionId(sessionId);
    return sessionId;
  }
  return null;
};

/**
 * Función para descargar directamente un proyecto
 */
export const downloadProjectDirectly = async (sessionId: string): Promise<void> => {
  if (!sessionId) {
    throw new Error('No hay sessionId disponible para la descarga');
  }

  const token = getAuthToken();
  
  // Intentar descarga vía fetch con blob
  try {
    const response = await fetch(`${API_URL}/gemini/download-project?sessionId=${sessionId}`, {
      method: 'GET',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        'session-id': sessionId
      }
    });

    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'proyecto-generado.zip');
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    }, 100);
    
    return;
  } catch (fetchError) {
    console.warn('Error en descarga con fetch:', fetchError);
    // Si falla, intentamos con método alternativo
  }

  // Método alternativo: abrir en nueva ventana
  window.open(`${API_URL}/gemini/download-project?sessionId=${sessionId}&token=${token || ''}`, '_blank');
};

/**
 * Función para hacer una petición POST con manejo de errores mejorado
 */
export const enhancedPost = async (endpoint: string, data: any, config?: AxiosRequestConfig): Promise<any> => {
  try {
    const client = createApiClient();
    
    // Si hay un sessionId en los datos, añadirlo también a los headers
    const enhancedConfig = { ...config };
    if (data && data.sessionId) {
      enhancedConfig.headers = {
        ...enhancedConfig.headers,
        'session-id': data.sessionId
      };
    }
    
    const response = await client.post(endpoint, data, enhancedConfig);
    
    // Extraer y almacenar sessionId si existe
    extractAndStoreSessionId(response);
    
    return response.data;
  } catch (error: any) {
    console.error(`Error en petición POST a ${endpoint}:`, error);
    
    // Mejorar mensajes de error
    if (error.response) {
      const statusCode = error.response.status;
      if (statusCode === 401) {
        throw new Error('Error de autenticación. Por favor, inicia sesión nuevamente.');
      } else if (statusCode === 404) {
        throw new Error(`Recurso no encontrado: ${endpoint}`);
      } else {
        throw new Error(`Error del servidor (${statusCode}): ${error.response.data?.message || 'Error desconocido'}`);
      }
    } else if (error.request) {
      throw new Error('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
    } else {
      throw error;
    }
  }
};

/**
 * Función para hacer una petición GET con manejo de errores mejorado
 */
export const enhancedGet = async (endpoint: string, config?: AxiosRequestConfig): Promise<any> => {
  try {
    const client = createApiClient();
    const response = await client.get(endpoint, config);
    
    // Extraer y almacenar sessionId si existe
    extractAndStoreSessionId(response);
    
    return response.data;
  } catch (error: any) {
    console.error(`Error en petición GET a ${endpoint}:`, error);
    
    // Mejorar mensajes de error
    if (error.response) {
      const statusCode = error.response.status;
      if (statusCode === 401) {
        throw new Error('Error de autenticación. Por favor, inicia sesión nuevamente.');
      } else if (statusCode === 404) {
        throw new Error(`Recurso no encontrado: ${endpoint}`);
      } else {
        throw new Error(`Error del servidor (${statusCode}): ${error.response.data?.message || 'Error desconocido'}`);
      }
    } else if (error.request) {
      throw new Error('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
    } else {
      throw error;
    }
  }
};