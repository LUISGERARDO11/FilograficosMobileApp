// utils/modelAdjustments.ts

// --- Tipos de Props de Ajuste ---
export type ModelAdjustment = {
    modelId: number;
    scaleFactor?: number; 
    positionX?: number; 
    positionY?: number; 
    positionZ?: number; 
    rotationX?: number; 
    rotationY?: number; 
    rotationZ?: number; 
    scaleX?: number; 
    scaleY?: number; 
    scaleZ?: number; 
}

// --- Configuración de Ajustes por Modelo ---
// Aquí defines los ajustes para los modelos que no se visualizan bien.
export const MODEL_ADJUSTMENTS: ModelAdjustment[] = [
    { modelId: 1,
      scaleFactor: 3,
      positionX: 0, positionY: 0, positionZ: 0, 
      rotationX: 0, rotationY: 0 , rotationZ:0
    }, 
    { modelId: 3,
      scaleFactor: 2,
      positionX: 0, positionY: -0.5, positionZ: 0, 
      rotationX: 0, rotationY: 1.8 , rotationZ:0
    }, 
    { modelId: 4,
      scaleFactor: 3,
      positionX: 0, positionY: -7,positionZ: -1
    }, 
    // ✨ Configuración para el Modelo 5 (Vaso)
    { modelId: 5, 
      scaleFactor: 1.5, // Ya definida, la mantenemos
      positionX:-1, positionY: -0.5, positionZ:0.3, // Ya definida, la mantenemos
      rotationX: 0, rotationY:-0.3 , rotationZ:0
    },
];

export const MODEL_ADJUSTMENTS_PERSONALIZATION: ModelAdjustment[] = [
    { modelId: 1,
      scaleFactor: 1,
      positionX: 0, positionY: 0, positionZ: 0, 
      rotationX: 0, rotationY: 0 , rotationZ:0
    }, 
    { modelId: 3,
      scaleFactor: 2,
      positionX: 0, positionY: -0.5, positionZ: 0, 
      rotationX: 0, rotationY: 1.8 , rotationZ:0
    }, 
    { modelId: 4,
      scaleFactor: 3,
      positionX: 0, positionY: -7,positionZ: -1
    }, 
    // ✨ Configuración para el Modelo 5 (Vaso)
    { modelId: 5, 
      scaleFactor: 1, // Ya definida, la mantenemos
      positionX:0, positionY: -0.1, positionZ:-2, // Ya definida, la mantenemos
      rotationX: 0, rotationY:-0.3 , rotationZ:0
    },
];


/**
 * Obtiene los ajustes de transformación para un ID de modelo dado.
 */
export const getAdjustmentByModelId = (id: number): ModelAdjustment | undefined => {
    return MODEL_ADJUSTMENTS.find(a => a.modelId === id);
};

export const getAdjustmenPersonalizationtByModelId = (id: number): ModelAdjustment | undefined => {
    // ✨ CORRECCIÓN CLAVE: Debes retornar los valores de la lista de PERSONALIZACIÓN.
    // Además, aseguramos que si no hay configuración específica, no aplicamos nada.
    return MODEL_ADJUSTMENTS_PERSONALIZATION.find(a => a.modelId === id);
};