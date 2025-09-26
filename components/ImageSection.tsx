import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
    Alert,
    Dimensions,
    Image,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useThemeColor } from '../hooks/use-theme-color';

const { width } = Dimensions.get('window');

interface ImageSectionProps {
    selectedImage: { uri: string } | null;
    onImageSelect: (imageUri: string) => void;
    onImageRemove: () => void;
}

const ImageSection: React.FC<ImageSectionProps> = ({ selectedImage, onImageSelect, onImageRemove }) => {
    const primaryTextColor = useThemeColor({ light: '#333', dark: '#eee' }, 'text');
    const placeholderTextColor = useThemeColor({ light: '#888', dark: '#bbb' }, 'icon');
    const removeButtonColor = useThemeColor({ light: 'red', dark: 'red' }, 'tint');
    const removeButtonBg = useThemeColor({ light: '#fdd', dark: '#fdd' }, 'tint');
    const dashBorderColor = useThemeColor({ light: '#99badd', dark: '#6699cc' }, 'tint');
    // Se eliminan las variables de color no utilizadas:
    // const imageControlsBg = useThemeColor({ light: '#f0f0f0', dark: '#444' }, 'background');
    // const imageControlsIconColor = useThemeColor({ light: '#666', dark: '#ccc' }, 'text');
    const modalBgColor = useThemeColor({ light: '#ffffff', dark: '#282828' }, 'background');
    const modalButtonBg = useThemeColor({ light: '#f0f0f0', dark: '#444' }, 'background');

    const [showModal, setShowModal] = useState(false);

    const handleSelectSource = async (source: 'camera' | 'gallery') => {
        setShowModal(false);

        let result: ImagePicker.ImagePickerResult;

        try {
            if (source === 'camera') {
                const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
                if (!cameraPermission.granted) {
                    Alert.alert('Permiso Requerido', 'Necesitamos acceso a la cámara para que puedas tomar una foto.');
                    return;
                }
                
                result = await ImagePicker.launchCameraAsync({
                    // ✅ CAMBIO A LA SINTAXIS COMPATIBLE CON LA VERSIÓN 17.x
                    mediaTypes: ImagePicker.MediaTypeOptions.Images, 
                    allowsEditing: true,
                    // ...
                });

            } else { // source === 'gallery'
                const libraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (!libraryPermission.granted) {
                    Alert.alert('Permiso Requerido', 'Necesitamos acceso a tu galería para seleccionar una imagen.');
                    return;
                }

                result = await ImagePicker.launchImageLibraryAsync({
                    // ✅ CAMBIO A LA SINTAXIS COMPATIBLE CON LA VERSIÓN 17.x
                    mediaTypes: ImagePicker.MediaTypeOptions.Images, 
                    allowsEditing: true,
                    aspect: [4, 3],
                    quality: 0.7,
                });
            }

            if (!result.canceled) {
                const imageUri = result.assets[0].uri; 
                onImageSelect(imageUri);
            }

        } catch (error) {
            console.error("Error al seleccionar la imagen:", error);
            Alert.alert("Error", "Ocurrió un error al intentar acceder a la fuente de la imagen.");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={[styles.sectionTitle, { color: primaryTextColor }]}>Agregar Imagen</Text>
            {selectedImage ? (
                // Contenedor simplificado, eliminando la sección imageControls
                <View style={styles.imagePreviewContainer}>
                    <TouchableOpacity onPress={() => setShowModal(true)} style={styles.imageReplaceArea}>
                        <Image
                            source={{ uri: selectedImage.uri }}
                            style={styles.selectedImageFull} // Nuevo estilo para imagen más grande (opcional)
                        />
                        <View style={styles.replaceOverlay}>
                            <Ionicons name="camera-reverse-outline" size={30} color="#fff" />
                            <Text style={styles.replaceText}>Toca para Reemplazar</Text>
                        </View>
                    </TouchableOpacity>
                    <View style={styles.imageInfoBar}>
                        <Text style={[styles.imagePreviewText, { color: primaryTextColor }]}>Imagen seleccionada</Text>
                        {/* Botón de eliminar conservado */}
                        <TouchableOpacity onPress={onImageRemove} style={[styles.removeButton, { backgroundColor: removeButtonBg }]}>
                            <Ionicons name="trash" size={20} color={removeButtonColor} />
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <TouchableOpacity
                    style={[styles.dashedBorderContainer, { borderColor: dashBorderColor }]}
                    onPress={() => setShowModal(true)}
                >
                    <Ionicons name="image-outline" size={40} color={placeholderTextColor} />
                    <Text style={[styles.dashedBorderText, { color: placeholderTextColor }]}>
                        Toca para agregar imagen{"\n"}JPG, PNG. Máx 5MB
                    </Text>
                </TouchableOpacity>
            )}

            <Modal
                animationType="slide"
                transparent={true}
                visible={showModal}
                onRequestClose={() => setShowModal(false)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setShowModal(false)}>
                    <View style={[styles.modalContainer, { backgroundColor: modalBgColor }]} onTouchStart={(e) => e.stopPropagation()}>
                        <View style={styles.modalHandle} />
                        <Text style={[styles.modalTitle, { color: primaryTextColor }]}>Seleccionar imagen</Text>
                        
                        <TouchableOpacity
                            style={[styles.modalButton, { backgroundColor: modalButtonBg }]}
                            onPress={() => handleSelectSource('camera')}
                        >
                            <View style={[styles.modalButtonIcon, { backgroundColor: '#0056b3' }]}>
                                <Ionicons name="camera" size={24} color="#fff" />
                            </View>
                            <View>
                                <Text style={[styles.modalButtonText, { color: primaryTextColor }]}>Tomar foto</Text>
                                <Text style={[styles.modalButtonSubText, { color: placeholderTextColor }]}>Usar la cámara</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.modalButton, { backgroundColor: modalButtonBg }]}
                            onPress={() => handleSelectSource('gallery')}
                        >
                            <View style={[styles.modalButtonIcon, { backgroundColor: '#6f42c1' }]}>
                                <Ionicons name="images" size={24} color="#fff" />
                            </View>
                            <View>
                                <Text style={[styles.modalButtonText, { color: primaryTextColor }]}>Desde galería</Text>
                                <Text style={[styles.modalButtonSubText, { color: placeholderTextColor }]}>Seleccionar imagen existente</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.modalCancelButton}
                            onPress={() => setShowModal(false)}
                        >
                            <Text style={[styles.modalCancelText, { color: placeholderTextColor }]}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 15,
        textAlign: 'center',
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
    imagePreviewContainer: {
        width: '100%',
        alignItems: 'center',
    },
    // Estilo para envolver la imagen y hacerla más visible, también funciona como área para reemplazar
    imageReplaceArea: {
        width: '100%',
        aspectRatio: 1.5, // Proporción común (e.g., 4:3)
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 15,
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedImageFull: {
        width: '100%',
        height: '100%',
    },
    replaceOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    replaceText: {
        color: '#fff',
        fontWeight: 'bold',
        marginTop: 5,
    },
    imageInfoBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 5,
        marginBottom: 10,
    },
    imagePreviewText: {
        flex: 1,
        fontWeight: '500',
        fontSize: 16,
    },
    removeButton: {
        padding: 8, // Aumentado para un mejor toque
        borderRadius: 25,
        borderWidth: 1,
        borderColor: 'red',
    },
    // Se eliminan los estilos no utilizados:
    // imageControls: { ... },
    // controlButton: { ... },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        width: width,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        paddingBottom: 40,
    },
    modalHandle: {
        width: 40,
        height: 4,
        backgroundColor: '#ccc',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    modalButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    modalButtonIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    modalButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    modalButtonSubText: {
        fontSize: 12,
        marginTop: 4,
    },
    modalCancelButton: {
        padding: 16,
        alignItems: 'center',
        borderRadius: 12,
        marginTop: 8,
    },
    modalCancelText: {
        fontSize: 16,
        fontWeight: '500',
    },
});


export default ImageSection;