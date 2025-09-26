// ModelViewer.tsx
import { Asset } from "expo-asset";
import { GLTFLoader } from "three-stdlib";

import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import React, { Suspense, useEffect, useState } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useThemeColor } from "../hooks/use-theme-color";

interface ModelViewerProps {
  modelUrl: string;
}

// Sub-componente que recibe la URI local
const Scene = ({ modelUrl }: { modelUrl: string }) => {
  const [gltf, setGltf] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;

    const loadModel = async () => {
      try {
        const loader = new GLTFLoader();
        loader.load(
          modelUrl, // 👉 usamos directamente la ruta local
          (gltf) => {
            if (isMounted) setGltf(gltf);
          },
          undefined,
          (err) => console.error("Error cargando GLB:", err)
        );
      } catch (e) {
        console.error("Error leyendo modelo:", e);
      }
    };

    if (modelUrl) loadModel();

    return () => {
      isMounted = false;
    };
  }, [modelUrl]);

  if (!gltf) return null;
  return <primitive object={gltf.scene} />;
};

const ModelViewer = ({ modelUrl }: ModelViewerProps) => {
  const loadingColor = useThemeColor(
    { light: "#0056b3", dark: "#007bff" },
    "tint"
  );
  const [localUri, setLocalUri] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const loadAsset = async () => {
      setLocalUri(null);
      try {
        const asset = Asset.fromURI(modelUrl);
        await asset.downloadAsync();

        if (!isCancelled && asset.localUri) {
          setLocalUri(asset.localUri);
        }
      } catch (e) {
        console.error("❌ Error al descargar el modelo 3D:", e);
        if (!isCancelled) setLocalUri(null);
      }
    };

    if (modelUrl) loadAsset();

    return () => {
      isCancelled = true;
    };
  }, [modelUrl]);

  const LoadingFallback = (
    <View style={[styles.container, styles.loadingContainer]}>
      <ActivityIndicator size="large" color={loadingColor} />
      <Text style={[styles.loadingText, { color: loadingColor }]}>
        Cargando modelo 3D...
      </Text>
    </View>
  );

  if (!localUri) {
    return LoadingFallback;
  }

  return (
    <View style={styles.container}>
      <Suspense fallback={LoadingFallback}>
        <Canvas>
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 2}
          />
          <ambientLight intensity={1.5} />
          <directionalLight position={[10, 10, 5]} intensity={3} />

          {/* Ahora Scene recibe directamente la ruta local */}
          <Scene modelUrl={localUri} />
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

export default ModelViewer;
