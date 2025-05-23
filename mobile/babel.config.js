module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'], // Assuming './' refers to the 'mobile' directory where this babel.config.js is
          alias: {
            '@': './', // Alias '@/' to 'mobile/'
          },
        },
      ],
      // Add other plugins here if needed, e.g., 'react-native-reanimated/plugin'
      // Ensure 'react-native-reanimated/plugin' is last if you use it.
    ],
  };
}; 