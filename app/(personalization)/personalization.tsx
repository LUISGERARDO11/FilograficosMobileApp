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
// ⚠️ Vuelve a importar SafeAreaView para usarlo SOLO en los estados de Carga/Error.
import { SafeAreaView } from 'react-native-safe-area-context';

import ImageSection from '../../components/ImageSection';
import ModelViewer from '../../components/ModelViewer';
import TextSection, { TextData } from '../../components/TextSection';
import { useThemeColor } from '../../hooks/use-theme-color';
import { get3dModelById, ProductModel } from '../../services/models3dService';

const { width } = Dimensions.get('window');

type PersonalizationMode = 'image' | 'text';

const PersonalizationScreen = () => {
    const { modelId } = useLocalSearchParams() as { modelId: string };
    const [modelData, setModelData] = useState<ProductModel | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<{ uri: string } | null>(null);

    const [textData, setTextData] = useState<TextData>({
        text: '',
        color: '#000000',
        size: 24,
        fontWeight: 'normal',
        fontStyle: 'normal',
    });

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
            clearData = () => setTextData({ text: '', color: '#000000', size: 24, fontWeight: 'normal', fontStyle: 'normal' });
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
    const handleRefresh = () => console.log('Refrescar');
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
                    <ModelViewer modelUrl={modelData.model_url} />
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