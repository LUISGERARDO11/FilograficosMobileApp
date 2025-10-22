// __tests__/components/ProductSelection.test.tsx
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import ProductSelection from '../../components/ProductSelection';
import { get3dModels } from '../../services/models3dService';

const mockModels = [
  {
    id: 1,
    product_name: 'Camiseta',
    description: 'Camiseta personalizable',
    preview_image_url: 'https://example.com/camiseta.jpg',
    model_url: 'https://example.com/camiseta.glb',
  },
];

// ✅ FIX: Mocks locales, NO setup
jest.mock('../../services/models3dService', () => ({
  get3dModels: jest.fn(),
  ProductModel: jest.fn(),
}));

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    back: jest.fn(),
    navigate: jest.fn(),
    canGoBack: jest.fn(),
    setParams: jest.fn(),
    setOptions: jest.fn(),
    dismiss: jest.fn(),
    dismissAll: jest.fn(),
  }),
}));

describe('ProductSelection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (get3dModels as jest.Mock).mockResolvedValue(mockModels);
  });

  it('debería mostrar loading mientras carga', () => {
    const { getByText } = render(<ProductSelection />);
    expect(getByText('Cargando productos...')).toBeTruthy();
  });

  it('debería toggle viewMode entre list y grid', async () => {
    const { getByTestId } = render(<ProductSelection />);
    await waitFor(() => expect(getByTestId('toggle-view')).toBeTruthy());
    fireEvent.press(getByTestId('toggle-view'));
    await waitFor(() => expect(getByTestId('grid-view')).toBeTruthy()); 
  });

  // ✅ SIMPLIFICADO: Sin animaciones complejas
  it('debería renderizar productos correctamente', async () => {
    const { getByTestId } = render(<ProductSelection />);
    await waitFor(() => expect(getByTestId('product-item-1')).toBeTruthy());
  });

  it('debería navegar al presionar producto', async () => {
    const { getByTestId } = render(<ProductSelection />);
    await waitFor(() => expect(getByTestId('product-item-1')).toBeTruthy());
    fireEvent.press(getByTestId('product-item-1'));
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/(personalization)/personalization',
      params: { modelId: '1' },
    });
  });
});