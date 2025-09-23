import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import api from '../services/api';

interface User {
  id: string;
  name: string;
  tipo: string;
  profile_picture_url: string | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>; // <--- Mantenemos el tipo void aquí
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  signIn: async () => {},
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Cargar el token al iniciar la aplicación
    const loadStoredUser = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('userToken');
        if (storedToken) {
          // Si hay un token, verifica la sesión con el backend
          await checkUserSession(storedToken);
        }
      } catch (error) {
        console.error("Failed to load user token:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredUser();
  }, []);

  const checkUserSession = async (token: string) => {
    try {
      // Configura el token en los headers de axios
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Llama a una ruta protegida para verificar la sesión y obtener los datos del usuario.
      // Tu backend parece tener una ruta protegida como `api/users/profile`.
      // Si no la tienes, crea una que retorne los datos del usuario.
      const response = await api.get('/api/users/profile'); // Ajusta esta ruta si es necesario
      const userData = response.data;
      setUser({
        id: userData.user_id,
        name: userData.name,
        tipo: userData.user_type,
        profile_picture_url: userData.profile_picture_url || null,
      });
    } catch (error) {
      console.error("Session check failed:", error);
      await AsyncStorage.removeItem('userToken');
      setUser(null);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
        // 1. Obtener el token CSRF del backend
      const csrfResponse = await api.get('/api/csrf-token');
      const csrfToken = csrfResponse.data.csrfToken;

      // 2. Enviar el token CSRF en los headers de la petición de login
      const response = await api.post('/api/auth/login', {
        email,
        password,
      }, {
        headers: {
          'x-csrf-token': csrfToken,
        }
      });

      const { userId, name, tipo, profile_picture_url } = response.data;

      const token = response.headers.authorization?.split(' ')[1]; // Acceso seguro

      if (!token) {
        throw new Error("No se recibió un token de autenticación en la respuesta del servidor.");
      }

      await AsyncStorage.setItem('userToken', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setUser({
        id: userId,
        name,
        tipo,
        profile_picture_url: profile_picture_url || null,
      });

    } catch (error: any) {
      console.error("Sign-in failed:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Error en el inicio de sesión');
    }
  };


const signOut = async () => {
  try {
    // 1. Obtener el token CSRF del backend
    const csrfResponse = await api.get('/api/csrf-token');
    const csrfToken = csrfResponse.data.csrfToken;

    // 2. Realizar la petición de logout con el token CSRF en los headers
    await api.post('/api/auth/logout', {}, {
      headers: {
        'x-csrf-token': csrfToken,
      }
    });

    // 3. Limpiar el token de AsyncStorage y el estado del usuario
    await AsyncStorage.removeItem('userToken');
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
  } catch (error) {
    console.error("Sign-out failed:", error);
    // Aunque falle la petición al backend, borrar el token local para evitar problemas
    await AsyncStorage.removeItem('userToken');
    setUser(null);
  }
};


  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};