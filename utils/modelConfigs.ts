import * as THREE from 'three';
// ✨ Importar la función de utilidad
import { generateCylindricalUVs } from './modelUtils';

// --- Tipos para la Configuración de Personalización ---
export type ModelPersonalizationConfig = {
    modelId: number;
    // Nombre del objeto Mesh en el archivo GLTF al que se aplicará la textura/UVs
    targetMeshName: string; 
    
    // Función opcional para generar UVs personalizados
    uvGenerator?: (geometry: THREE.BufferGeometry) => void; 
    
    // Ajustes del texto (por si un modelo necesita un offset de texto distinto)
    textPosition?: [number, number, number]; // [x, y, z]
    textRotation?: [number, number, number]; // [x, y, z]
    
    // Ajuste de escala para el texto si es necesario (ej: el modelo es grande)
    textScaleFactor?: number; 
};

// --- Configuraciones Específicas por Modelo ---
export const MODEL_PERSONALIZATION_CONFIGS: ModelPersonalizationConfig[] = [
    // 1. CONFIGURACIÓN DEL MODELO 1 (MANTENIENDO LA COMPATIBILIDAD)
    {
        modelId: 1, 
        targetMeshName: 'Cylinder_0', 
        uvGenerator: generateCylindricalUVs, // ✨ Asignamos la función de UVs
        textPosition: [0, 0.4, 0],
        textRotation: [0, 0, 0],
    },
    // 2. CONFIGURACIÓN DEL MODELO 5 (NUEVO VASO)
    {
        modelId: 5, 
        // ✨ CORRECCIÓN: Cambiamos 'Object_0' por el nombre real encontrado en los logs
        targetMeshName: 'Object_2', 
        uvGenerator: generateCylindricalUVs, 
        
        textPosition: [0, 0, 0], 
        textRotation: [0, 0, 0],
        textScaleFactor: 1.0, 
    },
    // Añade más configuraciones aquí
];

/**
 * Obtiene la configuración de personalización para un ID de modelo dado.
 * @param id El ID numérico del modelo.
 * @returns La configuración específica o undefined.
 */
export const getConfigByModelId = (id: number): ModelPersonalizationConfig | undefined => {
    return MODEL_PERSONALIZATION_CONFIGS.find(config => config.modelId === id);
};