// src/components/chat-interface.tsx (modificado)
"use client";

import { Edit, Menu, FileText, MoreHorizontal, Send } from "lucide-react";
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

  // Manejar la respuesta del análisis de requerimientos
  const handleAnalysisComplete = (response: AnalysisResponse) => {
    console.log("Análisis completado:", response);
    setAnalysisResponse(response);
    setCurrentSessionId(response.sessionId || null);

    // Si hay código generado, permitir cambiar a la pestaña de código
    if (response.generatedCode) {
      setActiveTab("code");
    }
  };

  // Cargar una conversación existente
// src/components/chat-interface.tsx
// Actualizar función handleSelectConversation
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

  // Enviar un mensaje para continuar la conversación
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
            </div>

            {/* Mostrar historial de conversaciones */}
            <div className="flex-1 overflow-auto">
              <ConversationHistory onSelectConversation={handleSelectConversation} />
            </div>
          </div>

          {/* Main Content */}
          <main className="flex-1 flex flex-col items-center overflow-auto">
            <div className="w-full max-w-4xl mt-3 px-4 mx-auto">
              <h1 className="text-3xl font-semibold text-center mb-6">
                Generador de diagramas y código UML
              </h1>
              <div className="mt-4 flex gap-4">
                <button
                  onClick={() => setActiveTab("diagrams")}
                  className={`px-4 py-2 rounded-lg ${
                    activeTab === "diagrams"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  Diagramas
                </button>
                <button
                  onClick={() => setActiveTab("code")}
                  disabled={!analysisResponse?.generatedCode}
                  className={`px-4 py-2 rounded-lg ${
                    activeTab === "code"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700"
                  } ${
                    !analysisResponse?.generatedCode
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  Código Generado
                </button>
              </div>

              <div>
              <div className="mt-6">
      {activeTab === "diagrams" ? (
        <UMLViewer
          onAnalysisComplete={handleAnalysisComplete}
          sessionId={currentSessionId}
          initialDiagrams={analysisResponse?.diagrams}
          initialRequirements={analysisResponse?.requirements}
        />
      ) : (
        <CodeViewer
          generatedCode={analysisResponse?.generatedCode}
        />
      )}
    </div>

                {/* Área para continuar la conversación */}
                {currentSessionId && (
                  <div className="mt-6 border-t border-gray-700 pt-4">
                    <div className="text-lg font-medium mb-2">
                      Continuar conversación
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={continuationMessage}
                        onChange={(e) => setContinuationMessage(e.target.value)}
                        placeholder="Añade detalles o haz preguntas sobre los diagramas..."
                        className="flex-1 bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isLoading}
                      />
                      <button
                        onClick={handleContinueConversation}
                        disabled={isLoading || !continuationMessage.trim()}
                        className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 rounded-lg px-4 py-2 flex items-center gap-2"
                      >
                        {isLoading ? 'Procesando...' : 'Enviar'}
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}