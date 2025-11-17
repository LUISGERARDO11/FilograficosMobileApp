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
import { BufferAttribute, BufferGeometry, MeshStandardMaterial, Texture, Vector3 } from 'three';
import { GLTFLoader } from 'three-stdlib';
import { useThemeColor } from '../hooks/use-theme-color';
import { TextData } from '../utils/types';

interface ModelViewerProps {
    modelUrl: string;
    textData: TextData;
    selectedImage: { uri: string } | null;
}

interface SceneProps {
    gltf: any;
    textData: TextData;
    texture: Texture | null;
}

// Función para generar UVs cilíndricos
const generateCylindricalUVs = (geometry: BufferGeometry) => {
    const pos = geometry.attributes.position;
    const uvs: number[] = [];

    // Encontrar el centro y la altura del modelo
    const center = new Vector3();
    geometry.computeBoundingBox();
    const bbox = geometry.boundingBox!;
    center.x = (bbox.min.x + bbox.max.x) / 2;
    center.y = (bbox.min.y + bbox.max.y) / 2;
    center.z = (bbox.min.z + bbox.max.z) / 2;
    
    const height = bbox.max.y - bbox.min.y;

    // Generar coordenadas UV para cada vértice
    for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i) - center.x;
        const y = pos.getY(i);
        const z = pos.getZ(i) - center.z;

        // UV horizontal (u): basado en el ángulo alrededor del eje Y
        const u = 0.5 + Math.atan2(z, x) / (2 * Math.PI);
        
        // UV vertical (v): basado en la altura
        const v = (y - bbox.min.y) / height;

        uvs.push(u, v);
    }

    // Asignar los UVs a la geometría
    geometry.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2));
    geometry.attributes.uv.needsUpdate = true;
};

// Componente para cargar el modelo GLB - OPTIMIZADO
const ModelAsset = React.memo(({ localUri }: { localUri: string }) => {
    const [gltf, setGltf] = useState<any | null>(null);
    const [error, setError] = useState<string | null>(null);
    const loadedRef = useRef(false);

    useEffect(() => {
        // Evitar recargas múltiples
        if (loadedRef.current) return;

        const loader = new GLTFLoader();
        console.log('🔄 Iniciando carga del modelo GLB:', localUri);
        
        loader.load(
            localUri,
            (loadedGltf: any) => {
                console.log('✅ Modelo GLB cargado exitosamente');
                loadedRef.current = true;
                setGltf(loadedGltf);
            },
            undefined,
            (err: any) => {
                console.error('❌ Error cargando GLB:', err);
                setError(err.message || 'Error desconocido');
            }
        );

        return () => {
            // Cleanup si el componente se desmonta
            if (gltf?.scene) {
                gltf.scene.traverse((child: any) => {
                    if (child.geometry) child.geometry.dispose();
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach((m: any) => m.dispose());
                        } else {
                            child.material.dispose();
                        }
                    }
                });
            }
        };
    }, [localUri]); // Solo depende de localUri

    if (error) {
        console.error('❌ Error en ModelAsset:', error);
        return null;
    }

    if (!gltf) {
        return null;
    }

    return <primitive object={gltf.scene} scale={[1, 1, 1]} />;
});

ModelAsset.displayName = 'ModelAsset';

