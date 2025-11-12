# App Icon & Splash Screen Setup Guide

This guide explains how to set up the app icon and splash screen for **Zap Wallet**.

## App Configuration

The app has been configured with:
- **App Name**: Zap Wallet
- **Bundle ID**: com.zapapp
- **Icon**: Uses the Zap logo (purple background with green "Z")
- **Splash Screen**: Purple background (#6045FE) with centered Zap logo

## Required Icon Files

You need to generate the following PNG files from `assets/svg/zap-logo.svg`:

### 1. iOS Icon (`assets/images/icon.png`)
- **Size**: 1024x1024 pixels
- **Format**: PNG
- **Background**: Transparent or solid purple (#6045FE)
- **Content**: Full Zap logo (purple rounded square with green "Z")

### 2. Android Adaptive Icon Foreground (`assets/images/android-icon-foreground.png`)
- **Size**: 1024x1024 pixels
- **Format**: PNG
- **Background**: Transparent
- **Content**: Just the green "Z" logo (the purple background will be added by Android)

### 3. Android Adaptive Icon Background (`assets/images/android-icon-background.png`)
- **Size**: 1024x1024 pixels
- **Format**: PNG
- **Background**: Solid purple (#6045FE)
- **Content**: Solid color only (no logo)

### 4. Splash Screen Icon (`assets/images/splash-icon.png`)
- **Size**: 200x200 pixels (or larger, will be scaled down)
- **Format**: PNG
- **Background**: Transparent
- **Content**: Full Zap logo (purple rounded square with green "Z")

### 5. Web Favicon (`assets/images/favicon.png`)
- **Size**: 32x32 or 64x64 pixels
- **Format**: PNG
- **Background**: Transparent or solid purple (#6045FE)
- **Content**: Zap logo (scaled down)

## How to Generate Icons

### Option 1: Online Tools (Easiest)
1. Go to [CloudConvert](https://cloudconvert.com/svg-to-png) or [SVG to PNG Converter](https://svgtopng.com/)
2. Upload `assets/svg/zap-logo.svg`
3. Set the output size (1024x1024 for main icons, 200x200 for splash)
4. Download and save to the appropriate location in `assets/images/`

### Option 2: Using Design Tools
1. Open `assets/svg/zap-logo.svg` in Figma, Sketch, or Adobe Illustrator
2. Export as PNG with the required dimensions
3. Save to `assets/images/` with the correct filename

### Option 3: Using ImageMagick (CLI)
```bash
# Install ImageMagick first
brew install imagemagick  # macOS
# or
sudo apt-get install imagemagick  # Linux

# Convert SVG to PNG
convert -background none -resize 1024x1024 assets/svg/zap-logo.svg assets/images/icon.png
convert -background none -resize 1024x1024 assets/svg/zap-logo.svg assets/images/android-icon-foreground.png
convert -background "#6045FE" -resize 1024x1024 assets/svg/zap-logo.svg assets/images/android-icon-background.png
convert -background none -resize 200x200 assets/svg/zap-logo.svg assets/images/splash-icon.png
convert -background none -resize 64x64 assets/svg/zap-logo.svg assets/images/favicon.png
```

### Option 4: Using Sharp (Node.js)
```bash
npm install --save-dev sharp
node scripts/generate-app-icons.js
```

## Color Reference

- **Purple Background**: `#6045FE` (RGB: 96, 69, 254)
- **Green "Z"**: `#DBFC57` (RGB: 219, 252, 87)

## Current Configuration

The `app.json` file has been configured with:
- App name: "Zap Wallet"
- Bundle ID: com.zapapp (iOS and Android)
- Splash screen background: #6045FE (purple)
- Android adaptive icon background: #6045FE

## Testing

After generating the icons:
1. Run `npx expo prebuild --clean` to regenerate native projects
2. For iOS: The icon will appear in Xcode
3. For Android: The adaptive icon will appear in Android Studio
4. Test the splash screen by running the app

## Notes

- The splash screen uses a purple background (#6045FE) in both light and dark modes
- The Android adaptive icon uses a solid purple background with the green "Z" as the foreground
- Make sure all PNG files are properly optimized (use tools like [TinyPNG](https://tinypng.com/) if needed)

