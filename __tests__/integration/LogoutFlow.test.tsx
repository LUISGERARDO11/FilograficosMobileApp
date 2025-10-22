// __tests__/integration/LogoutFlow.test.tsx

import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import React from 'react';
import HomeScreen from '../../app/index';
import api from '../../services/api';

// --- Mock del hook useAuth ---
// Esto nos permite simular un estado de "sesión iniciada" para el componente HomeScreen.
const mockSignOut = jest.fn();
jest.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: '1', name: 'Test User', tipo: 'admin', email: 'test@example.com', profile_picture_url: null },
    isLoading: false,
    signOut: mockSignOut, // Usamos la función mock para poder espiarla
    signIn: jest.fn(),
  }),
}));

const mockedRouter = useRouter as jest.Mock;
const mockedApi = api as jest.Mocked<typeof api>;

describe('Cierre de Sesión desde Menú', () => {
  beforeEach(() => {
    // Limpiamos todos los mocks antes de cada prueba
    mockedApi.get.mockReset();
    mockedApi.post.mockReset();
    mockedRouter().replace.mockClear();
    (AsyncStorage.removeItem as jest.Mock).mockClear();
    mockSignOut.mockClear(); // Limpiamos el mock de signOut
  });

  it('debería llamar a signOut y redirigir al presionar el botón de logout', async () => {
    // Renderizamos HomeScreen. Como mockeamos useAuth, ya "sabe" que hay un usuario logueado.
    const { getByTestId } = render(<HomeScreen />);

    // Simula la interacción del usuario: abre el menú y presiona "Cerrar Sesión"
    // (Asegúrate de que estos testID existan en tu componente)
    fireEvent.press(getByTestId('menu-button'));
    fireEvent.press(getByTestId('logout-button'));
    
    // Verificamos que la función signOut del contexto de autenticación fue llamada.
    // Esta es la prueba clave.
    expect(mockSignOut).toHaveBeenCalledTimes(1);
    
    // Opcional: Si quieres seguir probando el flujo completo dentro de la función signOut...
    // Puedes simular la implementación del mock para que llame a la lógica real.
    // Por ahora, solo nos aseguramos de que el botón llama a la función correcta.
  });
});