// Componente de personalización - SIN re-renderizados innecesarios
const SceneContent = React.memo(({ gltf, textData, texture }: SceneProps) => {
    const { scene } = useThree();
    const appliedRef = useRef(false);
    const materialRef = useRef<MeshStandardMaterial | null>(null);

    useEffect(() => {
        if (!gltf) return;

        console.log('🔄 Aplicando personalización al modelo...');
        
        scene.traverse((object: any) => {
            if (object.isMesh && object.name === 'Cylinder_0') {
                console.log('🎯 Encontrado objeto objetivo: Cylinder_0');

                // GENERAR UVs CILÍNDRICOS si no existen
                if (!object.geometry?.attributes?.uv) {
                    console.log('⚙️ Generando UVs cilíndricos automáticamente...');
                    generateCylindricalUVs(object.geometry);
                    console.log('✅ UVs generados');
                }

                // Crear o reemplazar material
                if (!materialRef.current || !(object.material instanceof MeshStandardMaterial)) {
                    const initialColor = object.material?.color || 0xffffff;
                    materialRef.current = new MeshStandardMaterial({ 
                        color: initialColor,
                        metalness: 0.1,
                        roughness: 0.8,
                        side: 2 // DoubleSide
                    });
                    object.material = materialRef.current;
                    console.log('🛠️ Material reemplazado a MeshStandardMaterial');
                }

                // Aplicar textura
                if (texture && materialRef.current) {
                    console.log('🖼️ Aplicando textura al material...');
                    materialRef.current.map = texture;
                    materialRef.current.needsUpdate = true;
                    materialRef.current.color.setHex(0xffffff);
                    
                    console.log('✅ Textura aplicada al modelo');
                } else if (!texture && materialRef.current) {
                    materialRef.current.map = null;
                    materialRef.current.color.setHex(0xffffff);
                    materialRef.current.needsUpdate = true;
                    console.log('✅ Textura removida');
                }

                appliedRef.current = true;
            }
        });
    }, [scene, gltf, texture]);

    const textContent = textData.text.trim();
    const showText = textContent.length > 0;

    return (
        <>
            {gltf && <primitive object={gltf.scene} />}
            
            {showText && (
                <DreiText
                    position={[0, 0.4, 0]}
                    rotation={[0, 0, 0]}
                    fontSize={textData.size / 100}
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

SceneContent.displayName = 'SceneContent';

// Componente principal ModelViewer
const ModelViewer = ({ modelUrl, textData, selectedImage }: ModelViewerProps) => {
    const loadingColor = useThemeColor({ light: '#0056b3', dark: '#007bff' }, 'tint');
    const [localUri, setLocalUri] = useState<string | null>(null);
    const [gltf, setGltf] = useState<any | null>(null);
    const [texture, setTexture] = useState<Texture | null>(null);
    const [loadingError, setLoadingError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Cargar el modelo 3D
    useEffect(() => {
        let isCancelled = false;

        const loadAsset = async () => {
            setIsLoading(true);
            setLocalUri(null);
            setLoadingError(null);

            console.log('⏳ Descargando modelo:', modelUrl);
            
            try {
                const asset = Asset.fromURI(modelUrl);
                await asset.downloadAsync();

                if (!isCancelled && asset.localUri) {
                    setLocalUri(asset.localUri);
                    console.log('✅ Modelo descargado:', asset.localUri);
                    
                    // Cargar el GLTF
                    const loader = new GLTFLoader();
                    loader.load(
                        asset.localUri,
                        (loadedGltf: any) => {
                            if (!isCancelled) {
                                console.log('✅ GLTF cargado');
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

    // Cargar la textura
    useEffect(() => {
        let isCancelled = false;

        const loadTexture = async () => {
            if (!selectedImage?.uri) {
                setTexture(null);
                return;
            }

            console.log('🖼️ Cargando textura:', selectedImage.uri);

            try {
                const imageAsset = Asset.fromURI(selectedImage.uri);
                await imageAsset.downloadAsync();
                
                const loadedTexture = await ExpoTHREE.loadTextureAsync({ 
                    asset: imageAsset 
                });

                if (!isCancelled && loadedTexture) {
                    // Configuración crítica de la textura
                    loadedTexture.flipY = false;
                    loadedTexture.needsUpdate = true;
                    
                    // Importar THREE para usar las constantes
                    const THREE = require('three');
                    
                    // Configurar el wrapping para que la textura se repita/ajuste correctamente
                    loadedTexture.wrapS = THREE.ClampToEdgeWrapping;
                    loadedTexture.wrapT = THREE.ClampToEdgeWrapping;
                    
                    // Configurar el filtrado para mejor calidad
                    loadedTexture.minFilter = THREE.LinearFilter;
                    loadedTexture.magFilter = THREE.LinearFilter;
                    
                    setTexture(loadedTexture);
                    console.log('✅ Textura cargada y configurada');
                    console.log('   - Dimensiones:', loadedTexture.image?.width, 'x', loadedTexture.image?.height);
                }
            } catch (error) {
                console.error('❌ Error cargando textura:', error);
                if (!isCancelled) {
                    setTexture(null);
                }
            }
        };

        loadTexture();

        return () => {
            isCancelled = true;
        };
    }, [selectedImage?.uri]);

    // Memorizar la configuración del Canvas para evitar re-renders
    const canvasConfig = useMemo(() => ({
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

    console.log('🎨 Renderizando Canvas');

    return (
        <View style={styles.container}>
            <Canvas {...canvasConfig}>
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
                
                <SceneContent
                    gltf={gltf}
                    textData={textData}
                    texture={texture}
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