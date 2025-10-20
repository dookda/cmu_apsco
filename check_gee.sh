#!/bin/bash

# Quick diagnostic script for GEE NDVI setup

echo "🔍 Checking Google Earth Engine NDVI Setup..."
echo "=============================================="
echo ""

# Check if containers are running
echo "1. Checking Docker containers..."
FASTAPI_RUNNING=$(docker ps --filter "name=cmu_apsco_fastapi" --format "{{.Status}}" 2>/dev/null)
if [ -n "$FASTAPI_RUNNING" ]; then
    echo "   ✅ FastAPI container is running: $FASTAPI_RUNNING"
else
    echo "   ❌ FastAPI container is not running"
    echo "   Run: docker compose up -d"
    exit 1
fi
echo ""

# Check environment variables
echo "2. Checking environment variables in container..."
docker compose exec -T fastapi bash -c 'echo "   GEE_SERVICE_ACCOUNT=$GEE_SERVICE_ACCOUNT"'
docker compose exec -T fastapi bash -c 'echo "   GEE_KEY_FILE=$GEE_KEY_FILE"'
echo ""

# Check if key file exists
echo "3. Checking if key file exists in container..."
KEY_EXISTS=$(docker compose exec -T fastapi bash -c '[ -f /app/sakdagee-aac5df75dc7f.json ] && echo "yes" || echo "no"')
if [ "$KEY_EXISTS" = "yes" ]; then
    echo "   ✅ Key file exists: /app/sakdagee-aac5df75dc7f.json"
else
    echo "   ❌ Key file not found: /app/sakdagee-aac5df75dc7f.json"
fi
echo ""

# Check FastAPI logs for GEE initialization
echo "4. Checking FastAPI logs for GEE initialization..."
docker compose logs fastapi | grep -i "earth\|gee" | tail -10
echo ""

# Test GEE health endpoint
echo "5. Testing GEE health endpoint..."
HEALTH_RESPONSE=$(curl -s http://localhost:8000/api/ndvi/health 2>/dev/null)
if [ -n "$HEALTH_RESPONSE" ]; then
    echo "   Response: $HEALTH_RESPONSE"
    
    # Check if initialized
    if echo "$HEALTH_RESPONSE" | grep -q '"earth_engine_initialized":true'; then
        echo "   ✅ Google Earth Engine is initialized!"
    else
        echo "   ❌ Google Earth Engine is NOT initialized"
    fi
else
    echo "   ❌ Cannot reach health endpoint"
fi
echo ""

# Test basic API endpoint
echo "6. Testing API root endpoint..."
API_RESPONSE=$(curl -s http://localhost:8000/health 2>/dev/null)
if [ -n "$API_RESPONSE" ]; then
    echo "   ✅ API is responding: $API_RESPONSE"
else
    echo "   ❌ API is not responding"
fi
echo ""

echo "=============================================="
echo "📋 Summary"
echo "=============================================="
echo ""
echo "If GEE is not initialized, try:"
echo "1. Check the key file exists: ls -la fastapi/sakdagee-aac5df75dc7f.json"
echo "2. Restart containers: docker compose restart fastapi"
echo "3. View full logs: docker compose logs fastapi"
echo "4. Rebuild: docker compose up --build fastapi"
echo ""
