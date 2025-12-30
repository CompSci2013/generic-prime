#!/bin/bash
# describe-image.sh - Use Llama 4 Scout to describe an image
# Usage: describe-image.sh <image_path> [prompt]
#
# Examples:
#   describe-image.sh screenshot.png
#   describe-image.sh error.png "What error is shown?"
#   describe-image.sh test-report.png "List the failing tests"

IMAGE_PATH="$1"
PROMPT="${2:-Describe this screenshot in detail, focusing on any error messages, test results, or important UI elements.}"

if [ -z "$IMAGE_PATH" ]; then
    echo "Usage: describe-image.sh <image_path> [prompt]"
    exit 1
fi

if [ ! -f "$IMAGE_PATH" ]; then
    echo "Error: File not found: $IMAGE_PATH"
    exit 1
fi

# Convert image to base64
IMAGE_BASE64=$(base64 -w 0 "$IMAGE_PATH")

# Get file extension for mime type
EXT="${IMAGE_PATH##*.}"
case "$EXT" in
    png) MIME="image/png" ;;
    jpg|jpeg) MIME="image/jpeg" ;;
    gif) MIME="image/gif" ;;
    webp) MIME="image/webp" ;;
    *) MIME="image/png" ;;
esac

# Call Ollama API with Scout model
curl -s http://mimir:11434/api/generate \
    -H "Content-Type: application/json" \
    -d "{
        \"model\": \"llama4:scout\",
        \"prompt\": \"$PROMPT\",
        \"images\": [\"$IMAGE_BASE64\"],
        \"stream\": false
    }" | jq -r '.response'
