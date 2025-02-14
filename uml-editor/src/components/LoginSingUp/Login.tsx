import { useState, ChangeEvent, FormEvent } from "react";
import "./LoginStyle.css";

const LoginAccess = () => {
  const [action, setAction] = useState("Iniciar Sesión");
  const [formErrors, setFormErrors] = useState<string[]>([]);

  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    const age = calculateAge(e.target.value);
    const ageInput = document.getElementById('age') as HTMLInputElement;
    if (ageInput) {
      ageInput.value = age.toString();
    }
  };

  const validateForm = (): boolean => {
    const errors: string[] = [];
    
    if (action === "Iniciar Sesión") {
      const username = (document.getElementById('username') as HTMLInputElement).value;
      const password = (document.getElementById('password') as HTMLInputElement).value;
      
      if (!username) errors.push("Usuario es requerido");
      if (!password) errors.push("Contraseña es requerida");
    } else {
      const username = (document.getElementById('username') as HTMLInputElement).value;
      const name = (document.getElementById('name') as HTMLInputElement).value;
      const paternalSurname = (document.getElementById('paternal_surname') as HTMLInputElement).value;
      const maternalSurname = (document.getElementById('maternal_surname') as HTMLInputElement).value;
      const email = (document.getElementById('email') as HTMLInputElement).value;
      const birthDate = (document.getElementById('birth_date') as HTMLInputElement).value;
      const password = (document.getElementById('password') as HTMLInputElement).value;
      const confirmPassword = (document.getElementById('confirm_password') as HTMLInputElement).value;
      
      if (!username) errors.push("Usuario es requerido");
      if (!name) errors.push("Nombre es requerido");
      if (!paternalSurname) errors.push("Apellido Paterno es requerido");
      if (!maternalSurname) errors.push("Apellido Materno es requerido");
      if (!email) errors.push("Correo es requerido");
      if (!birthDate) errors.push("Fecha de nacimiento es requerida");
      if (!password) errors.push("Contraseña es requerida");
      if (!confirmPassword) errors.push("Confirmar contraseña es requerido");
      
      if (password !== confirmPassword) {
        errors.push("Las contraseñas no coinciden");
      }
    }

    setFormErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (submitAction: string) => {
    if (submitAction === action && validateForm()) {
      try {
        const formData = new FormData();
        const inputs = document.querySelectorAll('input');
        inputs.forEach(input => {
          if (input.id && input.value) {
            formData.append(input.id, input.value);
          }
        });

        const endpoint = action === "Iniciar Sesión" ? "/api/login" : "/api/register";
        const response = await fetch(endpoint, {
          method: "POST",
          body: formData
        });
        
        if (response.ok) {
          console.log("Datos enviados exitosamente");
        } else {
          setFormErrors(["Error al procesar la solicitud"]);
        }
      } catch (error) {
        setFormErrors(["Error de conexión"]);
      }
    } else {
      setFormErrors([]);
      setAction(submitAction);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <div className="text">{action}</div>
        <div className="underline"></div>
      </div>
      
      {formErrors.length > 0 && (
        <div className="error-messages">
          {formErrors.map((error, index) => (
            <div key={index} className="error-message">{error}</div>
          ))}
        </div>
      )}
      
      <div className="inputs">
        {action === "Iniciar Sesión" ? (
          <>
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
                type="password" 
                placeholder="Contraseña" 
                name="password" 
                id="password" 
              />
            </div>
          </>
        ) : (
          <>
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
                name="name" 
                id="name" 
              />
            </div>
            <div className="input">
              <img src="" alt="" className="usericon" />
              <input 
                type="text" 
                placeholder="Apellido Paterno" 
                name="paternal_surname" 
                id="paternal_surname" 
              />
            </div>
            <div className="input">
              <img src="" alt="" className="usericon" />
              <input 
                type="text" 
                placeholder="Apellido Materno" 
                name="maternal_surname" 
                id="maternal_surname" 
              />
            </div>
            <div className="input">
              <img src="" alt="" className="usericon" />
              <input 
                type="email" 
                placeholder="Correo" 
                name="email" 
                id="email" 
              />
            </div>
            <div className="input date-input">
              <img src="" alt="" className="usericon" />
              <div className="date-container">
                <input 
                  type="date" 
                  name="birth_date" 
                  id="birth_date"
                  onChange={handleDateChange}
                />
                <input 
                  type="text" 
                  id="age" 
                  readOnly 
                  placeholder="Edad"
                />
              </div>
            </div>
            <div className="input">
              <img src="" alt="" className="passwordicon" />
              <input 
                type="password" 
                placeholder="Contraseña" 
                name="password" 
                id="password" 
              />
            </div>
            <div className="input">
              <img src="" alt="" className="passwordicon" />
              <input 
                type="password" 
                placeholder="Confirmar Contraseña" 
                name="confirm_password" 
                id="confirm_password" 
              />
            </div>
          </>
        )}
      </div>
      
      {action === "Iniciar Sesión" && (
        <div className="forgot-password">
          Olvidaste tu contraseña? <span>Click Aqui!</span>
        </div>
      )}
      
      <div className="sumbit-container">
        <div 
          className={action === "Iniciar Sesión" ? "submit gray" : "submit"}
          onClick={() => handleSubmit("Iniciar Sesión")}
        >
          Iniciar Sesión
        </div>
        <div 
          className={action === "Registrarse" ? "submit gray" : "submit"}
          onClick={() => handleSubmit("Registrarse")}
        >
          Registrarse
        </div>
      </div>
    </div>
  );
};

export default LoginAccess