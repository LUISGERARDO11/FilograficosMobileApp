// hooks/useModelAsset.ts
import { Asset } from "expo-asset";
import { useEffect, useState } from "react";

/**
 * Hook para descargar un asset de Expo y obtener su URI local.
 * @param modelUrl La URI remota del modelo (Sketchfab, etc.).
 * @returns La URI local del modelo o null si está cargando o hubo un error.
 */
export const useModelAsset = (modelUrl: string): string | null => {
  const [localUri, setLocalUri] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const loadAsset = async () => {
      setLocalUri(null); // Resetear al iniciar la carga
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

  return localUri;
};