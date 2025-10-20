"""
Google Earth Engine NDVI Router
Provides endpoints for NDVI calculation and visualization for Chiang Mai Province
"""

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import Response
from typing import Optional
from datetime import datetime, timedelta
import ee
import json
import os

router = APIRouter(prefix="/api/ndvi", tags=["NDVI"])

# Initialize Earth Engine


def initialize_ee():
    """Initialize Google Earth Engine with service account or OAuth"""
    try:
        # Try service account authentication first
        service_account = os.getenv('GEE_SERVICE_ACCOUNT')
        key_file = os.getenv('GEE_KEY_FILE', 'sakdagee-aac5df75dc7f.json')

        print(f"[GEE Init] Starting initialization...")
        print(f"[GEE Init] Service Account from env: {service_account}")
        print(f"[GEE Init] Key File from env: {key_file}")
        print(f"[GEE Init] Current working directory: {os.getcwd()}")
        print(f"[GEE Init] __file__ location: {__file__}")

        # If key_file is relative, make it absolute
        if not os.path.isabs(key_file):
            # Try multiple possible locations
            possible_paths = [
                os.path.join('/app', key_file),  # Docker container root
                os.path.join(os.getcwd(), key_file),  # Current directory
                os.path.join(os.path.dirname(__file__), '..', '..',
                             '..', key_file),  # Relative to this file
            ]

            key_file_found = None
            for path in possible_paths:
                abs_path = os.path.abspath(path)
                print(f"[GEE Init] Checking path: {abs_path}")
                if os.path.exists(abs_path):
                    key_file_found = abs_path
                    print(f"[GEE Init] ✓ Found key file at: {abs_path}")
                    break

            if key_file_found:
                key_file = key_file_found
            else:
                print(f"[GEE Init] ✗ Key file not found in any location")

        if service_account and os.path.exists(key_file):
            print(
                f"[GEE Init] Initializing GEE with service account: {service_account}")
            print(f"[GEE Init] Using key file: {key_file}")
            credentials = ee.ServiceAccountCredentials(
                service_account, key_file)
            ee.Initialize(credentials)
            print(
                "[GEE Init] ✓ Google Earth Engine initialized successfully with service account")
        else:
            print(f"[GEE Init] Service account or key file not found.")
            print(f"[GEE Init]   - Service account: {service_account}")
            print(f"[GEE Init]   - Key file path: {key_file}")
            print(
                f"[GEE Init]   - Key file exists: {os.path.exists(key_file) if key_file else False}")
            print("[GEE Init] ✗ Cannot initialize - missing credentials")
            return False

        return True
    except Exception as e:
        print(f"[GEE Init] ✗ Error initializing Earth Engine: {e}")
        import traceback
        traceback.print_exc()
        return False


# Initialize on module load
EE_INITIALIZED = initialize_ee()

