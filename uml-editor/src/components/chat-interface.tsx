"use client";

import { Edit, Menu, FileText, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import UMLViewer from "./UMLViewer";
import CodeViewer from "./CodeViewer";

interface AnalysisResponse {
  requirements: any[];
  diagrams: any[];
  generatedCode?: any;
}

export default function ChatInterface() {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"diagrams" | "code">("diagrams");
  const [analysisResponse, setAnalysisResponse] =
    useState<AnalysisResponse | null>(null);

  const handleAnalysisComplete = (response: AnalysisResponse) => {
    console.log("Análisis completado:", response);
    setAnalysisResponse(response);

    // Si hay código generado, permitir cambiar a la pestaña de código
    if (response.generatedCode) {
      setActiveTab("code");
    }
  };

  return (
    <div className="dark">
      <div className="min-h-screen bg-[#343541] text-white antialiased">
        <div className="flex h-screen">
          {/* Sidebar */}
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
              <div>Historial de chats</div>
            </div>

            <nav className="flex-1 p-2 space-y-1">
              <button className="flex items-center gap-3 w-full p-3 hover:bg-gray-700 rounded-lg transition-colors">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                  <Edit className="w-4 h-4" />
                </div>
                Un chat
              </button>
              <button className="flex items-center gap-3 w-full p-3 hover:bg-gray-700 rounded-lg transition-colors">
                <Edit className="w-5 h-5" />
                Otro chat
              </button>
            </nav>
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
                    <UMLViewer onAnalysisComplete={handleAnalysisComplete} />
                  ) : (
                    <CodeViewer
                      generatedCode={analysisResponse?.generatedCode}
                    />
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
