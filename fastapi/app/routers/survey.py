"""
Survey Router
Provides endpoints for survey form functionality including saving parcels and calculating indices
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date
import psycopg2
from psycopg2.extras import RealDictCursor
import os
import ee

router = APIRouter(prefix="/api/survey", tags=["Survey"])

# Database connection parameters
DB_CONFIG = {
    "host": os.getenv("POSTGRES_HOST", "postgis"),
    "database": os.getenv("POSTGRES_DB", "cmu_apsco_db"),
    "user": os.getenv("POSTGRES_USER", "postgres"),
    "password": os.getenv("POSTGRES_PASSWORD", "postgres"),
    "port": int(os.getenv("POSTGRES_PORT", 5432))
}


def get_db_connection():
    """Get PostgreSQL database connection"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        return conn
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Database connection error: {str(e)}")


class SurveyParcelCreate(BaseModel):
    parcel_name: str
    description: Optional[str] = None
    geometry: dict  # GeoJSON geometry
    surveyor_name: Optional[str] = None
    selected_index: str  # NDVI, NDMI, or SPI
    index_date_start: str  # YYYY-MM-DD
    index_date_end: str  # YYYY-MM-DD
    index_mean: Optional[float] = None
    index_min: Optional[float] = None
    index_max: Optional[float] = None
    index_std_dev: Optional[float] = None
    interpretation: Optional[str] = None
    province: Optional[str] = None
    land_use: Optional[str] = None
    crop_type: Optional[str] = None
    notes: Optional[str] = None


class SurveyParcelUpdate(BaseModel):
    parcel_name: Optional[str] = None
    description: Optional[str] = None
    surveyor_name: Optional[str] = None
    selected_index: Optional[str] = None
    index_date_start: Optional[str] = None
    index_date_end: Optional[str] = None
    index_mean: Optional[float] = None
    index_min: Optional[float] = None
    index_max: Optional[float] = None
    index_std_dev: Optional[float] = None
    interpretation: Optional[str] = None
    province: Optional[str] = None
    land_use: Optional[str] = None
    crop_type: Optional[str] = None
    notes: Optional[str] = None


@router.post("/parcels")
async def create_survey_parcel(parcel: SurveyParcelCreate):
    """
    Create a new survey parcel with geometry and drought index data
    """
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Convert GeoJSON geometry to WKT
            coordinates = parcel.geometry['coordinates'][0]
            wkt_coords = ', '.join([f"{lon} {lat}" for lon, lat in coordinates])
            wkt = f"POLYGON(({wkt_coords}))"

            # Insert parcel
            cur.execute("""
                INSERT INTO survey_parcels
                (parcel_name, description, geom, surveyor_name, selected_index,
                 index_date_start, index_date_end, index_mean, index_min, index_max,
                 index_std_dev, interpretation, province, land_use, crop_type, notes)
                VALUES (%s, %s, ST_GeomFromText(%s, 4326), %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id, parcel_name, area_hectares, created_at
            """, (
                parcel.parcel_name,
                parcel.description,
                wkt,
                parcel.surveyor_name,
                parcel.selected_index,
                parcel.index_date_start,
                parcel.index_date_end,
                parcel.index_mean,
                parcel.index_min,
                parcel.index_max,
                parcel.index_std_dev,
                parcel.interpretation,
                parcel.province,
                parcel.land_use,
                parcel.crop_type,
                parcel.notes
            ))

            result = cur.fetchone()
            conn.commit()

            return {
                "success": True,
                "message": "Survey parcel created successfully",
                "data": {
                    "id": result['id'],
                    "parcel_name": result['parcel_name'],
                    "area_hectares": float(result['area_hectares']) if result['area_hectares'] else None,
                    "created_at": result['created_at'].isoformat()
                }
            }

    except Exception as e:
        conn.rollback()
        raise HTTPException(
            status_code=500, detail=f"Error creating survey parcel: {str(e)}")
    finally:
        conn.close()


