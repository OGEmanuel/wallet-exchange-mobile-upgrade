const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

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

// Add extraNodeModules for better Node.js polyfill support
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  crypto: require.resolve('crypto-js'),
  stream: require.resolve('readable-stream'),
  buffer: require.resolve('buffer'),
  util: require.resolve('util'),
  events: require.resolve('events'),
  path: require.resolve('path-browserify'),
  os: require.resolve('os-browserify/browser'),
  fs: require.resolve('react-native-level-fs'),
  'cipher-base': require.resolve('cipher-base'),
  'create-hash': require.resolve('create-hash'),
  'string_decoder': require.resolve('string_decoder'),
  inherits: require.resolve('inherits'),
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