# Study area options
STUDY_AREAS = {
    # Upper Northern Thailand
    "Chiang Mai": {
        "name": "Chiang Mai",
        "bounds": {
            "type": "Polygon",
            "coordinates": [[[98.3, 18.2], [99.6, 18.2], [99.6, 20.0], [98.3, 20.0], [98.3, 18.2]]]
        },
        "center": [98.95, 18.8],
        "zoom": 8
    },
    "Chiang Rai": {
        "name": "Chiang Rai",
        "bounds": {
            "type": "Polygon",
            "coordinates": [[[99.3, 19.3], [100.5, 19.3], [100.5, 20.5], [99.3, 20.5], [99.3, 19.3]]]
        },
        "center": [99.9, 19.9],
        "zoom": 8
    },
    "Lamphun": {
        "name": "Lamphun",
        "bounds": {
            "type": "Polygon",
            "coordinates": [[[98.8, 17.9], [99.3, 17.9], [99.3, 18.6], [98.8, 18.6], [98.8, 17.9]]]
        },
        "center": [99.05, 18.25],
        "zoom": 9
    },
    "Lampang": {
        "name": "Lampang",
        "bounds": {
            "type": "Polygon",
            "coordinates": [[[99.2, 17.8], [100.0, 17.8], [100.0, 19.0], [99.2, 19.0], [99.2, 17.8]]]
        },
        "center": [99.6, 18.4],
        "zoom": 8
    },
    "Mae Hong Son": {
        "name": "Mae Hong Son",
        "bounds": {
            "type": "Polygon",
            "coordinates": [[[97.5, 17.8], [98.6, 17.8], [98.6, 19.6], [97.5, 19.6], [97.5, 17.8]]]
        },
        "center": [98.05, 18.7],
        "zoom": 8
    },
    "Nan": {
        "name": "Nan",
        "bounds": {
            "type": "Polygon",
            "coordinates": [[[100.4, 18.0], [101.3, 18.0], [101.3, 19.3], [100.4, 19.3], [100.4, 18.0]]]
        },
        "center": [100.85, 18.65],
        "zoom": 8
    },
    "Phayao": {
        "name": "Phayao",
        "bounds": {
            "type": "Polygon",
            "coordinates": [[[99.6, 18.8], [100.3, 18.8], [100.3, 19.7], [99.6, 19.7], [99.6, 18.8]]]
        },
        "center": [99.95, 19.25],
        "zoom": 9
    },
    "Phrae": {
        "name": "Phrae",
        "bounds": {
            "type": "Polygon",
            "coordinates": [[[99.8, 17.8], [100.9, 17.8], [100.9, 18.8], [99.8, 18.8], [99.8, 17.8]]]
        },
        "center": [100.35, 18.3],
        "zoom": 8
    },
    # Lower Northern Thailand
    "Phitsanulok": {
        "name": "Phitsanulok",
        "bounds": {
            "type": "Polygon",
            "coordinates": [[[99.8, 16.0], [101.3, 16.0], [101.3, 17.5], [99.8, 17.5], [99.8, 16.0]]]
        },
        "center": [100.55, 16.75],
        "zoom": 8
    },
    "Sukhothai": {
        "name": "Sukhothai",
        "bounds": {
            "type": "Polygon",
            "coordinates": [[[99.3, 16.8], [100.0, 16.8], [100.0, 17.7], [99.3, 17.7], [99.3, 16.8]]]
        },
        "center": [99.65, 17.25],
        "zoom": 8
    },
    "Uttaradit": {
        "name": "Uttaradit",
        "bounds": {
            "type": "Polygon",
            "coordinates": [[[99.9, 17.3], [100.8, 17.3], [100.8, 18.0], [99.9, 18.0], [99.9, 17.3]]]
        },
        "center": [100.35, 17.65],
        "zoom": 8
    },
    "Tak": {
        "name": "Tak",
        "bounds": {
            "type": "Polygon",
            "coordinates": [[[98.3, 15.9], [99.6, 15.9], [99.6, 17.8], [98.3, 17.8], [98.3, 15.9]]]
        },
        "center": [98.95, 16.85],
        "zoom": 8
    },
    "Kamphaeng Phet": {
        "name": "Kamphaeng Phet",
        "bounds": {
            "type": "Polygon",
            "coordinates": [[[99.0, 15.9], [100.1, 15.9], [100.1, 16.9], [99.0, 16.9], [99.0, 15.9]]]
        },
        "center": [99.55, 16.4],
        "zoom": 8
    },
    "Phichit": {
        "name": "Phichit",
        "bounds": {
            "type": "Polygon",
            "coordinates": [[[99.7, 15.8], [100.6, 15.8], [100.6, 16.6], [99.7, 16.6], [99.7, 15.8]]]
        },
        "center": [100.15, 16.2],
        "zoom": 8
    },
    "Phetchabun": {
        "name": "Phetchabun",
        "bounds": {
            "type": "Polygon",
            "coordinates": [[[100.5, 15.8], [101.5, 15.8], [101.5, 17.2], [100.5, 17.2], [100.5, 15.8]]]
        },
        "center": [101.0, 16.5],
        "zoom": 8
    },
    # For reference: Khon Kaen (Northeast, not Northern)
    "Khon Kaen": {
        "name": "Khon Kaen",
        "bounds": {
            "type": "Polygon",
            "coordinates": [[[101.5, 15.5], [103.5, 15.5], [103.5, 17.0], [101.5, 17.0], [101.5, 15.5]]]
        },
        "center": [102.5, 16.25],
        "zoom": 8
    }
}

# Chiang Mai Province boundaries (approximate) - for backward compatibility
CHIANG_MAI_BOUNDS = STUDY_AREAS["Chiang Mai"]["bounds"]


