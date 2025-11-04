// babel.config.js
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // 🚀 CRÍTICO: Debe estar para que Expo Router funcione en el build de EAS
      'expo-router/babel', 
      
      // Mantén tus otros plugins solo si son necesarios
      ['@babel/plugin-transform-flow-strip-types'],
      ['@babel/plugin-transform-class-properties', { loose: true }],
      ['@babel/plugin-transform-private-methods', { loose: true }],
      ['@babel/plugin-transform-private-property-in-object', { loose: true }],
      ['inline-dotenv', {
        unsafe: {
          EXPO_OS: 'android',
        },
      }],
      // Agrega el plugin de Reanimated si lo usas
      // 'react-native-reanimated/plugin',
    ],
  };
};