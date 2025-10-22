// __tests__/hooks/useAuth.test.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { AuthProvider, useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

const mockedApi = api as jest.Mocked<typeof api>;

const TestComponent = ({ callback }: { callback: (auth: ReturnType<typeof useAuth>) => void }) => {
  const auth = useAuth();
  callback(auth);
  return null;
};

describe('useAuth hook', () => {
  beforeEach(() => {
    mockedApi.get.mockReset();
    mockedApi.post.mockReset();
    // Removido mockResolvedValue default para evitar interferencia
    (AsyncStorage.setItem as jest.Mock).mockReset();
    (AsyncStorage.getItem as jest.Mock).mockReset();
    (AsyncStorage.removeItem as jest.Mock).mockReset();
  });

  describe('signIn', () => {
    it('debería manejar credenciales válidas correctamente', async () => {
      const validToken = 'valid-jwt-token';
      const userProfile = {
        user_id: '1',
        name: 'Test User',
        user_type: 'admin',
        email: 'test@example.com',
        profile_picture_url: null,
      };

      mockedApi.get
        .mockResolvedValueOnce({ data: { csrfToken: 'mock-csrf-token' } })
        .mockResolvedValueOnce({ data: userProfile });
      mockedApi.post
        .mockResolvedValueOnce({ headers: { authorization: `Bearer ${validToken}` } });

      let authResult: ReturnType<typeof useAuth> | undefined;
      render(
        <AuthProvider>
          <TestComponent callback={(auth) => (authResult = auth)} />
        </AuthProvider>
      );

      await act(async () => {
        await authResult!.signIn('test@example.com', 'password123');
      });

      expect(mockedApi.post).toHaveBeenCalledTimes(1);
      expect(mockedApi.get).toHaveBeenCalledTimes(2);

      expect(mockedApi.post).toHaveBeenCalledWith(
        '/api/auth/login',
        { email: 'test@example.com', password: 'password123' },
        { headers: { 'x-csrf-token': 'mock-csrf-token' } }
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('userToken', validToken);
      expect(api.defaults.headers.common.Authorization).toBe(`Bearer ${validToken}`);
      expect(authResult!.user).toEqual({
        id: '1',
        name: 'Test User',
        tipo: 'admin',
        email: 'test@example.com',
        profile_picture_url: null,
      });
    });

    it('debería lanzar error para credenciales inválidas', async () => {
      const errorResponse = {
        response: {
          data: { message: 'Credenciales inválidas' },
        },
      };

      mockedApi.get.mockResolvedValueOnce({ data: { csrfToken: 'mock-csrf-token' } });
      mockedApi.post.mockRejectedValueOnce(errorResponse);

      let authResult: ReturnType<typeof useAuth> | undefined;
      render(
        <AuthProvider>
          <TestComponent callback={(auth) => (authResult = auth)} />
        </AuthProvider>
      );

      await expect(
        act(async () => {
          await authResult!.signIn('invalid@example.com', 'wrong');
        })
      ).rejects.toThrow('Credenciales inválidas');

      expect(mockedApi.post).toHaveBeenCalledWith(
        '/api/auth/login',
        { email: 'invalid@example.com', password: 'wrong' },
        expect.any(Object)
      );
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });

    it('debería manejar error cuando no se recibe token', async () => {
      mockedApi.get.mockResolvedValueOnce({ data: { csrfToken: 'mock-csrf-token' } });
      mockedApi.post.mockResolvedValueOnce({ headers: {} });

      let authResult: ReturnType<typeof useAuth> | undefined;
      render(
        <AuthProvider>
          <TestComponent callback={(auth) => (authResult = auth)} />
        </AuthProvider>
      );

      await expect(
        act(async () => {
          await authResult!.signIn('test@example.com', 'password');
        })
      ).rejects.toThrow('No se recibió un token de autenticación en la respuesta del servidor.');

      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('signOut', () => {
    it('debería limpiar estado de usuario y token correctamente', async () => {
      api.defaults.headers.common.Authorization = 'Bearer existing-token';
      mockedApi.get.mockResolvedValueOnce({ data: { csrfToken: 'mock-csrf-token' } });
      mockedApi.post.mockResolvedValue({});

      let authResult: ReturnType<typeof useAuth> | undefined;
      render(
        <AuthProvider>
          <TestComponent callback={(auth) => (authResult = auth)} />
        </AuthProvider>
      );

      await act(async () => {
        await authResult!.signOut();
      });

      expect(mockedApi.post).toHaveBeenCalledWith('/api/auth/logout', {}, expect.any(Object));
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('userToken');
      expect(authResult!.user).toBeNull();
      expect(api.defaults.headers.common.Authorization).toBeUndefined();
    });
  });

  describe('AuthProvider - Estados iniciales', () => {
    it('debería inicializar con isLoading en true', () => {
      let authResult: ReturnType<typeof useAuth> | undefined;
      const { unmount } = render(
        <AuthProvider>
          <TestComponent callback={(auth) => (authResult = auth)} />
        </AuthProvider>
      );

      expect(authResult!.isLoading).toBe(true);

      unmount();
    });

    it('debería cargar usuario desde AsyncStorage al montar', async () => {
      const storedToken = 'stored-token';
      const userProfile = {
        user_id: '1',
        name: 'Stored User',
        user_type: 'user',
        email: 'stored@example.com',
        profile_picture_url: null,
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(storedToken);
      mockedApi.get.mockResolvedValueOnce({ data: userProfile });

      let authResult: ReturnType<typeof useAuth> | undefined;
      const { unmount } = render(
        <AuthProvider>
          <TestComponent callback={(auth) => (authResult = auth)} />
        </AuthProvider>
      );

      await waitFor(() => expect(authResult!.isLoading).toBe(false));

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('userToken');
      expect(api.defaults.headers.common.Authorization).toBe(`Bearer ${storedToken}`);
      expect(authResult!.user).toEqual({
        id: '1',
        name: 'Stored User',
        tipo: 'user',
        email: 'stored@example.com',
        profile_picture_url: null,
      });

      unmount();
    });

    it('debería limpiar sesión inválida desde AsyncStorage', async () => {
      const invalidToken = 'invalid-token';
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(invalidToken);
      mockedApi.get.mockRejectedValueOnce(new Error('Invalid session'));

      let authResult: ReturnType<typeof useAuth> | undefined;
      const { unmount } = render(
        <AuthProvider>
          <TestComponent callback={(auth) => (authResult = auth)} />
        </AuthProvider>
      );

      await waitFor(() => expect(authResult!.isLoading).toBe(false));

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('userToken');
      expect(authResult!.user).toBeNull();
      expect(api.defaults.headers.common.Authorization).toBeUndefined();

      unmount();
    });
  });

  describe('fetchUserProfile', () => {
    it('debería obtener y establecer perfil de usuario', async () => {
      const validToken = 'valid-jwt-token';
      const userProfile = {
        user_id: '123',
        name: 'Profile User',
        user_type: 'client',
        email: 'profile@example.com',
        profile_picture_url: 'https://example.com/avatar.jpg',
      };

      mockedApi.get.mockResolvedValueOnce({ data: { csrfToken: 'mock-csrf-token' } });
      mockedApi.post.mockResolvedValueOnce({
        headers: { authorization: `Bearer ${validToken}` },
      });
      mockedApi.get.mockResolvedValueOnce({ data: userProfile });

      let authResult: ReturnType<typeof useAuth> | undefined;
      const { unmount } = render(
        <AuthProvider>
          <TestComponent callback={(auth) => (authResult = auth)} />
        </AuthProvider>
      );

      await act(async () => {
        await authResult!.signIn('test@example.com', 'password123');
      });

      expect(mockedApi.get).toHaveBeenCalledWith('/api/users/profile');

      unmount();
    });
  });
});