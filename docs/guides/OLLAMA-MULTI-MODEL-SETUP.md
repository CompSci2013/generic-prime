# Ollama Multi-Model Setup for Mimir

**Purpose**: Configure Ollama to keep multiple models loaded simultaneously, enabling fast pipeline workflows without model swap delays.

**Use Case**: Browser automation pipeline where:
1. Vision model (Qwen3-VL) analyzes screenshots
2. Coder model (Qwen3-Coder) writes automation code

---

## Prerequisites

- Mimir (Mac Studio M3 Ultra, 256GB)
- Models downloaded:
  - `qwen3-vl:235b-a22b-instruct-q4_K_M` (143GB)
  - `qwen3-coder-256k` (30GB)
- Combined size: ~173GB (fits in 240GB budget)

---

## Step 1: Configure Ollama Environment

SSH to Mimir and edit the Ollama launch configuration:

```bash
ssh mimir
```

### Option A: LaunchAgent (Recommended - Persists across reboots)

Edit or create the Ollama LaunchAgent:

```bash
nano ~/Library/LaunchAgents/com.ollama.ollama.plist
```

Add/modify the `EnvironmentVariables` section:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.ollama.ollama</string>
    <key>ProgramArguments</key>
    <array>
        <string>/opt/homebrew/bin/ollama</string>
        <string>serve</string>
    </array>
    <key>EnvironmentVariables</key>
    <dict>
        <key>OLLAMA_HOST</key>
        <string>0.0.0.0</string>
        <key>OLLAMA_MAX_LOADED_MODELS</key>
        <string>2</string>
        <key>OLLAMA_KEEP_ALIVE</key>
        <string>24h</string>
    </dict>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
</dict>
</plist>
```

Load the updated configuration:

```bash
launchctl unload ~/Library/LaunchAgents/com.ollama.ollama.plist
launchctl load ~/Library/LaunchAgents/com.ollama.ollama.plist
```

### Option B: Environment Variables (Current session only)

```bash
# Stop existing Ollama
pkill ollama

# Start with multi-model support
export OLLAMA_HOST=0.0.0.0
export OLLAMA_MAX_LOADED_MODELS=2
export OLLAMA_KEEP_ALIVE=24h
ollama serve &
```

---

## Step 2: Environment Variables Explained

| Variable | Value | Purpose |
|----------|-------|---------|
| `OLLAMA_HOST` | `0.0.0.0` | Listen on all interfaces (required for remote access) |
| `OLLAMA_MAX_LOADED_MODELS` | `2` | Keep up to 2 models in memory simultaneously |
| `OLLAMA_KEEP_ALIVE` | `24h` | Don't unload models for 24 hours of inactivity |

---

## Step 3: Pre-load Both Models

After Ollama restarts with the new config, pre-load both models:

```bash
# From Thor (or any machine)
# Load Vision model
curl -s http://mimir:11434/api/generate -d '{
  "model": "qwen3-vl:235b-a22b-instruct-q4_K_M",
  "prompt": "hello",
  "stream": false
}' > /dev/null

# Load Coder model
curl -s http://mimir:11434/api/generate -d '{
  "model": "qwen3-coder-256k",
  "prompt": "hello",
  "stream": false
}' > /dev/null