def get_study_area_geometry(area_name: str = "Chiang Mai"):
    """
    Get study area geometry from FAO GAUL dataset or fallback to predefined bounds

    Args:
        area_name: Name of the study area (e.g., 'Chiang Mai', 'Khon Kaen', 'Phitsanulok')
    """
    try:
        # Try to get geometry from FAO GAUL dataset
        study_area = (ee.FeatureCollection("FAO/GAUL/2015/level1")
                      .filter(ee.Filter.eq('ADM0_NAME', 'Thailand'))
                      .filter(ee.Filter.eq('ADM1_NAME', area_name)))

        # Check if the area exists
        size = study_area.size().getInfo()
        if size > 0:
            return study_area.geometry()
        else:
            # Fallback to predefined bounds if area not found in GAUL dataset
            if area_name in STUDY_AREAS:
                return ee.Geometry.Polygon(STUDY_AREAS[area_name]["bounds"]['coordinates'])
            else:
                # Default to Chiang Mai
                return ee.Geometry.Polygon(CHIANG_MAI_BOUNDS['coordinates'])
    except Exception as e:
        print(f"[GEE] Error getting geometry for {area_name}: {e}")
        # Fallback to predefined bounds
        if area_name in STUDY_AREAS:
            return ee.Geometry.Polygon(STUDY_AREAS[area_name]["bounds"]['coordinates'])
        else:
            return ee.Geometry.Polygon(CHIANG_MAI_BOUNDS['coordinates'])


def get_chiang_mai_geometry():
    """Get Chiang Mai province geometry - for backward compatibility"""
    return get_study_area_geometry("Chiang Mai")


def calculate_ndvi_sentinel2(image):
    """Calculate NDVI from Sentinel-2 image"""
    ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI')
    return image.addBands(ndvi)


def calculate_precipitation_anomaly(start_date: str, end_date: str, study_area: str = "Chiang Mai"):
    """
    Calculate precipitation anomaly (proxy for SPI) using CHIRPS data

    Args:
        start_date: Start date in YYYY-MM-DD format
        end_date: End date in YYYY-MM-DD format
        study_area: Name of the study area (e.g., 'Chiang Mai', 'Khon Kaen', 'Phitsanulok')

    Returns:
        Precipitation anomaly image and region of interest
    """
    try:
        roi = get_study_area_geometry(study_area)

        # Load CHIRPS precipitation data
        chirps = ee.ImageCollection('UCSB-CHG/CHIRPS/DAILY')

        # Get precipitation for the specified period
        current_precip = (chirps
                          .filterDate(start_date, end_date)
                          .filterBounds(roi)
                          .sum()
                          .clip(roi))

        # Calculate long-term mean (using past 10 years as reference)
        from datetime import datetime, timedelta
        end_dt = datetime.strptime(end_date, '%Y-%m-%d')
        start_dt = datetime.strptime(start_date, '%Y-%m-%d')
        days_diff = (end_dt - start_dt).days

        # Go back 10 years for historical reference
        historical_start = (
            start_dt - timedelta(days=365*10)).strftime('%Y-%m-%d')
        historical_end = (end_dt - timedelta(days=365*10)).strftime('%Y-%m-%d')

        historical_precip = (chirps
                             .filterDate(historical_start, historical_end)
                             .filterBounds(roi)
                             .sum()
                             .clip(roi))

        # Calculate standardized anomaly (simple version of SPI)
        # SPI = (current - mean) / std_dev
        # For simplicity, we'll use (current - historical) / historical as a proxy
        anomaly = current_precip.subtract(historical_precip).divide(
            historical_precip).multiply(100)

        return anomaly.rename('SPI'), roi

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error calculating SPI: {str(e)}")


def get_modis_ndvi(start_date: str, end_date: str, study_area: str = "Chiang Mai"):
    """
    Get MODIS NDVI imagery for specified study area

    Args:
        start_date: Start date in YYYY-MM-DD format
        end_date: End date in YYYY-MM-DD format
        study_area: Name of the study area (e.g., 'Chiang Mai', 'Khon Kaen', 'Phitsanulok')
    """
    if not EE_INITIALIZED:
        raise HTTPException(
            status_code=503, detail="Earth Engine not initialized")

    try:
        roi = get_study_area_geometry(study_area)

        # Load MODIS Terra Vegetation Indices 16-Day Global 250m
        # MOD13Q1.061 - provides NDVI and EVI
        collection = (ee.ImageCollection('MODIS/061/MOD13Q1')
                      .filterBounds(roi)
                      .filterDate(start_date, end_date)
                      .select('NDVI'))

        # Get mean composite (MODIS NDVI values are scaled by 10000)
        ndvi_composite = collection.mean().clip(roi)

        # Scale NDVI values from 0-10000 to 0-1 range
        ndvi_scaled = ndvi_composite.multiply(0.0001)

        return ndvi_scaled, roi

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error calculating NDVI: {str(e)}")


