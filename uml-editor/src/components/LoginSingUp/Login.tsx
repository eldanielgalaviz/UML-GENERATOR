import { useState, FormEvent, useEffect } from "react";
import "./LoginStyle.css"; 

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
  nombre?: string;
}

interface LoginAccessProps {
  onLoginSuccess?: (user: User) => void;
}

const API_URL = "http://localhost:3005";

const LoginAccess = ({ onLoginSuccess }: LoginAccessProps) => {
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setLoggedInUser(null);
    setShowSuccessMessage("Has cerrado sesión correctamente");
    setTimeout(() => setShowSuccessMessage(""), 3000);
  };

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
      setAction(submitAction);
      setShowSuccessMessage("");
    }
  };

  const eyeOpen = (
    <svg 
      className="eye-icon" 
      xmlns="http://www.w3.org/2000/svg" 
      width="20" 
      height="20" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="#797979" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  );

  const eyeClosed = (
    <svg 
      className="eye-icon" 
      xmlns="http://www.w3.org/2000/svg" 
      width="20" 
      height="20" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="#797979" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
      <line x1="1" y1="1" x2="23" y2="23"></line>
    </svg>
  );

  return (
    <div className="container">
      <div className="header">
        <div className="text">
          {loggedInUser && !onLoginSuccess ? `Bienvenido, ${loggedInUser}` : action}
        </div>
        <div className="underline"></div>
      </div>

      {showSuccessMessage && (
        <div className="error-messages" style={{ background: '#e8f5e9', border: '1px solid #a5d6a7' }}>
          <div className="error-message" style={{ color: '#2e7d32' }}>
            {showSuccessMessage}
          </div>
        </div>
      )}
      
      {formErrors.length > 0 && (
        <div className="error-messages">
          {formErrors.map((error, index) => (
            <div key={index} className="error-message">{error}</div>
          ))}
        </div>
      )}

      {/* Si el usuario está logueado y no hay callback (componente usado independientemente) */}
      {loggedInUser && !onLoginSuccess ? (
        <div className="logged-in-container">
          <p>Has iniciado sesión correctamente. ¿Qué deseas hacer?</p>
          <div className="sumbit-container">
            <div 
              className="submit"
              onClick={handleLogout}
            >
              Cerrar Sesión
            </div>
            <div 
              className="submit"
              onClick={() => {
                // Redirigir a la página principal
                window.location.href = '/dashboard';
              }}
            >
              Ir a la aplicación
            </div>
          </div>
        </div>
      ) : isResettingPassword ? (
        <div className="inputs">
          <div className="input">
            <img src="" alt="" className="usericon" />
            <input
              type="email"
              placeholder="Correo electrónico"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
            />
          </div>
          <div className="sumbit-container">
            <div 
              className="submit"
              onClick={handleForgotPassword}
            >
              Enviar enlace
            </div>
            <div 
              className="submit gray"
              onClick={() => setIsResettingPassword(false)}
            >
              Volver
            </div>
          </div>
        </div>
      ) : (
        <>
          {action === "Iniciar Sesión" ? (
            <>
              <div className="register-form-container">
                <div className="register-form-row">
                  <div className="register-form-column" style={{ maxWidth: "500px", margin: "0 auto" }}>
                    <div className="input">
                      <img src="" alt="" className="usericon" />
                      <input 
                        type="text" 
                        placeholder="Usuario o Correo" 
                        name="username" 
                        id="username" 
                        required
                      />
                    </div>
                    <div className="input">
                      <img src="" alt="" className="passwordicon" />
                      <input 
                        type={showPassword ? "text" : "password"}
                        placeholder="Contraseña" 
                        name="password" 
                        id="password" 
                        pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}"
                        title="Debe contener al menos 6 caracteres, una mayúscula, una minúscula y un número"
                        onFocus={() => setShowPasswordHint(true)}
                        onBlur={() => setShowPasswordHint(false)}
                        required
                      />
                      <div className="password-toggle" onClick={togglePasswordVisibility}>
                        {showPassword ? eyeClosed : eyeOpen}
                      </div>
                      {showPasswordHint && (
                        <div className="password-tooltip">
                          Mínimo 6 caracteres, una mayúscula, una minúscula y un número
                        </div>
                      )}
                    </div>
                    <div className="forgot-password" style={{ textAlign: "right", width: "100%", marginTop: "10px" }}>
                      ¿Olvidaste tu contraseña?{" "}
                      <span onClick={() => setIsResettingPassword(true)}>
                        ¡Click Aquí!
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="register-form-container">
              <div className="register-form-row">
                <div className="register-form-column">
                  <div className="input">
                    <img src="" alt="" className="usericon" />
                    <input 
                      type="text" 
                      placeholder="Usuario" 
                      name="username" 
                      id="username" 
                      required
                    />
                  </div>
                  <div className="input">
                    <img src="" alt="" className="usericon" />
                    <input 
                      type="text" 
                      placeholder="Nombre(s)" 
                      name="nombre" 
                      id="nombre" 
                      required
                    />
                  </div>
                  <div className="input">
                    <img src="" alt="" className="usericon" />
                    <input 
                      type="text" 
                      placeholder="Apellido Paterno" 
                      name="apellidoPaterno" 
                      id="apellidoPaterno" 
                      required
                    />
                  </div>
                  <div className="input">
                    <img src="" alt="" className="usericon" />
                    <input 
                      type="text" 
                      placeholder="Apellido Materno" 
                      name="apellidoMaterno" 
                      id="apellidoMaterno" 
                      required
                    />
                  </div>
                </div>
                <div className="register-form-column">
                <div className="input">
                    <img src="" alt="" className="usericon" />
                    <input 
                      type="email" 
                      placeholder="Correo" 
                      name="email" 
                      id="email" 
                      required
                    />
                  </div>
                  <div className="input">
                    <img src="" alt="" className="usericon" />
                    <input 
                      type="date" 
                      name="fechaNacimiento" 
                      id="fechaNacimiento"
                      required
                    />
                  </div>
                  <div className="input">
                    <img src="" alt="" className="passwordicon" />
                    <input 
                      type={showPassword ? "text" : "password"}
                      placeholder="Contraseña" 
                      name="password" 
                      id="password" 
                      pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}"
                      title="Debe contener al menos 6 caracteres, una mayúscula, una minúscula y un número"
                      onFocus={() => setShowPasswordHint(true)}
                      onBlur={() => setShowPasswordHint(false)}
                      required
                    />
                    <div className="password-toggle" onClick={togglePasswordVisibility}>
                      {showPassword ? eyeClosed : eyeOpen}
                    </div>
                    {showPasswordHint && (
                      <div className="password-tooltip">
                        Mínimo 6 caracteres, una mayúscula, una minúscula y un número
                      </div>
                    )}
                  </div>
                  <div className="input">
                    <img src="" alt="" className="passwordicon" />
                    <input 
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirmar Contraseña" 
                      name="confirmPassword" 
                      id="confirmPassword" 
                      onFocus={() => setShowConfirmPasswordHint(true)}
                      onBlur={() => setShowConfirmPasswordHint(false)}
                      required
                    />
                    <div className="password-toggle" onClick={toggleConfirmPasswordVisibility}>
                      {showConfirmPassword ? eyeClosed : eyeOpen}
                    </div>
                    {showConfirmPasswordHint && (
                      <div className="password-tooltip">
                        Debe ser idéntica a la contraseña ingresada
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="sumbit-container">
            <div 
              className={action === "Iniciar Sesión" ? "submit" : "submit gray"}
              onClick={() => handleSubmit("Iniciar Sesión")}
            >
              Iniciar Sesión
            </div>
            <div 
              className={action === "Registrarse" ? "submit" : "submit gray"}
              onClick={() => handleSubmit("Registrarse")}
            >
              Registrarse
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LoginAccess;