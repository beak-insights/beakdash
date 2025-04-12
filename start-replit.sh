#!/bin/bash
# Custom Next.js startup script for Replit

# Set necessary environment variables
export PORT=5000
export HOSTNAME=0.0.0.0

# Start Next.js with proper port forwarding
node_modules/.bin/next dev -p 5000 -H 0.0.0.0