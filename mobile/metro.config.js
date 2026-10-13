const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Restrict workers to 1 so the transform pipeline runs safely in single-threaded mode
config.maxWorkers = 1;

module.exports = config;
