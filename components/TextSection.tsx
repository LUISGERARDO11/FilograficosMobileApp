// components/TextSection.tsx

import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useThemeColor } from '../hooks/use-theme-color';

// Definición de tipos para los datos del texto
export interface TextData {
    text: string;
    color: string;
    size: number;
    fontWeight: 'normal' | 'bold';
    fontStyle: 'normal' | 'italic';
}

interface TextSectionProps {
    textData: TextData;
    onTextChange: (newTextData: TextData) => void;
}

const MAX_LENGTH = 50;
const INITIAL_COLORS = [
    '#000000', '#FFFFFF', '#FF0000', '#0000FF', '#008000', '#FFA500',
    '#800080', '#00FFFF', '#A52A2A', '#808080',
];

const TextSection: React.FC<TextSectionProps> = ({ textData, onTextChange }) => {
    const primaryTextColor = useThemeColor({ light: '#333', dark: '#eee' }, 'text');
    const secondaryTextColor = useThemeColor({ light: '#888', dark: '#bbb' }, 'icon');
    const inputBorderColor = useThemeColor({ light: '#ddd', dark: '#444' }, 'tabIconDefault');
    const sliderTintColor = useThemeColor({ light: '#0056b3', dark: '#007bff' }, 'tint');
    const buttonBgColor = useThemeColor({ light: '#f0f0f0', dark: '#444' }, 'tabIconDefault');
    const buttonActiveBgColor = useThemeColor({ light: '#0056b3', dark: '#007bff' }, 'tint');
    const buttonActiveTextColor = useThemeColor({ light: '#fff', dark: '#fff' }, 'text');
    const previewBgColor = useThemeColor({ light: '#f9f9f9', dark: '#333' }, 'background');
    const dashedBorderColor = useThemeColor({ light: '#99badd', dark: '#6699cc' }, 'tint');


    // Handlers para actualizar el estado en el componente padre
    const updateTextData = (key: keyof TextData, value: any) => {
        onTextChange({ ...textData, [key]: value });
    };

    const toggleFontWeight = () => {
        updateTextData('fontWeight', textData.fontWeight === 'bold' ? 'normal' : 'bold');
    };

    const toggleFontStyle = () => {
        updateTextData('fontStyle', textData.fontStyle === 'italic' ? 'normal' : 'italic');
    };

    return (
        <ScrollView style={styles.scrollContent}>
            <Text style={[styles.sectionTitle, { color: primaryTextColor }]}>Agregar Texto</Text>

            {/* Input de Texto */}
            <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: primaryTextColor }]}>Tu texto</Text>
                <TextInput
                    value={textData.text}
                    onChangeText={(text) => updateTextData('text', text)}
                    placeholder="Escribe tu texto aquí..."
                    placeholderTextColor={secondaryTextColor}
                    multiline
                    maxLength={MAX_LENGTH}
                    style={[
                        styles.textInput,
                        { borderColor: inputBorderColor, color: primaryTextColor, backgroundColor: buttonBgColor }
                    ]}
                />
                <Text style={[styles.charCount, { color: secondaryTextColor }]}>
                    {textData.text.length}/{MAX_LENGTH} caracteres
                </Text>
            </View>

            {/* Tamaño de Fuente */}
            <View style={styles.controlGroup}>
                <Text style={[styles.label, { color: primaryTextColor }]}>
                    Tamaño de fuente: {textData.size}px
                </Text>
                <Slider
                    style={styles.slider}
                    minimumValue={12}
                    maximumValue={48}
                    step={1}
                    value={textData.size}
                    onValueChange={(value) => updateTextData('size', value)}
                    minimumTrackTintColor={sliderTintColor}
                    maximumTrackTintColor={inputBorderColor}
                    thumbTintColor={sliderTintColor}
                />
                <View style={styles.sliderLabels}>
                    <Text style={{ color: secondaryTextColor }}>Pequeño</Text>
                    <Text style={{ color: secondaryTextColor }}>Grande</Text>
                </View>
            </View>

            {/* Color del Texto */}
            <View style={styles.controlGroup}>
                <Text style={[styles.label, { color: primaryTextColor, marginBottom: 10 }]}>
                    Color del texto
                </Text>
                <View style={styles.colorPalette}>
                    {INITIAL_COLORS.map((color) => (
                        <TouchableOpacity
                            key={color}
                            onPress={() => updateTextData('color', color)}
                            style={[
                                styles.colorOption,
                                { backgroundColor: color, borderColor: textData.color === color ? sliderTintColor : inputBorderColor, borderWidth: textData.color === color ? 3 : 1 },
                                color === '#FFFFFF' && { borderWidth: 1 } // Borde para el blanco
                            ]}
                        >
                            {textData.color === color && (
                                <Ionicons name="checkmark-circle-sharp" size={24} color={color === '#FFFFFF' || color === '#FFFF00' ? '#000' : '#fff'} style={styles.checkIcon} />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
                <Text style={[styles.charCount, { color: secondaryTextColor, marginTop: 10 }]}>
                    Color seleccionado: {textData.color.toUpperCase()}
                </Text>
            </View>

            {/* Estilo de Texto */}
            <View style={styles.controlGroup}>
                <Text style={[styles.label, { color: primaryTextColor }]}>Estilo de texto</Text>
                <View style={styles.styleButtonsContainer}>
                    {/* Negrita */}
                    <TouchableOpacity
                        onPress={toggleFontWeight}
                        style={[
                            styles.styleButton,
                            { 
                                backgroundColor: textData.fontWeight === 'bold' ? buttonActiveBgColor : buttonBgColor 
                            }
                        ]}
                    >
                        <Text style={[
                            styles.styleButtonText,
                            {
                                fontWeight: 'bold',
                                color: textData.fontWeight === 'bold' ? buttonActiveTextColor : primaryTextColor
                            }
                        ]}>
                            Negrita
                        </Text>
                    </TouchableOpacity>
                    {/* Cursiva */}
                    <TouchableOpacity
                        onPress={toggleFontStyle}
                        style={[
                            styles.styleButton,
                            { 
                                backgroundColor: textData.fontStyle === 'italic' ? buttonActiveBgColor : buttonBgColor 
                            }
                        ]}
                    >
                        <Text style={[
                            styles.styleButtonText,
                            {
                                fontStyle: 'italic',
                                color: textData.fontStyle === 'italic' ? buttonActiveTextColor : primaryTextColor
                            }
                        ]}>
                            Cursiva
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Vista Previa del Texto */}
            {textData.text.length > 0 && (
                <View style={[styles.previewContainer, { borderColor: dashedBorderColor }]}>
                    <Text style={[styles.label, { color: primaryTextColor }]}>Vista previa:</Text>
                    <View style={[styles.previewBox, { backgroundColor: previewBgColor }]}>
                        <Text
                            style={{
                                color: textData.color,
                                fontSize: textData.size,
                                fontWeight: textData.fontWeight,
                                fontStyle: textData.fontStyle,
                                textAlign: 'center',
                            }}
                        >
                            {textData.text}
                        </Text>
                    </View>
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollContent: {
        paddingVertical: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 15,
        textAlign: 'center',
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
    },
    textInput: {
        minHeight: 80,
        padding: 15,
        borderRadius: 10,
        borderWidth: 1,
        textAlignVertical: 'top',
        fontSize: 16,
    },
    charCount: {
        fontSize: 12,
        marginTop: 5,
        textAlign: 'right',
    },
    controlGroup: {
        marginBottom: 20,
    },
    slider: {
        width: '100%',
        height: 40,
    },
    sliderLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: -5,
    },
    colorPalette: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
    },
    colorOption: {
        width: 38,
        height: 38,
        borderRadius: 8,
        marginRight: 12,
        marginBottom: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkIcon: {
        position: 'absolute',
    },
    styleButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    styleButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 5,
    },
    styleButtonText: {
        fontSize: 16,
    },
    previewContainer: {
        padding: 15,
        borderRadius: 10,
        borderWidth: 2,
        borderStyle: 'dashed',
        marginTop: 10,
    },
    previewBox: {
        padding: 15,
        borderRadius: 8,
    }
});

export default TextSection;