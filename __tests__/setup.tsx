// __tests__/setup.ts
// Set process.env.EXPO_OS explicitly
process.env.EXPO_OS = 'android';

// Aumentamos el timeout global a 30 segundos
jest.setTimeout(30000);

// Limpiamos los mocks DESPUÉS de CADA prueba para evitar contaminación
afterEach(() => {
  jest.clearAllMocks();
});

// Mock expo-modules-core to provide Platform
jest.mock('expo-modules-core', () => ({
  Platform: {
    OS: 'android',
    isDOMAvailable: false,
  },
}));

jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn().mockResolvedValue(undefined),
  getItem: jest.fn().mockResolvedValue(null),
  removeItem: jest.fn().mockResolvedValue(undefined),
  clear: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../services/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    defaults: {
      headers: {
        common: {
          Authorization: undefined,
        },
      },
    },
  },
}));

export const mockUseSegments = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    navigate: jest.fn(),
    canGoBack: jest.fn(),
    setParams: jest.fn(),
    setOptions: jest.fn(),
    dismiss: jest.fn(),
    dismissAll: jest.fn(),
  }),
  useSegments: mockUseSegments,
  Stack: () => <></>,
}));

jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
jest.mock('expo-image-picker', () => ({}));
const mockAlert = jest.fn();
jest.mock('react-native', () => {
  const rn = jest.requireActual('react-native');
  rn.Alert.alert = mockAlert;
  return rn;
});
jest.mock('expo-asset', () => ({
  Asset: {
    fromURI: jest.fn(() => ({
      downloadAsync: jest.fn().mockResolvedValue({ localUri: 'file://mock.glb' }),
    })),
  },
}));
jest.mock('../components/ModelViewer', () => 'MockModelViewer');

jest.mock('expo-linear-gradient', () => {
  // Lo reemplazamos con un componente simple de React Native (View)
  // que acepta todas las props para que no se rompa el test.
  const { View } = require('react-native');
  return {
    LinearGradient: ({ children, ...props }: { children: React.ReactNode }) => <View {...props}>{children}</View>,
  };
});

// Mock expo-gl and @react-three/fiber to prevent rendering issues
jest.mock('expo-gl', () => ({
  GLView: () => null,
}));
jest.mock('@react-three/fiber/native', () => ({
  Canvas: () => null,
  useFrame: jest.fn(),
  useThree: jest.fn(() => ({})),
}));