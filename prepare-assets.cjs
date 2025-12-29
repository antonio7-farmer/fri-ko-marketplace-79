// Quick script to prepare app icon and splash screen assets
const fs = require('fs');
const path = require('path');

console.log('Preparing assets from logo...');

// For now, we'll copy the logo as-is for icon
// The @capacitor/assets tool will handle resizing
const logoPath = path.join(__dirname, 'public', 'logo.png');
const iconPath = path.join(__dirname, 'resources', 'icon.png');
const splashPath = path.join(__dirname, 'resources', 'splash.png');

// Copy logo to resources/icon.png
fs.copyFileSync(logoPath, iconPath);
console.log('✓ Created resources/icon.png from logo');

// Copy logo to resources/splash.png
fs.copyFileSync(logoPath, splashPath);
console.log('✓ Created resources/splash.png from logo');

console.log('\nNote: The @capacitor/assets tool will automatically:');
console.log('- Resize icon.png to 1024x1024 square (will center your rectangular logo)');
console.log('- Create splash.png at proper sizes with centered logo');
console.log('- Generate all required Android densities');
console.log('\nReady to run: npx capacitor-assets generate --android');
