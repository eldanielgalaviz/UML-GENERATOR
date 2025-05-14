// src/components/ConversationHistory.tsx
import React, { useState, useEffect } from 'react';
import { fetchUserConversations } from '../services/conversations.service';

interface Conversation {
  id: number;
  title: string;
  sessionId: string;
  createdAt: string;
  updatedAt: string;
}

interface ConversationHistoryProps {
  onSelectConversation: (sessionId: string) => void;
}

const ConversationHistory: React.FC<ConversationHistoryProps> = ({ onSelectConversation }) => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [debug, setDebug] = useState<string | null>(null);
  
    useEffect(() => {
      const loadConversations = async () => {
        try {
          setLoading(true);
          
          // Verificar autenticación
          const token = localStorage.getItem('token');
          if (!token) {
            setError('No hay token de autenticación');
            setLoading(false);
            return;
          }
          
        //   setDebug(`Token encontrado: ${token.substring(0, 15)}...`);
          
          const data = await fetchUserConversations();
          console.log('Conversaciones cargadas:', data);
        //   setDebug(prev => `${prev || ''}\nRecibidas ${data.length} conversaciones`);
          
          setConversations(data);
          setError(null);
        } catch (err: any) {
          setError(`Error al cargar las conversaciones: ${err.message}`);
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
  
      loadConversations();
    }, []);

  if (loading) {
    return <div className="p-4 text-center">Cargando conversaciones...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  if (conversations.length === 0) {
    return <div className="p-4 text-center">No tienes conversaciones guardadas</div>;
  }

  return (
    <div className="p-2 space-y-2">
      <h3 className="font-semibold text-lg mb-3">Tus conversaciones</h3>
      {debug && (
        <div className="mb-4 p-2 bg-gray-800 text-xs font-mono">
          <code>{debug}</code>
        </div>
      )}
      {conversations.map((conversation) => (
        
        <button
          key={conversation.id}
          onClick={() => onSelectConversation(conversation.sessionId)}
          className="flex items-center gap-3 w-full p-3 hover:bg-gray-700 rounded-lg transition-colors text-left"
        >
          <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="truncate font-medium">{conversation.title}</div>
            <div className="text-xs text-gray-400">
              {new Date(conversation.updatedAt).toLocaleDateString()}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

export default ConversationHistory;