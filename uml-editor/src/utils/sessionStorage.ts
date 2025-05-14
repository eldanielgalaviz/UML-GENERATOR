// src/utils/sessionStorage.ts

/**
 * Utilidad para almacenar y recuperar datos de sesión en localStorage
 */

// Almacenar la respuesta de análisis en localStorage
export const storeAnalysisResponse = (response: any) => {
  try {
    if (!response) return;

    // Asegurarse de que tenemos una sessionId
    if (response.sessionId) {
      // Guardar la respuesta completa
      localStorage.setItem('lastAnalysisResponse', JSON.stringify({
        sessionId: response.sessionId,
        timestamp: new Date().toISOString()
      }));
      
      // También guardarla en el estado de la aplicación
      const appState = {
        currentSessionId: response.sessionId,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem('appState', JSON.stringify(appState));
      
      console.log('Respuesta de análisis almacenada en localStorage con sessionId:', response.sessionId);
    } else {
      console.warn('No se pudo guardar la respuesta de análisis porque no contiene sessionId');
    }
  } catch (error) {
    console.error('Error al almacenar la respuesta de análisis:', error);
  }
};

// Recuperar la última sessionId almacenada
export const getStoredSessionId = (): string | null => {
  try {
    // Primero intentar obtener del estado de la aplicación
    const appState = localStorage.getItem('appState');
    if (appState) {
      const parsedState = JSON.parse(appState);
      if (parsedState && parsedState.currentSessionId) {
        return parsedState.currentSessionId;
      }
    }
    
    // Si no existe, intentar obtener de la respuesta de análisis
    const analysisData = localStorage.getItem('lastAnalysisResponse');
    if (analysisData) {
      const parsedData = JSON.parse(analysisData);
      if (parsedData && parsedData.sessionId) {
        return parsedData.sessionId;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error al recuperar sessionId del localStorage:', error);
    return null;
  }
};

// Almacenar información del código generado
export const storeGeneratedCode = (code: any, sessionId: string) => {
  try {
    if (!code || !sessionId) return;
    
    // Almacenar un resumen del código generado (no todo el código para no sobrecargar localStorage)
    const codeInfo = {
      sessionId,
      timestamp: new Date().toISOString(),
      hasBackend: !!code.backend,
      hasFrontend: !!code.frontend,
      hasDatabase: !!code.database
    };
    
    localStorage.setItem('lastGeneratedCode', JSON.stringify(codeInfo));
    console.log('Información de código generado almacenada para sessionId:', sessionId);
  } catch (error) {
    console.error('Error al almacenar información del código generado:', error);
  }
};

// Verificar si hay código generado para una sesión
export const hasGeneratedCodeForSession = (sessionId: string): boolean => {
  try {
    const codeInfo = localStorage.getItem('lastGeneratedCode');
    if (!codeInfo) return false;
    
    const parsedInfo = JSON.parse(codeInfo);
    return parsedInfo.sessionId === sessionId;
  } catch (error) {
    console.error('Error al verificar código generado:', error);
    return false;
  }
};

// Almacenar el token de autenticación
export const storeAuthToken = (token: string) => {
  if (!token) return;
  localStorage.setItem('token', token);
};

// Obtener el token de autenticación
export const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

// Limpiar datos de sesión
export const clearSessionData = () => {
  localStorage.removeItem('lastAnalysisResponse');
  localStorage.removeItem('lastGeneratedCode');
  localStorage.removeItem('appState');
};

// Almacenar sessionId explícitamente
export const storeSessionId = (sessionId: string) => {
  if (!sessionId) return;
  
  const appState = {
    currentSessionId: sessionId,
    lastUpdated: new Date().toISOString()
  };
  localStorage.setItem('appState', JSON.stringify(appState));
  console.log('SessionId almacenado explícitamente:', sessionId);
};