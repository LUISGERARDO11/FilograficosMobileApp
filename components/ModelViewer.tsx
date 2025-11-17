import { Text as DreiText, OrbitControls } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import { Asset } from 'expo-asset';
import ExpoTHREE from 'expo-three';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    View,
} from 'react-native';
// ✨ Importar TRES para usar Box3, Vector3 y consts.
import * as THREE from 'three';
import { MeshStandardMaterial, Texture } from 'three';
import { GLTFLoader } from 'three-stdlib';
import { useThemeColor } from '../hooks/use-theme-color';
import { getAdjustmenPersonalizationtByModelId } from '../utils/modelAdjustments';
import { getConfigByModelId, ModelPersonalizationConfig } from '../utils/modelConfigs';
import { TextData } from '../utils/types';

interface ModelViewerProps {
    modelUrl: string;
    textData: TextData;
    selectedImage: { uri: string } | null;
    modelId: number;
}

interface SceneProps {
    gltf: any;
    textData: TextData;
    texture: Texture | null;
    modelId: number;
}


// --- Componente que Maneja la Normalización, Ajustes y Personalización ---
const PersonalizationScene = React.memo(({ gltf, textData, texture, modelId }: SceneProps) => {
    const { scene } = useThree();
    const materialRef = useRef<MeshStandardMaterial | null>(null);
    
    // Obtener configuración de personalización (Mesh Name, Text Position)
    const config: ModelPersonalizationConfig | undefined = useMemo(() => getConfigByModelId(modelId), [modelId]);

    // 💡 Paso 1: Clonar el GLTF y aplicar Normalización + Ajustes de Posición/Escala
    const adjustedScene = useMemo(() => {
        if (!gltf) return null;

        const clonedScene = gltf.scene.clone();

        // 1. OBTENER AJUSTES DE TRANSFORMACIÓN DE LA FASE 2
        const adjustment = getAdjustmenPersonalizationtByModelId(modelId);
        const {
            scaleFactor = 1,
            positionX = 0, positionY = 0, positionZ = 0,
            rotationX = 0, rotationY = 0, rotationZ = 0,
        } = adjustment || {};

        // --- 1. NORMALIZACIÓN Y CENTRADO AUTOMÁTICO (CLAVE) ---
        const box = new THREE.Box3().setFromObject(clonedScene);
        const size = box.getSize(new THREE.Vector3());
        // Normaliza el modelo para que el lado más largo sea un tamaño manejable (ej: 2 unidades)
        const maxDim = Math.max(size.x, size.y, size.z);
        const scaleN = (1 / maxDim) * 2; 
        
        clonedScene.scale.set(scaleN, scaleN, scaleN);
        
        // Recalcular el centro después de la escala de normalización
        const newBox = new THREE.Box3().setFromObject(clonedScene);
        const newCenter = newBox.getCenter(new THREE.Vector3());
        
        // Aplicar el centrado al origen (0,0,0) y luego el offset manual
        clonedScene.position.x += -newCenter.x + positionX;
        clonedScene.position.y += -newCenter.y + positionY;
        clonedScene.position.z += -newCenter.z + positionZ;

        // --- 2. AJUSTES FINOS (MANUALES) ---
        clonedScene.scale.multiplyScalar(scaleFactor);
        clonedScene.rotation.set(rotationX, rotationY, rotationZ); 

        console.log(`✨ Modelo ID ${modelId} (Fase 2) - Ajustes aplicados:
            Posición: [${clonedScene.position.x.toFixed(2)}, ${clonedScene.position.y.toFixed(2)}, ${clonedScene.position.z.toFixed(2)}]
            Escala Total: ${clonedScene.scale.x.toFixed(2)} (Normalizado * ${scaleFactor})
        `);

        return clonedScene;
    }, [gltf, modelId]); 

    // 💡 Paso 2: Aplicar Textura y Material a la Malla Objetivo
    useEffect(() => {
        if (!adjustedScene || !config) {
            console.log(`⚠️ No se encontró configuración para Modelo ID: ${modelId}`);
            return;
        }

        adjustedScene.traverse((object: any) => {
            // Usamos config.targetMeshName para encontrar el objeto
            if (object.isMesh && object.name === config.targetMeshName) {
                console.log(`🎯 Encontrado objeto objetivo: ${config.targetMeshName}`);

                // Generar UVs usando el generador de la configuración si es necesario
                if (config.uvGenerator && !object.geometry?.attributes?.uv) {  
                    console.log('⚙️ Generando UVs personalizados (desde config)...');
                    config.uvGenerator(object.geometry); 
                    console.log('✅ UVs generados');
                } 

                // Crear o reemplazar material 
                if (!materialRef.current || !(object.material instanceof MeshStandardMaterial)) {
                    const initialColor = object.material?.color || 0xffffff;
                    materialRef.current = new MeshStandardMaterial({ 
                        color: initialColor,
                        metalness: 0.1,
                        roughness: 0.8,
                        side: THREE.DoubleSide // Usar THREE.DoubleSide
                    });
                    object.material = materialRef.current;
                    console.log('🛠️ Material reemplazado a MeshStandardMaterial');
                }

                // Aplicar textura
                if (texture && materialRef.current) {
                    materialRef.current.map = texture;
                    materialRef.current.needsUpdate = true;
                    materialRef.current.color.setHex(0xffffff); // El color blanco permite que la textura se vea correctamente
                    console.log('✅ Textura aplicada al modelo');
                } else if (!texture && materialRef.current) {
                    // Remover textura
                    materialRef.current.map = null;
                    materialRef.current.color.setHex(0xffffff); 
                    materialRef.current.needsUpdate = true;
                    console.log('✅ Textura removida');
                }
            }
        });
    }, [adjustedScene, texture, modelId, config]); 

    // 💡 Paso 3: Renderizar Texto (Usando config)
    const textContent = textData.text.trim();
    const showText = textContent.length > 0;
    
    // Usar la configuración para la posición y escala del texto
    const textPosition = config?.textPosition || [0, 0.4, 0];
    const textRotation = config?.textRotation || [0, 0, 0];
    const textScaleFactor = config?.textScaleFactor || 1;
    const finalFontSize = (textData.size / 100) * textScaleFactor;

    if (!adjustedScene) return null;

    return (
        <>
            <primitive object={adjustedScene} />
            
            {showText && (
                <DreiText
                    position={textPosition as [number, number, number]}
                    rotation={textRotation as [number, number, number]}
                    fontSize={finalFontSize}
                    color={textData.color}
                    anchorX="center"
                    anchorY="middle"
                    depthOffset={0.01}
                >
                    {textContent}
                    <meshBasicMaterial color={textData.color} />
                </DreiText>
            )}
        </>
    );
});

