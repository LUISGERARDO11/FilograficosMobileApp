// app/(personalization)/personalization.tsx

import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ModelViewer from '../../components/ModelViewer'; // <--- IMPORTA EL NUEVO COMPONENTE
import { useThemeColor } from '../../hooks/use-theme-color';

const { width } = Dimensions.get('window');

const PersonalizationScreen = () => {
  // Asegúrate de castear modelUrl a string, ya que useLocalSearchParams devuelve un tipo genérico
  const { modelUrl, previewImageUrl } = useLocalSearchParams() as { modelUrl: string, previewImageUrl: string };
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'image' | 'text'>('image');

  // Colores de tema (sin errores de clave, usando las definidas previamente)
  const headerBgColor = useThemeColor({ light: '#002558', dark: '#151718' }, 'background');
  const headerTextColor = useThemeColor({ light: '#fff', dark: '#eee' }, 'text');
  const backgroundColor = useThemeColor({ light: '#e0e0e0', dark: '#333333' }, 'background');
  const cardBgColor = useThemeColor({ light: '#ffffff', dark: '#282828' }, 'background');
  const cardBorderColor = useThemeColor({ light: '#ddd', dark: '#444' }, 'tabIconDefault');
  const tabActiveBgColor = useThemeColor({ light: '#0056b3', dark: '#007bff' }, 'tint');
  const tabInactiveBgColor = useThemeColor({ light: '#f0f0f0', dark: '#444' }, 'tabIconDefault');
  const tabActiveTextColor = useThemeColor({ light: '#fff', dark: '#fff' }, 'text');
  const tabInactiveTextColor = useThemeColor({ light: '#333', dark: '#ccc' }, 'text');
  const buttonBgColor = useThemeColor({ light: '#0056b3', dark: '#007bff' }, 'tint');
  const buttonTextColor = useThemeColor({ light: '#fff', dark: '#fff' }, 'text');
  const placeholderTextColor = useThemeColor({ light: '#888', dark: '#bbb' }, 'icon');
  const primaryTextColor = useThemeColor({ light: '#333', dark: '#eee' }, 'text');
  const titleTextColor = '#dc3545';
  const dashBorderColor = useThemeColor({ light: '#99badd', dark: '#6699cc' }, 'tint');

  // ... (funciones de manejo de botones y navegación)

  const handleGoBack = () => router.back();
  const handleRefresh = () => console.log('Refrescar');
  const handleTakePhoto = () => console.log('Tomar foto');
  const handleSelectImage = () => console.log('Seleccionar imagen');
  const handlePreview = () => console.log('Ver Preview');

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: headerBgColor }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Personalizar',
          headerTitleAlign: 'center',
          headerStyle: { backgroundColor: headerBgColor },
          headerTintColor: headerTextColor,
          headerLeft: () => (
            <TouchableOpacity onPress={handleGoBack} style={styles.headerButton}>
              <Ionicons name="arrow-back" size={28} color={headerTextColor} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={handleRefresh} style={styles.headerButton}>
              <Ionicons name="reload-outline" size={28} color={headerTextColor} />
            </TouchableOpacity>
          ),
        }}
      />
      <View style={[styles.container, { backgroundColor: backgroundColor }]}>
        {/* Contenedor principal del producto */}
        <View style={[styles.productCard, { backgroundColor: cardBgColor, borderColor: cardBorderColor }]}>
          <Text style={[styles.productTitle, { color: titleTextColor }]}>Taza</Text>
          
          {/* 3D RENDER START */}
          {/* REEMPLAZAMOS LA IMAGEN POR EL VISUALIZADOR 3D */}
          <ModelViewer modelUrl={modelUrl} />
          {/* 3D RENDER END */}

        </View>

        {/* Tabs de selección: Imagen / Texto */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'image' && { backgroundColor: tabActiveBgColor },
              { borderColor: tabActiveBgColor }
            ]}
            onPress={() => setActiveTab('image')}
          >
            <Text style={[styles.tabText, { color: activeTab === 'image' ? tabActiveTextColor : tabInactiveTextColor }]}>
              Imagen
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'text' && { backgroundColor: tabActiveBgColor },
              { borderColor: tabActiveBgColor }
            ]}
            onPress={() => setActiveTab('text')}
          >
            <Text style={[styles.tabText, { color: activeTab === 'text' ? tabActiveTextColor : tabInactiveTextColor }]}>
              Texto
            </Text>
          </TouchableOpacity>
        </View>

        {/* Contenido de la pestaña activa */}
        <View style={[styles.tabContent, { backgroundColor: cardBgColor, borderColor: cardBorderColor }]}>
          {activeTab === 'image' ? (
            <View style={styles.imageSection}>
              <Text style={[styles.sectionTitle, { color: primaryTextColor }]}>Agregar Imagen</Text>
              <TouchableOpacity style={[styles.actionButton, { backgroundColor: buttonBgColor }]} onPress={handleTakePhoto}>
                <Ionicons name="camera-outline" size={24} color={buttonTextColor} />
                <Text style={[styles.actionButtonText, { color: buttonTextColor }]}>Tomar foto</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dashedBorderContainer, { borderColor: dashBorderColor }]}
                onPress={handleSelectImage}
              >
                <Ionicons name="image-outline" size={40} color={placeholderTextColor} />
                <Text style={[styles.dashedBorderText, { color: placeholderTextColor }]}>
                  Toca para agregar imagen{"\n"}JPG, PNG. Máx 5MB
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.textSection}>
              <Text style={[styles.sectionTitle, { color: primaryTextColor }]}>Agregar Texto</Text>
              <Text style={{ color: placeholderTextColor }}>Funcionalidad de texto próximamente...</Text>
            </View>
          )}
        </View>

        {/* Botón "Ver Preview" */}
        <TouchableOpacity style={[styles.previewButton, { backgroundColor: buttonBgColor }]} onPress={handlePreview}>
          <Text style={[styles.previewButtonText, { color: buttonTextColor }]}>Ver Preview</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, alignItems: 'center' },
  headerButton: { paddingHorizontal: 15 },
  productCard: {
    width: width * 0.9,
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 6,
    borderWidth: 1,
  },
  productTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  // ELIMINAMOS productImage ya que usamos ModelViewer
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    width: width * 0.9,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#0056b3',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
  },
  tabText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  tabContent: {
    width: width * 0.9,
    minHeight: 200,
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
  },
  imageSection: {
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  dashedBorderContainer: {
    width: '100%',
    height: 120,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  dashedBorderText: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 14,
  },
  textSection: {
    alignItems: 'center',
  },
  previewButton: {
    width: width * 0.9,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
  previewButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PersonalizationScreen;