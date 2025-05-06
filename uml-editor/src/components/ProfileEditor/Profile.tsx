import { useState, FormEvent, useEffect, useRef } from "react";
import { Menu, Edit, MoreHorizontal, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./LoginStyle.css"; 

// Definir la interfaz exactamente igual a la entidad User del backend
interface UserProfile {
  id: number;
  username: string;
  email: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  fechaNacimiento: string;
}

// Interfaz para las props del componente
interface ProfileProps {
  onLogout?: () => void;
}

const Profile = ({ onLogout }: ProfileProps) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState("");
  
  // Variables para el menú de usuario
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

  // Cargar datos del usuario directamente del localStorage
  useEffect(() => {
    try {
      const storedUserJSON = localStorage.getItem('user');
      console.log('Datos en localStorage:', storedUserJSON);
      
      if (storedUserJSON) {
        const storedUser = JSON.parse(storedUserJSON);
        console.log('Usuario parseado:', storedUser);
        setUserData(storedUser);
      } else {
        console.log('No hay datos de usuario en localStorage');
      }
    } catch (error) {
      console.error('Error al cargar los datos del usuario:', error);
    }
  }, []);

  // Solo actualizar el nombre de usuario (único campo editable)
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (userData) {
      setUserData({
        ...userData,
        username: e.target.value
      });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setFormErrors([]);
    
    // Validación básica
    const errors: string[] = [];
    if (!userData?.username) {
      errors.push("El nombre de usuario es obligatorio");
    }
    
    // Validación de contraseña si se está intentando cambiar
    if (password || confirmPassword) {
      if (password !== confirmPassword) {
        errors.push("Las contraseñas no coinciden");
      } else if (password.length < 6) {
        errors.push("La contraseña debe tener al menos 6 caracteres");
      } else if (!/[A-Z]/.test(password)) {
        errors.push("La contraseña debe contener al menos una letra mayúscula");
      } else if (!/[0-9]/.test(password)) {
        errors.push("La contraseña debe contener al menos un número");
      }
    }
    
    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }
    
    try {
      // Guardar cambios en localStorage
      if (userData) {
        localStorage.setItem('user', JSON.stringify(userData));
        
        // En un caso real, aquí llamaríamos a la API para actualizar los datos
        console.log('Datos guardados:', userData);
        
        // Si hay contraseña nueva, la actualizaríamos en un caso real
        if (password) {
          console.log("Contraseña actualizada:", password);
          // Aquí iría la lógica para actualizar la contraseña en el backend
        }
        
        setShowSuccessMessage("Perfil actualizado exitosamente");
        
        // Limpiar campos de contraseña
        setPassword("");
        setConfirmPassword("");
        
        // Ocultar el mensaje después de unos segundos
        setTimeout(() => {
          setShowSuccessMessage("");
        }, 3000);
      }
    } catch (error) {
      setFormErrors(["Error al actualizar el perfil"]);
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

  // Función para ir al chat principal
  const goToChat = () => {
    navigate('/');
  };
  
  // Función para ir a la página de configuración
  const goToConfiguration = () => {
    // Ya estamos en la página de configuración, así que solo cerramos el menú
    setShowUserMenu(false);
  };

  // Formatear fecha para mostrar (si es necesario)
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '';
    
    // Si la fecha viene en formato ISO, la convertimos a yyyy-MM-dd
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0]; // Formato yyyy-MM-dd
    } catch {
      return dateString; // Si hay error, devolver la cadena original
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
              <div>Navegación</div>
            </div>

            <div className="px-2 py-3 text-sm text-gray-400">Opciones</div>

            <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
              <button 
                className="flex items-center gap-3 w-full p-3 hover:bg-gray-700 rounded-lg transition-colors"
                onClick={goToChat}
              >
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                  <Edit className="w-4 h-4" />
                </div>
                Volver al Chat
              </button>
            </nav>
            
            {/* Información del usuario - Mismo formato que en ChatInterface */}
            {userData && (
              <div className="mt-auto p-4 border-t border-gray-700 relative" ref={userMenuRef}>
                {/* Botón para mostrar/ocultar menú de usuario */}
                <div 
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-sm">
                    {userData.nombre?.charAt(0) || userData.username?.charAt(0)}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{userData.nombre || userData.username}</span>
                    <span className="text-xs text-gray-400">{userData.email}</span>
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

          {/* Contenido principal - Formulario de perfil */}
          <main className="flex-1 flex flex-col items-center overflow-auto p-4">
            <div className="w-full max-w-4xl">
              <h1 className="text-3xl font-semibold text-center mb-2">Editar Perfil</h1>
              <div className="h-1 w-16 bg-blue-500 mx-auto mb-6"></div>

              {/* Mensajes de éxito o error */}
              {showSuccessMessage && (
                <div className="mb-6 bg-green-500/20 border border-green-500 text-green-100 p-3 rounded-lg text-center">
                  {showSuccessMessage}
                </div>
              )}
              
              {formErrors.length > 0 && (
                <div className="mb-6 bg-red-500/20 border border-red-500 text-red-100 p-3 rounded-lg">
                  {formErrors.map((error, index) => (
                    <div key={index} className="text-center">{error}</div>
                  ))}
                </div>
              )}

              {/* Debugging */}
              {!userData && (
                <div className="mb-6 bg-orange-500/20 border border-orange-500 text-orange-100 p-3 rounded-lg text-center">
                  Cargando datos del usuario...
                </div>
              )}

              {userData && (
                <form onSubmit={handleSubmit} className="bg-[#3a3b4a] p-6 rounded-lg shadow-lg space-y-6 border border-white/20 bg-gradient-to-b from-white/5 to-transparent">
                  {/* Grid de información personal - 3 columnas */}
                  <div className="mb-8">
                    <h3 className="text-lg font-medium mb-4 text-blue-300">Información Personal</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Usuario */}
                      <div>
                        <label className="block text-sm font-medium mb-1">Usuario</label>
                        <input 
                          type="text" 
                          value={userData.username}
                          onChange={handleUsernameChange}
                          className="w-full px-4 py-2 bg-[#444653] border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      {/* Correo Electrónico - No modificable */}
                      <div>
                        <label className="block text-sm font-medium mb-1">Correo Electrónico</label>
                        <input 
                          type="email" 
                          value={userData.email}
                          disabled
                          className="w-full px-4 py-2 bg-[#2c2d3a] border border-gray-700 rounded-md cursor-not-allowed"
                        />
                      </div>
                      
                      {/* Nombre(s) */}
                      <div>
                        <label className="block text-sm font-medium mb-1">Nombre(s)</label>
                        <input 
                          type="text" 
                          value={userData.nombre}
                          disabled
                          className="w-full px-4 py-2 bg-[#2c2d3a] border border-gray-700 rounded-md cursor-not-allowed"
                        />
                      </div>
                    
                      {/* Apellido Paterno */}
                      <div>
                        <label className="block text-sm font-medium mb-1">Apellido Paterno</label>
                        <input 
                          type="text" 
                          value={userData.apellidoPaterno}
                          disabled
                          className="w-full px-4 py-2 bg-[#2c2d3a] border border-gray-700 rounded-md cursor-not-allowed"
                        />
                      </div>
                      
                      {/* Apellido Materno */}
                      <div>
                        <label className="block text-sm font-medium mb-1">Apellido Materno</label>
                        <input 
                          type="text" 
                          value={userData.apellidoMaterno}
                          disabled
                          className="w-full px-4 py-2 bg-[#2c2d3a] border border-gray-700 rounded-md cursor-not-allowed"
                        />
                      </div>
                      
                      {/* Fecha de Nacimiento */}
                      <div>
                        <label className="block text-sm font-medium mb-1">Fecha de Nacimiento</label>
                        <input 
                          type="date" 
                          value={formatDate(userData.fechaNacimiento)}
                          disabled
                          className="w-full px-4 py-2 bg-[#2c2d3a] border border-gray-700 rounded-md cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Sección de contraseñas - 2 columnas */}
                  <div>
                    <h3 className="text-lg font-medium mb-4 text-blue-300">Cambiar Contraseña</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Nueva Contraseña */}
                      <div className="relative">
                        <label className="block text-sm font-medium mb-1">Nueva Contraseña</label>
                        <div className="relative">
                          <input 
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Dejar en blanco si no desea cambiarla"
                            className="w-full px-4 py-2 bg-[#444653] border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                          />
                          <button 
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={togglePasswordVisibility}
                          >
                            {showPassword ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                      
                      {/* Confirmar Nueva Contraseña */}
                      <div className="relative">
                        <label className="block text-sm font-medium mb-1">Confirmar Nueva Contraseña</label>
                        <div className="relative">
                          <input 
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Vuelve a ingresar la contraseña"
                            className="w-full px-4 py-2 bg-[#444653] border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                          />
                          <button 
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={toggleConfirmPasswordVisibility}
                          >
                            {showConfirmPassword ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 flex justify-center">
                    <button 
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-10 rounded-md transition-colors shadow-lg"
                    >
                      Guardar Cambios
                    </button>
                  </div>
                </form>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Profile;