#!/usr/bin/env bash
set -euo pipefail

SCHEME="${SCHEME:-ChitongInternal}"
CONFIGURATION="${CONFIGURATION:-Release}"
EXPORT_OPTIONS="${EXPORT_OPTIONS:-ios/ChitongInternal/ExportOptions-AdHoc.plist}"
PROJECT="ios/ChitongInternal/ChitongInternal.xcodeproj"
ARCHIVE_PATH="build/ios/${SCHEME}.xcarchive"
EXPORT_PATH="build/ios/export"

mkdir -p build/ios

xcodebuild archive \
  -project "$PROJECT" \
  -scheme "$SCHEME" \
  -configuration "$CONFIGURATION" \
  -destination "generic/platform=iOS" \
  -archivePath "$ARCHIVE_PATH"

xcodebuild -exportArchive \
  -archivePath "$ARCHIVE_PATH" \
  -exportOptionsPlist "$EXPORT_OPTIONS" \
  -exportPath "$EXPORT_PATH"

echo "IPA exported to: $EXPORT_PATH"