def get_modis_ndmi(start_date: str, end_date: str, study_area: str = "Chiang Mai"):
    """
    Get MODIS NDMI (Normalized Difference Moisture Index) imagery for specified study area

    NDMI = (NIR - SWIR) / (NIR + SWIR)
    Uses MODIS bands: NIR (Band 2) and SWIR (Band 6)

    Args:
        start_date: Start date in YYYY-MM-DD format
        end_date: End date in YYYY-MM-DD format
        study_area: Name of the study area (e.g., 'Chiang Mai', 'Khon Kaen', 'Phitsanulok')
    """
    if not EE_INITIALIZED:
        raise HTTPException(
            status_code=503, detail="Earth Engine not initialized")

    try:
        roi = get_study_area_geometry(study_area)

        # Load MODIS Terra Surface Reflectance 8-Day Global 500m
        # MOD09A1.061 - provides surface reflectance bands
        collection = (ee.ImageCollection('MODIS/061/MOD09A1')
                      .filterBounds(roi)
                      .filterDate(start_date, end_date)
                      # NIR and SWIR
                      .select(['sur_refl_b02', 'sur_refl_b06']))

        # Calculate NDMI for the collection
        def calculate_ndmi(image):
            # NDMI = (NIR - SWIR) / (NIR + SWIR)
            ndmi = image.normalizedDifference(
                ['sur_refl_b02', 'sur_refl_b06']).rename('NDMI')
            return ndmi

        # Get mean composite
        ndmi_collection = collection.map(calculate_ndmi)
        ndmi_composite = ndmi_collection.mean().clip(roi)

        return ndmi_composite, roi

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error calculating NDMI: {str(e)}")


@router.get("/study-areas")
async def get_study_areas():
    """
    Get available study areas

    Returns list of study areas with their metadata
    """
    return {
        "study_areas": [
            {
                "id": key,
                "name": value["name"],
                "center": value["center"],
                "zoom": value["zoom"],
                "bounds": value["bounds"]
            }
            for key, value in STUDY_AREAS.items()
        ]
    }


