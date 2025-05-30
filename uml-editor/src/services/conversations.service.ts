// src/services/conversations.service.ts

import axios from 'axios';

interface Conversation {
  id: number;
  title: string;
  originalRequirements: string;
  requirements: any[];
  diagrams: any[];
  messages: any[];
  sessionId: string;
  generatedCode?: any;
  createdAt: string;
  updatedAt: string;
}

const API_URL = 'https://uml-generator-backend.onrender.com/api';

// Función mejorada para obtener los headers de autenticación
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.warn('No se encontró token de autenticación en localStorage');
    return {};
  }
  return { 'Authorization': `Bearer ${token}` };
};

// Obtener lista de conversaciones del usuario
export const fetchUserConversations = async (): Promise<Conversation[]> => {
  try {
    const headers = getAuthHeaders();
    
    if (!Object.keys(headers).length) {
      console.error('No hay token de autenticación, no se pueden obtener conversaciones');
      return [];
    }
    
    console.log('Obteniendo conversaciones con token:', 
      headers.Authorization ? `${headers.Authorization.substring(0, 15)}...` : 'No token');
    
    const response = await axios.get(`${API_URL}/conversations`, { headers });
    
    console.log('Respuesta de conversaciones recibida:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error al obtener conversaciones:', 
      error.response?.data || error.message || error);
    return [];
  }
};

// Obtener una conversación por su ID
export const fetchConversationById = async (sessionId: string): Promise<Conversation | null> => {
  try {
    const headers = getAuthHeaders();
    
    if (!Object.keys(headers).length) {
      console.error('No hay token de autenticación, no se puede obtener conversación');
      return null;
    }
    
    console.log(`Obteniendo conversación con sessionId: ${sessionId}`);
    
    const response = await axios.get(`${API_URL}/conversations/${sessionId}`, { headers });
    
    console.log('Conversación recibida:', response.data);
    return response.data;
  } catch (error: any) {
    console.error(`Error al obtener conversación ${sessionId}:`, 
      error.response?.data || error.message || error);
    return null;
  }
};

// Obtener todos los detalles de una conversación
export const fetchConversationDetails = async (sessionId: string): Promise<any> => {
  try {
    const headers = getAuthHeaders();
    
    if (!Object.keys(headers).length) {
      console.error('No hay token de autenticación, no se pueden obtener detalles');
      throw new Error('Se requiere autenticación para acceder a los detalles de la conversación');
    }
    
    console.log(`Obteniendo detalles de conversación ${sessionId}`);
    
    const response = await axios.get(
      `${API_URL}/conversations/${sessionId}/details`, 
      { headers }
    );
    
    console.log('Detalles de conversación recibidos:', response.data);
    return response.data;
  } catch (error: any) {
    console.error(`Error al obtener detalles de conversación ${sessionId}:`, 
      error.response?.data || error.message || error);
    throw error;
  }
};

// Continuar una conversación con un nuevo mensaje
export const continueConversation = async (sessionId: string, message: string): Promise<any> => {
  try {
    const authHeaders = getAuthHeaders();
    
    if (!Object.keys(authHeaders).length) {
      console.error('No hay token de autenticación, no se puede continuar la conversación');
      throw new Error('Se requiere autenticación para continuar la conversación');
    }
    
    // Combinar los headers de autenticación con el session-id
    const headers = {
      ...authHeaders,
      'session-id': sessionId
    };
    
    console.log(`Continuando conversación ${sessionId} con mensaje: "${message.substring(0, 30)}..."`);
    console.log('Headers utilizados:', headers);
    
    const response = await axios.post(
      `${API_URL}/gemini/continue`,
      { message },
      { headers }
    );
    
    console.log('Respuesta de continuación recibida:', response.data);
    return response.data;
  } catch (error: any) {
    console.error(`Error al continuar conversación ${sessionId}:`, 
      error.response?.data || error.message || error);
    throw error;
  }
};

// Función para descargar el proyecto (reutilizable desde DownloadProjectButton)
export const downloadProject = async (sessionId: string): Promise<Blob> => {
  try {
    const authHeaders = getAuthHeaders();
    
    if (!Object.keys(authHeaders).length) {
      console.error('No hay token de autenticación, no se puede descargar el proyecto');
      throw new Error('Se requiere autenticación para descargar el proyecto');
    }
    
    // Combinar los headers de autenticación con el session-id
    const headers = {
      ...authHeaders,
      'session-id': sessionId
    };
    
    console.log(`Descargando proyecto para sessionId: ${sessionId}`);
    console.log('Headers utilizados:', headers);
    
    const response = await axios({
      url: `${API_URL}/gemini/download-project?sessionId=${sessionId}`,
      method: 'GET',
      responseType: 'blob',
      headers
    });
    
    console.log('Descarga completada, tamaño del blob:', response.data.size);
    return response.data;
  } catch (error: any) {
    console.error(`Error al descargar proyecto ${sessionId}:`, 
      error.response?.statusText || error.message || error);
    throw error;
  }
};
