/**
 * Script to generate app icons from zap-logo.svg
 * 
 * This script converts the SVG logo to PNG format for use as app icons.
 * 
 * Usage:
 *   npm install --save-dev sharp
 *   node scripts/generate-icons.js
 */

const fs = require('fs');
const path = require('path');

// Check if sharp is available
let sharp;
try {
  sharp = require('sharp');
} catch (error) {
  console.error('❌ Error: sharp is not installed.');
  console.log('\n📦 Please install sharp first:');
  console.log('   npm install --save-dev sharp\n');
  process.exit(1);
}

const SVG_PATH = path.join(__dirname, '../assets/svg/zap-logo.svg');
const OUTPUT_DIR = path.join(__dirname, '../assets/images');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Check if SVG exists
if (!fs.existsSync(SVG_PATH)) {
  console.error(`❌ SVG file not found at: ${SVG_PATH}`);
  process.exit(1);
}

console.log('🎨 Generating app icons from SVG...\n');

// Icon configurations
const icons = [
  {
    name: 'icon.png',
    size: 1024,
    description: 'iOS App Icon',
    options: { background: { r: 96, g: 69, b: 254, alpha: 1 } } // #6045FE
  },
  {
    name: 'android-icon-foreground.png',
    size: 1024,
    description: 'Android Adaptive Icon Foreground',
    options: { background: null } // Transparent
  },
  {
    name: 'android-icon-background.png',
    size: 1024,
    description: 'Android Adaptive Icon Background',
    options: { background: { r: 96, g: 69, b: 254, alpha: 1 } } // Solid purple
  },
  {
    name: 'splash-icon.png',
    size: 200,
    description: 'Splash Screen Icon',
    options: { background: null } // Transparent
  },
  {
    name: 'favicon.png',
    size: 64,
    description: 'Web Favicon',
    options: { background: { r: 96, g: 69, b: 254, alpha: 1 } } // #6045FE
  }
];

// Generate icons
async function generateIcons() {
  for (const icon of icons) {
    try {
      const outputPath = path.join(OUTPUT_DIR, icon.name);
      
      let image = sharp(SVG_PATH).resize(icon.size, icon.size, {
        fit: 'contain',
        background: icon.options.background || { r: 0, g: 0, b: 0, alpha: 0 }
      });

      // For solid background images (android-icon-background), create a solid color image
      if (icon.name === 'android-icon-background.png') {
        image = sharp({
          create: {
            width: icon.size,
            height: icon.size,
            channels: 4,
            background: icon.options.background
          }
        });
      } else if (icon.options.background) {
        // For icons with background, composite the SVG on top
        const svgBuffer = await sharp(SVG_PATH)
          .resize(icon.size, icon.size, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          })
          .toBuffer();
        
        image = sharp({
          create: {
            width: icon.size,
            height: icon.size,
            channels: 4,
            background: icon.options.background
          }
        }).composite([{ input: svgBuffer, gravity: 'center' }]);
      }

      await image.png().toFile(outputPath);
      
      console.log(`✅ Generated: ${icon.name} (${icon.size}x${icon.size}) - ${icon.description}`);
    } catch (error) {
      console.error(`❌ Failed to generate ${icon.name}:`, error.message);
    }
  }
  
  console.log('\n🎉 All icons generated successfully!');
  console.log(`📁 Output directory: ${OUTPUT_DIR}\n`);
}

// Run the script
generateIcons().catch(error => {
  console.error('❌ Error generating icons:', error);
  process.exit(1);
});

