#!/bin/sh

START_DIR="$(pwd)"
EXIFR_PATH="node_modules/exifr"
BUILD_FILE="$EXIFR_PATH/dist/full.esm.mjs"

# Check if build output already exists
if [ -f "$BUILD_FILE" ]; then
  echo "exifr already built — skipping."
  exit 0
fi

cd "$EXIFR_PATH" || exit 1

echo "building exifr..."
yarn install
yarn build-full

cd "$START_DIR" || exit 1