@router.get("/parcels")
async def get_survey_parcels(
    limit: int = Query(100, le=1000),
    offset: int = Query(0, ge=0),
    index_type: Optional[str] = Query(None),
    province: Optional[str] = Query(None)
):
    """
    Get list of survey parcels with optional filtering
    """
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Build query with filters
            query = """
                SELECT
                    id, parcel_name, description, surveyor_name,
                    selected_index, index_date_start, index_date_end,
                    index_mean, index_min, index_max, index_std_dev,
                    interpretation, area_hectares, province, land_use,
                    crop_type, notes, survey_date, created_at,
                    ST_AsGeoJSON(geom) as geometry
                FROM survey_parcels
                WHERE 1=1
            """
            params = []

            if index_type:
                query += " AND selected_index = %s"
                params.append(index_type)

            if province:
                query += " AND province = %s"
                params.append(province)

            query += " ORDER BY created_at DESC LIMIT %s OFFSET %s"
            params.extend([limit, offset])

            cur.execute(query, params)
            parcels = cur.fetchall()

            # Convert to JSON-serializable format
            result = []
            for parcel in parcels:
                parcel_dict = dict(parcel)
                # Parse geometry JSON
                if parcel_dict['geometry']:
                    import json
                    parcel_dict['geometry'] = json.loads(parcel_dict['geometry'])
                # Convert decimals to floats
                for key in ['index_mean', 'index_min', 'index_max', 'index_std_dev', 'area_hectares']:
                    if parcel_dict[key] is not None:
                        parcel_dict[key] = float(parcel_dict[key])
                # Convert dates to ISO format
                for key in ['index_date_start', 'index_date_end']:
                    if parcel_dict[key]:
                        parcel_dict[key] = parcel_dict[key].isoformat()
                if parcel_dict['survey_date']:
                    parcel_dict['survey_date'] = parcel_dict['survey_date'].isoformat()
                if parcel_dict['created_at']:
                    parcel_dict['created_at'] = parcel_dict['created_at'].isoformat()
                result.append(parcel_dict)

            return {
                "success": True,
                "count": len(result),
                "parcels": result
            }

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching survey parcels: {str(e)}")
    finally:
        conn.close()


