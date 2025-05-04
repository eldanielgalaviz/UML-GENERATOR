import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ChatInterface from "./components/chat-interface";
import './index.css';
import LoginAccess from './components/LoginSingUp/Login';
import Profile from './components/ProfileEditor/Profile';

// Interfaz completa del usuario que coincide con la entidad del backend
interface User {
  id: number;
  username: string;
  email: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  fechaNacimiento: string;
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
          console.log("Datos del usuario cargados desde localStorage:", user);
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
    
    // Asegurarse de que todos los campos estén presentes
    const completeUser = {
      ...user,
      nombre: user.nombre || "",
      apellidoPaterno: user.apellidoPaterno || "",
      apellidoMaterno: user.apellidoMaterno || "",
      fechaNacimiento: user.fechaNacimiento || ""
    };
    
    // Guardar usuario completo en localStorage y estado
    localStorage.setItem('user', JSON.stringify(completeUser));
    setCurrentUser(completeUser);
  };
  
  // Función para manejar el cierre de sesión
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
  };
  
  // Componente para rutas protegidas que requieren autenticación
  const ProtectedRoute = ({ element }: { element: JSX.Element }) => {
    return currentUser ? element : <Navigate to="/login" />;
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
    <BrowserRouter>
      <Routes>
        {/* Ruta para el inicio de sesión */}
        <Route 
          path="/login" 
          element={!currentUser ? <LoginAccess onLoginSuccess={handleLoginSuccess} /> : <Navigate to="/" />} 
        />
        
        {/* Ruta principal - Chat Interface */}
        <Route 
          path="/" 
          element={<ProtectedRoute element={<ChatInterface />} />} 
        />
        
        {/* Ruta para la página de perfil/configuración */}
        <Route 
          path="/perfil" 
          element={<ProtectedRoute element={<Profile />} />} 
        />
        
        {/* Redirección para rutas no encontradas */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;