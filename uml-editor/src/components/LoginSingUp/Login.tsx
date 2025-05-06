import React, { useState, FormEvent, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import "./LoginStyle.css"; 

// Definir tipos...
interface FormInput extends HTMLInputElement {
  id: string;
  value: string;
}

interface FormData {
  [key: string]: string | Date;
}

interface User {
  id: number;
  username: string;
  email: string;
  nombre: string;  
  apellidoPaterno: string; 
  apellidoMaterno: string; 
  fechaNacimiento: string;
}

interface LoginAccessProps {
  onLoginSuccess?: (user: User) => void;
}

const API_URL = "http://localhost:3005";

const LoginAccess = ({ onLoginSuccess }: LoginAccessProps) => {
  // Estados del componente...
  const [action, setAction] = useState<"Iniciar Sesión" | "Registrarse">("Iniciar Sesión");
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPasswordHint, setShowPasswordHint] = useState(false);
  const [showConfirmPasswordHint, setShowConfirmPasswordHint] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState("");
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null);
  // Añadimos un nuevo estado para controlar la animación
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Funciones del componente...
  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  // Comprobar si hay un usuario ya logueado al cargar el componente
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        setLoggedInUser(parsedUser.nombre || parsedUser.username);
        
        // Si tenemos una función de callback y un usuario, notificar al componente App
        if (onLoginSuccess) {
          onLoginSuccess(parsedUser);
        }
      } catch (error) {
        console.error("Error parsing user from localStorage", error);
      }
    }
  }, [onLoginSuccess]);

  // Función para manejar el olvido de contraseña
  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: resetEmail }),
      });

      if (response.ok) {
        setShowSuccessMessage("Se ha enviado un enlace de recuperación a tu correo");
        setIsResettingPassword(false);
        setResetEmail("");
      } else {
        const data = await response.json();
        setFormErrors([data.message || "Error al procesar la solicitud"]);
      }
    } catch (error) {
      setFormErrors(["Error al procesar la solicitud"]);
    }
  };

  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setLoggedInUser(null);
    setShowSuccessMessage("Has cerrado sesión correctamente");
    setTimeout(() => setShowSuccessMessage(""), 3000);
  };

  // Función modificada para cambiar entre formularios con transición
  const handleFormSwitch = (newAction: "Iniciar Sesión" | "Registrarse") => {
    if (action !== newAction) {
      setIsTransitioning(true);
      
      // Esperamos a que la animación de salida termine antes de cambiar el estado
      setTimeout(() => {
        setAction(newAction);
        // Cuando cambiamos el estado, la animación de entrada comenzará
        setTimeout(() => {
          setIsTransitioning(false);
        }, 50);
      }, 300); // Este tiempo debe coincidir con la duración de la animación en CSS
    } else {
      // Si es la misma acción, realizamos el submit
      handleSubmit(newAction);
    }
  };

  // Función para manejar el envío de formularios
  const handleSubmit = async (submitAction: "Iniciar Sesión" | "Registrarse") => {
    if (submitAction === action) {
      try {
        // Validar campos antes de enviar
        if (action === "Registrarse") {
          const password = document.getElementById('password') as HTMLInputElement;
          const confirmPassword = document.getElementById('confirmPassword') as HTMLInputElement;
          
          if (!password?.value || !confirmPassword?.value) {
            setFormErrors(["Debes completar todos los campos obligatorios"]);
            return;
          }
          
          if (password.value !== confirmPassword.value) {
            setFormErrors(["Las contraseñas no coinciden"]);
            return;
          }
          
          // Validar requisitos de contraseña
          const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/;
          if (!passwordRegex.test(password.value)) {
            setFormErrors(["La contraseña debe tener al menos 6 caracteres, una mayúscula, una minúscula y un número"]);
            return;
          }
        }

        // Recopilar datos del formulario
        const formObject: FormData = {};
        const inputs = document.querySelectorAll<FormInput>('input');
        
        inputs.forEach(input => {
          if (input.id && input.value) {
            // Para fechaNacimiento, convertir a Date si es necesario
            if (input.id === 'fechaNacimiento' && input.value) {
              formObject[input.id] = new Date(input.value);
            } else {
              formObject[input.id] = input.value;
            }
          }
        });

        console.log('Datos a enviar:', formObject);
        
        const endpoint = action === "Iniciar Sesión" 
          ? `${API_URL}/auth/login` 
          : `${API_URL}/auth/register`;
        
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formObject)
        });
        
        // Intentar procesar la respuesta
        let data;
        const responseText = await response.text();
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          console.error('Error al parsear la respuesta:', responseText);
          data = { message: 'Error en el formato de respuesta del servidor' };
        }
        
        if (response.ok) {
          setShowSuccessMessage(
            data.message || 
            (action === "Iniciar Sesión" 
              ? "¡Bienvenido! Has iniciado sesión correctamente" 
              : "Registro exitoso. Por favor verifica tu correo electrónico")
          );
          setFormErrors([]);
          
          if (action === "Iniciar Sesión" && data.access_token) {
            localStorage.setItem('token', data.access_token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setLoggedInUser(data.user.nombre || data.user.username);
            console.log(`El usuario ${data.user.username} pudo acceder correctamente`);
            
            // Llamar al callback para informar al componente padre
            if (onLoginSuccess) {
              onLoginSuccess(data.user);
            }
          }
        } else {
          console.error('Error del servidor:', data);
          setFormErrors([data.message || 'Error al procesar la solicitud']);
        }
      } catch (error) {
        console.error('Error completo:', error);
        setFormErrors(["Error de conexión"]);
      }
    } else {
      setFormErrors([]);
      handleFormSwitch(submitAction);
      setShowSuccessMessage("");
    }
  };

  return (
    <div className="login-container">
      {/* Fondo con elementos geométricos */}
      <div className="login-background">
        <div className="geometric-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
          <div className="shape shape-5"></div>
        </div>
      </div>

      {/* Contenedor principal */}
      <div className="login-form-container">
        <div className="login-form-header">
          <h1>{loggedInUser && !onLoginSuccess ? `Bienvenido, ${loggedInUser}` : action}</h1>
          <div className="header-underline"></div>
        </div>

        {/* Mensajes de éxito o error */}
        {showSuccessMessage && (
          <div className="success-message">
            {showSuccessMessage}
          </div>
        )}
        
        {formErrors.length > 0 && (
          <div className="error-container">
            {formErrors.map((error, index) => (
              <div key={index} className="error-message">{error}</div>
            ))}
          </div>
        )}

        {/* Contenido condicional basado en el estado del usuario */}
        {loggedInUser && !onLoginSuccess ? (
          <div className="logged-in-options">
            <p>Has iniciado sesión correctamente. ¿Qué deseas hacer?</p>
            <div className="action-buttons">
              <button 
                className="action-button logout"
                onClick={handleLogout}
              >
                Cerrar Sesión
              </button>
              <button 
                className="action-button go-app"
                onClick={() => window.location.href = '/dashboard'}
              >
                Ir a la aplicación
              </button>
            </div>
          </div>
        ) : isResettingPassword ? (
          <div className="password-reset-form">
            <div className="input-group">
              <label>Correo electrónico</label>
              <div className="input-wrapper">
                <input
                  type="email"
                  placeholder="Ingresa tu correo electrónico"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="action-buttons">
              <button 
                className="action-button send"
                onClick={handleForgotPassword}
              >
                Enviar enlace
              </button>
              <button 
                className="action-button cancel"
                onClick={() => setIsResettingPassword(false)}
              >
                Volver
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Formularios con clases de transición */}
            <div className={`form-container ${isTransitioning ? 'fade-out' : 'fade-in'}`}>
              {action === "Iniciar Sesión" ? (
                <form className="login-form">
                  <div className="input-group">
                    <label>Usuario</label>
                    <div className="input-wrapper">
                      <input
                        type="text"
                        placeholder="Ingresa tu usuario o correo"
                        id="username"
                        required
                      />
                    </div>
                  </div>
                  <div className="input-group">
                    <label>Contraseña</label>
                    <div className="input-wrapper password">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Ingresa tu contraseña"
                        id="password"
                        required
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={togglePasswordVisibility}
                      >
                        {showPassword ? <EyeOff className="icon" /> : <Eye className="icon" />}
                      </button>
                    </div>
                  </div>
                  <div className="forgot-password">
                    <span onClick={() => setIsResettingPassword(true)}>
                      ¿Olvidaste tu contraseña?
                    </span>
                  </div>
                </form>
              ) : (
                /* Formulario de registro */
                <form className="register-form">
                  <div className="register-columns">
                    <div className="register-column">
                      <div className="input-group">
                        <label>Usuario</label>
                        <div className="input-wrapper">
                          <input
                            type="text"
                            placeholder="Nombre de usuario"
                            id="username"
                            required
                          />
                        </div>
                      </div>
                      <div className="input-group">
                        <label>Nombre(s)</label>
                        <div className="input-wrapper">
                          <input
                            type="text"
                            placeholder="Tu nombre"
                            id="nombre"
                            required
                          />
                        </div>
                      </div>
                      <div className="input-group">
                        <label>Apellido Paterno</label>
                        <div className="input-wrapper">
                          <input
                            type="text"
                            placeholder="Tu apellido paterno"
                            id="apellidoPaterno"
                            required
                          />
                        </div>
                      </div>
                    </div>
                    <div className="register-column">
                      <div className="input-group">
                        <label>Correo</label>
                        <div className="input-wrapper">
                          <input
                            type="email"
                            placeholder="Tu correo electrónico"
                            id="email"
                            required
                          />
                        </div>
                      </div>
                      <div className="input-group">
                        <label>Apellido Materno</label>
                        <div className="input-wrapper">
                          <input
                            type="text"
                            placeholder="Tu apellido materno"
                            id="apellidoMaterno"
                            required
                          />
                        </div>
                      </div>
                      <div className="input-group">
                        <label>Fecha de Nacimiento</label>
                        <div className="input-wrapper">
                          <input
                            type="date"
                            id="fechaNacimiento"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                
                  <div className="register-columns">
                    <div className="register-column">
                      <div className="input-group">
                        <label>Contraseña</label>
                        <div className="input-wrapper password">
                          <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Crea una contraseña"
                            id="password"
                            required
                            pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d]{6,}"
                            onFocus={() => setShowPasswordHint(true)}
                            onBlur={() => setShowPasswordHint(false)}
                          />
                          <button
                            type="button"
                            className="password-toggle"
                            onClick={togglePasswordVisibility}
                          >
                            {showPassword ? <EyeOff className="icon" /> : <Eye className="icon" />}
                          </button>
                        </div>
                        {showPasswordHint && (
                          <div className="password-hint">
                            Mínimo 6 caracteres, una mayúscula, una minúscula y un número
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="register-column">
                      <div className="input-group">
                        <label>Confirmar Contraseña</label>
                        <div className="input-wrapper password">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirma tu contraseña"
                            id="confirmPassword"
                            required
                            onFocus={() => setShowConfirmPasswordHint(true)}
                            onBlur={() => setShowConfirmPasswordHint(false)}
                          />
                          <button
                            type="button"
                            className="password-toggle"
                            onClick={toggleConfirmPasswordVisibility}
                          >
                            {showConfirmPassword ? <EyeOff className="icon" /> : <Eye className="icon" />}
                          </button>
                        </div>
                        {showConfirmPasswordHint && (
                          <div className="password-hint">
                            Debe ser idéntica a la contraseña ingresada
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </form>
              )}
            </div>

            {/* Botones de acción */}
            <div className="form-actions">
              <button
                className={`form-button ${action === "Iniciar Sesión" ? "active" : ""}`}
                onClick={() => {
                  if (action !== "Iniciar Sesión") {
                    handleFormSwitch("Iniciar Sesión");
                  } else {
                    // Lógica para iniciar sesión
                    handleSubmit("Iniciar Sesión");
                  }
                }}
              >
                Iniciar Sesión
              </button>
              <button
                className={`form-button ${action === "Registrarse" ? "active" : ""}`}
                onClick={() => {
                  if (action !== "Registrarse") {
                    handleFormSwitch("Registrarse");
                  } else {
                    // Lógica para registrarse
                    handleSubmit("Registrarse");
                  }
                }}
              >
                Registrarse
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginAccess;