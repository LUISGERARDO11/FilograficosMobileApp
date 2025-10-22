import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import LoginScreen from '../../app/(auth)/login';

describe('Interacción UI en LoginScreen', () => {
  it('debería validar email en tiempo real y desactivar botón si inválido', () => {
    const { getByPlaceholderText, getByTestId, getByText } = render(<LoginScreen />);

    fireEvent.changeText(getByPlaceholderText('tu@correo.com'), 'invalid-email');
    const errorText = getByText('Ingresa un correo válido');
    expect(errorText).toBeTruthy();

    const button = getByTestId('login-button');
    // ✅ Cambio: verificar accessibilityState.disabled
    expect(button.props.accessibilityState?.disabled).toBe(true);
  });

  it('debería toggle showPassword al tocar icono', () => {
    const { getByTestId } = render(<LoginScreen />);

    const passwordInput = getByTestId('password-input');
    expect(passwordInput.props.secureTextEntry).toBe(true);

    fireEvent.press(getByTestId('toggle-password-icon'));
    expect(passwordInput.props.secureTextEntry).toBe(false);
  });

  it('debería desactivar botón si formulario es inválido', () => {
    const { getByPlaceholderText, getByTestId } = render(<LoginScreen />);

    fireEvent.changeText(getByPlaceholderText('tu@correo.com'), '');
    fireEvent.changeText(getByPlaceholderText('********'), '');
    const button = getByTestId('login-button');
    // ✅ Cambio: verificar accessibilityState.disabled
    expect(button.props.accessibilityState?.disabled).toBe(true);
  });
});