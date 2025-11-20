let getDefaultConfig;
try {
  getDefaultConfig = require("@expo/metro-config").getDefaultConfig;
} catch (e) {
  getDefaultConfig = require("expo/metro-config").getDefaultConfig;
}
module.exports = getDefaultConfig(__dirname);
