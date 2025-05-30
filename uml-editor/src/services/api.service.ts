// src/services/api.service.ts

import axios from 'axios';

interface IEEE830Requirement {
  id: string;
  type: 'functional' | 'non-functional';
  description: string;
  priority: 'high' | 'medium' | 'low';
  dependencies?: string[];
}

interface MermaidDiagram {
  type: string;
  title: string;
  code: string;
}

interface AnalysisResponse {
  requirements: IEEE830Requirement[];
  diagrams: MermaidDiagram[];
  sessionId: string;
}

interface GeneratedCode {
  backend: any;
  frontend: any;
  database?: any;
}

const API_URL = 'https://uml-generator-backend.onrender.com/api'; // Ajusta según tu configuración

// Función para obtener el token de autenticación
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Actualizar la función existente para que acepte sessionId
export const analyzeRequirements = async (requirements: string, sessionId?: string | null): Promise<AnalysisResponse> => {
  try {
    // Configurar headers con autenticación y sessionId si existe
    const headers: Record<string, string> = {
      ...getAuthHeaders()
    };
    
    if (sessionId) {
      headers['session-id'] = sessionId;
    }
    
    console.log('Enviando solicitud de análisis con headers:', headers);
    
    const response = await axios.post(`${API_URL}/gemini/analyze`, {
      requirements
    }, { headers });
    
    console.log('Respuesta de análisis recibida:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error analyzing requirements:', error);
    throw error;
  }
};

// Actualizar la función existente para que acepte sessionId
export const generateCode = async (
  diagrams: MermaidDiagram[],
  requirements: IEEE830Requirement[],
  sessionId?: string | null
): Promise<GeneratedCode> => {
  try {
    // Configurar headers con autenticación y sessionId si existe
    const headers: Record<string, string> = {
      ...getAuthHeaders()
    };
    
    if (sessionId) {
      headers['session-id'] = sessionId;
    }
    
    console.log('Enviando solicitud de generación de código con headers:', headers);
    console.log('Diagrams:', diagrams.length, 'Requirements:', requirements.length);
    
    const response = await axios.post(`${API_URL}/gemini/generate-code`, {
      diagrams,
      requirements
    }, { headers });
    
    console.log('Código generado recibido:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error generating code:', error);
    throw error;
  }
};

// Agregar esta nueva función a src/services/api.service.ts
export const continueConversation = async (sessionId: string, message: string): Promise<AnalysisResponse> => {
  try {
    // Configurar headers con autenticación y sessionId
    const headers: Record<string, string> = {
      ...getAuthHeaders(),
      'session-id': sessionId
    };
    
    console.log('Enviando solicitud de continuación con headers:', headers);
    
    const response = await axios.post(`${API_URL}/gemini/continue`, {
      message
    }, { headers });
    
    return response.data;
  } catch (error) {
    console.error('Error continuing conversation:', error);
    throw error;
  }
};

// Función para descargar el proyecto
export const downloadProject = async (sessionId: string): Promise<Blob> => {
  try {
    // Configurar headers con autenticación y sessionId
    const headers: Record<string, string> = {
      ...getAuthHeaders(),
      'session-id': sessionId
    };
    
    console.log('Enviando solicitud de descarga con headers:', headers);
    
    const response = await axios({
      url: `${API_URL}/gemini/download-project?sessionId=${sessionId}`,
      method: 'GET',
      responseType: 'blob',
      headers
    });
    
    return response.data;
  } catch (error) {
    console.error('Error downloading project:', error);
    throw error;
  }
};
