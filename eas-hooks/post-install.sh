#!/bin/bash

# EAS Build hook to build @zap/blockchain-sdk if dist folder is missing
# This ensures the SDK is built during EAS Build when installing from git

set -eo pipefail

SDK_PATH="node_modules/@zap/blockchain-sdk"
DIST_PATH="${SDK_PATH}/dist"

echo "🔍 Checking if @zap/blockchain-sdk needs to be built..."
echo "   Current directory: $(pwd)"
echo "   SDK path: ${SDK_PATH}"
echo "   Checking if SDK directory exists..."

# First, check what's actually in the SDK package
if [ -f "${SDK_PATH}/package.json" ]; then
  echo "   SDK package.json found, checking files array..."
  if command -v node &> /dev/null; then
    node -e "const pkg = require('${SDK_PATH}/package.json'); console.log('   Files in package.json:', JSON.stringify(pkg.files || [], null, 2));" 2>/dev/null || echo "   Could not parse package.json"
  fi
fi

# Check if SDK directory exists
if [ ! -d "${SDK_PATH}" ]; then
  echo "❌ SDK directory not found: ${SDK_PATH}"
  echo "   Listing node_modules/@zap/:"
  ls -la node_modules/@zap/ 2>/dev/null || echo "   @zap directory doesn't exist"
  exit 1
fi

# Check if dist folder exists and has react-native.js
if [ -d "${DIST_PATH}" ] && [ -f "${DIST_PATH}/react-native.js" ]; then
  echo "✅ @zap/blockchain-sdk dist folder already exists, skipping build"
  exit 0
fi

echo "⚠️  @zap/blockchain-sdk dist folder is missing, building..."
echo "   Listing files in SDK directory:"
ls -la "${SDK_PATH}" | head -20 || echo "   Could not list SDK directory"

# Check if source files exist
if [ ! -d "${SDK_PATH}/src" ]; then
  echo "❌ Source directory not found: ${SDK_PATH}/src"
  echo "   Available in SDK:"
  ls -la "${SDK_PATH}" || true
  exit 1
fi

if [ ! -f "${SDK_PATH}/rollup.config.js" ]; then
  echo "❌ rollup.config.js not found: ${SDK_PATH}/rollup.config.js"
  echo "   Available files:"
  ls -la "${SDK_PATH}"/*.js 2>/dev/null || echo "   No .js files found"
  exit 1
fi

echo "✅ Source files found, proceeding with build..."

# Navigate to SDK directory
echo "📂 Navigating to SDK directory: ${SDK_PATH}"
cd "${SDK_PATH}" || {
  echo "❌ Failed to navigate to ${SDK_PATH}"
  echo "   Current directory: $(pwd)"
  exit 1
}
echo "   Current directory after cd: $(pwd)"
echo "   Verifying we're in the right place..."
ls -la | head -10

# Install dependencies if needed
if [ ! -d "node_modules" ] || [ ! -f "node_modules/rollup/package.json" ]; then
  echo "Installing SDK dependencies..."
  
  # Try bun first (faster), fallback to npm
  if command -v bun &> /dev/null; then
    echo "Using bun to install dependencies..."
    set +e  # Temporarily disable exit on error
    bun install --production=false
    BUN_EXIT=$?
    set -e  # Re-enable exit on error
    if [ $BUN_EXIT -ne 0 ]; then
      echo "⚠️  bun install failed, trying npm..."
      npm install --production=false || {
        echo "❌ Failed to install SDK dependencies"
        exit 1
      }
    fi
  else
    echo "Using npm to install dependencies..."
    npm install --production=false || {
      echo "❌ Failed to install SDK dependencies"
      exit 1
    }
  fi
fi

# Build the SDK
echo "Building @zap/blockchain-sdk..."

# Try different build commands in order of preference
BUILD_SUCCESS=false

if command -v bunx &> /dev/null; then
  echo "Attempting build with bunx rollup..."
  set +e  # Temporarily disable exit on error
  bunx rollup -c rollup.config.js
  BUILD_EXIT=$?
  set -e  # Re-enable exit on error
  if [ $BUILD_EXIT -eq 0 ]; then
    BUILD_SUCCESS=true
  fi
fi

if [ "$BUILD_SUCCESS" = false ] && command -v npx &> /dev/null; then
  echo "Attempting build with npx rollup..."
  set +e
  npx rollup -c rollup.config.js
  BUILD_EXIT=$?
  set -e
  if [ $BUILD_EXIT -eq 0 ]; then
    BUILD_SUCCESS=true
  fi
fi

if [ "$BUILD_SUCCESS" = false ]; then
  echo "Attempting build with npm run build..."
  npm run build || {
    echo "❌ All build methods failed"
    echo "   Checking if rollup is available..."
    if command -v rollup &> /dev/null; then
      echo "   rollup command found, but build failed"
    else
      echo "   rollup command not found"
    fi
    if [ -f "node_modules/rollup/package.json" ]; then
      echo "   rollup package found in node_modules"
    else
      echo "   rollup package NOT found in node_modules"
    fi
    exit 1
  }
fi

# Verify the build output
echo "🔍 Verifying build output..."
if [ ! -f "dist/react-native.js" ]; then
  echo "❌ Build completed but dist/react-native.js is missing"
  if [ -d "dist" ]; then
    echo "   Files in dist/:"
    ls -la dist/ || echo "   Could not list dist/"
  else
    echo "   dist/ folder doesn't exist"
  fi
  echo "   Current directory: $(pwd)"
  echo "   Checking if we're in the right place..."
  ls -la | head -10
  exit 1
fi

echo "✅ @zap/blockchain-sdk built successfully"
echo "   dist/react-native.js exists: $(test -f dist/react-native.js && echo 'YES' || echo 'NO')"
echo "   File size: $(ls -lh dist/react-native.js | awk '{print $5}')"

