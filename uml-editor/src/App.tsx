import React, { useState, useEffect } from "react";
import ChatInterface from "./components/chat-interface";
import './index.css'
import LoginAccess from './components/LoginSingUp/Login';
import Profile from './components/ProfileEditor/Profile';

interface User {
  id: number;
  username: string;
  email: string;
  nombre?: string;
}

function App() {
  // Estado para el usuario autenticado
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Verificar si hay un usuario con sesión iniciada al cargar la aplicación
  useEffect(() => {
    const checkAuthentication = () => {
      // Verificar si hay un token en localStorage
      const token = localStorage.getItem('token');
      const userJson = localStorage.getItem('user');
      
      if (token && userJson) {
        try {
          const user = JSON.parse(userJson);
          setCurrentUser(user);
        } catch (error) {
          console.error('Error al parsear datos del usuario:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      
      setIsLoading(false);
    };
    
    checkAuthentication();
  }, []);
  
  // Función para manejar el inicio de sesión exitoso
  const handleLoginSuccess = (user: User) => {
    console.log("Login exitoso para usuario:", user);
    setCurrentUser(user);
  };
  
  // Función para manejar el cierre de sesión
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
  };
  
  // Mostrar un indicador de carga mientras verificamos la autenticación
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-xl">Cargando...</p>
        </div>
      </div>
    );
  }
  
  return (
    <main>
      {currentUser ? (
        // Si hay un usuario autenticado, mostrar el ChatInterface
        <>
          {/* Barra superior con información del usuario y botón de cierre de sesión */}
          <div className="fixed top-0 left-0 right-0 bg-gray-800 z-10 px-4 py-2 flex justify-between items-center shadow-md">
            <div className="flex items-center">
              <span className="font-bold text-white">{currentUser.nombre || currentUser.username}</span>
              <span className="text-gray-400 ml-2">({currentUser.email})</span>
            </div>
            <button 
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
            >
              Cerrar Sesión
            </button>
          </div>
          
          {/* Componente ChatInterface */}
          <div className="pt-10"> {/* Añadir padding-top para la barra de navegación */}
            <ChatInterface />
          </div>
        </>
      ) : (
        // Si no hay usuario autenticado, mostrar el LoginAccess
        <LoginAccess onLoginSuccess={handleLoginSuccess} />
      )}
    </main>
  );
}

export default App;