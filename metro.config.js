const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add crypto polyfill for React Native
config.resolver.alias = {
  ...config.resolver.alias,
  crypto: 'crypto-js',
  stream: 'readable-stream',
  buffer: 'buffer',
  util: 'util',
  events: 'events',
  path: 'path-browserify',
  os: 'os-browserify/browser',
  fs: false,
  net: false,
  tls: false,
  'cipher-base': 'cipher-base',
  'create-hash': 'create-hash',
  'string_decoder': 'string_decoder',
  'inherits': 'inherits',
  'to-buffer': 'to-buffer',
};

// Add Node.js polyfills
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Add resolver source extensions
config.resolver.sourceExts = [...config.resolver.sourceExts, 'cjs'];

// Add global polyfills
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

module.exports = config;
