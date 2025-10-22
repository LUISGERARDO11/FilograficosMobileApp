// utils/types.ts

// NOTA: Esta interfaz coincide con la que ya tienes exportada en components/TextSection.tsx,
// pero la centralizamos aquí para que preview.tsx no tenga que depender de un componente UI.
export interface TextData {
    text: string;
    color: string;
    size: number;
    fontWeight: 'normal' | 'bold';
    fontStyle: 'normal' | 'italic';
}

/**
 * Define la estructura de una imagen seleccionada para personalización.
 * El contenido de 'uri' debe ser la ruta (local o remota) de la imagen.
 * Cuando no hay imagen, es 'null'.
 */
export interface SelectedImage {
    uri: string;
}

/**
 * Define la estructura completa de los datos de personalización que se enviarán al preview.
 */
export interface ModelViewerProps {
  modelUrl: string;
  selectedImage?: SelectedImage | null;
  textData?: TextData;
}

// Exportamos también la interfaz ProductModel para completar los tipos del servicio (opcional, pero buena práctica)
// NOTA: Asegúrate de que esta definición sea idéntica a la de services/models3dService.ts si la usas.
export interface ProductModel {
    id: number;
    product_name: string;
    description: string;
    preview_image_url: string;
    model_url: string;
    created_at?: string;
    updated_at?: string;
}
