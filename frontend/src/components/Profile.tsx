import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface User {
  id: number;
  email: string;
  createdAt: string;
}

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data);
      } catch (err) {
        logout();
        navigate('/login');
      }
    };

    fetchProfile();
  }, [token, logout, navigate]);

  if (!user) return <div>Cargando...</div>;

  return (
    <div className="max-w-md mx-auto mt-10 p-6">
      <h2 className="text-2xl font-bold mb-6">Perfil</h2>
      <div className="mb-4">
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Creado:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
      </div>
      <button
        onClick={logout}
        className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600"
      >
        Cerrar Sesión
      </button>
    </div>
  );
};

export default Profile;