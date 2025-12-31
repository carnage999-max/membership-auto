module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './',
            '@api': './api',
            '@assets': './assets',
            '@components': './components',
            '@constants': './constants',
            '@features': './features',
            '@hooks': './hooks',
            '@locales': './locales',
            '@services': './services',
            '@stores': './stores',
            '@types': './types',
            '@utils': './utils',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
