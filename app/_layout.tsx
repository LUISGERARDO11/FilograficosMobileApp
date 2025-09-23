import { Stack, useRouter, useSegments } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from '../hooks/useAuth';

const InitialLayout = () => {
  const { user } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  // Usamos un estado para saber cuándo el Stack está montado
  useEffect(() => {
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (user && inAuthGroup) {
      // Si hay un usuario y está en el grupo de autenticación, redirige a la página principal.
      router.replace('/');
    } else if (!user && !inAuthGroup) {
      // Si no hay un usuario y no está en el grupo de autenticación, redirige al login.
      router.replace('/(auth)/login');
    }
  }, [user, segments, isReady]);

  return <Stack screenOptions={{ headerShown: false }} />;
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <InitialLayout />
    </AuthProvider>
  );
}