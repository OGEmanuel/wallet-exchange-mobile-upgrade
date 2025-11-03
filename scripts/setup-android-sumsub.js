#!/usr/bin/env node

/**
 * Setup script for Android Sumsub integration
 * This script helps configure Android build files for Sumsub SDK
 */

const fs = require('fs');
const path = require('path');

const ANDROID_DIR = path.join(__dirname, '..', 'android');
const BUILD_GRADLE_PATH = path.join(ANDROID_DIR, 'build.gradle');
const APP_BUILD_GRADLE_PATH = path.join(ANDROID_DIR, 'app', 'build.gradle');
const MANIFEST_PATH = path.join(ANDROID_DIR, 'app', 'src', 'main', 'AndroidManifest.xml');

const SUMSUB_MAVEN_REPO = 'maven { url "https://maven.sumsub.com/repository/maven-releases/" }';
const SUMSUB_MAVEN_PUBLIC = 'maven { url "https://maven.sumsub.com/repository/maven-public/" }';

console.log('🔧 Setting up Android Sumsub integration...\n');

// Check if Android directory exists
if (!fs.existsSync(ANDROID_DIR)) {
  console.log('⚠️  Android directory not found.');
  console.log('📝 Please run: npx expo prebuild --platform android');
  console.log('   Then run this script again.\n');
  process.exit(1);
}

// Function to check if string exists in file
function fileContains(filePath, searchString) {
  if (!fs.existsSync(filePath)) return false;
  const content = fs.readFileSync(filePath, 'utf8');
  return content.includes(searchString);
}

// Function to add repository if not present
function addRepositoryIfNeeded(filePath, repoString) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return false;
  }

  if (fileContains(filePath, repoString)) {
    console.log(`✅ Repository already added: ${repoString}`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  
  // Find allprojects or repositories block
  if (content.includes('allprojects')) {
    // Add to allprojects repositories
    content = content.replace(
      /(allprojects\s*\{[\s\S]*?repositories\s*\{)/,
      `$1\n        ${repoString}`
    );
  } else if (content.includes('repositories')) {
    // Add to repositories block
    content = content.replace(
      /(repositories\s*\{)/,
      `$1\n        ${repoString}`
    );
  } else {
    // Add allprojects block if it doesn't exist
    content = `allprojects {\n    repositories {\n        google()\n        mavenCentral()\n        ${repoString}\n    }\n}\n\n${content}`;
  }

  fs.writeFileSync(filePath, content);
  console.log(`✅ Added repository to ${path.basename(filePath)}: ${repoString}`);
  return true;
}

// Setup project-level build.gradle
console.log('📝 Checking project-level build.gradle...');
if (fs.existsSync(BUILD_GRADLE_PATH)) {
  addRepositoryIfNeeded(BUILD_GRADLE_PATH, SUMSUB_MAVEN_REPO);
  addRepositoryIfNeeded(BUILD_GRADLE_PATH, SUMSUB_MAVEN_PUBLIC);
} else {
  console.log('⚠️  build.gradle not found. Android project may not be generated yet.');
}

// Check AndroidManifest.xml
console.log('\n📝 Checking AndroidManifest.xml...');
if (fs.existsSync(MANIFEST_PATH)) {
  let manifest = fs.readFileSync(MANIFEST_PATH, 'utf8');
  
  const permissions = [
    'android.permission.CAMERA',
    'android.permission.INTERNET'
  ];

  let modified = false;
  permissions.forEach(permission => {
    if (!manifest.includes(permission)) {
      console.log(`⚠️  Missing permission: ${permission}`);
      console.log(`   Add this to AndroidManifest.xml: <uses-permission android:name="${permission}" />`);
    } else {
      console.log(`✅ Permission found: ${permission}`);
    }
  });
} else {
  console.log('⚠️  AndroidManifest.xml not found.');
}

console.log('\n✅ Android Sumsub setup check complete!');
console.log('\n📋 Next steps:');
console.log('   1. Verify the Maven repositories were added to android/build.gradle');
console.log('   2. Ensure permissions are in AndroidManifest.xml');
console.log('   3. Sync Gradle: cd android && ./gradlew clean && cd ..');
console.log('   4. Rebuild: npx expo run:android\n');

