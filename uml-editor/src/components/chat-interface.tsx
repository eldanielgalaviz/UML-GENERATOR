// src/components/chat-interface.tsx (VERSIÓN MEJORADA)
"use client";

import { Edit, Menu, FileText, MoreHorizontal, Send, Plus, X } from "lucide-react";
import { useState, useEffect } from "react";
import UMLViewer from "./UMLViewer";
import CodeViewer from "./CodeViewer";
import ConversationHistory from "./ConversationHistory";
import { continueConversation, fetchConversationById, fetchConversationDetails } from "../services/conversations.service";

interface AnalysisResponse {
  requirements: any[];
  diagrams: any[];
  generatedCode?: any;
  sessionId?: string;
}

export default function ChatInterface() {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"diagrams" | "code">("diagrams");
  const [analysisResponse, setAnalysisResponse] = useState<AnalysisResponse | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [continuationMessage, setContinuationMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // ✅ NUEVOS ESTADOS PARA CONTROLAR LA INTERFAZ
  const [isExistingConversation, setIsExistingConversation] = useState(false);
  const [showRequirementsForm, setShowRequirementsForm] = useState(false);
  const [conversationTitle, setConversationTitle] = useState("");

  // Manejar la respuesta del análisis de requerimientos
  const handleAnalysisComplete = (response: AnalysisResponse) => {
    console.log("Análisis completado:", response);
    
    // CRÍTICO: Guardar sessionId explícitamente
    if (response.sessionId) {
      localStorage.setItem('currentSessionId', response.sessionId);
      localStorage.setItem('lastAnalysisResponse', JSON.stringify(response));
      console.log("🔥 SessionId guardado desde ChatInterface:", response.sessionId);
    }
    
    setAnalysisResponse(response);
    setCurrentSessionId(response.sessionId || null);
    
    // ✅ Marcar como conversación existente una vez que se genera contenido
    if (response.sessionId) {
      setIsExistingConversation(true);
      setShowRequirementsForm(false); // Ocultar formulario de requerimientos
    }

    // Si hay código generado, permitir cambiar a la pestaña de código
    if (response.generatedCode) {
      setActiveTab("code");
    }
  };

  // Cargar una conversación existente
  const handleSelectConversation = async (sessionId: string) => {
    try {
      setIsLoading(true);
      
      // Obtener todos los detalles de la conversación
      const conversation = await fetchConversationDetails(sessionId);
      
      if (conversation) {
        setAnalysisResponse({
          requirements: conversation.requirements || [],
          diagrams: conversation.diagrams || [],
          generatedCode: conversation.generatedCode,
          sessionId: conversation.sessionId
        });
        
        setCurrentSessionId(conversation.sessionId);
        setConversationTitle(conversation.title || "Conversación");
        
        // ✅ MARCAR COMO CONVERSACIÓN EXISTENTE
        setIsExistingConversation(true);
        setShowRequirementsForm(false); // Ocultar formulario por defecto
        
        // Si hay código generado, permitir cambiar a pestaña de código
        if (conversation.generatedCode) {
          // Opcional: cambiar automáticamente a la pestaña de código
          // setActiveTab("code");
        }
      }
    } catch (error) {
      console.error("Error al cargar la conversación:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ NUEVA FUNCIÓN: Crear nueva conversación
  const handleNewConversation = () => {
    setIsExistingConversation(false);
    setShowRequirementsForm(true);
    setCurrentSessionId(null);
    setAnalysisResponse(null);
    setConversationTitle("");
    setContinuationMessage("");
    setActiveTab("diagrams");
  };

  // ✅ FUNCIÓN MEJORADA: Continuar conversación
  const handleContinueConversation = async () => {
    if (!currentSessionId || !continuationMessage.trim()) return;

    try {
      setIsLoading(true);
      const response = await continueConversation(
        currentSessionId,
        continuationMessage
      );
      
      if (response) {
        setAnalysisResponse({
          requirements: response.requirements || [],
          diagrams: response.diagrams || [],
          generatedCode: response.generatedCode || analysisResponse?.generatedCode,
          sessionId: response.sessionId
        });
        setContinuationMessage("");
      }
    } catch (error) {
      console.error("Error al continuar la conversación:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Función para manejar Enter en el textarea
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleContinueConversation();
    }
  };

  return (
    <div className="dark">
      <div className="min-h-screen bg-[#343541] text-white antialiased">
        <div className="flex h-screen">
          {/* Sidebar con historial */}
          <div
            className={`${
              isOpen ? "w-64" : "w-0"
            } bg-[#202123] transition-all duration-300 overflow-hidden flex flex-col border-r border-gray-700`}
          >
            <div className="p-2 flex items-center gap-2">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-3 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>Historial</div>
              
              {/* ✅ Botón para nueva conversación */}
              <button
                onClick={handleNewConversation}
                className="ml-auto p-2 hover:bg-gray-700 rounded-lg transition-colors"
                title="Nueva conversación"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Mostrar historial de conversaciones */}
            <div className="flex-1 overflow-auto">
              <ConversationHistory onSelectConversation={handleSelectConversation} />
            </div>
          </div>

          {/* Main Content */}
          <main className="flex-1 flex flex-col items-center overflow-auto">
            <div className="w-full max-w-4xl mt-3 px-4 mx-auto">
              {/* ✅ HEADER MEJORADO */}
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-semibold">
                  {isExistingConversation && conversationTitle ? 
                    conversationTitle : 
                    "Generador de diagramas y código UML"
                  }
                </h1>
                
                {isExistingConversation && (
                  <button
                    onClick={handleNewConversation}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Nueva conversación
                  </button>
                )}
              </div>

              {/* ✅ CAMPO PARA CONTINUAR CONVERSACIÓN - ARRIBA */}
              {isExistingConversation && !showRequirementsForm && (
                <div className="mb-6 bg-[#2A2B32] rounded-lg p-4 border border-gray-600">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium">Continuar conversación</h3>
                    <button
                      onClick={() => setShowRequirementsForm(true)}
                      className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Nuevos requerimientos
                    </button>
                  </div>
                  
                  <div className="flex gap-3">
                    <textarea
                      value={continuationMessage}
                      onChange={(e) => setContinuationMessage(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Añade detalles, haz preguntas o solicita modificaciones..."
                      className="flex-1 bg-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[80px]"
                      disabled={isLoading}
                    />
                    <button
                      onClick={handleContinueConversation}
                      disabled={isLoading || !continuationMessage.trim()}
                      className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 rounded-lg px-6 py-3 flex items-center gap-2 self-end"
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      {isLoading ? 'Enviando...' : 'Enviar'}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Presiona Ctrl+Enter para enviar rápidamente
                  </p>
                </div>
              )}

              {/* ✅ MOSTRAR FORMULARIO DE REQUERIMIENTOS CON BOTÓN CERRAR */}
              {showRequirementsForm && isExistingConversation && (
                <div className="mb-6 bg-[#2A2B32] rounded-lg p-4 border border-gray-600">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium">Agregar nuevos requerimientos</h3>
                    <button
                      onClick={() => setShowRequirementsForm(false)}
                      className="text-gray-400 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-400 mb-4">
                    Agrega nuevos requerimientos para expandir o modificar los diagramas existentes.
                  </p>
                </div>
              )}

              {/* Tabs */}
              <div className="mt-4 flex gap-4">
                <button
                  onClick={() => setActiveTab("diagrams")}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    activeTab === "diagrams"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  Diagramas
                </button>
                <button
                  onClick={() => setActiveTab("code")}
                  disabled={!analysisResponse?.generatedCode}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    activeTab === "code"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  } ${
                    !analysisResponse?.generatedCode
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  Código Generado
                </button>
              </div>

              {/* Content */}
              <div className="mt-6">
                {activeTab === "diagrams" ? (
                  <UMLViewer 
                    onAnalysisComplete={handleAnalysisComplete}
                    sessionId={currentSessionId}
                    initialDiagrams={analysisResponse?.diagrams}
                    initialRequirements={analysisResponse?.requirements}
                    // ✅ PASAR PROPS ADICIONALES PARA CONTROLAR LA INTERFAZ
                    hideRequirementsInput={isExistingConversation && !showRequirementsForm}
                    isExistingConversation={isExistingConversation}
                  />
                ) : (
                  <CodeViewer
                    generatedCode={analysisResponse?.generatedCode}
                    sessionId={currentSessionId}
                  />
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}