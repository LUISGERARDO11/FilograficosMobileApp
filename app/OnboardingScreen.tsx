import AsyncStorage from "@react-native-async-storage/async-storage";
import Checkbox from "expo-checkbox";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Importamos el módulo de íconos que sí tienes instalado
import { Ionicons } from '@expo/vector-icons';

// Usamos las dimensiones de la ventana para un diseño responsivo
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const STORAGE_KEY = "HAS_VIEWED_ONBOARDING";

// Definimos un tipo para el componente visual
interface SlideVisualProps {
    className?: string;
}

interface Slide {
    // Usamos string para el tipo de icono de Ionicons
    iconName: keyof typeof Ionicons.glyphMap; 
    title: string;
    subtitle: string;
    description: string;
    visual: (props: SlideVisualProps) => React.ReactNode;
}

// Componente Wrapper para los iconos de Expo
interface ExpoIconProps {
    name: keyof typeof Ionicons.glyphMap;
    size: number;
    color: string;
    style?: any;
}

const ExpoIcon: React.FC<ExpoIconProps> = ({ name, size, color, style }) => (
    <Ionicons name={name} size={size} color={color} style={style} />
);

// --- Definición de Diapositivas con Ionicons ---

const SLIDES: Slide[] = [
    {
        iconName: "color-palette",
        title: "¡Bienvenido a Filográficos!",
        subtitle: "Personaliza productos en 3D",
        description: "Crea diseños únicos para tazas, playeras y vasos con visualización en tiempo real.",
        visual: () => (
            <View style={visualStyles.visualContainer}>
                <View style={[visualStyles.visualCard, visualStyles.paletteBackground]}>
                    <ExpoIcon name="color-palette" size={80} color="white" />
                </View>
                <View style={visualStyles.tag}>
                    <Text style={visualStyles.tagText}>3D</Text>
                </View>
            </View>
        )
    },
    {
        iconName: "camera",
        title: "Sube tu diseño",
        subtitle: "Desde galería o cámara",
        description: "Toma una foto o selecciona una imagen desde tu galería para personalizar tus productos.",
        visual: () => (
            <View style={visualStyles.flexRowCenter}>
                <View style={[visualStyles.iconBox, { backgroundColor: '#E0F2FE' }]}>
                    <ExpoIcon name="camera" size={40} color="#0B71E8" />
                </View>
                <ExpoIcon name="arrow-forward" size={24} color="#9CA3AF" style={{ marginHorizontal: 15 }} />
                <View style={[visualStyles.iconBox, { backgroundColor: '#F3E5FF' }]}>
                    <ExpoIcon name="cloud-upload" size={40} color="#9333EA" />
                </View>
            </View>
        )
    },
    {
        iconName: "eye",
        title: "Visualiza en 3D",
        subtitle: "Ve tu diseño en tiempo real",
        description: "Observa cómo se verá tu diseño en diferentes productos con nuestra tecnología 3D.",
        visual: () => (
            <View style={visualStyles.flexRowCenter}>
                <View style={[visualStyles.productCard, visualStyles.coffeeBackground]}>
                    <ExpoIcon name="cafe" size={35} color="white" />
                </View>
                <View style={[visualStyles.productCard, visualStyles.shirtBackground]}>
                    <ExpoIcon name="shirt" size={35} color="white" />
                </View>
                <View style={[visualStyles.productCard, visualStyles.wineBackground]}>
                    <ExpoIcon name="wine" size={35} color="white" />
                </View>
            </View>
        )
    },
    {
        iconName: "share-social",
        title: "Comparte y descarga",
        subtitle: "Guarda tu creación",
        description: "Descarga tu diseño como imagen de vista previa o compártelo con tus amigos.",
        visual: () => (
            <View style={visualStyles.flexRowCenter}>
                <View style={[visualStyles.iconBox, { backgroundColor: '#D1FAE5' }]}>
                    <ExpoIcon name="download" size={40} color="#059669" />
                </View>
                <ExpoIcon name="arrow-forward" size={24} color="#9CA3AF" style={{ marginHorizontal: 15 }} />
                <View style={[visualStyles.iconBox, { backgroundColor: '#E0F2FE' }]}>
                    <ExpoIcon name="share-social" size={40} color="#0B71E8" />
                </View>
            </View>
        )
    }
];

// --- Componente Principal ---

