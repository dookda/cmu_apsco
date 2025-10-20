#!/bin/bash

echo "🚀 Starting CMU APSCO with Google Earth Engine"
echo "=============================================="
echo ""

# Check if .env file exists
if [ ! -f "fastapi/.env" ]; then
    echo "❌ Error: fastapi/.env file not found!"
    echo "Creating .env file from configuration..."
    cat > fastapi/.env << 'EOF'
# Google Earth Engine Configuration
GEE_SERVICE_ACCOUNT=gee-apsco@sakdagee.iam.gserviceaccount.com
GEE_KEY_FILE=sakdagee-aac5df75dc7f.json

# Database Configuration
DB_HOST=postgis
DB_PORT=5432
DB_NAME=gis
DB_USER=postgres
DB_PASSWORD=postgres

# API Configuration
PORT=8000
EOF
    echo "✅ Created fastapi/.env file"
fi

# Check if key file exists
if [ ! -f "fastapi/sakdagee-aac5df75dc7f.json" ]; then
    echo "❌ Error: Service account key file not found!"
    echo "   Expected: fastapi/sakdagee-aac5df75dc7f.json"
    echo ""
    echo "Please ensure the key file is in the fastapi directory."
    exit 1
else
    echo "✅ Key file found: fastapi/sakdagee-aac5df75dc7f.json"
fi

# Display .env contents
echo ""
echo "📋 Current .env configuration:"
echo "---"
grep "^GEE" fastapi/.env
echo "---"
echo ""

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker compose down

# Build and start containers
echo ""
echo "🔨 Building and starting containers..."
docker compose up --build -d

# Wait for containers to start
echo ""
echo "⏳ Waiting for containers to start (30 seconds)..."
sleep 30

# Check if containers are running
echo ""
echo "📊 Container status:"
docker compose ps

# Check FastAPI logs for GEE initialization
echo ""
echo "📝 Checking GEE initialization in logs:"
echo "---"
docker compose logs fastapi | grep -i "\[GEE Init\]" | tail -20
echo "---"

# Test health endpoint
echo ""
echo "🏥 Testing API health endpoint..."
HEALTH=$(curl -s http://localhost:8000/health 2>/dev/null)
if [ -n "$HEALTH" ]; then
    echo "✅ API Response: $HEALTH"
else
    echo "❌ API not responding"
fi

# Test GEE health endpoint
echo ""
echo "🌍 Testing GEE health endpoint..."
GEE_HEALTH=$(curl -s http://localhost:8000/api/ndvi/health 2>/dev/null)
if [ -n "$GEE_HEALTH" ]; then
    echo "Response: $GEE_HEALTH"
    
    if echo "$GEE_HEALTH" | grep -q '"earth_engine_initialized":true'; then
        echo ""
        echo "🎉 SUCCESS! Google Earth Engine is initialized!"
        echo ""
        echo "✅ You can now:"
        echo "   1. Open http://localhost:3000"
        echo "   2. Click 'NDVI Analysis' in the sidebar"
        echo "   3. Select a date range and click 'Update Map'"
    else
        echo ""
        echo "⚠️  Google Earth Engine is NOT initialized"
        echo ""
        echo "Please check the logs above for errors."
        echo "Common issues:"
        echo "  1. Service account not registered with Google Earth Engine"
        echo "  2. Key file path incorrect"
        echo "  3. Environment variables not loaded"
        echo ""
        echo "View full logs with: docker compose logs fastapi"
    fi
else
    echo "❌ Cannot reach GEE health endpoint"
    echo ""
    echo "Check if FastAPI is running:"
    echo "  docker compose logs fastapi"
fi

echo ""
echo "=============================================="
echo "For more details: docker compose logs -f fastapi"
echo "=============================================="
