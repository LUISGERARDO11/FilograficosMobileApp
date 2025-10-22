import { fireEvent, render, waitFor } from '@testing-library/react-native';
import * as ImagePicker from 'expo-image-picker';
import React from 'react';
import { Alert } from 'react-native';
import ImageSection from '../../components/ImageSection';

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  requestCameraPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  MediaTypeOptions: {
    Images: 'Images',
  },
}));

const mockOnImageSelect = jest.fn();
const mockOnImageRemove = jest.fn();

const mockImageResult = {
  canceled: false,
  assets: [{ uri: 'file://test.jpg', width: 100, height: 100 }],
};

describe('ImageSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock para permisos
    (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({ granted: true });
    (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({ granted: true });
    // Mock para selección de imagen
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue(mockImageResult);
    (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValue(mockImageResult);
  });

  it('maneja selección desde galería - formato válido', async () => {
    const { getByText } = render(
      <ImageSection 
        selectedImage={null} 
        onImageSelect={mockOnImageSelect} 
        onImageRemove={mockOnImageRemove} 
      />
    );

    // 1. Abrir modal
    const addImageButton = getByText(/Toca para agregar imagen/i);
    fireEvent.press(addImageButton);

    // 2. Esperar a que el modal se renderice completamente
    await waitFor(() => {
      expect(getByText('Seleccionar imagen')).toBeTruthy();
    }, { timeout: 10000 }); // Aumentado el timeout

    // 3. Seleccionar galería
    const galleryButton = getByText('Desde galería');
    fireEvent.press(galleryButton);

    // 4. Esperar a que se complete el flujo asíncrono
    await waitFor(() => {
      expect(mockOnImageSelect).toHaveBeenCalledWith('file://test.jpg');
    }, { timeout: 10000 }); // Aumentado el timeout
  }, 15000); // Timeout global para el test

  it('valida formato - solo JPEG/PNG', async () => {
    const invalidResult = { 
      canceled: false, 
      assets: [{ uri: 'file://test.gif', width: 100, height: 100 }] 
    };
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue(invalidResult);

    const { getByText } = render(
      <ImageSection 
        selectedImage={null} 
        onImageSelect={mockOnImageSelect} 
        onImageRemove={mockOnImageRemove} 
      />
    );

    fireEvent.press(getByText(/Toca para agregar imagen/i));
    await waitFor(() => {
      expect(getByText('Seleccionar imagen')).toBeTruthy();
    }, { timeout: 10000 });

    fireEvent.press(getByText('Desde galería'));

    await waitFor(() => {
      expect(mockOnImageSelect).not.toHaveBeenCalled();
    }, { timeout: 10000 });
  }, 15000);

  it('maneja error tamaño excesivo >5MB', async () => {
    const largeResult = { 
      canceled: false, 
      assets: [{ uri: 'file://large.jpg', width: 100, height: 100, fileSize: 6000000 }] 
    };
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue(largeResult);

    const { getByText } = render(
      <ImageSection 
        selectedImage={null} 
        onImageSelect={mockOnImageSelect} 
        onImageRemove={mockOnImageRemove} 
      />
    );

    fireEvent.press(getByText(/Toca para agregar imagen/i));
    await waitFor(() => {
      expect(getByText('Seleccionar imagen')).toBeTruthy();
    }, { timeout: 10000 });

    fireEvent.press(getByText('Desde galería'));

    await waitFor(() => {
      expect(mockOnImageSelect).not.toHaveBeenCalled();
    }, { timeout: 10000 });
  }, 15000);

  it('captura desde cámara - permisos OK', async () => {
    const { getByText } = render(
      <ImageSection 
        selectedImage={null} 
        onImageSelect={mockOnImageSelect} 
        onImageRemove={mockOnImageRemove} 
      />
    );

    // 1. Abrir modal
    fireEvent.press(getByText(/Toca para agregar imagen/i));

    // 2. Esperar modal y seleccionar cámara
    await waitFor(() => {
      expect(getByText('Seleccionar imagen')).toBeTruthy();
    }, { timeout: 10000 });

    // 3. Simular acción de cámara
    const cameraButton = getByText('Tomar foto');
    fireEvent.press(cameraButton);

    // 4. Esperar resultado
    await waitFor(() => {
      expect(mockOnImageSelect).toHaveBeenCalledWith('file://test.jpg');
    }, { timeout: 10000 });
  }, 15000);

  it('error permiso denegado cámara', async () => {
    (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({ granted: false });

    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

    const { getByText } = render(
      <ImageSection 
        selectedImage={null} 
        onImageSelect={mockOnImageSelect} 
        onImageRemove={mockOnImageRemove} 
      />
    );

    fireEvent.press(getByText(/Toca para agregar imagen/i));
    await waitFor(() => {
      expect(getByText('Seleccionar imagen')).toBeTruthy();
    }, { timeout: 10000 });

    fireEvent.press(getByText('Tomar foto'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        'Permiso Requerido', 
        expect.stringContaining('Necesitamos acceso a la cámara')
      );
    }, { timeout: 10000 });

    alertSpy.mockRestore();
  }, 15000);

  it('elimina imagen seleccionada', () => {
    const { getByTestId } = render(
      <ImageSection 
        selectedImage={{ uri: 'file://test.jpg' }} 
        onImageSelect={mockOnImageSelect} 
        onImageRemove={mockOnImageRemove} 
      />
    );

    fireEvent.press(getByTestId('remove-button'));
    expect(mockOnImageRemove).toHaveBeenCalled();
  });
});