// src/services/conversations.service.ts
import axios from 'axios';

const API_URL = 'http://localhost:3005/api'; 

// src/services/conversations.service.ts
export const fetchUserConversations = async (): Promise<any[]> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No hay token de autenticación');
      return [];
    }
    
    console.log('Obteniendo conversaciones con token:', token.substring(0, 15) + '...');
    
    const response = await axios.get(`${API_URL}/conversations`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('Respuesta del servidor:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error al obtener conversaciones:', error.response?.data || error.message);
    throw error;
  }
};

export const fetchConversationById = async (sessionId: string): Promise<any> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No hay token de autenticación');
    }
    
    const response = await axios.get(`${API_URL}/conversations/${sessionId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error al obtener conversación:', error);
    return null;
  }
};

export const continueConversation = async (sessionId: string, message: string): Promise<any> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No hay token de autenticación');
    }
    
    // Procesar con Gemini
    const response = await axios.post(
      `${API_URL}/gemini/continue`,
      { message },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'session-id': sessionId
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error al continuar conversación:', error);
    throw error;
  }
};
export const fetchConversationDetails = async (sessionId: string): Promise<any> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No hay token de autenticación');
    }
    
    const response = await axios.get(`${API_URL}/conversations/${sessionId}/details`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error al obtener detalles de conversación:', error);
    throw error;
  }
};