"use client";

import {
  Edit,
  Menu,
  ChevronDown,
  Plus,
  Globe,
  Lightbulb,
  ImageIcon,
  FileText,
  BarChart3,
  Code2,
  MoreHorizontal,
  Mic,
} from "lucide-react";
import { useState } from "react";
import UMLViewer from "./UMLViewer";

export default function ChatInterface() {
  const [isOpen, setIsOpen] = useState(true);

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
            <div className="w-full max-w-2xl mt-12 px-4 mx-auto">
              <h1 className="text-4xl font-semibold text-center mb-6">
                ¿Con qué puedo ayudarte?
              </h1>

              {/* Input Area */}
              <div className="w-full">
                <div className="rounded-2xl bg-[#40414f] p-4 shadow-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <UMLViewer />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 justify-center">
                    <button className="flex items-center gap-2 px-4 py-3 rounded-lg border border-gray-600 hover:bg-gray-700 transition-colors">
                      <FileText className="w-5 h-5" />
                      Crea diagrama de secuencia
                    </button>
                    <button className="flex items-center gap-2 px-4 py-3 rounded-lg border border-gray-600 hover:bg-gray-700 transition-colors">
                      <FileText className="w-5 h-5" />
                      Crea diagrama de clases
                    </button>
                    <button className="flex items-center gap-2 px-4 py-3 rounded-lg border border-gray-600 hover:bg-gray-700 transition-colors">
                      <FileText className="w-5 h-5" />
                      Crea diagrama de paquetes
                    </button>
                    <button className="flex items-center gap-2 px-4 py-3 rounded-lg border border-gray-600 hover:bg-gray-700 transition-colors">
                      <FileText className="w-5 h-5" />
                      Crea diagrama casos de uso
                    </button>
                    <button className="flex items-center gap-2 px-4 py-3 rounded-lg border border-gray-600 hover:bg-gray-700 transition-colors">
                      <FileText className="w-5 h-5" />
                      Crea diagrama de componentes
                    </button>
                    <button className="flex items-center gap-2 px-4 py-3 rounded-lg border border-gray-600 hover:bg-gray-700 transition-colors">
                      <MoreHorizontal className="w-5 h-5" />
                      Generar todos los diagramas
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
