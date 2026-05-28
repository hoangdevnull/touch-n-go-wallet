const { withAndroidManifest } = require("@expo/config-plugins");

// Sets android:extractNativeLibs="false" on the <application> tag.
// Combined with expo.useLegacyPackaging=false this tells Android to load
// .so files directly from the APK via mmap rather than extracting them,
// which satisfies the 16KB page-size alignment requirement.
module.exports = function withExtractNativeLibs(config) {
  return withAndroidManifest(config, (cfg) => {
    const app = cfg.modResults.manifest.application?.[0];
    if (app) {
      app.$["android:extractNativeLibs"] = "false";
    }
    return cfg;
  });
};
