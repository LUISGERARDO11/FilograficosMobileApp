// __tests__/components/ProductItem.test.tsx
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import ProductItem from '../../components/ProductItem';
import { ProductModel } from '../../services/models3dService';

const mockProduct: ProductModel = {
  id: 1,
  product_name: 'Camiseta',
  description: 'Camiseta personalizable',
  preview_image_url: 'https://example.com/image.jpg',
  model_url: 'https://example.com/model.glb',
};

const mockOnPress = jest.fn();

const createTestProps = (customProps = {}) => ({
  item: mockProduct,
  viewMode: 'list' as const,
  onPress: mockOnPress,
  accentColor: '#3498db',
  ...customProps,
});

describe('ProductItem', () => {
  it('debería renderizar nombre y descripción correctamente en modo list', () => {
    const { getByText } = render(<ProductItem {...createTestProps()} />);

    expect(getByText('Camiseta')).toBeTruthy();
    expect(getByText('Camiseta personalizable')).toBeTruthy();
  });

  it('debería renderizar imagen correctamente', () => {
    const { getByTestId } = render(<ProductItem {...createTestProps()} />);
    expect(getByTestId('product-image')).toBeTruthy();
  });

  // ✅ FIX: Busca en array de styles
  it('debería aplicar accentColor al nombre del producto', () => {
    const { getByText } = render(<ProductItem {...createTestProps()} />);
    const productName = getByText('Camiseta');
    expect(productName.props.style).toContainEqual(expect.objectContaining({ color: '#3498db' }));
  });

  // ✅ FIX: testID correcto
  it('debería manejar onPress sin errores', () => {
    const { getByTestId } = render(<ProductItem {...createTestProps()} />);
    fireEvent.press(getByTestId('product-item-1')); // ✅ CORRECTO
    expect(mockOnPress).toHaveBeenCalledWith(mockProduct);
  });

  it('debería renderizar correctamente en modo grid', () => {
    const { getByText } = render(<ProductItem {...createTestProps({ viewMode: 'grid' })} />);
    expect(getByText('Camiseta')).toBeTruthy();
  });
});