@router.get("/pixel-value")
async def get_pixel_value(
    lng: float = Query(..., description="Longitude"),
    lat: float = Query(..., description="Latitude"),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    study_area: str = Query("Chiang Mai", description="Study area name"),
    index_type: str = Query("NDVI", description="Index type: NDVI, SPI, or NDMI")
):
    """
    Get index value at a specific point

    Returns the index value (NDVI, SPI, or NDMI) at the specified coordinates
    """
    if not EE_INITIALIZED:
        raise HTTPException(
            status_code=503, detail="Earth Engine not initialized. Please configure authentication.")

    try:
        # Default to last 30 days if no dates provided
        if not end_date:
            end_date = datetime.now().strftime('%Y-%m-%d')
        if not start_date:
            start_date = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')

        # Create point geometry
        point = ee.Geometry.Point([lng, lat])

        # Get the appropriate image based on index type
        if index_type == 'SPI':
            image, _ = calculate_precipitation_anomaly(start_date, end_date, study_area)
            band_name = 'SPI'
        elif index_type == 'NDMI':
            image, _ = get_modis_ndmi(start_date, end_date, study_area)
            band_name = 'NDMI'
        else:  # NDVI
            image, _ = get_modis_ndvi(start_date, end_date, study_area)
            band_name = 'NDVI'

        # Sample the image at the point
        value = image.reduceRegion(
            reducer=ee.Reducer.first(),
            geometry=point,
            scale=250  # MODIS resolution
        ).getInfo()

        index_value = value.get(band_name, None)

        if index_value is None:
            return {
                "location": {"lng": lng, "lat": lat},
                "index_type": index_type,
                "value": None,
                "message": "No data available at this location"
            }

        # Get interpretation based on index type
        if index_type == 'SPI':
            interpretation = interpret_spi(index_value)
        elif index_type == 'NDMI':
            interpretation = interpret_ndmi(index_value)
        else:
            interpretation = interpret_ndvi(index_value)

        return {
            "location": {"lng": lng, "lat": lat},
            "index_type": index_type,
            "value": round(index_value, 4),
            "interpretation": interpretation,
            "period": {
                "start_date": start_date,
                "end_date": end_date
            }
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting pixel value: {str(e)}")


@router.get("/tile/{z}/{x}/{y}")
async def get_ndvi_tile(
    z: int,
    x: int,
    y: int,
    start_date: Optional[str] = Query(
        None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    study_area: str = Query("Chiang Mai", description="Study area name")
):
    """
    Get NDVI map tile for specified study area using MODIS data

    Returns PNG tile for use with MapLibre GL JS
    """
    if not EE_INITIALIZED:
        raise HTTPException(
            status_code=503, detail="Earth Engine not initialized. Please configure authentication.")

    try:
        # Default to last 30 days if no dates provided
        if not end_date:
            end_date = datetime.now().strftime('%Y-%m-%d')
        if not start_date:
            start_date = (datetime.now() - timedelta(days=30)
                          ).strftime('%Y-%m-%d')

        ndvi_image, roi = get_modis_ndvi(start_date, end_date, study_area)

        # Visualization parameters
        vis_params = {
            'min': -0.2,
            'max': 0.8,
            'palette': [
                '#d73027',  # Red (very low NDVI)
                '#fc8d59',  # Orange
                '#fee08b',  # Yellow
                '#d9ef8b',  # Light green
                '#91cf60',  # Green
                '#1a9850'   # Dark green (high NDVI)
            ]
        }

        # Get map tile URL
        map_id = ndvi_image.getMapId(vis_params)
        tile_url = map_id['tile_fetcher'].url_format

        # Fetch the actual tile
        import requests
        tile_request_url = tile_url.format(x=x, y=y, z=z)
        response = requests.get(tile_request_url)

        if response.status_code == 200:
            return Response(content=response.content, media_type="image/png")
        else:
            raise HTTPException(status_code=404, detail="Tile not found")

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error generating tile: {str(e)}")


@router.get("/stats")
async def get_ndvi_stats(
    start_date: Optional[str] = Query(
        None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    study_area: str = Query("Chiang Mai", description="Study area name")
):
    """
    Get NDVI statistics for specified study area using MODIS data

    Returns mean, min, max NDVI values and histogram data
    """
    if not EE_INITIALIZED:
        raise HTTPException(
            status_code=503, detail="Earth Engine not initialized. Please configure authentication.")

    try:
        # Default to last 30 days if no dates provided
        if not end_date:
            end_date = datetime.now().strftime('%Y-%m-%d')
        if not start_date:
            start_date = (datetime.now() - timedelta(days=30)
                          ).strftime('%Y-%m-%d')

        ndvi_image, roi = get_modis_ndvi(start_date, end_date, study_area)

        # Calculate statistics
        # MODIS is 250m resolution, so use appropriate scale
        stats = ndvi_image.reduceRegion(
            reducer=ee.Reducer.mean().combine(
                reducer2=ee.Reducer.minMax(),
                sharedInputs=True
            ).combine(
                reducer2=ee.Reducer.stdDev(),
                sharedInputs=True
            ),
            geometry=roi,
            scale=250,  # MODIS MOD13Q1 is 250m resolution
            maxPixels=1e9
        ).getInfo()

        # MODIS returns band name without suffix for mean/min/max
        mean_val = stats.get('NDVI', 0)
        if mean_val == 0:  # Fallback to check with suffix
            mean_val = stats.get('NDVI_mean', 0)

        return {
            "period": {
                "start_date": start_date,
                "end_date": end_date
            },
            "region": study_area,
            "statistics": {
                "mean": round(mean_val, 4),
                "min": round(stats.get('NDVI_min', 0), 4),
                "max": round(stats.get('NDVI_max', 0), 4),
                "std_dev": round(stats.get('NDVI_stdDev', 0), 4)
            },
            "interpretation": interpret_ndvi(mean_val)
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error calculating statistics: {str(e)}")


@router.get("/timeseries")
async def get_ndvi_timeseries(
    start_date: Optional[str] = Query(
        None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    interval: str = Query(
        "month", description="Time interval: day, week, month"),
    study_area: str = Query("Chiang Mai", description="Study area name")
):
    """
    Get NDVI time series data for specified study area

    Returns historical NDVI values over time
    """
    if not EE_INITIALIZED:
        raise HTTPException(
            status_code=503, detail="Earth Engine not initialized. Please configure authentication.")

    try:
        # Default to last year if no dates provided
        if not end_date:
            end_date = datetime.now().strftime('%Y-%m-%d')
        if not start_date:
            start_date = (datetime.now() - timedelta(days=365)
                          ).strftime('%Y-%m-%d')

        roi = get_study_area_geometry(study_area)

        # Load MODIS Terra Vegetation Indices 16-Day Global 250m
        collection = (ee.ImageCollection('MODIS/061/MOD13Q1')
                      .filterBounds(roi)
                      .filterDate(start_date, end_date)
                      .select('NDVI'))

        # Function to calculate mean NDVI for each image
        def get_mean_ndvi(image):
            # Scale NDVI values from 0-10000 to 0-1 range
            scaled_ndvi = image.multiply(0.0001)
            mean = scaled_ndvi.reduceRegion(
                reducer=ee.Reducer.mean(),
                geometry=roi,
                scale=250,  # MODIS is 250m resolution
                maxPixels=1e9
            )
            return ee.Feature(None, {
                'date': image.date().format('YYYY-MM-dd'),
                'ndvi': mean.get('NDVI')
            })

        # Get time series
        time_series = collection.map(get_mean_ndvi).getInfo()

        # Format results
        results = []
        for feature in time_series['features']:
            props = feature['properties']
            if props.get('ndvi') is not None:
                results.append({
                    'date': props['date'],
                    'ndvi': round(props['ndvi'], 4)
                })

        # Sort by date
        results.sort(key=lambda x: x['date'])

        return {
            "period": {
                "start_date": start_date,
                "end_date": end_date
            },
            "region": study_area,
            "data_points": len(results),
            "timeseries": results
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error generating time series: {str(e)}")


@router.get("/spi/stats")
async def get_spi_stats(
    start_date: Optional[str] = Query(
        None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    study_area: str = Query("Chiang Mai", description="Study area name")
):
    """
    Get SPI (Standardized Precipitation Index) statistics for specified study area

    Returns precipitation anomaly statistics
    """
    if not EE_INITIALIZED:
        raise HTTPException(
            status_code=503, detail="Earth Engine not initialized. Please configure authentication.")

    try:
        # Default to last 30 days if no dates provided
        if not end_date:
            end_date = datetime.now().strftime('%Y-%m-%d')
        if not start_date:
            start_date = (datetime.now() - timedelta(days=30)
                          ).strftime('%Y-%m-%d')

        spi_image, roi = calculate_precipitation_anomaly(
            start_date, end_date, study_area)

        # Calculate statistics
        stats = spi_image.reduceRegion(
            reducer=ee.Reducer.mean().combine(
                reducer2=ee.Reducer.minMax(),
                sharedInputs=True
            ).combine(
                reducer2=ee.Reducer.stdDev(),
                sharedInputs=True
            ),
            geometry=roi,
            scale=5000,  # CHIRPS is 5km resolution
            maxPixels=1e9
        ).getInfo()

        mean_val = stats.get('SPI_mean', 0)

        return {
            "period": {
                "start_date": start_date,
                "end_date": end_date
            },
            "region": study_area,
            "statistics": {
                "mean": round(mean_val, 2),
                "min": round(stats.get('SPI_min', 0), 2),
                "max": round(stats.get('SPI_max', 0), 2),
                "std_dev": round(stats.get('SPI_stdDev', 0), 2)
            },
            "interpretation": interpret_spi(mean_val)
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error calculating SPI statistics: {str(e)}")


@router.get("/spi/map-url")
async def get_spi_map_url(
    start_date: Optional[str] = Query(
        None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    study_area: str = Query("Chiang Mai", description="Study area name")
):
    """
    Get SPI map URL for use with MapLibre GL JS as a raster source

    Returns tile URL template
    """
    if not EE_INITIALIZED:
        raise HTTPException(
            status_code=503, detail="Earth Engine not initialized. Please configure authentication.")

    try:
        # Default to last 30 days if no dates provided
        if not end_date:
            end_date = datetime.now().strftime('%Y-%m-%d')
        if not start_date:
            start_date = (datetime.now() - timedelta(days=30)
                          ).strftime('%Y-%m-%d')

        spi_image, roi = calculate_precipitation_anomaly(
            start_date, end_date, study_area)

        # Visualization parameters for SPI
        vis_params = {
            'min': -50,
            'max': 50,
            'palette': [
                '#8B0000',  # Dark red (severe drought)
                '#FF0000',  # Red (moderate drought)
                '#FFA500',  # Orange (mild drought)
                '#FFFF00',  # Yellow (near normal)
                '#90EE90',  # Light green (slightly wet)
                '#008000',  # Green (moderately wet)
                '#0000FF'   # Blue (very wet)
            ]
        }

        # Get map tile URL
        map_id = spi_image.getMapId(vis_params)

        # Get bounds for the study area
        study_area_bounds = STUDY_AREAS.get(
            study_area, STUDY_AREAS["Chiang Mai"])["bounds"]
        study_area_info = STUDY_AREAS.get(
            study_area, STUDY_AREAS["Chiang Mai"])

        return {
            "tile_url": map_id['tile_fetcher'].url_format,
            "map_id": map_id['mapid'],
            "period": {
                "start_date": start_date,
                "end_date": end_date
            },
            "region": study_area,
            "bounds": study_area_bounds,
            "center": study_area_info["center"],
            "zoom": study_area_info["zoom"],
            "legend": {
                "title": "Precipitation Anomaly (%)",
                "min": -50,
                "max": 50,
                "colors": vis_params['palette'],
                "labels": [
                    "Severe drought",
                    "Moderate drought",
                    "Mild drought",
                    "Near normal",
                    "Slightly wet",
                    "Moderately wet",
                    "Very wet"
                ]
            }
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error generating SPI map URL: {str(e)}")


@router.get("/ndmi/stats")
async def get_ndmi_stats(
    start_date: Optional[str] = Query(
        None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    study_area: str = Query("Chiang Mai", description="Study area name")
):
    """
    Get NDMI (Normalized Difference Moisture Index) statistics for specified study area

    Returns moisture index statistics
    """
    if not EE_INITIALIZED:
        raise HTTPException(
            status_code=503, detail="Earth Engine not initialized. Please configure authentication.")

    try:
        # Default to last 30 days if no dates provided
        if not end_date:
            end_date = datetime.now().strftime('%Y-%m-%d')
        if not start_date:
            start_date = (datetime.now() - timedelta(days=30)
                          ).strftime('%Y-%m-%d')

        ndmi_image, roi = get_modis_ndmi(start_date, end_date, study_area)

        # Calculate statistics
        # MODIS MOD09A1 is 500m resolution
        stats = ndmi_image.reduceRegion(
            reducer=ee.Reducer.mean().combine(
                reducer2=ee.Reducer.minMax(),
                sharedInputs=True
            ).combine(
                reducer2=ee.Reducer.stdDev(),
                sharedInputs=True
            ),
            geometry=roi,
            scale=500,  # MODIS MOD09A1 is 500m resolution
            maxPixels=1e9
        ).getInfo()

        mean_val = stats.get('NDMI', 0)
        if mean_val == 0:  # Fallback to check with suffix
            mean_val = stats.get('NDMI_mean', 0)

        return {
            "period": {
                "start_date": start_date,
                "end_date": end_date
            },
            "region": study_area,
            "statistics": {
                "mean": round(mean_val, 4),
                "min": round(stats.get('NDMI_min', 0), 4),
                "max": round(stats.get('NDMI_max', 0), 4),
                "std_dev": round(stats.get('NDMI_stdDev', 0), 4)
            },
            "interpretation": interpret_ndmi(mean_val)
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error calculating NDMI statistics: {str(e)}")


@router.get("/ndmi/map-url")
async def get_ndmi_map_url(
    start_date: Optional[str] = Query(
        None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    study_area: str = Query("Chiang Mai", description="Study area name")
):
    """
    Get NDMI map URL for use with MapLibre GL JS as a raster source

    Returns tile URL template
    """
    if not EE_INITIALIZED:
        raise HTTPException(
            status_code=503, detail="Earth Engine not initialized. Please configure authentication.")

    try:
        # Default to last 30 days if no dates provided
        if not end_date:
            end_date = datetime.now().strftime('%Y-%m-%d')
        if not start_date:
            start_date = (datetime.now() - timedelta(days=30)
                          ).strftime('%Y-%m-%d')

        ndmi_image, roi = get_modis_ndmi(start_date, end_date, study_area)

        # Visualization parameters for NDMI
        vis_params = {
            'min': -0.6,
            'max': 0.6,
            'palette': [
                '#8B4513',  # Brown (very dry)
                '#D2691E',  # Chocolate (dry)
                '#F4A460',  # Sandy brown (slightly dry)
                '#FFFF00',  # Yellow (moderate)
                '#90EE90',  # Light green (high moisture)
                '#008000',  # Green (very high moisture)
                '#006400'   # Dark green (saturated)
            ]
        }

        # Get map tile URL
        map_id = ndmi_image.getMapId(vis_params)

        # Get bounds for the study area
        study_area_bounds = STUDY_AREAS.get(
            study_area, STUDY_AREAS["Chiang Mai"])["bounds"]
        study_area_info = STUDY_AREAS.get(
            study_area, STUDY_AREAS["Chiang Mai"])

        return {
            "tile_url": map_id['tile_fetcher'].url_format,
            "map_id": map_id['mapid'],
            "period": {
                "start_date": start_date,
                "end_date": end_date
            },
            "region": study_area,
            "bounds": study_area_bounds,
            "center": study_area_info["center"],
            "zoom": study_area_info["zoom"],
            "legend": {
                "title": "Moisture Index (NDMI)",
                "min": -0.6,
                "max": 0.6,
                "colors": vis_params['palette'],
                "labels": [
                    "Very dry",
                    "Dry",
                    "Slightly dry",
                    "Moderate",
                    "High moisture",
                    "Very high moisture",
                    "Saturated"
                ]
            }
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error generating NDMI map URL: {str(e)}")


@router.get("/map-url")
async def get_ndvi_map_url(
    start_date: Optional[str] = Query(
        None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    study_area: str = Query("Chiang Mai", description="Study area name")
):
    """
    Get NDVI map URL for use with MapLibre GL JS as a raster source using MODIS data

    Returns tile URL template
    """
    if not EE_INITIALIZED:
        raise HTTPException(
            status_code=503, detail="Earth Engine not initialized. Please configure authentication.")

    try:
        # Default to last 30 days if no dates provided
        if not end_date:
            end_date = datetime.now().strftime('%Y-%m-%d')
        if not start_date:
            start_date = (datetime.now() - timedelta(days=30)
                          ).strftime('%Y-%m-%d')

        ndvi_image, roi = get_modis_ndvi(start_date, end_date, study_area)

        # Visualization parameters
        vis_params = {
            'min': -0.2,
            'max': 0.8,
            'palette': [
                '#d73027',  # Red (very low NDVI)
                '#fc8d59',  # Orange
                '#fee08b',  # Yellow
                '#d9ef8b',  # Light green
                '#91cf60',  # Green
                '#1a9850'   # Dark green (high NDVI)
            ]
        }

        # Get map tile URL
        map_id = ndvi_image.getMapId(vis_params)

        # Get bounds for the study area
        study_area_bounds = STUDY_AREAS.get(
            study_area, STUDY_AREAS["Chiang Mai"])["bounds"]
        study_area_info = STUDY_AREAS.get(
            study_area, STUDY_AREAS["Chiang Mai"])

        return {
            "tile_url": map_id['tile_fetcher'].url_format,
            "map_id": map_id['mapid'],
            "period": {
                "start_date": start_date,
                "end_date": end_date
            },
            "region": study_area,
            "bounds": study_area_bounds,
            "center": study_area_info["center"],
            "zoom": study_area_info["zoom"],
            "legend": {
                "title": "NDVI Values",
                "min": -0.2,
                "max": 0.8,
                "colors": vis_params['palette'],
                "labels": [
                    "Bare soil / Water",
                    "Very low vegetation",
                    "Low vegetation",
                    "Moderate vegetation",
                    "High vegetation",
                    "Very high vegetation"
                ]
            }
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error generating map URL: {str(e)}")


def interpret_ndvi(ndvi_value: float) -> str:
    """Interpret NDVI value"""
    if ndvi_value < 0:
        return "Water or bare soil"
    elif ndvi_value < 0.2:
        return "Very low vegetation / Drought stress"
    elif ndvi_value < 0.4:
        return "Low vegetation density"
    elif ndvi_value < 0.6:
        return "Moderate vegetation"
    elif ndvi_value < 0.8:
        return "High vegetation density"
    else:
        return "Very dense vegetation"


def interpret_spi(spi_value: float) -> str:
    """Interpret SPI/precipitation anomaly value"""
    if spi_value < -30:
        return "Severe drought - Extremely dry conditions"
    elif spi_value < -20:
        return "Moderate drought - Significantly below normal precipitation"
    elif spi_value < -10:
        return "Mild drought - Below normal precipitation"
    elif spi_value < 10:
        return "Near normal - Precipitation near historical average"
    elif spi_value < 20:
        return "Slightly wet - Above normal precipitation"
    elif spi_value < 30:
        return "Moderately wet - Significantly above normal precipitation"
    else:
        return "Very wet - Extremely high precipitation"


def interpret_ndmi(ndmi_value: float) -> str:
    """Interpret NDMI value"""
    if ndmi_value < -0.4:
        return "Very dry - Severe water stress"
    elif ndmi_value < -0.2:
        return "Dry - Moderate water stress"
    elif ndmi_value < 0:
        return "Slightly dry - Low water content"
    elif ndmi_value < 0.2:
        return "Moderate moisture - Normal water content"
    elif ndmi_value < 0.4:
        return "High moisture - Good water content"
    else:
        return "Very high moisture - Saturated vegetation"


@router.get("/health")
async def ndvi_health_check():
    """Check if Earth Engine is initialized and working"""
    return {
        "earth_engine_initialized": EE_INITIALIZED,
        "status": "operational" if EE_INITIALIZED else "not configured",
        "message": "Earth Engine is ready" if EE_INITIALIZED else "Please configure GEE authentication"
    }