@router.get("/parcels/{parcel_id}")
async def get_survey_parcel(parcel_id: int):
    """
    Get a specific survey parcel by ID
    """
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT
                    id, parcel_name, description, surveyor_name,
                    selected_index, index_date_start, index_date_end,
                    index_mean, index_min, index_max, index_std_dev,
                    interpretation, area_hectares, province, land_use,
                    crop_type, notes, survey_date, created_at, updated_at,
                    ST_AsGeoJSON(geom) as geometry
                FROM survey_parcels
                WHERE id = %s
            """, (parcel_id,))

            parcel = cur.fetchone()

            if not parcel:
                raise HTTPException(
                    status_code=404, detail=f"Survey parcel {parcel_id} not found")

            # Convert to JSON-serializable format
            parcel_dict = dict(parcel)
            if parcel_dict['geometry']:
                import json
                parcel_dict['geometry'] = json.loads(parcel_dict['geometry'])

            # Convert decimals to floats
            for key in ['index_mean', 'index_min', 'index_max', 'index_std_dev', 'area_hectares']:
                if parcel_dict[key] is not None:
                    parcel_dict[key] = float(parcel_dict[key])

            # Convert dates to ISO format
            for key in ['index_date_start', 'index_date_end']:
                if parcel_dict[key]:
                    parcel_dict[key] = parcel_dict[key].isoformat()
            for key in ['survey_date', 'created_at', 'updated_at']:
                if parcel_dict[key]:
                    parcel_dict[key] = parcel_dict[key].isoformat()

            return {
                "success": True,
                "parcel": parcel_dict
            }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching survey parcel: {str(e)}")
    finally:
        conn.close()


@router.put("/parcels/{parcel_id}")
async def update_survey_parcel(parcel_id: int, parcel: SurveyParcelUpdate):
    """
    Update an existing survey parcel
    """
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Build update query dynamically based on provided fields
            update_fields = []
            params = []

            if parcel.parcel_name is not None:
                update_fields.append("parcel_name = %s")
                params.append(parcel.parcel_name)
            if parcel.description is not None:
                update_fields.append("description = %s")
                params.append(parcel.description)
            if parcel.surveyor_name is not None:
                update_fields.append("surveyor_name = %s")
                params.append(parcel.surveyor_name)
            if parcel.selected_index is not None:
                update_fields.append("selected_index = %s")
                params.append(parcel.selected_index)
            if parcel.index_date_start is not None:
                update_fields.append("index_date_start = %s")
                params.append(parcel.index_date_start)
            if parcel.index_date_end is not None:
                update_fields.append("index_date_end = %s")
                params.append(parcel.index_date_end)
            if parcel.index_mean is not None:
                update_fields.append("index_mean = %s")
                params.append(parcel.index_mean)
            if parcel.index_min is not None:
                update_fields.append("index_min = %s")
                params.append(parcel.index_min)
            if parcel.index_max is not None:
                update_fields.append("index_max = %s")
                params.append(parcel.index_max)
            if parcel.index_std_dev is not None:
                update_fields.append("index_std_dev = %s")
                params.append(parcel.index_std_dev)
            if parcel.interpretation is not None:
                update_fields.append("interpretation = %s")
                params.append(parcel.interpretation)
            if parcel.province is not None:
                update_fields.append("province = %s")
                params.append(parcel.province)
            if parcel.land_use is not None:
                update_fields.append("land_use = %s")
                params.append(parcel.land_use)
            if parcel.crop_type is not None:
                update_fields.append("crop_type = %s")
                params.append(parcel.crop_type)
            if parcel.notes is not None:
                update_fields.append("notes = %s")
                params.append(parcel.notes)

            if not update_fields:
                raise HTTPException(
                    status_code=400, detail="No fields to update")

            params.append(parcel_id)
            query = f"""
                UPDATE survey_parcels
                SET {', '.join(update_fields)}
                WHERE id = %s
                RETURNING id, parcel_name, updated_at
            """

            cur.execute(query, params)
            result = cur.fetchone()

            if not result:
                raise HTTPException(
                    status_code=404, detail=f"Survey parcel {parcel_id} not found")

            conn.commit()

            return {
                "success": True,
                "message": "Survey parcel updated successfully",
                "data": {
                    "id": result['id'],
                    "parcel_name": result['parcel_name'],
                    "updated_at": result['updated_at'].isoformat()
                }
            }

    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(
            status_code=500, detail=f"Error updating survey parcel: {str(e)}")
    finally:
        conn.close()


@router.delete("/parcels/{parcel_id}")
async def delete_survey_parcel(parcel_id: int):
    """
    Delete a survey parcel
    """
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "DELETE FROM survey_parcels WHERE id = %s RETURNING id", (parcel_id,))
            result = cur.fetchone()

            if not result:
                raise HTTPException(
                    status_code=404, detail=f"Survey parcel {parcel_id} not found")

            conn.commit()

            return {
                "success": True,
                "message": f"Survey parcel {parcel_id} deleted successfully"
            }

    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(
            status_code=500, detail=f"Error deleting survey parcel: {str(e)}")
    finally:
        conn.close()


@router.get("/stats")
async def get_survey_stats():
    """
    Get survey statistics (total parcels, by index type, etc.)
    """
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT
                    COUNT(*) as total_parcels,
                    COUNT(CASE WHEN selected_index = 'NDVI' THEN 1 END) as ndvi_count,
                    COUNT(CASE WHEN selected_index = 'NDMI' THEN 1 END) as ndmi_count,
                    COUNT(CASE WHEN selected_index = 'SPI' THEN 1 END) as spi_count,
                    SUM(area_hectares) as total_area_hectares,
                    AVG(area_hectares) as avg_area_hectares
                FROM survey_parcels
            """)

            stats = cur.fetchone()

            # Convert decimals to floats
            result = dict(stats)
            for key in ['total_area_hectares', 'avg_area_hectares']:
                if result[key] is not None:
                    result[key] = float(result[key])

            return {
                "success": True,
                "stats": result
            }

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching survey stats: {str(e)}")
    finally:
        conn.close()
