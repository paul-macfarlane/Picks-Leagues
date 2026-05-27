#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUTPUT_DIR="$REPO_ROOT/.vercel/output"
FUNC_DIR="$OUTPUT_DIR/functions/api.func"

echo "Cleaning $OUTPUT_DIR..."
rm -rf "$OUTPUT_DIR"
mkdir -p "$FUNC_DIR"
mkdir -p "$OUTPUT_DIR/static"

echo "Building web app..."
pnpm --filter @picksleagues/web build

echo "Copying web static files..."
cp -r "$REPO_ROOT/apps/web/dist/." "$OUTPUT_DIR/static/"

echo "Bundling API function..."
esbuild "$REPO_ROOT/services/api/src/vercel-entry.ts" \
  --bundle \
  --format=esm \
  --platform=node \
  --target=node22 \
  --outfile="$FUNC_DIR/index.js"

echo "Writing function package.json (ESM)..."
cat > "$FUNC_DIR/package.json" << 'EOF'
{ "type": "module" }
EOF

echo "Writing function config..."
cat > "$FUNC_DIR/.vc-config.json" << 'EOF'
{
  "runtime": "nodejs22.x",
  "handler": "index.js",
  "launcherType": "Nodejs",
  "shouldAddHelpers": false
}
EOF

echo "Writing output config..."
cat > "$OUTPUT_DIR/config.json" << 'EOF'
{
  "version": 3,
  "routes": [
    { "src": "^/api(?:/.*)?$", "dest": "/api" },
    { "handle": "filesystem" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
EOF

echo "Build complete. Output at $OUTPUT_DIR"
