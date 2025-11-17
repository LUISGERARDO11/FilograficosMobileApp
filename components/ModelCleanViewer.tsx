// components/ModelCleanViewer.tsx
import { OrbitControls } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import React, { Suspense } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useThemeColor } from "../hooks/use-theme-color"; // Asegúrate de que la ruta sea correcta
import { useModelAsset } from "../hooks/useModelAsset"; // Nuevo hook
import { getAdjustmentByModelId } from "../utils/modelAdjustments";
import SceneRenderer from "./SceneRenderer"; // Nuevo componente

// --- Tipos de Props de Ajuste ---
interface ModelViewerProps {
  modelUrl: string;
  modelId: number; // Agregamos el ID para la lógica de ajustes
}

const CameraLogger = () => {
    const { camera } = useThree();

    const handleCameraChange = () => {
        // Ejecutado cada vez que el usuario mueve el control
        console.log("--- Interacción de Usuario (Cámara) ---");
        console.log(`Posición Cámara (X, Y, Z):`, camera.position.toArray());
        console.log(`Rotación Cámara (X, Y, Z):`, camera.rotation.toArray().slice(0, 3));
        // Nota: La rotación de la cámara es compleja de interpretar por sí sola;
        // La posición es generalmente más útil para guardar vistas.
    };

    return (
        <OrbitControls
            // ... (Tus props actuales) ...
            enablePan={false}
            enableZoom={true}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 2}
            
            // ⭐ CLAVE: Usa el evento onChange para registrar cada movimiento
            onChange={handleCameraChange}
            // o usa onEnd para registrar solo cuando el usuario termina de arrastrar:
            // onEnd={handleCameraChange} 
        />
    );
};


const ModelCleanViewer = ({ modelUrl, modelId }: ModelViewerProps) => {
  const loadingColor = useThemeColor(
    { light: "#0056b3", dark: "#007bff" },
    "tint"
  );
  
  // Usamos el hook para manejar la descarga del asset
  const localUri = useModelAsset(modelUrl);

  // Lógica para obtener ajustes específicos del modelo
  const adjustment = getAdjustmentByModelId(modelId);
  const { scaleFactor, positionX, positionY,positionZ, rotationX, rotationY, rotationZ } = adjustment || {};

  const LoadingFallback = (
    <View style={[styles.container, styles.loadingContainer]}>
      <ActivityIndicator size="large" color={loadingColor} />
      <Text style={[styles.loadingText, { color: loadingColor }]}>
        Cargando modelo 3D...
      </Text>
    </View>
  );

  // Muestra el fallback si no hay URI local (descargando o error)
  if (!localUri) {
    return LoadingFallback;
  }

  return (
      <View style={styles.container}>
        <Suspense fallback={LoadingFallback}>
          <Canvas>
            {/* Cámara y Controles ahora usan CameraLogger */}
            <CameraLogger /> {/* ⭐ USAMOS EL NUEVO COMPONENTE */}
            
            {/* Luces */}
            <ambientLight intensity={1.5} />
            <directionalLight position={[10, 10, 5]} intensity={3} />
            <directionalLight position={[-10, -10, -5]} intensity={1.5} /> 

            {/* Renderizador de Escena con ajustes */}
            <SceneRenderer 
              modelUrl={localUri} 
              scaleFactor={scaleFactor}
              positionX={positionX}
              positionY={positionY}
              positionZ={positionZ}
              rotationX={rotationX}
              rotationY={rotationY}
              rotationZ={rotationZ}
            />
          </Canvas>
        </Suspense>
      </View>
    );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 250,
    borderRadius: 10,
    zIndex: 1,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
  },
});

export default ModelCleanViewer;