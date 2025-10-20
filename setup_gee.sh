#!/bin/bash

# Google Earth Engine Setup Script for CMU APSCO Project

echo "🌍 Google Earth Engine Setup for CMU APSCO"
echo "=========================================="
echo ""

# Check if docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Navigate to project directory
cd "$(dirname "$0")"
PROJECT_DIR=$(pwd)

echo "📁 Project directory: $PROJECT_DIR"
echo ""

# Step 1: Build containers with new dependencies
echo "🔨 Step 1: Building containers with new dependencies..."
docker compose build fastapi

if [ $? -ne 0 ]; then
    echo "❌ Failed to build containers"
    exit 1
fi

echo "✅ Containers built successfully"
echo ""

# Step 2: Start services
echo "🚀 Step 2: Starting services..."
docker compose up -d

if [ $? -ne 0 ]; then
    echo "❌ Failed to start services"
    exit 1
fi

echo "✅ Services started"
echo ""

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check if FastAPI is running
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ FastAPI is running"
else
    echo "⚠️  FastAPI may not be fully ready yet"
fi

echo ""
echo "=========================================="
echo "🎯 Next Steps for Google Earth Engine Authentication"
echo "=========================================="
echo ""
echo "Choose one authentication method:"
echo ""
echo "Option A: OAuth Authentication (Development)"
echo "--------------------------------------------"
echo "1. Run: docker compose exec fastapi earthengine authenticate"
echo "2. Follow the URL in your browser"
echo "3. Copy the authorization code back to terminal"
echo ""
echo "Option B: Service Account (Production)"
echo "---------------------------------------"
echo "1. Create a Google Cloud Project: https://console.cloud.google.com"
echo "2. Enable Earth Engine API"
echo "3. Create a Service Account and download JSON key"
echo "4. Register service account: https://signup.earthengine.google.com/#!/service_accounts"
echo "5. Save key file to: $PROJECT_DIR/fastapi/gee-service-account.json"
echo "6. Update .env file with your service account email"
echo ""
echo "=========================================="
echo "📊 Access Points"
echo "=========================================="
echo ""
echo "🌐 React Frontend: http://localhost:3000"
echo "🔧 FastAPI Backend: http://localhost:8000"
echo "📖 API Docs: http://localhost:8000/docs"
echo "🌍 NDVI Health Check: http://localhost:8000/api/ndvi/health"
echo ""
echo "=========================================="
echo ""

# Offer to run authentication now
read -p "Would you like to run OAuth authentication now? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🔐 Running Earth Engine authentication..."
    docker compose exec fastapi earthengine authenticate
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Authentication successful!"
    else
        echo ""
        echo "⚠️  Authentication failed or cancelled"
    fi
fi

echo ""
echo "✅ Setup complete! Visit http://localhost:3000 to see your app"
echo "📚 Read GEE_NDVI_SETUP.md for detailed documentation"
echo ""
