import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../layout';
import MapComponent from './MapComponent';
import { fetchGeoJSON, addGeoJSONLayer, fitToGeoJSON, addLayerClickHandler } from '../../utils/mapUtils';
import { Popup } from 'react-map-gl/maplibre';

/**
 * Example: Map with PostGIS Data Integration
 * This component demonstrates how to load and display data from PostGIS database
 */
const PostGISMapExample = () => {
    const [selectedFeature, setSelectedFeature] = useState(null);
    const [popupInfo, setPopupInfo] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleMapLoad = async (map) => {
        console.log('Map loaded, fetching PostGIS data...');
        setLoading(true);

        try {
            // Example 1: Fetch and display polygon data (e.g., drought zones)
            const droughtZones = await fetchGeoJSON('drought-zones');
            if (droughtZones) {
                addGeoJSONLayer(
                    map,
                    'drought-zones-source',
                    droughtZones,
                    'drought-zones-layer',
                    {
                        'fill-color': [
                            'match',
                            ['get', 'severity'],
                            'high', '#d32f2f',
                            'medium', '#ff9800',
                            'low', '#ffeb3b',
                            '#ccc'
                        ],
                        'fill-opacity': 0.6,
                        'fill-outline-color': '#000'
                    }
                );

                // Add click handler
                addLayerClickHandler(map, 'drought-zones-layer', (feature, lngLat) => {
                    setPopupInfo({
                        longitude: lngLat.lng,
                        latitude: lngLat.lat,
                        properties: feature.properties
                    });
                });

                // Fit map to data bounds
                fitToGeoJSON(map, droughtZones, { padding: 50 });
            }

            // Example 2: Add point data (e.g., weather stations)
            const stations = await fetchGeoJSON('weather-stations');
            if (stations) {
                addGeoJSONLayer(
                    map,
                    'stations-source',
                    stations,
                    'stations-layer',
                    {
                        'circle-radius': 8,
                        'circle-color': '#2196F3',
                        'circle-stroke-width': 2,
                        'circle-stroke-color': '#fff'
                    }
                );
            }

            // Example 3: Add WMS layer from GeoServer (if available)
            map.addSource('geoserver-wms', {
                type: 'raster',
                tiles: [
                    'http://localhost:8080/geoserver/wms?' +
                    'service=WMS&' +
                    'version=1.1.1&' +
                    'request=GetMap&' +
                    'layers=drought:rainfall&' +
                    'bbox={bbox-epsg-3857}&' +
                    'width=256&' +
                    'height=256&' +
                    'srs=EPSG:3857&' +
                    'format=image/png&' +
                    'transparent=true'
                ],
                tileSize: 256
            });

            map.addLayer({
                id: 'geoserver-wms-layer',
                type: 'raster',
                source: 'geoserver-wms',
                paint: { 'raster-opacity': 0.7 }
            });

        } catch (error) {
            console.error('Error loading PostGIS data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout
            title="PostGIS Integration Map"
            breadcrumbItems={[{ name: 'Map' }, { name: 'PostGIS Data' }]}
        >
            <div className="col-12">
                <div className="card">
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">
                            <i className="ph-duotone ph-map-pin me-2"></i>
                            Drought Zones Map (PostGIS Data)
                        </h5>
                        {loading && (
                            <div className="spinner-border spinner-border-sm text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        )}
                    </div>
                    <div className="card-body p-0">
                        <MapComponent
                            initialViewState={{
                                longitude: 100.5,
                                latitude: 13.7,
                                zoom: 5.5
                            }}
                            style={{ width: '100%', height: '600px' }}
                            onMapLoad={handleMapLoad}
                        >
                            {/* Show popup when feature is clicked */}
                            {popupInfo && (
                                <Popup
                                    longitude={popupInfo.longitude}
                                    latitude={popupInfo.latitude}
                                    anchor="bottom"
                                    onClose={() => setPopupInfo(null)}
                                >
                                    <div style={{ minWidth: '200px' }}>
                                        <h6 className="mb-2">Feature Information</h6>
                                        {Object.entries(popupInfo.properties).map(([key, value]) => (
                                            <div key={key} className="mb-1">
                                                <strong>{key}:</strong> {value}
                                            </div>
                                        ))}
                                    </div>
                                </Popup>
                            )}
                        </MapComponent>
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="col-md-4">
                <div className="card">
                    <div className="card-header">
                        <h5 className="mb-0">Legend</h5>
                    </div>
                    <div className="card-body">
                        <div className="mb-3">
                            <h6>Drought Severity</h6>
                            <div className="d-flex align-items-center mb-2">
                                <div style={{
                                    width: '30px',
                                    height: '20px',
                                    backgroundColor: '#d32f2f',
                                    marginRight: '10px',
                                    border: '1px solid #000'
                                }}></div>
                                <span>High</span>
                            </div>
                            <div className="d-flex align-items-center mb-2">
                                <div style={{
                                    width: '30px',
                                    height: '20px',
                                    backgroundColor: '#ff9800',
                                    marginRight: '10px',
                                    border: '1px solid #000'
                                }}></div>
                                <span>Medium</span>
                            </div>
                            <div className="d-flex align-items-center mb-2">
                                <div style={{
                                    width: '30px',
                                    height: '20px',
                                    backgroundColor: '#ffeb3b',
                                    marginRight: '10px',
                                    border: '1px solid #000'
                                }}></div>
                                <span>Low</span>
                            </div>
                        </div>
                        <div>
                            <h6>Weather Stations</h6>
                            <div className="d-flex align-items-center">
                                <div style={{
                                    width: '12px',
                                    height: '12px',
                                    backgroundColor: '#2196F3',
                                    borderRadius: '50%',
                                    marginRight: '10px',
                                    border: '2px solid #fff',
                                    boxShadow: '0 0 3px rgba(0,0,0,0.3)'
                                }}></div>
                                <span>Active Station</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Instructions */}
            <div className="col-md-8">
                <div className="card">
                    <div className="card-header">
                        <h5 className="mb-0">PostGIS Integration</h5>
                    </div>
                    <div className="card-body">
                        <h6>Backend API Endpoints Required:</h6>
                        <ul>
                            <li><code>GET /api/drought-zones</code> - Returns GeoJSON of drought zones</li>
                            <li><code>GET /api/weather-stations</code> - Returns GeoJSON of weather stations</li>
                        </ul>

                        <h6 className="mt-3">Example FastAPI Endpoint:</h6>
                        <pre className="bg-light p-3 rounded">
                            <code>{`
@app.get("/api/drought-zones")
async def get_drought_zones():
    query = """
        SELECT 
            id, 
            name, 
            severity,
            ST_AsGeoJSON(geom)::json as geometry
        FROM drought_zones
        WHERE active = true
    """
    # Execute query and return GeoJSON
    return {
        "type": "FeatureCollection",
        "features": [...]
    }
                            `}</code>
                        </pre>

                        <div className="alert alert-info mt-3">
                            <i className="ph-duotone ph-info me-2"></i>
                            <strong>Note:</strong> This is a demo showing PostGIS integration.
                            Make sure your FastAPI backend has the corresponding endpoints.
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default PostGISMapExample;