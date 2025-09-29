import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ImageSection from '../../components/ImageSection';
import ModelViewer from '../../components/ModelViewer';
import TextSection, { TextData } from '../../components/TextSection';
import { useThemeColor } from '../../hooks/use-theme-color';
import { get3dModelById, ProductModel } from '../../services/models3dService';

const { width } = Dimensions.get('window');

type PersonalizationMode = 'image' | 'text';

// 1. Constante para el estado inicial de TextData
const DEFAULT_TEXT_DATA: TextData = {
    text: '',
    color: '#000000',
    size: 24,
    fontWeight: 'normal',
    fontStyle: 'normal',
};

// 2. AÑADIDO: Interfaz de Props esperada para ModelViewer.
// Esto soluciona el error de tipado en este archivo.
// NOTA: Esta interfaz DEBERÍA ser exportada desde '../../components/ModelViewer.tsx'
// para una implementación correcta en producción.
interface ModelViewerProps {
    modelUrl: string;
    textData: TextData;
    selectedImage: { uri: string } | null;
}

// 3. AÑADIDO: Definición tipada del componente ModelViewer
const ModelViewerTyped = ModelViewer as React.ComponentType<ModelViewerProps>;


const PersonalizationScreen = () => {
    const { modelId } = useLocalSearchParams() as { modelId: string };
    const [modelData, setModelData] = useState<ProductModel | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<{ uri: string } | null>(null);

    // 2. Usar la constante para inicializar el estado
    const [textData, setTextData] = useState<TextData>(DEFAULT_TEXT_DATA);

    const router = useRouter();
    const [activeTab, setActiveTab] = useState<PersonalizationMode>('image');

    const headerBgColor = useThemeColor({ light: '#002558', dark: '#151718' }, 'background');
    const headerTextColor = useThemeColor({ light: '#fff', dark: '#eee' }, 'text');
    const backgroundColor = useThemeColor({ light: '#e0e0e0', dark: '#333333' }, 'background');
    const cardBgColor = useThemeColor({ light: '#ffffff', dark: '#282828' }, 'background');
    const cardBorderColor = useThemeColor({ light: '#ddd', dark: '#444' }, 'tabIconDefault');
    const tabActiveBgColor = useThemeColor({ light: '#0056b3', dark: '#007bff' }, 'tint');
    const tabActiveTextColor = useThemeColor({ light: '#fff', dark: '#fff' }, 'text');
    const tabInactiveTextColor = useThemeColor({ light: '#333', dark: '#ccc' }, 'text');
    const buttonBgColor = useThemeColor({ light: '#0056b3', dark: '#007bff' }, 'tint');
    const buttonTextColor = useThemeColor({ light: '#fff', dark: '#fff' }, 'text');
    const primaryTextColor = useThemeColor({ light: '#333', dark: '#eee' }, 'text');
    const titleTextColor = '#dc3545';

    useEffect(() => {
        const fetchModel = async () => {
            setIsLoading(true);
            try {
                if (!modelId) {
                    throw new Error("Error de navegación: No se encontró el ID del producto.");
                }
                const idAsNumber = parseInt(modelId, 10);
                if (isNaN(idAsNumber)) {
                    throw new Error("ID de modelo inválido.");
                }
                const data = await get3dModelById(idAsNumber);
                setModelData(data);
            } catch (error: any) {
                console.error("Error al obtener detalles del modelo:", error);
                Alert.alert("Error", error.message || "No se pudieron obtener los detalles del producto.");
                setModelData(null);
            } finally {
                setIsLoading(false);
            }
        };
        fetchModel();
    }, [modelId]);

    const handleImageSelect = (imageUri: string) => {
        setSelectedImage({ uri: imageUri });
    };

    const handleImageRemove = () => {
        setSelectedImage(null);
    };

    const handleTextChange = (newTextData: TextData) => {
        setTextData(newTextData);
    };

    // Lógica de confirmación para el cambio de tab
    const handleTabChange = (newTab: PersonalizationMode) => {
        if (activeTab === newTab) {
            return;
        }

        let hasData = false;
        let dataName = '';
        let clearData: () => void;

        // 1. Verificar si el modo actual tiene datos
        if (activeTab === 'image' && selectedImage) {
            hasData = true;
            dataName = 'la imagen';
            clearData = () => setSelectedImage(null);
        } else if (activeTab === 'text' && textData.text.trim() !== '') {
            hasData = true;
            dataName = 'el texto';
            // 3. Usar la constante DEFAULT_TEXT_DATA aquí también
            clearData = () => setTextData(DEFAULT_TEXT_DATA);
        }

        // 2. Si hay datos, pedir confirmación
        if (hasData) {
            Alert.alert(
                "Pérdida de datos",
                `Cambiar a modo ${newTab === 'text' ? 'Texto' : 'Imagen'} descartará ${dataName} actual. ¿Continuar?`,
                [
                    {
                        text: "No",
                        style: "cancel"
                    },
                    {
                        text: "Sí, descartar",
                        onPress: () => {
                            clearData();
                            setActiveTab(newTab);
                        },
                        style: 'destructive'
                    }
                ]
            );
        } else {
            // 3. Si no hay datos, cambiar directamente
            setActiveTab(newTab);
        }
    };

    const handleGoBack = () => router.back();
    
    // ⭐ IMPLEMENTACIÓN DE LA FUNCIÓN DE REINICIO SIMPLIFICADA
    const handleRefresh = () => {
        const hasImage = selectedImage !== null;
        const hasText = textData.text.trim() !== '';

        // 1. Si no hay nada que reiniciar, no hacemos nada ni mostramos alerta.
        if (!hasImage && !hasText) {
            return;
        }

        // 2. Si hay datos, pedimos confirmación.
        Alert.alert(
            "Reiniciar Personalización",
            "¿Estás seguro de que quieres limpiar toda la personalización (imagen y texto)? Esta acción no se puede deshacer.",
            [
                {
                    text: "Cancelar",
                    style: "cancel"
                },
                {
                    text: "Reiniciar Todo",
                    onPress: () => {
                        setSelectedImage(null); // Limpiar imagen
                        setTextData(DEFAULT_TEXT_DATA); // Limpiar texto y estilos
                        // Volvemos a la pestaña de Imagen, que es la primera.
                        setActiveTab('image'); 
                        // 3. Eliminamos el alert de confirmación de reinicio exitoso.
                    },
                    style: 'destructive'
                }
            ]
        );
    };

    const handlePreview = () => {
        console.log('Ver Preview');
        console.log('Imagen seleccionada:', selectedImage);
        console.log('Datos de texto:', textData);
    };

    if (isLoading) {
        // ✅ CORRECCIÓN: Usamos SafeAreaView aquí para manejar el notch en el estado de carga
        return (
            <SafeAreaView style={[styles.safeArea, { backgroundColor: backgroundColor }]}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={headerBgColor} />
                    <Text style={{ color: primaryTextColor, marginTop: 10 }}>Cargando detalles del producto...</Text>
                </View>
            </SafeAreaView>
        );
    }
    
    if (!modelData) {
        // ✅ CORRECCIÓN: Usamos SafeAreaView aquí para manejar el notch en el estado de error
        return (
            <SafeAreaView style={[styles.safeArea, { backgroundColor: backgroundColor }]}>
                <View style={styles.loadingContainer}>
                    <Text style={{ color: titleTextColor, fontSize: 18 }}>Producto no encontrado.</Text>
                </View>
            </SafeAreaView>
        );
    }

    // ⭐ CONTENIDO PRINCIPAL: Mantenemos View porque el Stack Header ya está visible
    return (
        <View style={[styles.rootContainer, { backgroundColor: headerBgColor }]}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    headerTitle: modelData.product_name || '',
                    headerTitleAlign: 'center',
                    headerStyle: { backgroundColor: headerBgColor },
                    headerTintColor: headerTextColor,
                    headerLeft: () => (
                        <TouchableOpacity onPress={handleGoBack} style={styles.headerButton}>
                            <Ionicons name="arrow-back" size={28} color={headerTextColor} />
                        </TouchableOpacity>
                    ),
                    // Este es el botón de Reinicio, ahora con la lógica de handleRefresh
                    headerRight: () => (
                        <TouchableOpacity onPress={handleRefresh} style={styles.headerButton}>
                            <Ionicons name="reload-outline" size={28} color={headerTextColor} />
                        </TouchableOpacity>
                    ),
                }}
            />
            {/* El ScrollView ahora ocupa el espacio restante debajo del header de Stack */}
            <ScrollView
                style={[styles.scrollView, { backgroundColor: backgroundColor }]}
                contentContainerStyle={styles.contentContainer}
                keyboardShouldPersistTaps="handled"
            >
                <View style={[styles.productCard, { backgroundColor: cardBgColor, borderColor: cardBorderColor }]}>
                    <Text style={[styles.productTitle, { color: titleTextColor }]}>{modelData.product_name}</Text>
                    {/* 4. Usamos el componente tipado para evitar el error de TS */}
                    <ModelViewerTyped 
                        modelUrl={modelData.model_url}
                        textData={textData}
                        selectedImage={selectedImage}
                    />
                </View>

                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[
                            styles.tabButton,
                            activeTab === 'image' && { backgroundColor: tabActiveBgColor },
                            { borderColor: tabActiveBgColor }
                        ]}
                        onPress={() => handleTabChange('image')}
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
                        onPress={() => handleTabChange('text')}
                    >
                        <Text style={[styles.tabText, { color: activeTab === 'text' ? tabActiveTextColor : tabInactiveTextColor }]}>
                            Texto
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={[styles.tabContent, { backgroundColor: cardBgColor, borderColor: cardBorderColor }]}>
                    {activeTab === 'image' ? (
                        <ImageSection 
                            selectedImage={selectedImage}
                            onImageSelect={handleImageSelect}
                            onImageRemove={handleImageRemove}
                        />
                    ) : (
                        <TextSection
                            textData={textData}
                            onTextChange={handleTextChange}
                        />
                    )}
                </View>

                <TouchableOpacity 
                    style={[styles.previewButton, { backgroundColor: buttonBgColor }]} 
                    onPress={handlePreview}
                    disabled={!selectedImage && textData.text.trim() === ''}
                >
                    <Text style={[styles.previewButtonText, { color: buttonTextColor }]}>Ver Preview</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    // Estilo que se usará para SafeAreaView en Carga/Error
    safeArea: { flex: 1 }, 

    rootContainer: { flex: 1 },
    scrollView: { flex: 1 },
    contentContainer: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    // Ajustado para que el loading container use flex: 1, ahora es hijo de SafeAreaView
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerButton: { paddingHorizontal: 15 },
    productCard: {
        width: width * 0.9,
        borderRadius: 15,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
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