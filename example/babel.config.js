const path = require('path');
const { getConfig } = require('react-native-builder-bob/babel-config');
const pkg = require('../package.json');

const root = path.resolve(__dirname, '..');

module.exports = function (api) {
  api.cache(true);

  const config = getConfig(
    {
      presets: ['babel-preset-expo'],
      plugins: ['react-native-reanimated/plugin'],
    },
    { root, pkg }
  );

  // builder-bob's source override matches the library's `src` with a string
  // `include`. Since SDK 56, Metro computes a transform cache key by loading
  // the Babel config with no filename, and Babel rejects string/RegExp matchers
  // in that case ("Configuration contains string/RegExp pattern, but no filename
  // was passed to Babel"). Function matchers are exempt, so convert the string
  // path into one that simply returns false when there's no filename to match.
  config.overrides = config.overrides?.map((override) => {
    if (typeof override.include !== 'string') {
      return override;
    }

    const dir = override.include;
    return {
      ...override,
      include: (filename) => filename != null && filename.startsWith(dir),
    };
  });

  return config;
};
