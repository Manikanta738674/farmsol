const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.transformer.babelTransformerPath = path.resolve(__dirname, 'frontend-farmer', 'metro-patch-transformer.js');

module.exports = config;
