#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:8080}"
OUTPUT="${1:-generated-room.png}"

echo "Sending request to $BASE_URL/api/v1/generate-room ..."

curl -X POST "$BASE_URL/api/v1/generate-room" \
  -H "Content-Type: application/json" \
  -d @"$(dirname "$0")/sample-request.json" \
  --output "$OUTPUT" \
  --fail \
  --show-error

echo "Done! Image saved to: $OUTPUT"
