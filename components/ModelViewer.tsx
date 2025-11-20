import { Text as DreiText, OrbitControls } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import { Asset } from 'expo-asset';
import ExpoTHREE from 'expo-three';
import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { captureRef } from 'react-native-view-shot'; // ✨ IMPORTANTE
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

// Interfaz para las funciones que exponemos al padre
export interface ModelViewerHandle {
    captureSnapshot: () => Promise<string | null>;
}

// --- Componente PersonalizationScene (Sin Cambios Lógicos, solo lo incluimos por completitud) ---
const PersonalizationScene = React.memo(({ gltf, textData, texture, modelId }: SceneProps) => {
    const { scene } = useThree();
    const materialRef = useRef<MeshStandardMaterial | null>(null);
    
    const config: ModelPersonalizationConfig | undefined = useMemo(() => getConfigByModelId(modelId), [modelId]);

    const adjustedScene = useMemo(() => {
        if (!gltf) return null;
        const clonedScene = gltf.scene.clone();
        const adjustment = getAdjustmenPersonalizationtByModelId(modelId);
        const {
            scaleFactor = 1,
            positionX = 0, positionY = 0, positionZ = 0,
            rotationX = 0, rotationY = 0, rotationZ = 0,
        } = adjustment || {};

        const box = new THREE.Box3().setFromObject(clonedScene);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scaleN = (maxDim > 0) ? (1 / maxDim) * 2 : 1; 
        
        clonedScene.scale.set(scaleN, scaleN, scaleN);
        
        const newBox = new THREE.Box3().setFromObject(clonedScene);
        const newCenter = newBox.getCenter(new THREE.Vector3());
        
        clonedScene.position.x += -newCenter.x + positionX;
        clonedScene.position.y += -newCenter.y + positionY;
        clonedScene.position.z += -newCenter.z + positionZ;

        clonedScene.scale.multiplyScalar(scaleFactor);
        clonedScene.rotation.set(rotationX, rotationY, rotationZ); 

        return clonedScene;
    }, [gltf, modelId]); 

    useEffect(() => {
        if (!adjustedScene || !config) return;

        adjustedScene.traverse((object: any) => {
            if (object.isMesh && object.name === config.targetMeshName) {
                if (config.uvGenerator && !object.geometry?.attributes?.uv) { 
                    config.uvGenerator(object.geometry); 
                } 

                if (!materialRef.current || !(object.material instanceof MeshStandardMaterial)) {
                    materialRef.current = new MeshStandardMaterial({ 
                        color: 0xffffff,
                        metalness: 0.1,
                        roughness: 0.8,
                        side: THREE.DoubleSide
                    });
                    object.material = materialRef.current;
                }
                
                if (texture && materialRef.current) {
                    texture.wrapS = THREE.ClampToEdgeWrapping;
                    texture.wrapT = THREE.ClampToEdgeWrapping;
                    texture.minFilter = THREE.LinearFilter;
                    texture.magFilter = THREE.LinearFilter;
                    materialRef.current.map = texture;
                    materialRef.current.color.set(0xffffff);
                    materialRef.current.transparent = true;
                    materialRef.current.needsUpdate = true;
                } else if (!texture && materialRef.current) {
                    materialRef.current.map = null;
                    materialRef.current.color.setHex(0xffffff);
                    materialRef.current.needsUpdate = true;
                }
            }
        });
    }, [adjustedScene, texture, modelId, config]);

    const textContent = (textData.text || '').trim();
    const showText = textContent.length > 0;
    const textPosition = config?.textPosition || [0, 0.4, 0];
    const textRotation = config?.textRotation || [0, 0, 0];
    const textScaleFactor = config?.textScaleFactor || 1;
    const finalFontSize = (textData.size / 100) * textScaleFactor * 0.1; 
    const finalFontWeight = textData.fontWeight === 'bold' ? 700 : 400; 
    const finalFontStyle = textData.fontStyle === 'italic' ? 'italic' : 'normal';

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
                    fontWeight={finalFontWeight} 
                    fontStyle={finalFontStyle}    
                    anchorX="center"
                    anchorY="middle"
                    depthOffset={0.01}
                >
                    {textContent}
                </DreiText>
            )}
        </>
    );
});