# Verify both are loaded
curl -s http://mimir:11434/api/ps | jq '.models[].name'
```

Expected output:
```
"qwen3-vl:235b-a22b-instruct-q4_K_M"
"qwen3-coder-256k"
```

---

## Step 4: Verify Memory Usage

Check that both models fit:

```bash
# From Thor
curl -s http://mimir:11434/api/ps | jq '.models[] | {name, size_gb: (.size / 1073741824 | floor)}'
```

Expected:
```json
{"name": "qwen3-vl:235b-a22b-instruct-q4_K_M", "size_gb": 143}
{"name": "qwen3-coder-256k", "size_gb": 30}
```

Check Mimir's memory pressure:
```bash
ssh mimir "memory_pressure | head -5"
```

Memory pressure should stay below 80%. If it's critical (>90%), reduce to one model.

---

## Step 5: Using the Pipeline

### Vision Model (Screenshot Analysis)

```bash
# Base64 encode image and send to vision model
IMAGE_BASE64=$(base64 -w 0 /path/to/screenshot.png)
curl -s http://mimir:11434/api/generate -d "{
  \"model\": \"qwen3-vl:235b-a22b-instruct-q4_K_M\",
  \"prompt\": \"Describe the UI elements in this screenshot. List all buttons, inputs, and their locations.\",
  \"images\": [\"$IMAGE_BASE64\"],
  \"stream\": false
}" | jq -r '.response'
```

### Coder Model (Code Generation)

```bash
curl -s http://mimir:11434/api/generate -d '{
  "model": "qwen3-coder-256k",
  "prompt": "Write a Playwright script to click the Submit button at coordinates (450, 320)",
  "stream": false
}' | jq -r '.response'
```

Both requests return immediately without model loading delays.

---

## Step 6: Create Helper Script

Create a pipeline helper on Thor:

```bash
cat << 'EOF' > ~/bin/vision-to-code
#!/bin/bash
# Usage: vision-to-code <screenshot.png> "<task description>"

IMAGE_PATH="$1"
TASK="$2"

if [ ! -f "$IMAGE_PATH" ]; then
    echo "Error: Image not found: $IMAGE_PATH"
    exit 1
fi

echo "=== Step 1: Analyzing screenshot with Vision model ==="
IMAGE_BASE64=$(base64 -w 0 "$IMAGE_PATH")
DESCRIPTION=$(curl -s http://mimir:11434/api/generate -d "{
  \"model\": \"qwen3-vl:235b-a22b-instruct-q4_K_M\",
  \"prompt\": \"Analyze this UI screenshot. Identify all interactive elements (buttons, links, inputs) with their approximate positions. Be specific about element text and locations.\",
  \"images\": [\"$IMAGE_BASE64\"],
  \"stream\": false
}" | jq -r '.response')

echo "$DESCRIPTION"
echo ""
echo "=== Step 2: Generating code with Coder model ==="

PROMPT="Based on this UI analysis:

$DESCRIPTION

Task: $TASK

Write a Playwright TypeScript script to accomplish this task. Use specific selectors based on the UI elements identified."

curl -s http://mimir:11434/api/generate -d "{
  \"model\": \"qwen3-coder-256k\",
  \"prompt\": $(echo "$PROMPT" | jq -Rs .),
  \"stream\": false
}" | jq -r '.response'
EOF

chmod +x ~/bin/vision-to-code
```

Usage:
```bash
vision-to-code /tmp/screenshot.png "Click the login button and fill in the username field"
```

---

## Troubleshooting

### Models Not Staying Loaded

Check if `OLLAMA_MAX_LOADED_MODELS` is set:
```bash
ssh mimir "ps aux | grep ollama"
# Look for environment variables in the process
```

### Out of Memory

If memory pressure is critical:
1. Use smaller context windows (reduce `num_ctx`)
2. Use only one large model at a time
3. Consider Q4 quantization for both models

### Checking Loaded Models

```bash
# Quick check from Thor
curl -s http://mimir:11434/api/ps | jq -r '.models[].name'

# Or use mimir-watch
mimir-watch
```

---

## Memory Budget Summary

| Component | Size |
|-----------|------|
| macOS Reserved | 16GB |
| Qwen3-VL Q4 | 143GB |
| Qwen3-Coder | 30GB |
| KV Cache (both models, minimal context) | ~10GB |
| **Total** | **~199GB** |
| **Headroom** | **~57GB** |

This leaves room for moderate context windows on both models.

---

## Alternative: Scout-Only Setup

If multi-model complexity isn't worth it, use Llama 4 Scout (62GB) for everything:

- Handles both vision and code
- 10M token context
- Single model, no swapping
- Simpler setup

```bash
ollama run llama4:scout "Analyze this screenshot and write code to click the Submit button" --images /path/to/screenshot.png
```

---

**Created**: 2025-12-31 (Session 68)
**Last Updated**: 2025-12-31
