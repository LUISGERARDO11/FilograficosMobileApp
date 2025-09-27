// app/_layout.tsx

import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react'; // 👈 Importamos useState
import AppLoader from '../components/AppLoader';
import { AuthProvider, useAuth } from '../hooks/useAuth';

// ***** PASO CLAVE: AGREGAR ESTAS IMPORTACIONES *****
import '@react-three/fiber/native';
import 'expo-file-system';
// *************************************************

SplashScreen.preventAutoHideAsync();

const InitialLayout = () => {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // 1. Nuevo estado para controlar la transición después de la espera mínima.
  const [isDelayedReady, setIsDelayedReady] = useState(false); 

  useEffect(() => {
    // Si aún está cargando la autenticación, o si la bandera de "listo con retraso" ya está en true, salimos.
    if (isDelayedReady) return;

    if (isLoading) {
      return; // Esperar a que la verificación de Auth (isLoading) termine
    }

    // 2. Ejecutar la lógica de espera mínima de 5 segundos.
    const minimumTimePromise = new Promise(resolve => 
      setTimeout(resolve, 5000) // 👈 Retraso de 5 segundos (5000 ms)
    );

    // 3. Esperar que el tiempo mínimo termine
    minimumTimePromise.then(() => {
        setIsDelayedReady(true); // Marcar como listo DESPUÉS del retraso
    });

  }, [isLoading, isDelayedReady]); // Depende de isLoading y su propio estado de retraso

  // 4. Efecto de Redirección (Se ejecuta DESPUÉS de que isDelayedReady cambia a true)
  useEffect(() => {
      // Solo procede a redirigir una vez que la pantalla de carga ha sido vista por el tiempo deseado.
      if (!isDelayedReady) {
          return;
      }

      // Una vez que el tiempo mínimo y la carga han terminado, ocultamos el Splash nativo.
      SplashScreen.hideAsync();

      const inAuthGroup = segments[0] === '(auth)';

      if (user && inAuthGroup) {
          router.replace('/');
      } else if (!user && !inAuthGroup) {
          router.replace('/(auth)/login');
      }
      
  }, [user, isDelayedReady, segments]);


  // 5. Muestra la pantalla de carga si aún no está listo el retraso O la autenticación.
  if (isLoading || !isDelayedReady) {
    return <AppLoader />;
  }

  // 6. Renderiza la navegación solo cuando isDelayedReady es true.
  return <Stack screenOptions={{ headerShown: false }} />;
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <InitialLayout />
    </AuthProvider>
  );
}