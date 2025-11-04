// babel.config.js - CORRECCIÓN DEFINITIVA
module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    // ¡ELIMINAR: 'expo-router/babel', ESTO ESTÁ CAUSANDO LA FALLA EN SDK 54!
    
    // Tus otros plugins existentes (mantener)
    ['@babel/plugin-transform-flow-strip-types'],
    ['@babel/plugin-transform-class-properties', { loose: true }],
    ['@babel/plugin-transform-private-methods', { loose: true }],
    ['@babel/plugin-transform-private-property-in-object', { loose: true }],
    ['inline-dotenv', {
      unsafe: {
        EXPO_OS: 'android',
      },
    }],
  ],
};