// hooks/useAuth.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import api from '../services/api';

interface User {
  id: string;
  name: string;
  tipo: string;
  email: string; // <--- Añadido el email
  profile_picture_url: string | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
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

  // Nueva función para obtener y establecer los datos del usuario
  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/api/users/profile');
      const userData = response.data;
      setUser({
        id: userData.user_id,
        name: userData.name,
        tipo: userData.user_type,
        email: userData.email, // <--- El email se obtiene de aquí
        profile_picture_url: userData.profile_picture_url || null,
      });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      // Si falla la obtención del perfil, asume que la sesión no es válida
      await AsyncStorage.removeItem('userToken');
      setUser(null);
      // Limpiar el token de axios también
      delete api.defaults.headers.common['Authorization'];
      throw error;
    }
  };

  const checkUserSession = async (token: string) => {
    try {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      await fetchUserProfile(); // <--- Usamos la nueva función aquí
    } catch (error) {
      console.error("Session check failed:", error);
      await AsyncStorage.removeItem('userToken');
      setUser(null);
      delete api.defaults.headers.common['Authorization'];
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const csrfResponse = await api.get('/api/csrf-token');
      const csrfToken = csrfResponse.data.csrfToken;

      const response = await api.post('/api/auth/login', {
        email,
        password,
      }, {
        headers: {
          'x-csrf-token': csrfToken,
        }
      });

      const token = response.headers.authorization?.split(' ')[1];

      if (!token) {
        throw new Error("No se recibió un token de autenticación en la respuesta del servidor.");
      }

      await AsyncStorage.setItem('userToken', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Después de iniciar sesión, obtenemos el perfil completo
      await fetchUserProfile();

    } catch (error: any) {
      console.error("Sign-in failed:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Error en el inicio de sesión');
    }
  };

  const signOut = async () => {
    try {
      const csrfResponse = await api.get('/api/csrf-token');
      const csrfToken = csrfResponse.data.csrfToken;

      await api.post('/api/auth/logout', {}, {
        headers: {
          'x-csrf-token': csrfToken,
        }
      });

      // *** CLAVE: SOLO ELIMINAMOS EL TOKEN. NO ELIMINAMOS "HAS_VIEWED_ONBOARDING" ***
      // Si en otra parte del código usas AsyncStorage.clear(), esto borraría el flag de onboarding.
      await AsyncStorage.removeItem('userToken');
      setUser(null);
      delete api.defaults.headers.common['Authorization'];
    } catch (error) {
      console.error("Sign-out failed:", error);
      await AsyncStorage.removeItem('userToken');
      setUser(null);
    }
  };

  useEffect(() => {
    const loadStoredUser = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('userToken');
        if (storedToken) {
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

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};