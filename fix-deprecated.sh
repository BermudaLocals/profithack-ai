#!/bin/bash
echo "🔧 FIXING DEPRECATED PACKAGES..."

# 1. Update rimraf and uuid
npm update rimraf uuid

# 2. Remove broken packages (won't break if not present)
npm remove phantomjs-prebuilt request 2>/dev/null || true

# 3. Update TypeScript types for Node 20
npm install --save-dev @types/node@20

# 4. Force update package-lock.json
npm install

echo "✅ DEPRECATED PACKAGES FIXED!"
echo "📦 Changes made to: package.json and package-lock.json"
echo "🚀 Commit these files:"
echo "   git add package.json package-lock.json"
echo "   git commit -m 'fix: update deprecated dependencies'"
echo "   git push origin main"
