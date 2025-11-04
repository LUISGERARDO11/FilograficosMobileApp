// babel.config.js - ESTA ES LA VERSIÓN CORRECTA
module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    // 🚀 ESTO ES VITAL Y ESTABA FALTANDO
    'expo-router/babel', 

    // Tus otros plugins
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