// __tests__/services/models3dService.test.tsx
import { get3dModelById, get3dModels, ProductModel } from '../../services/models3dService';
// ✅ FIX: IMPORT mockedApi desde setup
import api from '../../services/api';

const mockedApi = api as jest.Mocked<typeof api>;

const mockModels: ProductModel[] = [
  {
    id: 1,
    product_name: 'Camiseta Personalizable',
    description: 'Camiseta 100% algodón',
    preview_image_url: 'https://example.com/camiseta.jpg',
    model_url: 'https://example.com/camiseta.glb',
  },
  {
    id: 2,
    product_name: 'Gorra Personalizable',
    description: 'Gorra deportiva',
    preview_image_url: 'https://example.com/gorra.jpg',
    model_url: 'https://example.com/gorra.glb',
  },
];

describe('models3dService', () => {
  beforeEach(() => {
    mockedApi.get.mockReset();
  });

  describe('get3dModels', () => {
    it('debería retornar lista de modelos mockeados correctamente', async () => {
      mockedApi.get.mockResolvedValueOnce({ data: mockModels });

      const result = await get3dModels();

      expect(mockedApi.get).toHaveBeenCalledWith('/api/models3d');
      expect(result).toEqual(mockModels);
    });

    it('debería manejar error de red fallida', async () => {
      const error = new Error('Network Error');
      mockedApi.get.mockRejectedValueOnce(error);

      await expect(get3dModels()).rejects.toThrow('Network Error');
      expect(mockedApi.get).toHaveBeenCalledWith('/api/models3d');
    });
  });

  describe('get3dModelById', () => {
    it('debería retornar modelo específico por ID válido', async () => {
      const mockModel = mockModels[0];
      mockedApi.get.mockResolvedValueOnce({ data: { model: mockModel } });

      const result = await get3dModelById(1);

      expect(mockedApi.get).toHaveBeenCalledWith('/api/models3d/1');
      expect(result).toEqual(mockModel);
    });

    it('debería lanzar error para ID inválido', async () => {
        const error = { response: { status: 404, data: { message: 'Modelo no encontrado' } } };
        mockedApi.get.mockRejectedValueOnce(error);

        await expect(get3dModelById(999)).rejects.toMatchObject({ // ✅ CAMBIO
            response: { status: 404 }
        });
        expect(mockedApi.get).toHaveBeenCalledWith('/api/models3d/999');
    });
  });
});