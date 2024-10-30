// testApkReader.js
const reader = require('./lib/apkReader');

// Set the directory for APKs (modify this path if needed)
reader.setRepoDir('.apk_repo');

// Test reading available APKs
console.log('Available APKs:', reader.available());

// Test getting the last APK version of a package, e.g., "com.example.app"
console.log('Last APK for test app:', reader.last('test'));

// Test getting the next APK version
console.log('Next APK for test app:', reader.getNextVersion('test', 3)); // Replace "1" with a version to test
