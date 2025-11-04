// babel.config.js - CORRECCIÓN DEFINITIVA
module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    // La funcionalidad de expo-router/babel ya está en presets: ['babel-preset-expo']
    
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