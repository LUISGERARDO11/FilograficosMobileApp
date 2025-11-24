import { Ionicons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useMemo, useRef } from 'react';
import { Alert, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ModelViewer, { ModelViewerHandle } from '../../components/ModelViewer';
import { useThemeColor } from '../../hooks/use-theme-color';
import { TextData } from '../../utils/types';

const { width } = Dimensions.get('window');
const DEFAULT_TEXT_DATA: TextData = { text: '', color: '#000000', size: 24, fontWeight: 'normal', fontStyle: 'normal' };

const PreviewScreen = () => {
  const params = useLocalSearchParams();
  const router = useRouter();

  // Referencia para controlar el ModelViewer
  const modelViewerRef = useRef<ModelViewerHandle>(null);

  const { modelId, selectedImageUri, textData: serializedTextData, modelUrl } = params as {
    modelId: string | undefined;
    selectedImageUri: string | null | undefined;
    textData: string | undefined;
    modelUrl: string | undefined;
  };

  const headerBgColor = useThemeColor({ light: '#002558', dark: '#151718' }, 'background');
  const headerTextColor = useThemeColor({ light: '#fff', dark: '#eee' }, 'text');
  const backgroundColor = useThemeColor({ light: '#e0e0e0', dark: '#333333' }, 'background');
  const cardBgColor = useThemeColor({ light: '#ffffff', dark: '#282828' }, 'background');
  const primaryTextColor = useThemeColor({ light: '#333', dark: '#eee' }, 'text');
  const titleTextColor = '#dc3545';
  const buttonBgColor = useThemeColor({ light: '#0056b3', dark: '#007bff' }, 'tint');
  const buttonTextColor = useThemeColor({ light: '#fff', dark: '#fff' }, 'text');

  const personalizationData = useMemo(() => {
    let parsedTextData: TextData | null = null;
    try {
      if (serializedTextData) {
        parsedTextData = JSON.parse(serializedTextData);
      }
    } catch (error) {
      console.error("Error al parsear textData:", error);
    }
    const selectedImage = selectedImageUri ? { uri: selectedImageUri } : null;
    const modelIdString = modelId as string | undefined;
    return {
      modelId: modelIdString,
      selectedImage,
      textData: parsedTextData || DEFAULT_TEXT_DATA,
      modelUrl,
    };
  }, [modelId, selectedImageUri, serializedTextData, modelUrl]);

  const handleGoBack = () => router.back();
  const handleGoHome = () => router.push('/');

  // FUNCIÓN DE DESCARGA IMPLEMENTADA
  const handleDownload = async () => {
    try {
        // 1. Solicitar permisos
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permiso denegado', 'Necesitamos permiso para guardar la imagen en tu galería.');
            return;
        }

        // 2. Capturar la imagen desde el componente hijo
        if (modelViewerRef.current) {
            const uri = await modelViewerRef.current.captureSnapshot();
            
            if (uri) {
                // 3. Guardar en la galería/descargas
                const asset = await MediaLibrary.createAssetAsync(uri);
                // Opcional: Mover a un álbum específico
                // await MediaLibrary.createAlbumAsync('Filograficos', asset, false);
                
                Alert.alert('¡Descarga Exitosa!', 'La imagen se ha guardado en tu galería de fotos.');
            } else {
                Alert.alert('Error', 'No se pudo generar la captura del modelo.');
            }
        }
    } catch (error) {
        console.error(error);
        Alert.alert('Error', 'Hubo un problema al intentar guardar la imagen.');
    }
  };

  const handleShare = async () => {
    try {
        // Paso 1: Verificar si el sistema operativo puede compartir archivos
        if (!(await Sharing.isAvailableAsync())) {
            Alert.alert('Error', 'La función de compartir no está disponible en este dispositivo.');
            return;
        }

        // Paso 2: Capturar la imagen desde el componente hijo (Igual que en handleDownload)
        if (modelViewerRef.current) {
            // `captureSnapshot` debe devolver una URI de archivo temporal
            const uri = await modelViewerRef.current.captureSnapshot(); 

            if (uri) {
                // Paso 3: Abrir el diálogo de compartir
                await Sharing.shareAsync(uri, {
                    mimeType: 'image/png', // Define el tipo de archivo (ViewShot usa PNG por defecto)
                    dialogTitle: 'Comparte tu diseño 3D personalizado',
                });
            } else {
                Alert.alert('Error', 'No se pudo generar la captura para compartir.');
            }
        }
    } catch (error) {
        console.error("Error al compartir:", error);
        Alert.alert('Error', 'Hubo un problema al intentar compartir la imagen.');
    }
  };

  const { selectedImage, textData, modelUrl: finalModelUrl, modelId: finalModelId } = personalizationData;

  if (!finalModelId || !finalModelUrl) {
      return <View><Text>Error</Text></View>; // Simplificado para el ejemplo
  }

  return (
    <View style={[styles.rootContainer, { backgroundColor: headerBgColor }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Vista Previa 3D',
          headerTitleAlign: 'center',
          headerStyle: { backgroundColor: headerBgColor },
          headerTintColor: headerTextColor,
          headerLeft: () => (
            <TouchableOpacity onPress={handleGoBack} style={styles.headerButton}>
              <Ionicons name="arrow-back" size={28} color={headerTextColor} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={handleGoHome} style={styles.headerButton}>
              <Ionicons name="home" size={26} color={headerTextColor} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={[styles.scrollView, { backgroundColor: backgroundColor }]} contentContainerStyle={styles.contentContainer}>
        <View style={[styles.modelContainer, { backgroundColor: cardBgColor }]}>
          <Text style={[styles.productTitle, { color: primaryTextColor }]}>Modelo ID: {modelId}</Text>
          
          <ModelViewer
            ref={modelViewerRef} 
            modelUrl={finalModelUrl}
            textData={textData}
            selectedImage={selectedImage}
            modelId={parseInt(finalModelId, 10)}
          />
        </View>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: buttonBgColor }]}
          onPress={handleDownload}
        >
          <Text style={[styles.actionButtonText, { color: buttonTextColor }]}>Descargar Imagen</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.shareButton]}
          onPress={handleShare}
        >
          <Text style={styles.shareButtonText}>Compartir Diseño</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  rootContainer: { flex: 1 },
  scrollView: { flex: 1 },
  contentContainer: { alignItems: 'center', paddingVertical: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerButton: { paddingHorizontal: 15 },
  modelContainer: {
    width: width * 0.95,
    borderRadius: 15,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 6,
  },
  productTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  actionButton: {
    width: width * 0.9,
    paddingVertical: 15,
    marginTop: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  errorButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  shareButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#007bff',
  },
  shareButtonText: {
    color: '#007bff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PreviewScreen;