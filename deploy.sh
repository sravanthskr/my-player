#!/bin/bash

# Deployment script for production environments like Render

echo "Starting deployment build..."

# Set production environment
export NODE_ENV=production

# Clean previous build
rm -rf dist/

# Build the frontend
echo "Building frontend..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    
    # List build output
    echo "Build output:"
    ls -la dist/
    
    if [ -d "dist/public" ]; then
        echo "✅ Frontend built to dist/public"
        ls -la dist/public/
    else
        echo "❌ Frontend build failed - dist/public not found"
        exit 1
    fi
    
    if [ -f "dist/index.js" ]; then
        echo "✅ Server built to dist/index.js"
    else
        echo "❌ Server build failed - dist/index.js not found"
        exit 1
    fi
    
    echo "🚀 Ready to start with: npm start"
else
    echo "❌ Build failed!"
    exit 1
fi