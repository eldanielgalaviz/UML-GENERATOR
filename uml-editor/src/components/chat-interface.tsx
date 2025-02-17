"use client"

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
} from "lucide-react"
import { useState } from "react"

export default function ChatInterface() {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div className="dark">
      <div className="min-h-screen bg-[#343541] text-white antialiased">
        <div className="flex h-screen">
          {/* Sidebar */}
          <div
            className={`${isOpen ? "w-64" : "w-0"} bg-[#202123] transition-all duration-300 overflow-hidden flex flex-col border-r border-gray-700`}
          >
            <div className="p-2 flex items-center gap-2">
              <button onClick={() => setIsOpen(!isOpen)} className="p-3 hover:bg-gray-700 rounded-lg transition-colors">
                <Menu className="w-5 h-5" />
              </button>
              <button className="flex items-center justify-between w-full p-3 hover:bg-gray-700 rounded-lg transition-colors">
                ChatGPT
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            <nav className="flex-1 p-2 space-y-1">
              <button className="flex items-center gap-3 w-full p-3 hover:bg-gray-700 rounded-lg transition-colors">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                  <ImageIcon className="w-4 h-4" />
                </div>
                ChatGPT
              </button>
              <button className="flex items-center gap-3 w-full p-3 hover:bg-gray-700 rounded-lg transition-colors">
                <Edit className="w-5 h-5" />
                Write For Me
              </button>
              <button className="flex items-center gap-3 w-full p-3 hover:bg-gray-700 rounded-lg transition-colors">
                <Code2 className="w-5 h-5" />
                Code Copilot
              </button>
              <button className="flex items-center gap-3 w-full p-3 hover:bg-gray-700 rounded-lg transition-colors">
                <FileText className="w-5 h-5" />
                SQL Expert
              </button>
              <button className="flex items-center gap-3 w-full p-3 hover:bg-gray-700 rounded-lg transition-colors">
                <Globe className="w-5 h-5" />
                Explorar GPT
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <main className="flex-1 flex flex-col items-center overflow-hidden">
            <div className="w-full max-w-2xl mt-24 px-4 mx-auto">
              <h1 className="text-4xl font-semibold text-center mb-6">¿Con qué puedo ayudarte?</h1>

              {/* Input Area */}
              <div className="w-full">
                <div className="rounded-2xl bg-[#40414f] p-4 shadow-lg">
                  <div className="min-h-[60px] flex items-center gap-2 mb-4">
                    <button className="p-2 hover:bg-gray-600 rounded-lg transition-colors">
                      <Plus className="w-5 h-5" />
                    </button>
                    <input
                      type="text"
                      placeholder="Envía un mensaje a ChatGPT"
                      className="flex-1 bg-transparent outline-none border-none text-white placeholder-gray-400"
                    />
                    <button className="p-2 hover:bg-gray-600 rounded-lg transition-colors">
                      <Globe className="w-5 h-5" />
                    </button>
                    <button className="p-2 hover:bg-gray-600 rounded-lg transition-colors">
                      <Lightbulb className="w-5 h-5" />
                    </button>
                    <button className="p-2 hover:bg-gray-600 rounded-lg transition-colors">
                      <Mic className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 justify-center">
                    <button className="flex items-center gap-2 px-4 py-3 rounded-lg border border-gray-600 hover:bg-gray-700 transition-colors">
                      <ImageIcon className="w-5 h-5" />
                      Crea una imagen
                    </button>
                    <button className="flex items-center gap-2 px-4 py-3 rounded-lg border border-gray-600 hover:bg-gray-700 transition-colors">
                      <FileText className="w-5 h-5" />
                      Resume un texto
                    </button>
                    <button className="flex items-center gap-2 px-4 py-3 rounded-lg border border-gray-600 hover:bg-gray-700 transition-colors">
                      <BarChart3 className="w-5 h-5" />
                      Analiza datos
                    </button>
                    <button className="flex items-center gap-2 px-4 py-3 rounded-lg border border-gray-600 hover:bg-gray-700 transition-colors">
                      <Code2 className="w-5 h-5" />
                      Código
                    </button>
                    <button className="flex items-center gap-2 px-4 py-3 rounded-lg border border-gray-600 hover:bg-gray-700 transition-colors">
                      <MoreHorizontal className="w-5 h-5" />
                      Más
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

