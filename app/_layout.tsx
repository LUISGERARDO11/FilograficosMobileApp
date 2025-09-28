// app/_layout.tsx

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import AppLoader from "../components/AppLoader";
import { AuthProvider, useAuth } from "../hooks/useAuth";

// ***** PASO CLAVE: AGREGAR ESTAS IMPORTACIONES *****
import "@react-three/fiber/native";
import "expo-file-system";
// *************************************************

SplashScreen.preventAutoHideAsync();

const STORAGE_KEY = "HAS_VIEWED_ONBOARDING";

const InitialLayout = () => {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  const [isDelayedReady, setIsDelayedReady] = useState(false);
  const [hasViewedOnboarding, setHasViewedOnboarding] = useState<boolean | null>(null);

  // Cargar flag de AsyncStorage
  useEffect(() => {
    const loadFlag = async () => {
      try {
        const value = await AsyncStorage.getItem(STORAGE_KEY);
        // --- INICIO DE CAMBIO ---
        const viewed = value === "true";
        console.log("Onboarding Flag Loaded:", viewed, "Raw value:", value);
        setHasViewedOnboarding(viewed);
      } catch (error) {
        console.error("Error loading onboarding flag:", error);
        setHasViewedOnboarding(false);
      }
    };
    loadFlag();
  }, []);

  // Lógica del delay de 5 segundos
  useEffect(() => {
    if (isDelayedReady || isLoading) return;

    const minimumTimePromise = new Promise(resolve =>
      setTimeout(resolve, 5000)
    );

    minimumTimePromise.then(() => setIsDelayedReady(true));
  }, [isLoading, isDelayedReady]);

  // Redirecciones
  useEffect(() => {
    if (!isDelayedReady || hasViewedOnboarding === null) return;

    SplashScreen.hideAsync();

    const inAuthGroup = segments[0] === "(auth)";

    if (user && inAuthGroup) {
      if (hasViewedOnboarding) {
        console.log("Redirecting: User logged in, Onboarding SKIPPED.");
        router.replace("/");
      } else {
        console.log("Redirecting: User logged in, showing Onboarding.");
        router.replace("/OnboardingScreen");
      }
    } else if (!user && !inAuthGroup) {
        console.log("Redirecting: User logged out, going to login.");
      router.replace("/(auth)/login");
    }
  }, [user, isDelayedReady, segments, hasViewedOnboarding]);

  // Loader mientras carga
  if (isLoading || !isDelayedReady || hasViewedOnboarding === null) {
    return <AppLoader />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <InitialLayout />
    </AuthProvider>
  );
}