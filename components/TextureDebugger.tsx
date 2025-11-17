// Componente de diagnóstico para verificar UVs y texturas
// Colócalo temporalmente en tu proyecto para debuggear

import { useThree } from '@react-three/fiber';
import React, { useEffect } from 'react';

interface TextureDebuggerProps {
    gltf: any;
}

export const TextureDebugger: React.FC<TextureDebuggerProps> = ({ gltf }) => {
    const { scene } = useThree();

    useEffect(() => {
        if (!gltf) return;

        console.log('🔍 === DIAGNÓSTICO DE MODELO ===');
        
        scene.traverse((object: any) => {
            if (object.isMesh) {
                console.log('\n📦 Mesh encontrado:', object.name);
                console.log('   - Tipo de geometría:', object.geometry.type);
                
                // Verificar UVs
                const uvs = object.geometry.attributes.uv;
                if (uvs) {
                    console.log('   ✅ UVs presentes');
                    console.log('   - Cantidad de coordenadas UV:', uvs.count);
                    console.log('   - Primeras coordenadas UV:', [
                        uvs.getX(0).toFixed(3),
                        uvs.getY(0).toFixed(3)
                    ]);
                } else {
                    console.log('   ❌ NO tiene UVs');
                    console.log('   ⚠️ Este modelo necesita UVs para mostrar texturas correctamente');
                }

                // Verificar material
                console.log('   - Material:', object.material?.type || 'Sin material');
                if (object.material?.map) {
                    console.log('   - Tiene textura asignada:', object.material.map.uuid);
                }

                // Verificar posición y escala
                console.log('   - Posición:', [
                    object.position.x.toFixed(2),
                    object.position.y.toFixed(2),
                    object.position.z.toFixed(2)
                ]);
                console.log('   - Escala:', [
                    object.scale.x.toFixed(2),
                    object.scale.y.toFixed(2),
                    object.scale.z.toFixed(2)
                ]);
            }
        });

        console.log('\n🔍 === FIN DEL DIAGNÓSTICO ===\n');
    }, [gltf, scene]);

    return null;
};

// USO: En SceneContent, agrega antes del primitive:
// {gltf && <TextureDebugger gltf={gltf} />}