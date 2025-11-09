#!/bin/bash

# EAS Build hook to update CocoaPods repos before pod install
# This ensures IdensicMobileSDK from Sumsub can be found

echo "Cleaning up CocoaPods cache to avoid version conflicts..."

# Remove Podfile.lock if it exists (will be regenerated)
if [ -f "ios/Podfile.lock" ]; then
  echo "Removing old Podfile.lock..."
  rm -f ios/Podfile.lock
fi

# Remove Pods/Local Podspecs which can cause version conflicts
if [ -d "ios/Pods/Local Podspecs" ]; then
  echo "Removing Pods/Local Podspecs to clear cached versions..."
  rm -rf "ios/Pods/Local Podspecs"
fi

# Remove Pods directory to ensure clean install
if [ -d "ios/Pods" ]; then
  echo "Removing Pods directory for clean install..."
  rm -rf ios/Pods
fi

echo "Adding Sumsub CocoaPods spec repository..."
pod repo add SumSubstance-Specs https://github.com/SumSubstance/Specs.git 2>/dev/null || true

echo "Updating CocoaPods repositories..."
pod repo update trunk || true
pod repo update SumSubstance-Specs 2>/dev/null || true

echo "CocoaPods cleanup and repo update completed"

