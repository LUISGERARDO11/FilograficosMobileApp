import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Easing,
    StyleSheet,
    Text,
    View,
} from "react-native";
const COMPANY_NAME = "Filográficos";
const TAGLINE = "Personaliza • Visualiza • Comparte";

const loadingMessages = [
  "Preparando tu experiencia...",
  "Cargando productos personalizables...",
  "Configurando vista 3D...",
  "¡Casi listo!",
];

const AppLoader = () => {
  const screenWidth = Dimensions.get("window").width;

  const [messageIndex, setMessageIndex] = useState(0);
  const [letterIndex, setLetterIndex] = useState(0);
  const [nameTypingComplete, setNameTypingComplete] = useState(false);

  // Animaciones
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const morphAnim1 = useRef(new Animated.Value(0)).current;
  const morphAnim2 = useRef(new Animated.Value(0)).current;
  const morphAnim3 = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Partículas (animaciones independientes)
  const particleAnims = Array.from({ length: 12 }, () =>
    useRef(new Animated.Value(0)).current
  );

  useEffect(() => {
    // Efecto máquina de escribir
    const letterInterval = setInterval(() => {
      setLetterIndex((prev) => {
        if (prev >= COMPANY_NAME.length) {
          clearInterval(letterInterval);
          setNameTypingComplete(true);
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }).start();
          return prev;
        }
        return prev + 1;
      });
    }, 150);

    // Cursor + dots bounce
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Morph shapes
    const morphLoop = (anim: Animated.Value, delay = 0) =>
      Animated.loop(
        Animated.timing(anim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          delay,
          useNativeDriver: true,
        })
      );
    morphLoop(morphAnim1).start();
    morphLoop(morphAnim2, 1000).start();
    morphLoop(morphAnim3, 2000).start();

    // Glow animación
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Partículas flotantes
    particleAnims.forEach((anim, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 4000 + Math.random() * 3000,
            delay: Math.random() * 2000,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 4000 + Math.random() * 3000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });

    // Cambio de mensajes
    const msgInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2000);

    return () => clearInterval(msgInterval);
  }, []);

  // Interpolaciones
  const cursorOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  const glowScale = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.5],
  });
  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1],
  });

  const logoFontSize = screenWidth < 400 ? 36 : 48;
  const taglineFontSize = screenWidth < 400 ? 16 : 18;

  const morphRotate1 = morphAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });
  const morphRotate2 = morphAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });
  const morphRotate3 = morphAnim3.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <LinearGradient
      colors={["#001F54", "#1a365d", "#2a4a6b"]}
      style={styles.container}
    >
      {/* Partículas */}
      {particleAnims.map((anim, i) => {
        const translateY = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -15],
        });
        const opacity = anim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0.3, 0.6, 0.3],
        });
        return (
          <Animated.View
            key={i}
            style={[
              styles.particle,
              {
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity,
                transform: [{ translateY }],
              },
            ]}
          />
        );
      })}

      {/* Contenido principal */}
      <View style={styles.mainContentWrapper}>
        {/* Logo con máquina de escribir */}
        <View style={styles.logoContainer}>
          <Text style={[styles.logoText, { fontSize: logoFontSize }]}>
            {COMPANY_NAME.slice(0, letterIndex)}
          </Text>
          {letterIndex < COMPANY_NAME.length && (
            <Animated.View
              style={[styles.cursor, { opacity: cursorOpacity }]}
            />
          )}
        </View>

        {/* Tagline y formas */}
        {nameTypingComplete && (
          <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
            {/* Tagline */}
            <View style={styles.taglineRow}>
              <View style={[styles.taglineDivider, { backgroundColor: "red" }]} />
              <Text style={[styles.taglineText, { fontSize: taglineFontSize }]}>
                {TAGLINE}
              </Text>
              <View style={[styles.taglineDivider, { backgroundColor: "green" }]} />
            </View>

            {/* Shapes + Glow */}
            <View style={styles.morphingShapesContainer}>
            <View style={styles.morphingShapeWrapper}>
                {/* Shape 1 */}
                <Animated.View
                style={[
                    styles.morphingShape,
                    {
                    borderColor: "#FF0000",
                    transform: [
                        { rotate: morphRotate1 },
                        {
                        scale: morphAnim1.interpolate({
                            inputRange: [0, 0.5, 1],
                            outputRange: [1, 0.8, 1.2],
                        }),
                        },
                    ],
                    borderRadius: morphAnim1.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [75, 20, 50], // círculo → cuadrado redondeado → óvalo
                    }),
                    },
                ]}
                />

                {/* Shape 2 */}
                <Animated.View
                style={[
                    styles.morphingShape,
                    {
                    borderColor: "#00A859",
                    transform: [
                        { rotate: morphRotate2 },
                        {
                        scale: morphAnim2.interpolate({
                            inputRange: [0, 0.5, 1],
                            outputRange: [1, 1.1, 0.9],
                        }),
                        },
                    ],
                    borderRadius: morphAnim2.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [20, 75, 5],
                    }),
                    },
                ]}
                />

                {/* Shape 3 */}
                <Animated.View
                style={[
                    styles.morphingShape,
                    {
                    borderColor: "#1E56A0",
                    transform: [
                        { rotate: morphRotate3 },
                        {
                        scale: morphAnim3.interpolate({
                            inputRange: [0, 0.5, 1],
                            outputRange: [1, 0.7, 1.3],
                        }),
                        },
                    ],
                    borderRadius: morphAnim3.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [10, 50, 30],
                    }),
                    },
                ]}
                />

                {/* Glow central blanco */}
                <Animated.View
                style={[
                    styles.glow,
                    { opacity: glowOpacity, transform: [{ scale: glowScale }] },
                ]}
                />
            </View>
            </View>


            {/* Estado de carga */}
            <View style={styles.loadingStatusContainer}>
              <Text style={styles.statusMessage}>
                {loadingMessages[messageIndex]}
              </Text>
              <View style={styles.dotsContainer}>
                {["#FF0000", "#1E56A0", "#00A859"].map((color, i) => (
                  <Animated.View
                    key={i}
                    style={[styles.dot, { backgroundColor: color }]}
                  />
                ))}
              </View>
            </View>
          </Animated.View>
        )}
      </View>

      {/* Mensaje inferior */}
      <View style={styles.bottomMessageContainer}>
        <Text style={styles.bottomMessageText}>
          Transforma tus ideas en productos únicos
        </Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  mainContentWrapper: { flex: 1, justifyContent: "center", alignItems: "center" },
  logoContainer: { flexDirection: "row", alignItems: "center", marginBottom: 50 },
  logoText: { fontWeight: "bold", color: "#fff" },
  cursor: { width: 3, height: 40, marginLeft: 5, backgroundColor: "#1E56A0" },
  contentContainer: { alignItems: "center", width: "100%" },
  taglineRow: { flexDirection: "row", alignItems: "center", marginBottom: 60 },
  taglineDivider: { width: 30, height: 2, marginHorizontal: 10, opacity: 0.7 },
  taglineText: { fontWeight: "600", color: "#fff", textAlign: "center" },
  morphingShapesContainer: { justifyContent: "center", alignItems: "center" },
  morphingShapeWrapper: { width: 150, height: 150, justifyContent: "center", alignItems: "center", marginBottom: 40 },
  morphingShape: { position: "absolute", width: "100%", height: "100%", borderWidth: 2, borderRadius: 75 },
  glow: { width: 20, height: 20, borderRadius: 10, backgroundColor: "#fff", position: "absolute" },
  loadingStatusContainer: { alignItems: "center", marginTop: 20 },
  statusMessage: { fontSize: 18, fontWeight: "500", color: "#fff", marginBottom: 15 },
  dotsContainer: { flexDirection: "row", justifyContent: "center" },
  dot: { width: 12, height: 12, borderRadius: 6, marginHorizontal: 5 },
  bottomMessageContainer: { position: "absolute", bottom: 40 },
  bottomMessageText: { fontSize: 14, color: "rgba(255,255,255,0.7)" },
  particle: { position: "absolute", width: 4, height: 4, borderRadius: 2, backgroundColor: "#fff" },
});

export default AppLoader;
