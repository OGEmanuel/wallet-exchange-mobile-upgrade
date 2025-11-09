/**
 * Script to generate app icons from zap-logo.svg
 * 
 * This script converts the SVG logo to PNG format for use as app icons.
 * 
 * Requirements:
 * - Install sharp: npm install --save-dev sharp
 * - Or use an online SVG to PNG converter
 * 
 * For now, this script provides instructions and can be extended to use sharp
 * or other image processing libraries.
 */

const fs = require('fs');
const path = require('path');

const SVG_PATH = path.join(__dirname, '../assets/svg/zap-logo.svg');
const OUTPUT_DIR = path.join(__dirname, '../assets/images');

// Icon sizes needed
const ICON_SIZES = {
  ios: [1024], // iOS requires 1024x1024
  android: {
    foreground: 1024, // Android adaptive icon foreground
    background: 1024, // Android adaptive icon background (solid color)
  },
  splash: 200, // Splash screen icon size
};

console.log('📱 App Icon Generation Guide');
console.log('============================\n');
console.log('To generate app icons from the SVG logo:\n');
console.log('1. iOS Icon (icon.png):');
console.log('   - Size: 1024x1024 pixels');
console.log('   - Format: PNG');
console.log('   - Background: Transparent or #6045FE (purple)');
console.log('   - Output: ./assets/images/icon.png\n');

console.log('2. Android Adaptive Icon:');
console.log('   - Foreground (android-icon-foreground.png):');
console.log('     * Size: 1024x1024 pixels');
console.log('     * Format: PNG');
console.log('     * Background: Transparent');
console.log('     * Contains: The green "Z" logo');
console.log('   - Background (android-icon-background.png):');
console.log('     * Size: 1024x1024 pixels');
console.log('     * Format: PNG');
console.log('     * Solid color: #6045FE (purple)');
console.log('   - Output: ./assets/images/android-icon-foreground.png');
console.log('            ./assets/images/android-icon-background.png\n');

console.log('3. Splash Screen Icon (splash-icon.png):');
console.log('   - Size: 200x200 pixels (or larger, will be scaled)');
console.log('   - Format: PNG');
console.log('   - Background: Transparent');
console.log('   - Contains: The green "Z" logo');
console.log('   - Output: ./assets/images/splash-icon.png\n');

console.log('4. Web Favicon (favicon.png):');
console.log('   - Size: 32x32 or 64x64 pixels');
console.log('   - Format: PNG');
console.log('   - Background: Transparent or #6045FE');
console.log('   - Output: ./assets/images/favicon.png\n');

console.log('Recommended Tools:');
console.log('- Online: https://cloudconvert.com/svg-to-png');
console.log('- CLI: Use sharp (npm install --save-dev sharp)');
console.log('- Design: Figma, Sketch, or Adobe Illustrator\n');

console.log('SVG Source:', SVG_PATH);
console.log('Output Directory:', OUTPUT_DIR);

// Check if SVG exists
if (fs.existsSync(SVG_PATH)) {
  console.log('\n✅ SVG file found at:', SVG_PATH);
} else {
  console.log('\n❌ SVG file not found at:', SVG_PATH);
}

