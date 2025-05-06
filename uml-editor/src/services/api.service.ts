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
}

interface GeneratedCode {
  backend: any;
  frontend: any;
}

const API_URL = 'http://localhost:3005/api'; // Ajusta según tu configuración

// Actualizar la función existente para que acepte sessionId
// src/services/api.service.ts
export const analyzeRequirements = async (requirements: string, sessionId?: string | null): Promise<AnalysisResponse> => {
  try {
    const token = localStorage.getItem('token');
    
    const headers: Record<string, string> = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('Enviando petición con token:', token.substring(0, 15) + '...');
    } else {
      console.warn('No hay token de autenticación disponible');
    }
    
    if (sessionId) {
      headers['session-id'] = sessionId;
    }
    
    const response = await axios.post(`${API_URL}/gemini/analyze`, {
      requirements
    }, { headers });
    
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
    const headers: Record<string, string> = {};
    
    if (sessionId) {
      headers['session-id'] = sessionId;
    }
    
    const response = await axios.post(`${API_URL}/gemini/generate-code`, {
      diagrams,
      requirements
    }, { headers });
    
    return response.data;
  } catch (error) {
    console.error('Error generating code:', error);
    throw error;
  }
};
// Agregar esta nueva función a src/services/api.service.ts
export const continueConversation = async (message: string, sessionId: string): Promise<AnalysisResponse> => {
  try {
    const response = await axios.post(`${API_URL}/gemini/continue`, {
      message
    }, {
      headers: {
        'session-id': sessionId
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error continuing conversation:', error);
    throw error;
  }
};