PersonalizationScene.displayName = 'PersonalizationScene';


// Componente principal ModelViewer
const ModelViewer = ({ modelUrl, textData, selectedImage, modelId }: ModelViewerProps) => {
    const loadingColor = useThemeColor({ light: '#0056b3', dark: '#007bff' }, 'tint');
    const [localUri, setLocalUri] = useState<string | null>(null);
    const [gltf, setGltf] = useState<any | null>(null);
    const [texture, setTexture] = useState<Texture | null>(null);
    const [loadingError, setLoadingError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Cargar el modelo 3D (similar a tu código original)
    useEffect(() => {
        let isCancelled = false;
        // Reiniciamos gltf y estado al cambiar la URL del modelo
        setGltf(null); 

        const loadAsset = async () => {
            setIsLoading(true);
            setLocalUri(null);
            setLoadingError(null);
            
            try {
                const asset = Asset.fromURI(modelUrl);
                await asset.downloadAsync();

                if (!isCancelled && asset.localUri) {
                    setLocalUri(asset.localUri);
                    
                    const loader = new GLTFLoader();
                    loader.load(
                        asset.localUri,
                        (loadedGltf: any) => {
                            if (!isCancelled) {
                                setGltf(loadedGltf);
                                setIsLoading(false);
                            }
                        },
                        undefined,
                        (err: any) => {
                            if (!isCancelled) {
                                console.error('❌ Error cargando GLTF:', err);
                                setLoadingError(err.message);
                                setIsLoading(false);
                            }
                        }
                    );
                }
            } catch (e: any) {
                console.error('❌ Error descargando modelo:', e);
                if (!isCancelled) {
                    setLoadingError(e.message || 'Error desconocido');
                    setIsLoading(false);
                }
            }
        };

        if (modelUrl) {
            loadAsset();
        }

        return () => {
            isCancelled = true;
        };
    }, [modelUrl]);

    // Cargar la textura (igual a tu código original)
    useEffect(() => {
        let isCancelled = false;

        const loadTexture = async () => {
            if (!selectedImage?.uri) {
                setTexture(null);
                return;
            }

            try {
                const imageAsset = Asset.fromURI(selectedImage.uri);
                await imageAsset.downloadAsync();
                
                const loadedTexture = await ExpoTHREE.loadTextureAsync({ asset: imageAsset });

                if (!isCancelled && loadedTexture) {
                    loadedTexture.flipY = false;
                    loadedTexture.needsUpdate = true;
                    
                    loadedTexture.wrapS = THREE.ClampToEdgeWrapping;
                    loadedTexture.wrapT = THREE.ClampToEdgeWrapping;
                    
                    loadedTexture.minFilter = THREE.LinearFilter;
                    loadedTexture.magFilter = THREE.LinearFilter;
                    
                    setTexture(loadedTexture);
                }
            } catch (error) {
                console.error('❌ Error cargando textura:', error);
                if (!isCancelled) setTexture(null);
            }
        };

        loadTexture();

        return () => {
            isCancelled = true;
        };
    }, [selectedImage?.uri]);

    // Usar la posición de la cámara del Canvas estándar
    const canvasConfig = useMemo(() => ({
        // Posición de la cámara por defecto
        camera: { position: [0, 0, 3] as [number, number, number], fov: 50 }, 
        gl: { 
            antialias: true,
            alpha: true 
        }
    }), []);


    if (loadingError) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <Text style={[styles.loadingText, { color: '#dc3545' }]}>
                    Error: {loadingError}
                </Text>
            </View>
        );
    }

    if (isLoading || !gltf) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="large" color={loadingColor} />
                <Text style={[styles.loadingText, { color: loadingColor }]}>
                    Cargando modelo 3D...
                </Text>
            </View>
        );
    }

    console.log('🎨 Renderizando Canvas de Personalización');

    return (
        <View style={styles.container}>
            <Canvas {...canvasConfig}>
                {/* Controles de Órbita */}
                <OrbitControls
                    enablePan={false}
                    enableZoom={true}
                    minPolarAngle={Math.PI / 4}
                    maxPolarAngle={Math.PI / 2}
                />
                
                {/* Iluminación */}
                <ambientLight intensity={1.5} />
                <directionalLight position={[10, 10, 5]} intensity={3} />
                <pointLight position={[-10, -10, -5]} intensity={0.5} />
                
                {/* Renderizar la escena con la lógica de normalización y personalización */}
                <PersonalizationScene
                    gltf={gltf}
                    textData={textData}
                    texture={texture}
                    modelId={modelId}
                />

            </Canvas>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 250,
        borderRadius: 10,
        overflow: 'hidden',
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 14,
        textAlign: 'center',
    },
});

export default React.memo(ModelViewer);