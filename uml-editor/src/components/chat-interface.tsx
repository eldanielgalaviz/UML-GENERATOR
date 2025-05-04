"use client";

import { Edit, Menu, FileText, MoreHorizontal, User } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import UMLViewer from "./UMLViewer";
import CodeViewer from "./CodeViewer";

interface AnalysisResponse {
  requirements: any[];
  diagrams: any[];
  generatedCode?: any;
}

interface UserData {
  id: number;
  username: string;
  email: string;
  nombre?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  fechaNacimiento?: string;
}

interface ChatInterfaceProps {
  onLogout?: () => void; // Nueva prop para manejar el cierre de sesión
}

export default function ChatInterface({ onLogout }: ChatInterfaceProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"diagrams" | "code">("diagrams");
  const [analysisResponse, setAnalysisResponse] =
    useState<AnalysisResponse | null>(null);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMoreInfo, setShowMoreInfo] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Cerrar el menú de usuario cuando se hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
        setShowMoreInfo(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Obtener los datos del usuario desde localStorage al cargar el componente
  useEffect(() => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        const userData = JSON.parse(userJson);
        setCurrentUser(userData);
      } catch (error) {
        console.error('Error al parsear datos del usuario:', error);
      }
    }
  }, []);

  const handleAnalysisComplete = (response: AnalysisResponse) => {
    console.log("Análisis completado:", response);
    setAnalysisResponse(response);

    // Si hay código generado, permitir cambiar a la pestaña de código
    if (response.generatedCode) {
      setActiveTab("code");
    }
  };

  // Función para manejar el cierre de sesión
  const handleLogout = () => {
    // Si se proporciona una función onLogout desde el padre, usarla
    if (onLogout) {
      onLogout();
    } else {
      // Si no, hacer el comportamiento por defecto
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redireccionar a la página de login
      navigate("/login");
    }
  };

  // Función para ir a la página de configuración
  const goToConfiguration = () => {
    navigate('/perfil');
    setShowUserMenu(false); // Cerrar el menú después de hacer clic
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

            <div className="px-2 py-3 text-sm text-gray-400">Destacados</div>

            <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
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
            
            {/* Información del usuario - Movida al final del sidebar */}
            {currentUser && (
              <div className="mt-auto p-4 border-t border-gray-700 relative" ref={userMenuRef}>
                {/* Botón para mostrar/ocultar menú de usuario */}
                <div 
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-sm">
                    {currentUser.nombre?.charAt(0) || currentUser.username?.charAt(0)}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{currentUser.nombre || currentUser.username}</span>
                    <span className="text-xs text-gray-400">{currentUser.email}</span>
                  </div>
                </div>
                
                {/* Menú desplegable de opciones - Versión compacta */}
                {showUserMenu && (
                  <div className="absolute bottom-full left-0 mb-2 w-full border border-gray-700 rounded-lg overflow-hidden bg-[#202123] shadow-lg z-20">
                    {/* Opción de Configuración */}
                    <button 
                      onClick={goToConfiguration}
                      className="w-full py-2 px-3 hover:bg-gray-700 transition-colors flex items-center justify-between text-left text-xs"
                    >
                      <span>Configuración</span>
                      <span className="text-gray-400"></span>
                    </button>
                    
                    {/* Opción de Más información */}
                    <button 
                      className="w-full py-2 px-3 border-t border-gray-700 hover:bg-gray-700 transition-colors text-left flex items-center justify-between text-xs"
                      onClick={() => setShowMoreInfo(!showMoreInfo)}
                    >
                      <span>Más información</span>
                      <span className="text-gray-400">→</span>
                    </button>
                    
                    {/* Opciones dentro de Más información */}
                    {showMoreInfo && (
                      <>
                        {/* Opción de Acerca de */}
                        <button 
                          className="w-full py-2 px-3 border-t border-gray-700 hover:bg-gray-700 transition-colors text-left pl-6 flex items-center justify-between text-xs"
                          onClick={() => window.open('https://gemini.google/advanced/?hl=es', '_blank')}
                        >
                          <span>Acerca de Gemini</span>
                          <span className="text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </span>
                        </button>
                        
                        {/* Opción de Política de privacidad */}
                        <button 
                          className="w-full py-2 px-3 border-t border-gray-700 hover:bg-gray-700 transition-colors text-left pl-6 flex items-center justify-between text-xs"
                          onClick={() => window.open('https://www.gemini.com/es-LA/legal/privacy-policy', '_blank')}
                        >
                          <span>Política de privacidad</span>
                          <span className="text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </span>
                        </button>
                      </>
                    )}
                    
                    {/* Opción de Cerrar sesión */}
                    <button 
                      onClick={handleLogout}
                      className="w-full py-2 px-3 border-t border-gray-700 hover:bg-gray-700 transition-colors text-left text-red-500 text-xs"
                    >
                      <span>Cerrar sesión</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Botón para mostrar el sidebar cuando está oculto */}
          {!isOpen && (
            <button
              onClick={() => setIsOpen(true)}
              className="absolute top-4 left-4 p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors z-10"
              aria-label="Mostrar menú"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

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