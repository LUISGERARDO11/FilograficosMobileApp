import api from './api';

export interface ProductModel {
  id: number;
  product_name: string;
  description: string;
  preview_image_url: string;
  model_url: string;
  created_at?: string; 
  updated_at?: string;
}

/**
 * Obtiene la lista de modelos 3D personalizables del backend.
 * @returns Una promesa que resuelve con un array de objetos ProductModel.
 */
export const get3dModels = async (): Promise<ProductModel[]> => {
  try {
    const response = await api.get('/api/models3d');
    return response.data;
  } catch (error) {
    console.error("Error al obtener modelos 3D:", error);
    throw error;
  }
};

/**
 * Obtiene un modelo 3D específico por su ID.
 * @param id El ID del modelo 3D a obtener.
 * @returns Una promesa que resuelve con el objeto ProductModel.
 */
export const get3dModelById = async (id: number): Promise<ProductModel> => {
  try {
    // La ruta en el backend es '/api/models3d/:id'
    const response = await api.get(`/api/models3d/${id}`);
    
    // El backend devuelve { "model": { ... } }, así que accedemos a 'response.data.model'
    // De esta manera, devolvemos directamente el objeto del modelo que coincide con la interfaz ProductModel.
    return response.data.model; 
  } catch (error) {
    // Es útil lanzar un error más específico para saber qué ID falló
    console.error(`Error al obtener modelo 3D con ID ${id}:`, error);
    throw error;
  }
};