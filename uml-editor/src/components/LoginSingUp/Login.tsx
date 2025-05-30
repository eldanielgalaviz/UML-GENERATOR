import { useState, FormEvent } from "react";
import "./LoginStyle.css"; 

interface FormInput extends HTMLInputElement {
  id: string;
  value: string;
}

interface FormData {
  [key: string]: string;
}

const API_URL = "https://uml-generator-backend.onrender.com";

const LoginAccess = () => {
  const [action, setAction] = useState<"Iniciar Sesión" | "Registrarse">("Iniciar Sesión");
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPasswordHint, setShowPasswordHint] = useState(false);
  const [showConfirmPasswordHint, setShowConfirmPasswordHint] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState("");
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

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
        setFormErrors([data.message]);
      }
    } catch (error) {
      setFormErrors(["Error al procesar la solicitud"]);
    }
  };

  const handleSubmit = async (submitAction: "Iniciar Sesión" | "Registrarse") => {
    if (submitAction === action) {
      try {
        const formObject: FormData = {};
        const inputs = document.querySelectorAll<FormInput>('input');
        
        inputs.forEach(input => {
          if (input.id && input.value) {
            formObject[input.id] = input.value;
          }
        });

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
        
        const data = await response.json();
        
        if (response.ok) {
          setShowSuccessMessage(
            action === "Iniciar Sesión" 
              ? "Inicio de sesión exitoso" 
              : "Registro exitoso. Por favor verifica tu correo electrónico"
          );
          setFormErrors([]);
          
          if (action === "Iniciar Sesión" && data.access_token) {
            localStorage.setItem('token', data.access_token);
            localStorage.setItem('user', JSON.stringify(data.user));
          }
        } else {
          setFormErrors([data.message || "Error al procesar la solicitud"]);
        }
      } catch (error) {
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
        <div className="text">{action}</div>
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

      {isResettingPassword ? (
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
                      />
                    </div>
                    <div className="input">
                      <img src="" alt="" className="passwordicon" />
                      <input 
                        type={showPassword ? "text" : "password"}
                        placeholder="Contraseña" 
                        name="password" 
                        id="password" 
                        pattern="(?=.*[A-Z])(?=.*[0-9]).{6,}"
                        title="Debe contener al menos 6 caracteres, una mayúscula y un número"
                        onFocus={() => setShowPasswordHint(true)}
                        onBlur={() => setShowPasswordHint(false)}
                      />
                      <div className="password-toggle" onClick={togglePasswordVisibility}>
                        {showPassword ? eyeClosed : eyeOpen}
                      </div>
                      {showPasswordHint && (
                        <div className="password-tooltip">
                          Mínimo 6 caracteres, una mayúscula y un número
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
                    />
                  </div>
                  <div className="input">
                    <img src="" alt="" className="usericon" />
                    <input 
                      type="text" 
                      placeholder="Nombre(s)" 
                      name="nombre" 
                      id="nombre" 
                    />
                  </div>
                  <div className="input">
                    <img src="" alt="" className="usericon" />
                    <input 
                      type="text" 
                      placeholder="Apellido Paterno" 
                      name="apellidoPaterno" 
                      id="apellidoPaterno" 
                    />
                  </div>
                  <div className="input">
                    <img src="" alt="" className="usericon" />
                    <input 
                      type="text" 
                      placeholder="Apellido Materno" 
                      name="apellidoMaterno" 
                      id="apellidoMaterno" 
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
                    />
                  </div>
                  <div className="input">
                    <img src="" alt="" className="usericon" />
                    <input 
                      type="date" 
                      name="fechaNacimiento" 
                      id="fechaNacimiento"
                    />
                  </div>
                  <div className="input">
                    <img src="" alt="" className="passwordicon" />
                    <input 
                      type={showPassword ? "text" : "password"}
                      placeholder="Contraseña" 
                      name="password" 
                      id="password" 
                      pattern="(?=.*[A-Z])(?=.*[0-9]).{6,}"
                      title="Debe contener al menos 6 caracteres, una mayúscula y un número"
                      onFocus={() => setShowPasswordHint(true)}
                      onBlur={() => setShowPasswordHint(false)}
                    />
                    <div className="password-toggle" onClick={togglePasswordVisibility}>
                      {showPassword ? eyeClosed : eyeOpen}
                    </div>
                    {showPasswordHint && (
                      <div className="password-tooltip">
                        Mínimo 6 caracteres, una mayúscula y un número
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
                      pattern="(?=.*[A-Z])(?=.*[0-9]).{6,}"
                      title="Debe contener al menos 6 caracteres, una mayúscula y un número"
                      onFocus={() => setShowConfirmPasswordHint(true)}
                      onBlur={() => setShowConfirmPasswordHint(false)}
                    />
                    <div className="password-toggle" onClick={toggleConfirmPasswordVisibility}>
                      {showConfirmPassword ? eyeClosed : eyeOpen}
                    </div>
                    {showConfirmPasswordHint && (
                      <div className="password-tooltip">
                        Mínimo 6 caracteres, una mayúscula y un número
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