const OnboardingScreen = () => {
    // Nota: useRouter solo funcionará si restauras el _layout original con Stack.
    const router = useRouter(); 
    const [currentSlide, setCurrentSlide] = useState(0);
    const [doNotShowAgain, setDoNotShowAgain] = useState(false);

    const handleCheckboxChange = (value: boolean) => setDoNotShowAgain(value);

    const nextSlide = () => {
        if (currentSlide < SLIDES.length - 1) {
            setCurrentSlide(prev => prev + 1);
        }
    };

    const prevSlide = () => {
        if (currentSlide > 0) {
            setCurrentSlide(prev => prev - 1);
        }
    };

    const handleFinish = async () => {
      if (doNotShowAgain) {
        try {
          await AsyncStorage.setItem(STORAGE_KEY, "true");
          console.log("Onboarding Flag set to 'true' and persisted.");
        } catch (err) {
          console.error("Error guardando flag en AsyncStorage:", err);
        }
      } else {
        console.log("Onboarding Flag not set to 'true'. It will show again.");
      }
      
      // Navegamos al final. Esto solo funcionará con el _layout original.
      router.replace("/");
    };

    const isLastSlide = currentSlide === SLIDES.length - 1;

    return (
      <SafeAreaView style={styles.container}>
          
          {/* Header (Omitir) */}
          <View style={styles.header}>
              <View style={styles.headerTitleContainer}>
                  <View style={styles.headerIconBox}>
                      <ExpoIcon name="color-palette" size={20} color="white" />
                  </View>
                  <Text style={styles.headerTitle}>Filográficos</Text>
              </View>
              <TouchableOpacity onPress={handleFinish}>
                  <Text style={styles.skipText}>Omitir</Text>
              </TouchableOpacity>
          </View>

          {/* Main Content (El Carrusel) */}
          <View style={styles.mainContent}>
              
              {/* Visual */}
              <View style={styles.visualWrapper}>
                  {SLIDES[currentSlide].visual({})}
              </View>

              {/* Content */}
              <View style={styles.textContainer}>
                  <Text style={styles.slideTitle}>{SLIDES[currentSlide].title}</Text>
                  <Text style={styles.slideSubtitle}>{SLIDES[currentSlide].subtitle}</Text>
                  <Text style={styles.slideDescription}>{SLIDES[currentSlide].description}</Text>
              </View>

              {/* Navigation Dots */}
              <View style={styles.dotsContainer}>
                  {SLIDES.map((_, index) => (
                      <TouchableOpacity
                          key={index}
                          onPress={() => setCurrentSlide(index)}
                          // El cambio de ancho y color es instantáneo,
                          // ya que quitamos la propiedad transitionDuration no soportada.
                          style={[
                              styles.dot,
                              index === currentSlide ? styles.activeDot : styles.inactiveDot,
                          ]}
                      />
                  ))}
              </View>

              {/* Navigation Buttons */}
              <View style={styles.navButtonsContainer}>
                  {/* Botón Atrás */}
                  <TouchableOpacity
                      onPress={prevSlide}
                      style={[styles.navButton, currentSlide === 0 && styles.disabledButton]}
                      disabled={currentSlide === 0}
                  >
                      <ExpoIcon name="chevron-back" size={24} color={currentSlide === 0 ? '#CCC' : '#6B7280'} />
                  </TouchableOpacity>

                  {/* Botón Siguiente / Comenzar */}
                  {isLastSlide ? (
                      <TouchableOpacity 
                          onPress={handleFinish} 
                          style={styles.startButtonLarge}
                      >
                          <Text style={styles.startButtonText}>¡Comenzar!</Text>
                          <ExpoIcon name="arrow-forward" size={20} color="white" style={{ marginLeft: 5 }} />
                      </TouchableOpacity>
                  ) : (
                      <TouchableOpacity
                          onPress={nextSlide}
                          style={styles.nextButton}
                      >
                          <ExpoIcon name="chevron-forward" size={24} color="white" />
                      </TouchableOpacity>
                  )}
              </View>
          </View>

          {/* Footer (Check y Quick Features) */}
          <View style={styles.footer}>
              
              {/* Checkbox */}
              <View style={styles.checkboxRow}>
                  <Checkbox
                      value={doNotShowAgain}
                      onValueChange={handleCheckboxChange}
                      color={doNotShowAgain ? "#0B71E8" : undefined}
                      style={styles.checkbox}
                  />
                  <Text style={styles.checkboxLabel}>No volver a mostrar</Text>
              </View>
              
              {/* Quick Features */}
              <View style={styles.featuresContainer}>
                  <FeatureBox iconName="phone-portrait-outline" label="Fácil de usar" color="#0B71E8" bgColor="#E0F2FE" />
                  <FeatureBox iconName="eye" label="Vista 3D real" color="#9333EA" bgColor="#F3E5FF" />
                  <FeatureBox iconName="download" label="Descarga gratis" color="#059669" bgColor="#D1FAE5" />
              </View>
          </View>
      </SafeAreaView>
    );
};

