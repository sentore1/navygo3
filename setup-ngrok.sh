#!/bin/bash

# Polar Sandbox + ngrok Setup Script
# This script helps you set up ngrok for testing Polar payments

echo "🚀 Polar Sandbox + ngrok Setup"
echo "================================"
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok is not installed"
    echo ""
    echo "Please install ngrok:"
    echo "  1. Visit: https://ngrok.com/download"
    echo "  2. Download and extract ngrok"
    echo "  3. Add ngrok to your PATH"
    echo "  4. Run: ngrok config add-authtoken YOUR_TOKEN"
    echo ""
    exit 1
fi

echo "✅ ngrok is installed"
echo ""

# Check if dev server is running
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "⚠️  Development server is not running on port 3000"
    echo ""
    echo "Please start your dev server first:"
    echo "  npm run dev"
    echo ""
    echo "Then run this script again."
    exit 1
fi

echo "✅ Development server is running"
echo ""

# Start ngrok
echo "🌐 Starting ngrok tunnel..."
echo ""
echo "Press Ctrl+C to stop ngrok"
echo ""
echo "After ngrok starts:"
echo "  1. Copy the https://....ngrok-free.app URL"
echo "  2. Update .env.local with NEXT_PUBLIC_SITE_URL"
echo "  3. Configure Polar webhook: https://sandbox.polar.sh"
echo "  4. Restart your dev server"
echo ""
echo "================================"
echo ""

ngrok http 3000
