import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Alert, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// La ruta relativa a utils/types.ts desde app/(personalization)/preview.tsx
import ModelViewer from '../../components/ModelViewer'; // Asumimos la ruta correcta
import { useThemeColor } from '../../hooks/use-theme-color';
import { TextData } from '../../utils/types';

// NOTA: Replicamos la interfaz ModelViewerProps necesaria
interface ModelViewerProps {
    modelUrl: string; // Para el modelo 3D (ahora real)
    textData: TextData; // Datos de texto
    selectedImage: { uri: string } | null; // Imagen de textura
}

const ModelViewerTyped = ModelViewer as React.ComponentType<ModelViewerProps>;

const { width } = Dimensions.get('window');

const DEFAULT_TEXT_DATA: TextData = { text: '', color: '#000000', size: 24, fontWeight: 'normal', fontStyle: 'normal' };


const PreviewScreen = () => {
    const params = useLocalSearchParams();
    const router = useRouter();
    
    // 1. Recibir y tipar los parámetros, incluyendo modelUrl
    const { modelId, selectedImageUri, textData: serializedTextData, modelUrl } = params as {
        modelId: string | undefined;
        selectedImageUri: string | null | undefined;
        textData: string | undefined; 
        modelUrl: string | undefined; // ⭐ RECIBIMOS LA URL DEL MODELO
    };

    // Hooks de tema
    const headerBgColor = useThemeColor({ light: '#002558', dark: '#151718' }, 'background');
    const headerTextColor = useThemeColor({ light: '#fff', dark: '#eee' }, 'text');
    const backgroundColor = useThemeColor({ light: '#e0e0e0', dark: '#333333' }, 'background');
    const cardBgColor = useThemeColor({ light: '#ffffff', dark: '#282828' }, 'background');
    const primaryTextColor = useThemeColor({ light: '#333', dark: '#eee' }, 'text');
    const titleTextColor = '#dc3545';
    const buttonBgColor = useThemeColor({ light: '#0056b3', dark: '#007bff' }, 'tint');
    const buttonTextColor = useThemeColor({ light: '#fff', dark: '#fff' }, 'text');

    // 2. Deserializar y preparar los datos
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

        return {
            modelId: modelId,
            selectedImage: selectedImage,
            textData: parsedTextData || DEFAULT_TEXT_DATA,
            modelUrl: modelUrl, // ⭐ USAMOS LA URL DEL MODELO
        };
    }, [modelId, selectedImageUri, serializedTextData, modelUrl]);


    const handleGoBack = () => router.back();
    
    const { selectedImage, textData, modelUrl: finalModelUrl } = personalizationData;
    const hasPersonalization = selectedImage || (textData.text && textData.text.trim() !== '');

    // Manejo de errores de datos esenciales
    if (!modelId || !finalModelUrl) {
        return (
            <SafeAreaView style={[styles.safeArea, { backgroundColor: backgroundColor }]}>
                <Stack.Screen options={{ 
                    headerShown: true,
                    headerTitle: "Error de Vista Previa",
                    headerStyle: { backgroundColor: headerBgColor },
                    headerTintColor: headerTextColor,
                }} />
                <View style={styles.loadingContainer}>
                    <Text style={{ color: titleTextColor, fontSize: 18 }}>
                        Error: ID o URL del modelo 3D no encontrados.
                    </Text>
                    <TouchableOpacity onPress={handleGoBack} style={[styles.errorButton, { backgroundColor: buttonBgColor, marginTop: 20 }]}>
                        <Text style={[styles.errorButtonText, { color: buttonTextColor }]}>Volver</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }
    
    return (
        <View style={[styles.rootContainer, { backgroundColor: headerBgColor }]}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    headerTitle: 'Vista Previa de Personalización',
                    headerTitleAlign: 'center',
                    headerStyle: { backgroundColor: headerBgColor },
                    headerTintColor: headerTextColor,
                    headerLeft: () => (
                        <TouchableOpacity onPress={handleGoBack} style={styles.headerButton}>
                            <Ionicons name="arrow-back" size={28} color={headerTextColor} />
                        </TouchableOpacity>
                    ),
                    headerRight: () => null,
                }}
            />
            
            <ScrollView style={[styles.scrollView, { backgroundColor: backgroundColor }]} contentContainerStyle={styles.contentContainer}>
                
                <View style={[styles.modelContainer, { backgroundColor: cardBgColor }]}>
                    <Text style={[styles.productTitle, { color: primaryTextColor }]}>Modelo ID: {modelId}</Text>
                    <Text style={[styles.productTitle, { color: primaryTextColor, fontSize: 16, marginBottom: 10 }]}>Renderizado de Personalización</Text>

                    {/* 3. Renderizar el ModelViewer con la URL real del modelo */}
                    <ModelViewerTyped 
                        modelUrl={finalModelUrl} 
                        textData={textData}
                        selectedImage={selectedImage}
                    />

                    <View style={styles.dataDisplay}>
                        <Text style={[styles.dataTitle, { color: primaryTextColor }]}>Datos de Personalización Aplicados:</Text>
                        <Text style={[styles.dataText, { color: primaryTextColor }]}>- URL del Modelo: {finalModelUrl.substring(0, 50)}...</Text>
                        <Text style={[styles.dataText, { color: primaryTextColor }]}>- Imagen URI: {selectedImage?.uri ? 'Sí' : 'No'}</Text>
                        <Text style={[styles.dataText, { color: primaryTextColor }]}>- Texto: "{textData.text || 'N/A'}"</Text>
                    </View>
                </View>

                <TouchableOpacity 
                    style={[styles.actionButton, { backgroundColor: buttonBgColor }]} 
                    onPress={() => Alert.alert('Éxito', '¡Personalización lista para ser agregada al carrito!')}
                    disabled={!hasPersonalization}
                >
                    <Text style={[styles.actionButtonText, { color: buttonTextColor }]}>Añadir al Carrito</Text>
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1 }, 
    rootContainer: { flex: 1 },
    scrollView: { flex: 1 },
    contentContainer: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
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
    dataDisplay: {
        marginTop: 20,
        width: '100%',
        padding: 15,
        backgroundColor: '#f8f8f8', 
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    dataTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    dataText: {
        fontSize: 14,
        lineHeight: 20,
    },
    actionButton: {
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
    }
});

export default PreviewScreen;