import { useState, FormEvent, useEffect } from "react";
import "./LoginStyle.css"; 

interface UserProfile {
  username: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  email: string;
  fechaNacimiento: string;
  profileImage: string | null;
}

const API_URL = "http://localhost:3005";

const Profile = () => {
  const [userProfile, setUserProfile] = useState<UserProfile>({
    username: "",
    nombre: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    email: "",
    fechaNacimiento: "",
    profileImage: null
  });
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPasswordHint, setShowPasswordHint] = useState(false);
  const [showConfirmPasswordHint, setShowConfirmPasswordHint] = useState(false);
  
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUserProfile(prevProfile => ({
          ...prevProfile,
          ...userData
        }));
      } catch (error) {
        console.error("Error al cargar datos del usuario:", error);
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setUserProfile(prevProfile => ({
      ...prevProfile,
      [id]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      setUserProfile(prevProfile => ({
        ...prevProfile,
        profileImage: file.name 
      }));
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormErrors([]);
    
    // Validaciones básicas
    const errors: string[] = [];
    if (!userProfile.nombre) errors.push("El nombre es obligatorio");
    if (!userProfile.apellidoPaterno) errors.push("El apellido paterno es obligatorio");
    if (!userProfile.email) errors.push("El correo electrónico es obligatorio");
    
    // Validación de contraseña si se está intentando cambiar
    if (password || confirmPassword) {
      if (password !== confirmPassword) {
        errors.push("Las contraseñas no coinciden");
      } else if (password.length > 0 && password.length < 6) {
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
      setTimeout(() => {
        // Actualizamos localStorage para simular persistencia
        localStorage.setItem('user', JSON.stringify(userProfile));
        
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
      }, 500);

    } catch (error) {
      setFormErrors(["Error al actualizar el perfil"]);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <div className="text">Editar Perfil</div>
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

      <form onSubmit={handleSubmit}>
        <div className="register-form-container">
          {/* Sección de imagen de perfil */}
          <div className="profile-image-container">
            <div className="profile-image">
              {imagePreview ? (
                <img 
                  src={imagePreview} 
                  alt="Vista previa de perfil" 
                  className="profile-preview" 
                />
              ) : (
                <div className="profile-placeholder">
                  {userProfile.nombre && userProfile.apellidoPaterno ? (
                    `${userProfile.nombre.charAt(0)}${userProfile.apellidoPaterno.charAt(0)}`
                  ) : (
                    "U"
                  )}
                </div>
              )}
            </div>
            <div className="profile-image-upload">
              <label htmlFor="profileImage" className="upload-button">
                Cambiar foto
              </label>
              <input 
                type="file" 
                id="profileImage" 
                accept="image/*" 
                style={{ display: 'none' }} 
                onChange={handleImageChange}
              />
            </div>
          </div>

          <div className="register-form-row">
            <div className="register-form-column">
              <div className="input">
                <img src="" alt="" className="usericon" />
                <input 
                  type="text" 
                  placeholder="Usuario" 
                  id="username" 
                  value={userProfile.username}
                  onChange={handleChange}
                />
              </div>
              <div className="input">
                <img src="" alt="" className="usericon" />
                <input 
                  type="text" 
                  placeholder="Nombre(s)" 
                  id="nombre" 
                  value={userProfile.nombre}
                  onChange={handleChange}
                  disabled 
                />
              </div>
              <div className="input">
                <img src="" alt="" className="usericon" />
                <input 
                  type="text" 
                  placeholder="Apellido Paterno" 
                  id="apellidoPaterno" 
                  value={userProfile.apellidoPaterno}
                  onChange={handleChange}
                  disabled 
                />
              </div>
              <div className="input">
                <img src="" alt="" className="usericon" />
                <input 
                  type="text" 
                  placeholder="Apellido Materno" 
                  id="apellidoMaterno" 
                  value={userProfile.apellidoMaterno}
                  onChange={handleChange}
                  disabled 
                />
              </div>
            </div>
            <div className="register-form-column">
              <div className="input">
                <img src="" alt="" className="usericon" />
                <input 
                  type="email" 
                  placeholder="Correo" 
                  id="email" 
                  value={userProfile.email}
                  onChange={handleChange}
                />
              </div>
              <div className="input">
                <img src="" alt="" className="usericon" />
                <input 
                  type="date" 
                  id="fechaNacimiento"
                  value={userProfile.fechaNacimiento}
                  onChange={handleChange}
                  disabled 
                />
              </div>
              <div className="input">
                <img src="" alt="" className="passwordicon" />
                <input 
                  type={showPassword ? "text" : "password"}
                  placeholder="Nueva Contraseña" 
                  id="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  pattern="(?=.*[A-Z])(?=.*[0-9]).{6,}"
                  title="Debe contener al menos 6 caracteres, una mayúscula y un número"
                  onFocus={() => setShowPasswordHint(true)}
                  onBlur={() => setShowPasswordHint(false)}
                />
                <div className="password-toggle" onClick={togglePasswordVisibility}>
                  {showPassword ? (
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
                  ) : (
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
                  )}
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
                  placeholder="Confirmar Nueva Contraseña" 
                  id="confirmPassword" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  pattern="(?=.*[A-Z])(?=.*[0-9]).{6,}"
                  title="Debe contener al menos 6 caracteres, una mayúscula y un número"
                  onFocus={() => setShowConfirmPasswordHint(true)}
                  onBlur={() => setShowConfirmPasswordHint(false)}
                />
                <div className="password-toggle" onClick={toggleConfirmPasswordVisibility}>
                  {showConfirmPassword ? (
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
                  ) : (
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
                  )}
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

        <div className="sumbit-container">
          <button 
            type="submit"
            className="submit"
          >
            Guardar Cambios
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;