// --- Componente de Funcionalidad Rápida ---

interface FeatureBoxProps {
    iconName: keyof typeof Ionicons.glyphMap;
    label: string;
    color: string;
    bgColor: string;
}

const FeatureBox: React.FC<FeatureBoxProps> = ({ iconName, label, color, bgColor }) => (
    <View style={featureStyles.container}>
        <View style={[featureStyles.iconWrapper, { backgroundColor: bgColor }]}>
            <ExpoIcon name={iconName} size={24} color={color} />
        </View>
        <Text style={featureStyles.label}>{label}</Text>
    </View>
);


// --- Estilos ---

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F9FAFB" },
    
    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    headerIconBox: {
        width: 32, 
        height: 32, 
        backgroundColor: '#DC2626', // Red
        borderRadius: 8, 
        alignItems: 'center', 
        justifyContent: 'center'
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#1F2937",
    },
    skipText: {
        color: "#0B71E8",
        fontWeight: "600",
        padding: 5,
    },

    // Main Content
    mainContent: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 30,
    },
    visualWrapper: {
        marginBottom: 50,
    },
    textContainer: {
        alignItems: 'center',
        maxWidth: 350,
        marginBottom: 30,
    },
    slideTitle: {
        fontSize: 26,
        fontWeight: "800",
        color: "#1F2937",
        marginBottom: 10,
        textAlign: 'center',
    },
    slideSubtitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#0B71E8", // Blue-600
        marginBottom: 10,
        textAlign: 'center',
    },
    slideDescription: {
        fontSize: 15,
        color: "#4B5563",
        lineHeight: 22,
        textAlign: 'center',
    },

    // Dots (CORRECCIÓN: Se eliminó transitionDuration)
    dotsContainer: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 40,
    },
    dot: {
        height: 12,
        borderRadius: 6,
    },
    inactiveDot: {
        width: 12,
        backgroundColor: '#D1D5DB', // Gray-300
    },
    activeDot: {
        width: 28,
        backgroundColor: '#0B71E8', // Blue-600
    },

    // Navigation Buttons
    navButtonsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: 350,
    },
    navButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    disabledButton: {
        borderColor: '#F3F4F6',
    },
    nextButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#0B71E8',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#0B71E8",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    startButtonLarge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0B71E8', // Blue-600
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 15,
        shadowColor: "#0B71E8",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 8,
    },
    startButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
    },

    // Footer
    footer: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        backgroundColor: 'white',
    },
    checkboxRow: { 
        flexDirection: "row", 
        alignItems: "center", 
        marginBottom: 15, 
        justifyContent: 'center' 
    },
    checkbox: {
        borderRadius: 4,
    },
    checkboxLabel: { 
        marginLeft: 10, 
        fontSize: 14, 
        color: "#4B5563" 
    },
    featuresContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        maxWidth: 400,
        alignSelf: 'center',
    },
});

// --- Estilos para los visuales específicos de cada slide ---

const visualStyles = StyleSheet.create({
    flexRowCenter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    visualContainer: {
        position: 'relative',
        width: 150,
        height: 150,
        alignSelf: 'center',
        justifyContent: 'center',
    },
    visualCard: {
        width: 120,
        height: 120,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 10,
        transform: [{ rotate: '5deg' }], // Ligera inclinación para efecto 3D
    },
    paletteBackground: {
        backgroundColor: '#4C51BF', // Color base, usaremos un gradiente simulado
    },
    tag: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 40,
        height: 40,
        backgroundColor: '#EF4444', // Red-500
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    tagText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    iconBox: {
        width: 80,
        height: 80,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    productCard: {
        width: 60,
        height: 80,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
    coffeeBackground: { backgroundColor: '#3B82F6' }, // Blue
    shirtBackground: { backgroundColor: '#10B981' }, // Green
    wineBackground: { backgroundColor: '#F56565' }, // Red
});

const featureStyles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    iconWrapper: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    label: {
        fontSize: 10,
        color: '#4B5563',
        fontWeight: '600',
        textAlign: 'center',
    }
});

export default OnboardingScreen;
