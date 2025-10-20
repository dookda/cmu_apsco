import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../layout';
import MapComponent from './MapComponent';
import { Layer, Source } from 'react-map-gl/maplibre';

const NDVIPage = () => {
    const [ndviData, setNdviData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState(null);
    const [error, setError] = useState(null);
    const [studyAreas, setStudyAreas] = useState([]);
    const [selectedArea, setSelectedArea] = useState('Chiang Mai');
    const [mapCenter, setMapCenter] = useState([98.95, 18.8]);
    const [mapZoom, setMapZoom] = useState(8);
    const [dateRange, setDateRange] = useState({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });
    const [opacity, setOpacity] = useState(0.7);
    const [basemap, setBasemap] = useState('positron');
    const [selectedIndex, setSelectedIndex] = useState('NDVI'); // 'NDVI', 'SPI', or 'NDMI'

    // Available basemap options
    const basemapOptions = {
        positron: {
            name: 'Light',
            url: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
            icon: 'ph-sun'
        },
        'dark-matter': {
            name: 'Dark',
            url: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
            icon: 'ph-moon'
        },
        voyager: {
            name: 'Voyager',
            url: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
            icon: 'ph-map-trifold'
        },
        osm: {
            name: 'Streets',
            url: 'https://tiles.openfreemap.org/styles/liberty',
            icon: 'ph-road-horizon'
        },
        satellite: {
            name: 'Satellite',
            url: {
                version: 8,
                sources: {
                    'esri-satellite': {
                        type: 'raster',
                        tiles: [
                            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                        ],
                        tileSize: 256,
                        attribution: 'Esri, Maxar, Earthstar Geographics'
                    }
                },
                layers: [
                    {
                        id: 'esri-satellite-layer',
                        type: 'raster',
                        source: 'esri-satellite',
                        minzoom: 0,
                        maxzoom: 22
                    }
                ]
            },
            icon: 'ph-globe-hemisphere-west'
        }
    };

    // Fetch available study areas
    const fetchStudyAreas = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/ndvi/study-areas');
            if (response.ok) {
                const data = await response.json();
                setStudyAreas(data.study_areas);
            }
        } catch (error) {
            console.error('Error fetching study areas:', error);
        }
    };

    const fetchIndexMapUrl = async () => {
        setLoading(true);
        setError(null);
        try {
            let endpoint = 'map-url';
            if (selectedIndex === 'SPI') {
                endpoint = 'spi/map-url';
            } else if (selectedIndex === 'NDMI') {
                endpoint = 'ndmi/map-url';
            }

            const response = await fetch(
                `http://localhost:8000/api/ndvi/${endpoint}?start_date=${dateRange.startDate}&end_date=${dateRange.endDate}&study_area=${encodeURIComponent(selectedArea)}`
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: response.statusText }));
                throw new Error(errorData.detail || `Server error: ${response.status}`);
            }

            const data = await response.json();
            setNdviData(data);

            // Update map center and zoom based on study area
            if (data.center) {
                setMapCenter(data.center);
            }
            if (data.zoom) {
                setMapZoom(data.zoom);
            }
        } catch (error) {
            console.error(`Error fetching ${selectedIndex} map:`, error);
            setError(error.message || `Error loading ${selectedIndex} data. Make sure Google Earth Engine is configured.`);
        } finally {
            setLoading(false);
        }
    };

    const fetchIndexStats = async () => {
        try {
            let endpoint = 'stats';
            if (selectedIndex === 'SPI') {
                endpoint = 'spi/stats';
            } else if (selectedIndex === 'NDMI') {
                endpoint = 'ndmi/stats';
            }

            const response = await fetch(
                `http://localhost:8000/api/ndvi/${endpoint}?start_date=${dateRange.startDate}&end_date=${dateRange.endDate}&study_area=${encodeURIComponent(selectedArea)}`
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: response.statusText }));
                console.error('Error fetching stats:', errorData.detail);
                return;
            }

            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error(`Error fetching ${selectedIndex} statistics:`, error);
        }
    };

    // Load study areas on mount
    useEffect(() => {
        fetchStudyAreas();
    }, []);

    // Reload data when date range, study area, or selected index changes
    useEffect(() => {
        fetchIndexMapUrl();
        fetchIndexStats();
    }, [dateRange, selectedArea, selectedIndex]);

    const handleMapLoad = (map) => {
        console.log('Map loaded', map);
    };

    const handleDateChange = () => {
        fetchIndexMapUrl();
        fetchIndexStats();
    };

    return (
        <DashboardLayout
            title="Drought Monitoring"
            breadcrumbItems={[{ name: 'Drought Indices' }]}
        >
            {/* Error Alert */}
            {error && (
                <div className="col-12">
                    <div className="alert alert-danger alert-dismissible fade show" role="alert">
                        <i className="ph-duotone ph-warning me-2"></i>
                        <strong>Error:</strong> {error}
                        <button
                            type="button"
                            className="btn-close"
                            onClick={() => setError(null)}
                        ></button>
                    </div>
                </div>
            )}

            {/* Controls Card */}
            <div className="col-12">
                <div className="card">
                    <div className="card-body">
                        {/* Index Selector - moved to top of card body */}
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="mb-0">
                                <i className="ph-duotone ph-chart-line me-2"></i>
                                {selectedIndex} Analysis - {selectedArea}
                            </h5>
                            <div className="btn-group" role="group">
                                <button
                                    type="button"
                                    className={`btn btn-sm ${selectedIndex === 'NDVI' ? 'btn-primary' : 'btn-outline-primary'}`}
                                    onClick={() => setSelectedIndex('NDVI')}
                                    title="Normalized Difference Vegetation Index"
                                >
                                    <i className="ph-duotone ph-plant me-1"></i>
                                    NDVI
                                </button>
                                <button
                                    type="button"
                                    className={`btn btn-sm ${selectedIndex === 'NDMI' ? 'btn-primary' : 'btn-outline-primary'}`}
                                    onClick={() => setSelectedIndex('NDMI')}
                                    title="Normalized Difference Moisture Index"
                                >
                                    <i className="ph-duotone ph-drop me-1"></i>
                                    NDMI
                                </button>
                                <button
                                    type="button"
                                    className={`btn btn-sm ${selectedIndex === 'SPI' ? 'btn-primary' : 'btn-outline-primary'}`}
                                    onClick={() => setSelectedIndex('SPI')}
                                    title="Standardized Precipitation Index"
                                >
                                    <i className="ph-duotone ph-cloud-rain me-1"></i>
                                    SPI
                                </button>
                            </div>
                        </div>
                        <div className="row g-3">
                            <div className="col-md-3">
                                <label className="form-label">Study Area</label>
                                <select
                                    className="form-select"
                                    value={selectedArea}
                                    onChange={(e) => setSelectedArea(e.target.value)}
                                >
                                    {studyAreas.map((area) => (
                                        <option key={area.id} value={area.id}>
                                            {area.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-2">
                                <label className="form-label">Start Date</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={dateRange.startDate}
                                    onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                                />
                            </div>
                            <div className="col-md-2">
                                <label className="form-label">End Date</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={dateRange.endDate}
                                    onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                                />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">Layer Opacity: {opacity}</label>
                                <input
                                    type="range"
                                    className="form-range"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    value={opacity}
                                    onChange={(e) => setOpacity(parseFloat(e.target.value))}
                                />
                            </div>
                            <div className="col-md-2">
                                <label className="form-label">&nbsp;</label>
                                <button
                                    className="btn btn-primary w-100"
                                    onClick={handleDateChange}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Loading...
                                        </>
                                    ) : (
                                        <>
                                            <i className="ph-duotone ph-arrows-clockwise me-2"></i>
                                            Update
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Map Card */}
            <div className="col-12">
                <div className="card">
                    <div className="card-body p-0" style={{ position: 'relative' }}>
                        {/* Basemap Selector */}
                        <div
                            style={{
                                position: 'absolute',
                                top: '10px',
                                left: '10px',
                                zIndex: 1,
                                backgroundColor: 'white',
                                borderRadius: '8px',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                padding: '8px'
                            }}
                        >
                            <div className="btn-group-vertical" role="group">
                                {Object.entries(basemapOptions).map(([key, value]) => (
                                    <button
                                        key={key}
                                        type="button"
                                        className={`btn btn-sm ${basemap === key ? 'btn-primary' : 'btn-outline-secondary'}`}
                                        onClick={() => setBasemap(key)}
                                        title={value.name}
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            padding: '0',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <i className={`ph-duotone ${value.icon}`} style={{ fontSize: '20px' }}></i>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Legend */}
                        {ndviData && ndviData.legend && (
                            <div
                                style={{
                                    position: 'absolute',
                                    bottom: '20px',
                                    left: '10px',
                                    zIndex: 1,
                                    backgroundColor: 'white',
                                    borderRadius: '8px',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                    padding: '12px',
                                    minWidth: '200px'
                                }}
                            >
                                <h6 className="mb-2" style={{ fontSize: '14px', fontWeight: 'bold' }}>
                                    {ndviData.legend.title}
                                </h6>
                                <div className="d-flex flex-column gap-1">
                                    {ndviData.legend.colors.map((color, idx) => (
                                        <div key={idx} className="d-flex align-items-center gap-2">
                                            <div
                                                style={{
                                                    width: '20px',
                                                    height: '20px',
                                                    backgroundColor: color,
                                                    border: '1px solid #ccc'
                                                }}
                                            ></div>
                                            <span style={{ fontSize: '12px' }}>
                                                {ndviData.legend.labels[idx]}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-2 pt-2 border-top">
                                    <small className="text-muted">
                                        Period: {dateRange.startDate} to {dateRange.endDate}
                                    </small>
                                </div>
                            </div>
                        )}

                        <MapComponent
                            initialViewState={{
                                longitude: mapCenter[0],
                                latitude: mapCenter[1],
                                zoom: mapZoom
                            }}
                            key={`${mapCenter[0]}-${mapCenter[1]}-${mapZoom}`}
                            style={{ width: '100%', height: '600px' }}
                            mapStyle={basemapOptions[basemap].url}
                            onMapLoad={handleMapLoad}
                        >
                            {/* Add NDVI raster layer when data is available */}
                            {ndviData && ndviData.tile_url && (
                                <Source
                                    id="ndvi-source"
                                    type="raster"
                                    tiles={[ndviData.tile_url]}
                                    tileSize={256}
                                >
                                    <Layer
                                        id="ndvi-layer"
                                        type="raster"
                                        paint={{
                                            'raster-opacity': opacity
                                        }}
                                    />
                                </Source>
                            )}
                        </MapComponent>
                    </div>
                </div>
            </div>

            {/* Statistics Card */}
            <div className="col-md-6">
                <div className="card">
                    <div className="card-body">
                        <h5 className="mb-3">{selectedIndex} Statistics</h5>
                        {stats ? (
                            <>
                                <div className="mb-3">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span>Mean NDVI</span>
                                        <span className="badge bg-primary fs-6">{stats.statistics.mean}</span>
                                    </div>
                                    <div className="progress" style={{ height: '8px' }}>
                                        <div
                                            className="progress-bar bg-success"
                                            style={{ width: `${(stats.statistics.mean + 0.2) / 1.0 * 100}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <ul className="list-group list-group-flush">
                                    <li className="list-group-item d-flex justify-content-between">
                                        <span>Minimum</span>
                                        <strong>{stats.statistics.min}</strong>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between">
                                        <span>Maximum</span>
                                        <strong>{stats.statistics.max}</strong>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between">
                                        <span>Std Deviation</span>
                                        <strong>{stats.statistics.std_dev}</strong>
                                    </li>
                                </ul>

                                <div className="alert alert-info mt-3 mb-0">
                                    <strong>Interpretation:</strong> {stats.interpretation}
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-4">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Information Card */}
            <div className="col-md-6">
                <div className="card">
                    <div className="card-body">
                        <h5 className="mb-3">About {selectedIndex}</h5>
                        {selectedIndex === 'NDVI' ? (
                            <>
                                <p className="mb-3">
                                    The Normalized Difference Vegetation Index (NDVI) is used to monitor vegetation health
                                    and detect drought stress.
                                </p>

                                <h6 className="mb-2">NDVI Values:</h6>
                                <ul className="mb-3">
                                    <li><strong>&lt; 0:</strong> Water or bare soil</li>
                                    <li><strong>0 - 0.2:</strong> Very low vegetation (drought stress)</li>
                                    <li><strong>0.2 - 0.4:</strong> Low vegetation density</li>
                                    <li><strong>0.4 - 0.6:</strong> Moderate vegetation</li>
                                    <li><strong>0.6 - 0.8:</strong> High vegetation density</li>
                                    <li><strong>&gt; 0.8:</strong> Very dense vegetation</li>
                                </ul>

                                <div className="alert alert-warning mb-0">
                                    <strong>Data Source:</strong> MODIS Terra MOD13Q1 (250m, 16-day) via Google Earth Engine
                                </div>
                            </>
                        ) : selectedIndex === 'NDMI' ? (
                            <>
                                <p className="mb-3">
                                    The Normalized Difference Moisture Index (NDMI) measures vegetation water content
                                    and is sensitive to vegetation moisture stress.
                                </p>

                                <h6 className="mb-2">NDMI Values:</h6>
                                <ul className="mb-3">
                                    <li><strong>&lt; -0.4:</strong> Very dry (severe water stress)</li>
                                    <li><strong>-0.4 to -0.2:</strong> Dry (moderate water stress)</li>
                                    <li><strong>-0.2 to 0:</strong> Slightly dry (low water content)</li>
                                    <li><strong>0 to 0.2:</strong> Moderate moisture (normal)</li>
                                    <li><strong>0.2 to 0.4:</strong> High moisture (good water content)</li>
                                    <li><strong>&gt; 0.4:</strong> Very high moisture (saturated)</li>
                                </ul>

                                <div className="alert alert-warning mb-0">
                                    <strong>Data Source:</strong> MODIS Terra MOD09A1 (500m, 8-day) via Google Earth Engine
                                </div>
                            </>
                        ) : (
                            <>
                                <p className="mb-3">
                                    The Standardized Precipitation Index (SPI) measures precipitation anomalies
                                    compared to historical averages to identify drought or wet conditions.
                                </p>

                                <h6 className="mb-2">SPI Values:</h6>
                                <ul className="mb-3">
                                    <li><strong>&lt; -30%:</strong> Severe drought</li>
                                    <li><strong>-30% to -20%:</strong> Moderate drought</li>
                                    <li><strong>-20% to -10%:</strong> Mild drought</li>
                                    <li><strong>-10% to +10%:</strong> Near normal</li>
                                    <li><strong>+10% to +20%:</strong> Slightly wet</li>
                                    <li><strong>+20% to +30%:</strong> Moderately wet</li>
                                    <li><strong>&gt; +30%:</strong> Very wet</li>
                                </ul>

                                <div className="alert alert-warning mb-0">
                                    <strong>Data Source:</strong> CHIRPS precipitation data via Google Earth Engine
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default NDVIPage;
