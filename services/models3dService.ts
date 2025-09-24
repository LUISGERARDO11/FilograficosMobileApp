// services/models3dService.ts

import api from './api';

export interface ProductModel {
  id: number;
  product_name: string;
  description: string;
  preview_image_url: string;
  model_url: string;
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