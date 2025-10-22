// jest.config.js
module.exports = {
  preset: 'jest-expo',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
  },
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.tsx', '@testing-library/jest-native/extend-expect'],
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': 'identity-obj-proxy',
  },
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '!**/__tests__/setup.tsx',
    '!**/__tests__/__mocks__/**/*.[jt]s?(x)',
  ],
};