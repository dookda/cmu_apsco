#!/usr/bin/env python3
"""
Test Google Earth Engine NDVI Integration
Run inside FastAPI container to verify setup
"""

import sys
import requests
from datetime import datetime, timedelta


def test_health():
    """Test API health endpoint"""
    print("🏥 Testing API Health...")
    try:
        response = requests.get("http://localhost:8000/health")
        if response.status_code == 200:
            print("✅ API is healthy")
            return True
        else:
            print(f"❌ API returned status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def test_gee_health():
    """Test GEE initialization"""
    print("\n🌍 Testing Google Earth Engine...")
    try:
        response = requests.get("http://localhost:8000/api/ndvi/health")
        if response.status_code == 200:
            data = response.json()
            if data.get("earth_engine_initialized"):
                print("✅ Google Earth Engine is initialized")
                return True
            else:
                print("❌ Google Earth Engine is NOT initialized")
                print("   Run: docker compose exec fastapi earthengine authenticate")
                return False
        else:
            print(
                f"❌ NDVI health endpoint returned status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def test_ndvi_stats():
    """Test NDVI statistics endpoint"""
    print("\n📊 Testing NDVI Statistics...")
    try:
        end_date = datetime.now().strftime('%Y-%m-%d')
        start_date = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')

        url = f"http://localhost:8000/api/ndvi/stats?start_date={start_date}&end_date={end_date}"
        print(f"   Requesting: {url}")

        response = requests.get(url, timeout=60)
        if response.status_code == 200:
            data = response.json()
            stats = data.get("statistics", {})
            print("✅ NDVI statistics retrieved successfully")
            print(f"   Mean NDVI: {stats.get('mean', 'N/A')}")
            print(f"   Min NDVI: {stats.get('min', 'N/A')}")
            print(f"   Max NDVI: {stats.get('max', 'N/A')}")
            print(f"   Interpretation: {data.get('interpretation', 'N/A')}")
            return True
        else:
            print(
                f"❌ NDVI stats endpoint returned status {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except requests.Timeout:
        print("⏰ Request timed out (this is normal for first request)")
        print("   GEE may be processing data. Try again in a minute.")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def test_ndvi_map_url():
    """Test NDVI map URL endpoint"""
    print("\n🗺️  Testing NDVI Map URL...")
    try:
        end_date = datetime.now().strftime('%Y-%m-%d')
        start_date = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')

        url = f"http://localhost:8000/api/ndvi/map-url?start_date={start_date}&end_date={end_date}"
        print(f"   Requesting: {url}")

        response = requests.get(url, timeout=60)
        if response.status_code == 200:
            data = response.json()
            print("✅ NDVI map URL generated successfully")
            print(f"   Map ID: {data.get('map_id', 'N/A')[:20]}...")
            print(f"   Tile URL: {data.get('tile_url', 'N/A')[:60]}...")
            return True
        else:
            print(
                f"❌ NDVI map URL endpoint returned status {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except requests.Timeout:
        print("⏰ Request timed out (this is normal for first request)")
        print("   GEE may be processing data. Try again in a minute.")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def main():
    """Run all tests"""
    print("=" * 60)
    print("🧪 Google Earth Engine NDVI Integration Test")
    print("=" * 60)

    results = []

    # Test 1: API Health
    results.append(("API Health", test_health()))

    # Test 2: GEE Health
    gee_ok = test_gee_health()
    results.append(("GEE Health", gee_ok))

    if gee_ok:
        # Test 3: NDVI Stats (only if GEE is initialized)
        results.append(("NDVI Statistics", test_ndvi_stats()))

        # Test 4: NDVI Map URL (only if GEE is initialized)
        results.append(("NDVI Map URL", test_ndvi_map_url()))
    else:
        print("\n⚠️  Skipping NDVI tests (GEE not initialized)")
        print("   Please authenticate first:")
        print("   docker compose exec fastapi earthengine authenticate")

    # Summary
    print("\n" + "=" * 60)
    print("📋 Test Summary")
    print("=" * 60)

    passed = sum(1 for _, result in results if result)
    total = len(results)

    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")

    print(f"\nResults: {passed}/{total} tests passed")

    if passed == total:
        print("\n🎉 All tests passed! Your NDVI integration is working!")
        print("\n🌐 Next steps:")
        print("   1. Visit http://localhost:3000")
        print("   2. Click 'NDVI Analysis' in the sidebar")
        print("   3. Select a date range and click 'Update Map'")
        return 0
    else:
        print("\n⚠️  Some tests failed. Check the output above for details.")
        return 1


if __name__ == "__main__":
    sys.exit(main())