PersonalizationScene.displayName = 'PersonalizationScene';

// --- Componente Principal ModelViewer con forwardRef ---
const ModelViewer = forwardRef<ModelViewerHandle, ModelViewerProps>(({ modelUrl, textData, selectedImage, modelId }, ref) => {
    const loadingColor = useThemeColor({ light: '#0056b3', dark: '#007bff' }, 'tint');
    const [localUri, setLocalUri] = useState<string | null>(null);
    const [gltf, setGltf] = useState<any | null>(null);
    const [texture, setTexture] = useState<Texture | null>(null);
    const [loadingError, setLoadingError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    // Referencia al contenedor que queremos capturar
    const viewShotRef = useRef<View>(null);

    // ✨ Exponer la función captureSnapshot al componente padre
    useImperativeHandle(ref, () => ({
        captureSnapshot: async () => {
            try {
                if (viewShotRef.current) {
                    // Capturamos la vista como PNG en base64 o archivo temporal
                    const uri = await captureRef(viewShotRef, {
                        format: "png",
                        quality: 1,
                        result: "tmpfile" // Devuelve ruta temporal del archivo
                    });
                    return uri;
                }
                return null;
            } catch (error) {
                console.error("Error al capturar snapshot:", error);
                return null;
            }
        }
    }));

    useEffect(() => {
        let isCancelled = false;
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
                                console.log('✅ GLTF cargado exitosamente.');
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
                if (!isCancelled) {
                    console.error('❌ Error descargando Asset:', e.message);
                    setLoadingError(e.message || 'Error desconocido');
                    setIsLoading(false);
                }
            }
        };

        if (modelUrl) loadAsset();
        return () => { isCancelled = true; };
    }, [modelUrl]);

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
                if (!isCancelled) setTexture(null);
            }
        };
        loadTexture();
        return () => { isCancelled = true; };
    }, [selectedImage?.uri]);

    const canvasConfig = useMemo(() => ({
        camera: { position: [0, 0, 3] as [number, number, number], fov: 50 }, 
        gl: { 
            antialias: true,
            alpha: true,
            // ✨ CLAVE: Esto evita que el canvas salga negro al tomar captura
            preserveDrawingBuffer: true 
        }
    }), []);


    if (loadingError) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <Text style={[styles.loadingText, { color: '#dc3545' }]}>Error: {loadingError}</Text>
            </View>
        );
    }

    if (isLoading || !gltf) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="large" color={loadingColor} />
                <Text style={[styles.loadingText, { color: loadingColor }]}>Cargando modelo 3D...</Text>
            </View>
        );
    }

    return (
        // ✨ Envolvemos en View con collapsable=false y la ref para ViewShot
        <View ref={viewShotRef} collapsable={false} style={styles.container}>
            <Canvas {...canvasConfig}>
                <OrbitControls
                    enablePan={false}
                    enableZoom={true}
                    minPolarAngle={Math.PI / 4}
                    maxPolarAngle={Math.PI / 2}
                />
                
                <ambientLight intensity={1.5} />
                <directionalLight position={[10, 10, 5]} intensity={3} />
                <pointLight position={[-10, -10, -5]} intensity={0.5} />
                
                <PersonalizationScene
                    gltf={gltf}
                    textData={textData}
                    texture={texture}
                    modelId={modelId}
                />
            </Canvas>
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: Dimensions.get('window').height * 0.55,
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: '#f0f0f0', // Fondo para que la captura no tenga fondo transparente negro
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

// Exportamos usando memo pero envolviendo el componente con forwardRef
export default React.memo(ModelViewer);