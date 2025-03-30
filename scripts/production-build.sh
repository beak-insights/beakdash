#!/bin/bash

# Production Build Script for BeakDash

echo "🚀 Starting production build process..."

# Create dirs if they don't exist
mkdir -p dist

# Step 1: Build the frontend
echo "📦 Building frontend..."
npm run build

# Step 2: Copy production files to dist directory
echo "📂 Organizing production files..."

# Step 3: Set environment to production
echo "⚙️ Setting up environment variables..."
echo "NODE_ENV=production" > dist/.env

echo "✅ Build completed successfully!"
echo ""
echo "To start the application in production mode, run:"
echo "npm start"
echo ""