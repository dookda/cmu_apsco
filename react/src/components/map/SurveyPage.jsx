import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../layout';
import MapComponent from './MapComponent';
import usePolygonDrawing from '../../hooks/usePolygonDrawing';
import { useLanguage } from '../../contexts/LanguageContext';

const SurveyPage = () => {
    const { t } = useLanguage();
    const [mapCenter, setMapCenter] = useState([100.5, 15.87]);
    const [mapZoom, setMapZoom] = useState(6);
    const [basemap, setBasemap] = useState('satellite');

    // Form state
    const [parcelName, setParcelName] = useState('');
    const [description, setDescription] = useState('');
    const [surveyorName, setSurveyorName] = useState('');
    const [selectedIndex, setSelectedIndex] = useState('NDVI');
    const [dateRange, setDateRange] = useState({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });
    const [province, setProvince] = useState('');
    const [landUse, setLandUse] = useState('');
    const [cropType, setCropType] = useState('');
    const [notes, setNotes] = useState('');

    // Drawing state
    const [indexData, setIndexData] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Layer state
    const [layerOpacity, setLayerOpacity] = useState(0.7);

    // Custom polygon layer state (from calculate button)
    const [customPolygonLayer, setCustomPolygonLayer] = useState(null);
    const [showCustomLayer, setShowCustomLayer] = useState(true);

    const [map, setMap] = useState(null);

    // Use custom polygon drawing hook
    const {
        isDrawing,
        polygon: drawnPolygon,
        pointCount,
        startDrawing,
        finishDrawing,
        clearDrawing
    } = usePolygonDrawing(map);

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
                        tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
                        tileSize: 256,
                        attribution: 'Esri, Maxar, Earthstar Geographics'
                    }
                },
                layers: [{
                    id: 'esri-satellite-layer',
                    type: 'raster',
                    source: 'esri-satellite',
                    minzoom: 0,
                    maxzoom: 22
                }]
            },
            icon: 'ph-globe-hemisphere-west'
        }
    };

    // Handle map load
    const handleMapLoad = (mapInstance) => {
        setMap(mapInstance);
        console.log('Map loaded successfully');
    };

    // Handle clear polygon - also clears stats and layers
    const handleClearPolygon = () => {
        clearDrawing();
        setStats(null);
        setCustomPolygonLayer(null);
        setIndexData(null);
    };

    // Background GEE layer removed - only custom polygon layers will be shown after calculation

    // Update custom polygon layer opacity when it changes
    useEffect(() => {
        if (!map) return;

        try {
            // Update custom polygon layer opacity if it exists
            const customLayerId = 'custom-polygon-layer';
            if (map.getLayer(customLayerId)) {
                map.setPaintProperty(customLayerId, 'raster-opacity', layerOpacity);
                console.log('[SurveyPage] Updated custom layer opacity:', layerOpacity);
            }
        } catch (e) {
            console.warn('[SurveyPage] Error updating opacity:', e);
        }
    }, [map, layerOpacity]);

    // Add custom polygon layer to map when calculated
    useEffect(() => {
        if (!map || !customPolygonLayer || !customPolygonLayer.tile_url) return;
        const sourceId = 'custom-polygon-source';
        const layerId = 'custom-polygon-layer';

        console.log('[SurveyPage] Adding custom polygon layer:', customPolygonLayer);

        // Remove existing custom layer if present
        try {
            if (map.getLayer(layerId)) {
                map.removeLayer(layerId);
                console.log('[SurveyPage] Removed existing custom layer');
            }
            if (map.getSource(sourceId)) {
                map.removeSource(sourceId);
                console.log('[SurveyPage] Removed existing custom source');
            }
        } catch (e) {
            console.warn('[SurveyPage] Error removing old custom layer:', e);
        }

        // Add custom polygon layer if visible
        if (showCustomLayer) {
            try {
                // Add source
                map.addSource(sourceId, {
                    type: 'raster',
                    tiles: [customPolygonLayer.tile_url],
                    tileSize: 256,
                    minzoom: 0,
                    maxzoom: 22
                });
                console.log('[SurveyPage] Added custom polygon source');

                // Add layer below draw layers
                map.addLayer({
                    id: layerId,
                    type: 'raster',
                    source: sourceId,
                    paint: {
                        'raster-opacity': layerOpacity,
                        'raster-fade-duration': 0
                    },
                    minzoom: 0,
                    maxzoom: 22
                });
                console.log('[SurveyPage] Added custom polygon layer');
            } catch (e) {
                console.error('[SurveyPage] Error adding custom polygon layer:', e);
                setError(`Failed to add custom ${selectedIndex} layer to map: ${e.message}`);
            }
        }

        // Cleanup function
        return () => {
            try {
                if (map.getLayer(layerId)) {
                    map.removeLayer(layerId);
                }
                if (map.getSource(sourceId)) {
                    map.removeSource(sourceId);
                }
            } catch (e) {
                console.warn('[SurveyPage] Custom layer cleanup error:', e);
            }
        };
    }, [map, customPolygonLayer, showCustomLayer, layerOpacity, selectedIndex]);

    const calculateIndexForPolygon = async () => {
        if (!drawnPolygon) {
            setError('Please draw a polygon on the map first');
            return;
        }

        setLoading(true);
        setError(null);
        setStats(null);

        try {
            // Determine the correct endpoint based on selected index
            let endpoint = 'stats/custom';
            if (selectedIndex === 'SPI') {
                endpoint = 'spi/stats/custom';
            } else if (selectedIndex === 'NDMI') {
                endpoint = 'ndmi/stats/custom';
            }

            console.log(`[SurveyPage] Calculating ${selectedIndex} for polygon...`);
            console.log(`[SurveyPage] Date range: ${dateRange.startDate} to ${dateRange.endDate}`);
            console.log(`[SurveyPage] Geometry:`, drawnPolygon);

            const response = await fetch(`http://localhost:8000/api/ndvi/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    start_date: dateRange.startDate,
                    end_date: dateRange.endDate,
                    geometry: drawnPolygon
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: response.statusText }));
                throw new Error(errorData.detail || `Failed to calculate ${selectedIndex}`);
            }

            const data = await response.json();
            console.log(`[SurveyPage] ${selectedIndex} stats received:`, data);
            setStats(data);

            // Store custom polygon layer data for visualization
            if (data.tile_url) {
                setCustomPolygonLayer({
                    tile_url: data.tile_url,
                    bounds: data.bounds,
                    index: selectedIndex
                });
                console.log(`[SurveyPage] Custom polygon layer data stored`);
            }
        } catch (error) {
            console.error(`[SurveyPage] Error calculating ${selectedIndex}:`, error);
            setError(error.message || `Error calculating ${selectedIndex}. Please try again.`);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveParcel = async () => {
        if (!drawnPolygon) { alert('Please draw a polygon on the map first'); return; }
        if (!parcelName.trim()) { alert('Please enter a parcel name'); return; }
        setLoading(true); setSaveSuccess(false); setError(null);
        try {
            const parcelData = { parcel_name: parcelName, description, geometry: drawnPolygon, surveyor_name: surveyorName, selected_index: selectedIndex, index_date_start: dateRange.startDate, index_date_end: dateRange.endDate, index_mean: stats?.statistics?.mean || null, index_min: stats?.statistics?.min || null, index_max: stats?.statistics?.max || null, index_std_dev: stats?.statistics?.std_dev || null, interpretation: stats?.interpretation || null, province, land_use: landUse, crop_type: cropType, notes };
            const response = await fetch('http://localhost:8000/api/survey/parcels', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(parcelData) });
            if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.detail || 'Failed to save parcel'); }
            const result = await response.json(); console.log('Parcel saved:', result); setSaveSuccess(true); setTimeout(() => { handleClearForm(); setSaveSuccess(false); }, 3000);
        } catch (error) { console.error('Error saving parcel:', error); setError(error.message); } finally { setLoading(false); }
    };

    const handleClearForm = () => {
        setParcelName('');
        setDescription('');
        setSurveyorName('');
        setProvince('');
        setLandUse('');
        setCropType('');
        setNotes('');
        setStats(null);
        setError(null);
        setSaveSuccess(false);
        setCustomPolygonLayer(null);
        clearDrawing();
    };

    return (
        <DashboardLayout title="Survey Form" breadcrumbItems={[{ name: 'Survey Form' }]}>
            <div className="row g-3">
                <div className="col-lg-7">
                    <div className="card">
                        <div className="card-body p-0" style={{ position: 'relative' }}>
                            {/* Basemap Selector */}
                            <div
                                className="basemap-selector"
                                style={{
                                    position: 'absolute',
                                    top: '10px',
                                    left: '10px',
                                    zIndex: 1
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

                            {/* Custom Drawing Controls - Bottom Right */}
                            <div
                                className="custom-drawing-controls"
                                style={{
                                    position: 'absolute',
                                    bottom: '50px',
                                    right: '10px',
                                    zIndex: 9999,
                                    pointerEvents: 'auto'
                                }}
                            >
                                {!isDrawing && (
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-secondary"
                                        onClick={() => {
                                            console.log('Draw button clicked');
                                            startDrawing();
                                        }}
                                        title="Draw new polygon"
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            padding: '0',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                                            borderRadius: '0.25rem',
                                            marginBottom: '5px'
                                        }}
                                    >
                                        <i className="ph-duotone ph-polygon" style={{ fontSize: '20px' }}></i>
                                    </button>
                                )}
                                {isDrawing && (
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-success"
                                        onClick={() => {
                                            console.log('Finish button clicked');
                                            finishDrawing();
                                        }}
                                        title="Finish drawing"
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            padding: '0',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                                            borderRadius: '0.25rem',
                                            marginBottom: '5px'
                                        }}
                                    >
                                        <i className="ph-duotone ph-check" style={{ fontSize: '20px' }}></i>
                                    </button>
                                )}
                                {drawnPolygon && !isDrawing && (
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => {
                                            console.log('Clear button clicked');
                                            handleClearPolygon();
                                        }}
                                        title="Clear polygon"
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            padding: '0',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                                            borderRadius: '0.25rem'
                                        }}
                                    >
                                        <i className="ph-duotone ph-trash" style={{ fontSize: '20px' }}></i>
                                    </button>
                                )}
                            </div>

                            <MapComponent initialViewState={{ longitude: mapCenter[0], latitude: mapCenter[1], zoom: mapZoom }} style={{ width: '100%', height: '600px' }} mapStyle={basemapOptions[basemap].url} onMapLoad={handleMapLoad} />
                        </div>
                    </div>

                    {stats && (
                        <div className="card mt-3">
                            <div className="card-body">
                                <div className="mb-3">
                                    <h6 className="text-muted mb-2">Period</h6>
                                    <p className="mb-0">
                                        <i className="ph-duotone ph-calendar me-2"></i>
                                        {stats.period?.start_date} to {stats.period?.end_date}
                                    </p>
                                </div>

                                <hr />

                                <h6 className="mb-3">Statistical Summary</h6>
                                <ul className="list-group list-group-flush mb-3">
                                    <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                                        <span><strong>Area</strong></span>
                                        <span className="badge bg-info rounded-pill fs-6">
                                            {stats.area_km2 !== undefined ? `${Number(stats.area_km2).toFixed(2)} km²` : 'N/A'}
                                        </span>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                                        <span><strong>Mean {selectedIndex}</strong></span>
                                        <span className="badge bg-primary rounded-pill fs-6">
                                            {stats.statistics?.mean !== undefined ? Number(stats.statistics.mean).toFixed(4) : 'N/A'}
                                        </span>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                                        <span>Minimum</span>
                                        <span className="badge bg-secondary rounded-pill">
                                            {stats.statistics?.min !== undefined ? Number(stats.statistics.min).toFixed(4) : 'N/A'}
                                        </span>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                                        <span>Maximum</span>
                                        <span className="badge bg-secondary rounded-pill">
                                            {stats.statistics?.max !== undefined ? Number(stats.statistics.max).toFixed(4) : 'N/A'}
                                        </span>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                                        <span>Standard Deviation</span>
                                        <span className="badge bg-secondary rounded-pill">
                                            {stats.statistics?.std_dev !== undefined ? Number(stats.statistics.std_dev).toFixed(4) : 'N/A'}
                                        </span>
                                    </li>
                                </ul>

                                <div className="alert alert-info mb-0">
                                    <h6 className="alert-heading">
                                        <i className="ph-duotone ph-info me-2"></i>
                                        Interpretation
                                    </h6>
                                    <p className="mb-0">{stats.interpretation}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="col-lg-5">
                    <div className="card">
                        <div className="card-body">
                            {/* Error Alert */}
                            {error && (
                                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                                    <i className="ph-duotone ph-warning me-2"></i>
                                    <strong>Error:</strong> {error}
                                    <button type="button" className="btn-close" onClick={() => setError(null)}></button>
                                </div>
                            )}

                            {/* Success Alert */}
                            {saveSuccess && (
                                <div className="alert alert-success alert-dismissible fade show" role="alert">
                                    <i className="ph-duotone ph-check-circle me-2"></i>
                                    <strong>Success!</strong> Survey parcel saved successfully.
                                    <button type="button" className="btn-close" onClick={() => setSaveSuccess(false)}></button>
                                </div>
                            )}

                            <div className="mb-3">
                                <label className="form-label">Select Drought Index</label>
                                <div className="btn-group w-100" role="group">
                                    <button type="button" className={`btn ${selectedIndex === 'NDVI' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setSelectedIndex('NDVI')}>NDVI</button>
                                    <button type="button" className={`btn ${selectedIndex === 'NDMI' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setSelectedIndex('NDMI')}>NDMI</button>
                                    <button type="button" className={`btn ${selectedIndex === 'SPI' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setSelectedIndex('SPI')}>SPI</button>
                                </div>
                            </div>

                            <div className="row mb-3">
                                <div className="col-6">
                                    <label className="form-label">Start Date</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={dateRange.startDate}
                                        onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                                    />
                                </div>
                                <div className="col-6">
                                    <label className="form-label">End Date</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={dateRange.endDate}
                                        onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Layer Controls */}
                            {customPolygonLayer && (
                                <div className="mb-3">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <label className="form-label mb-0">{selectedIndex} Layer</label>
                                        <div className="form-check form-switch">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id="showCustomLayer"
                                                checked={showCustomLayer}
                                                onChange={(e) => setShowCustomLayer(e.target.checked)}
                                            />
                                            <label className="form-check-label" htmlFor="showCustomLayer">
                                                {showCustomLayer ? 'Visible' : 'Hidden'}
                                            </label>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="form-label small">Opacity: {Math.round(layerOpacity * 100)}%</label>
                                        <input
                                            type="range"
                                            className="form-range"
                                            min="0"
                                            max="1"
                                            step="0.1"
                                            value={layerOpacity}
                                            onChange={(e) => setLayerOpacity(parseFloat(e.target.value))}
                                            disabled={!showCustomLayer}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Calculate Button */}
                            <div className="mb-3">
                                <button
                                    className="btn btn-success w-100"
                                    onClick={calculateIndexForPolygon}
                                    disabled={loading || !drawnPolygon}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Calculating {selectedIndex}...
                                        </>
                                    ) : (
                                        <>
                                            <i className="ph-duotone ph-chart-line me-2"></i>
                                            Calculate {selectedIndex}
                                        </>
                                    )}
                                </button>
                                {drawnPolygon && !stats && !loading && (
                                    <small className="text-muted d-block mt-1">
                                        Click to calculate {selectedIndex} for the drawn polygon
                                    </small>
                                )}
                            </div>

                            <hr />

                            <div className="mb-3">
                                <label className="form-label">Parcel Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={parcelName}
                                    onChange={(e) => setParcelName(e.target.value)}
                                    placeholder="Enter parcel name"
                                />
                            </div>

                            <div className="d-grid gap-2">
                                <button
                                    className="btn btn-primary btn-lg"
                                    onClick={handleSaveParcel}
                                    disabled={loading || !drawnPolygon || !parcelName.trim()}
                                >
                                    {loading ? 'Saving...' : 'Save Survey Parcel'}
                                </button>
                                <button
                                    className="btn btn-outline-secondary"
                                    onClick={handleClearForm}
                                    disabled={loading}
                                >
                                    Clear Form
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default SurveyPage;
