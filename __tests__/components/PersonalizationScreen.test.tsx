import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Alert } from 'react-native';
import PersonalizationScreen from '../../app/(personalization)/personalization';
import * as models3dService from '../../services/models3dService';

let mockOnImageSelect: (uri: string) => void;

jest.mock('../../components/ImageSection', () => (props: any) => {
    // Guardamos la función onImageSelect para poder llamarla desde la prueba
    mockOnImageSelect = props.onImageSelect;
    // El mock no necesita renderizar nada visualmente
    return null;
});

jest.mock('../../services/models3dService');
jest.mock('expo-router', () => ({
    useRouter: () => ({
        push: jest.fn(),
        back: jest.fn(),
    }),
    useLocalSearchParams: () => ({ modelId: '1' }),
    Stack: {
        Screen: (_props: { options?: { headerLeft?: () => React.ReactNode; headerRight?: () => React.ReactNode; } }) => {
            // Carga React y View aquí adentro para evitar el error de hoisting
            const React = require('react');
            const { View } = require('react-native');
            
            const { options } = _props;
            if (!options) {
                return null;
            }
            // Ahora View está definido y se puede usar
            return (
                <View>
                    {options.headerLeft && options.headerLeft()}
                    {options.headerRight && options.headerRight()}
                </View>
            );
        },
    },
    useSegments: () => [],
}));
const mockModel = {
  id: 1,
  product_name: 'Test Product',
  model_url: 'test.glb'
};

const mockAlert = jest.fn();
Alert.alert = mockAlert;

type AlertButton = {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
};

describe('PersonalizationScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (models3dService.get3dModelById as jest.Mock).mockResolvedValue(mockModel);
  });

  it('actualiza preview selectedImage sin dependencias externas', async () => {
    const { getByText } = render(<PersonalizationScreen />);
    await waitFor(() => expect(getByText('Test Product')).toBeTruthy());

    // Simula selección imagen
    fireEvent.press(getByText('Imagen'));
    expect(getByText('Imagen')).toBeTruthy();
  });


  it('resetea a DEFAULT_TEXT_DATA', async () => {
      const { getByText, getByTestId } = render(<PersonalizationScreen />);
      await waitFor(() => expect(getByText('Test Product')).toBeTruthy());

      fireEvent.press(getByText('Texto'));
      
      const textInput = getByTestId('text-input');
      fireEvent.changeText(textInput, 'Hola Mundo');

      expect(textInput.props.value).toBe('Hola Mundo');

      fireEvent.press(getByTestId('reset-button'));

      expect(mockAlert).toHaveBeenCalledWith(
          "Reiniciar Personalización",
          expect.any(String),
          expect.any(Array)
      );

      const alertArgs = mockAlert.mock.calls[0];
      const resetButton = (alertArgs[2] as AlertButton[]).find(
          (button: AlertButton) => button.text === "Reiniciar Todo"
      );

      expect(resetButton).toBeDefined();
      expect(resetButton?.onPress).toBeDefined();

      act(() => {
          resetButton!.onPress!();
      });
      
      // ✅ SOLUCIÓN:
      fireEvent.press(getByText('Texto'));
      await waitFor(() => {
          const newTextInput = getByTestId('text-input');
          expect(newTextInput.props.value).toBe('');
      });
  });

  it('handleTabChange confirma descartar imagen', async () => {
      const { getByText } = render(<PersonalizationScreen />);
      await waitFor(() => expect(getByText('Test Product')).toBeTruthy());

      // 1. Simula que el usuario ha seleccionado una imagen
      // Llamamos directamente a la función que guardamos en nuestro mock
      // act() es útil para envolver actualizaciones de estado
      await act(async () => {
          mockOnImageSelect('file://fake-image.jpg');
      });

      // 2. Ahora, intenta cambiar de pestaña
      fireEvent.press(getByText('Texto'));

      // 3. La alerta debería aparecer porque ahora SÍ hay datos (la imagen)
      expect(mockAlert).toHaveBeenCalledWith(
          'Pérdida de datos',
          expect.stringContaining('descartará la imagen actual'), // Sé más específico si quieres
          expect.any(Array)
      );
  });

  it('handleTabChange NO confirma si no hay datos', async () => {
    const { getByText } = render(<PersonalizationScreen />);
    await waitFor(() => expect(getByText('Test Product')).toBeTruthy());

    fireEvent.press(getByText('Texto'));
    expect(mockAlert).not.toHaveBeenCalled();
  });
});