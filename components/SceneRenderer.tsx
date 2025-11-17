// components/SceneRenderer.tsx (Versión extendida)
import { useLoader } from "@react-three/fiber";
import React, { useMemo } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three-stdlib";

// Asegúrate de importar o definir ModelAdjustment aquí si no usas un archivo de tipos
// (Asumo que importarás ModelAdjustment si lo mueves a un archivo separado)

interface SceneRendererProps {
  modelUrl: string; 
  scaleFactor?: number;
  positionX?: number; // ✨ Nuevo
  positionY?: number; 
  positionZ?: number; // ✨ Nuevo
  rotationX?: number; 
  rotationY?: number; // ✨ Nuevo
  rotationZ?: number; // ✨ Nuevo
  scaleX?: number; // ✨ Nuevo
  scaleY?: number; // ✨ Nuevo
  scaleZ?: number; // ✨ Nuevo
}

const Model = React.memo(
  ({ 
    modelUrl, 
    scaleFactor = 1, 
    positionX = 0, // ✨ Inicializado a 0
    positionY = 0, 
    positionZ = 0, // ✨ Inicializado a 0
    rotationX = 0, 
    rotationY = 0, // ✨ Inicializado a 0
    rotationZ = 0, // ✨ Inicializado a 0
    scaleX = 1, // ✨ Inicializado a 1
    scaleY = 1, // ✨ Inicializado a 1
    scaleZ = 1, // ✨ Inicializado a 1
  }: SceneRendererProps) => {
    
    const gltf = useLoader(GLTFLoader, modelUrl);

    const adjustedScene = useMemo(() => {
      const scene = gltf.scene.clone();

      // --- 1. NORMALIZACIÓN Y CENTRADO AUTOMÁTICO (EXISTENTE) ---
      const box = new THREE.Box3().setFromObject(scene);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scaleN = (1 / maxDim) * 2; 
      
      scene.scale.set(scaleN, scaleN, scaleN);
      
      const newBox = new THREE.Box3().setFromObject(scene);
      const newCenter = newBox.getCenter(new THREE.Vector3());
      
      // Aplicar el centrado y el offset de posición (manual)
      scene.position.x += -newCenter.x + positionX; // ✨ Aplicar positionX
      scene.position.y += -newCenter.y + positionY;
      scene.position.z += -newCenter.z + positionZ; // ✨ Aplicar positionZ
      
      // --- 2. AJUSTES FINOS (MANUALES) ---
      
      // Aplicar escala uniforme adicional
      if (scaleFactor !== 1) {
        scene.scale.multiplyScalar(scaleFactor);
      }
      
      // Aplicar escala no uniforme (multiplicar sobre la escala actual)
      scene.scale.x *= scaleX; // ✨ Aplicar scaleX
      scene.scale.y *= scaleY; // ✨ Aplicar scaleY
      scene.scale.z *= scaleZ; // ✨ Aplicar scaleZ

      // Aplicar rotaciones
      scene.rotation.x = rotationX;
      scene.rotation.y = rotationY; // ✨ Aplicar rotationY (Giro sobre su eje)
      scene.rotation.z = rotationZ; // ✨ Aplicar rotationZ

      console.log(`
--- Ajustes Finales (Modelo ID: ${modelUrl.split('/').pop()?.split('.')[0] || 'Desconocido'}) ---
Posición:
  X: ${scene.position.x.toFixed(4)} (Centrado + ${positionX})
  Y: ${scene.position.y.toFixed(4)} (Centrado + ${positionY})
  Z: ${scene.position.z.toFixed(4)} (Centrado + ${positionZ})

Rotación (Radianes):
  X: ${scene.rotation.x.toFixed(4)} (${(scene.rotation.x * 180 / Math.PI).toFixed(1)}°)
  Y: ${scene.rotation.y.toFixed(4)} (${(scene.rotation.y * 180 / Math.PI).toFixed(1)}°)
  Z: ${scene.rotation.z.toFixed(4)} (${(scene.rotation.z * 180 / Math.PI).toFixed(1)}°)

Escala:
  Factor Uniforme: x${scaleFactor}
  Escala Final X: ${scene.scale.x.toFixed(4)} (Normalizado * Factor * ${scaleX})
  Escala Final Y: ${scene.scale.y.toFixed(4)} (Normalizado * Factor * ${scaleY})
  Escala Final Z: ${scene.scale.z.toFixed(4)} (Normalizado * Factor * ${scaleZ})
------------------------------------------------------
      `);
      
      return scene;
    }, [
      gltf, 
      scaleFactor, 
      positionX, positionY, positionZ, // Dependencias de Posición
      rotationX, rotationY, rotationZ, // Dependencias de Rotación
      scaleX, scaleY, scaleZ // Dependencias de Escala
    ]);

    // ... el resto de tu código que usa SceneRendererProps
    // ... Tu OrbitControls y Luces siguen estando en ModelCleanViewer.tsx
    
    return <primitive object={adjustedScene} />;
  }
);

export default Model;