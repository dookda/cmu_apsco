import React, { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '../layout';
import MapComponent from './MapComponent';
import { useLanguage } from '../../contexts/LanguageContext';

const NDVIPage = () => {
    const { t, format, getProvinceName } = useLanguage();
    const [ndviData, setNdviData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState(null);
    const [error, setError] = useState(null);
    const [studyAreas, setStudyAreas] = useState([]);
    const [selectedArea, setSelectedArea] = useState('');
    const [mapCenter, setMapCenter] = useState([98.95, 18.8]);
    const [mapZoom, setMapZoom] = useState(8);
    const [dateRange, setDateRange] = useState({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });
    const [opacity, setOpacity] = useState(0.7);
    const [basemap, setBasemap] = useState('positron');
    const [selectedIndex, setSelectedIndex] = useState('NDVI'); // 'NDVI', 'SPI', or 'NDMI'
    const [showIndexLayer, setShowIndexLayer] = useState(true); // Show/hide index layer
    const [toastMessage, setToastMessage] = useState(null); // Toast notification
    const mapRef = useRef(null); // Reference to map instance

    // Available basemap options
    const basemapOptions = {
        positron: {
            name: t('basemaps.light'),
            url: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
            icon: 'ph-sun'
        },
        'dark-matter': {
            name: t('basemaps.dark'),
            url: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
            icon: 'ph-moon'
        },
        voyager: {
            name: t('basemaps.voyager'),
            url: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
            icon: 'ph-map-trifold'
        },
        osm: {
            name: t('basemaps.streets'),
            url: 'https://tiles.openfreemap.org/styles/liberty',
            icon: 'ph-road-horizon'
        },
        satellite: {
            name: t('basemaps.satellite'),
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
            // console.log(`[${selectedIndex}] Map data received:`, data);
            // console.log(`[${selectedIndex}] Tile URL:`, data.tile_url);
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
    // Only load if a study area is selected
    useEffect(() => {
        if (selectedArea) {
            fetchIndexMapUrl();
            fetchIndexStats();
        }
    }, [dateRange, selectedArea, selectedIndex]);

    // Add GEE layer to map when data is available
    useEffect(() => {
        if (!mapRef.current || !ndviData || !ndviData.tile_url) return;

        const map = mapRef.current;
        const sourceId = `${selectedIndex.toLowerCase()}-gee-source`;
        const layerId = `${selectedIndex.toLowerCase()}-gee-layer`;

        // console.log('[NDVIPage] Adding GEE layer:', { sourceId, layerId, tileUrl: ndviData.tile_url });

        // Remove existing source and layer if present
        try {
            if (map && map.getLayer && map.getLayer(layerId)) {
                map.removeLayer(layerId);
                console.log('[NDVIPage] Removed existing layer:', layerId);
            }
            if (map && map.getSource && map.getSource(sourceId)) {
                map.removeSource(sourceId);
                console.log('[NDVIPage] Removed existing source:', sourceId);
            }
        } catch (e) {
            console.warn('[NDVIPage] Error removing old layer/source:', e);
        }

        // Add source and layer if layer should be visible
        if (showIndexLayer) {
            try {
                // Add source
                map.addSource(sourceId, {
                    type: 'raster',
                    tiles: [ndviData.tile_url],
                    tileSize: 256,
                    minzoom: 0,
                    maxzoom: 22
                });
                console.log('[NDVIPage] Added source:', sourceId);

                // Add layer
                map.addLayer({
                    id: layerId,
                    type: 'raster',
                    source: sourceId,
                    paint: {
                        'raster-opacity': opacity,
                        'raster-fade-duration': 0
                    },
                    minzoom: 0,
                    maxzoom: 22
                });
                console.log('[NDVIPage] Added layer:', layerId);
            } catch (e) {
                console.error('[NDVIPage] Error adding GEE layer:', e);
                setError(`Failed to add ${selectedIndex} layer to map: ${e.message}`);
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
                console.warn('[NDVIPage] Cleanup error:', e);
            }
        };
    }, [ndviData, selectedIndex, showIndexLayer]);

    // Update layer opacity when it changes
    useEffect(() => {
        if (!mapRef.current) return;
        const map = mapRef.current;
        const layerId = `${selectedIndex.toLowerCase()}-gee-layer`;

        try {
            if (map.getLayer(layerId)) {
                map.setPaintProperty(layerId, 'raster-opacity', opacity);
                console.log('[NDVIPage] Updated opacity:', opacity);
            }
        } catch (e) {
            console.warn('[NDVIPage] Error updating opacity:', e);
        }
    }, [opacity, selectedIndex]);

    const handleMapLoad = (map) => {
        // console.log('[NDVIPage] Map loaded', map);
        mapRef.current = map;

        // Set globe projection
        if (map.setProjection) {
            map.setProjection({ type: 'globe' });
        }

        // Add click event for showing index values
        map.on('click', handleMapClick);

        // Debug: Log when layers are added
        map.on('load', (e) => {
            map.setProjection({
                type: 'globe'
            });
        });

        map.on('error', (e) => {
            console.error('[NDVIPage] Map error:', e);
            if (e.error && e.error.message) {
                setError(`Map error: ${e.error.message}`);
            }
        });
    };

    const handleMapClick = async (e) => {
        if (!mapRef.current || !ndviData || !ndviData.tile_url || !showIndexLayer) return;

        const lngLat = e.lngLat;

        try {
            // Show loading toast
            showToast('Loading...', 10000);

            // Query the backend for pixel value
            const response = await fetch(
                `http://localhost:8000/api/ndvi/pixel-value?` +
                `lng=${lngLat.lng}&lat=${lngLat.lat}` +
                `&start_date=${dateRange.startDate}&end_date=${dateRange.endDate}` +
                `&study_area=${encodeURIComponent(selectedArea)}` +
                `&index_type=${selectedIndex}`
            );

            if (response.ok) {
                const data = await response.json();
                if (data.value !== null) {
                    showToast(
                        `${selectedIndex}: ${data.value}\n${data.interpretation}`,
                        5000
                    );
                } else {
                    showToast(t('noDataAvailable'), 3000);
                }
            } else {
                showToast(t('errorFetchingValue'), 3000);
            }
        } catch (error) {
            console.error('Error querying map:', error);
            showToast(t('errorFetchingValue'), 3000);
        }
    };

    const showToast = (message, duration = 3000) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(null), duration);
    };

    const handleDateChange = () => {
        fetchIndexMapUrl();
        fetchIndexStats();
    };

    return (
        <DashboardLayout
            title={t('droughtMonitoring')}
            breadcrumbItems={[{ name: t('droughtIndices') }]}
        >
            {/* Error Alert */}
            {error && (
                <div className="col-12">
                    <div className="alert alert-danger alert-dismissible fade show" role="alert">
                        <i className="ph-duotone ph-warning me-2"></i>
                        <strong>{t('error')}:</strong> {error}
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
                        {/* Index Selector with checkbox - moved to top of card body */}
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="mb-0">
                                <i className="ph-duotone ph-chart-line me-2"></i>
                                {selectedIndex} {t('analysis')}{selectedArea ? ` - ${getProvinceName(selectedArea)}` : ` - ${t('selectStudyArea')}`}
                            </h5>
                            <div className="d-flex align-items-center gap-3">
                                {/* Show/Hide Layer Checkbox */}
                                <div className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="showIndexLayer"
                                        checked={showIndexLayer}
                                        onChange={(e) => setShowIndexLayer(e.target.checked)}
                                    />
                                    <label className="form-check-label" htmlFor="showIndexLayer">
                                        {t('showLayer')}
                                    </label>
                                </div>
                                {/* Index Type Selector */}
                                <div className="btn-group" role="group">
                                    <button
                                        type="button"
                                        className={`btn btn-sm ${selectedIndex === 'NDVI' ? 'btn-primary' : 'btn-outline-primary'}`}
                                        onClick={() => setSelectedIndex('NDVI')}
                                        title={t('ndviLong')}
                                    >
                                        <i className="ph-duotone ph-plant me-1"></i>
                                        NDVI
                                    </button>
                                    <button
                                        type="button"
                                        className={`btn btn-sm ${selectedIndex === 'NDMI' ? 'btn-primary' : 'btn-outline-primary'}`}
                                        onClick={() => setSelectedIndex('NDMI')}
                                        title={t('ndmiLong')}
                                    >
                                        <i className="ph-duotone ph-drop me-1"></i>
                                        NDMI
                                    </button>
                                    <button
                                        type="button"
                                        className={`btn btn-sm ${selectedIndex === 'SPI' ? 'btn-primary' : 'btn-outline-primary'}`}
                                        onClick={() => setSelectedIndex('SPI')}
                                        title={t('spiLong')}
                                    >
                                        <i className="ph-duotone ph-cloud-rain me-1"></i>
                                        SPI
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="row g-3">
                            <div className="col-md-3">
                                <label className="form-label">{t('studyArea')}</label>
                                <select
                                    className="form-select"
                                    value={selectedArea}
                                    onChange={(e) => setSelectedArea(e.target.value)}
                                >
                                    <option value="">{t('selectStudyArea')}</option>
                                    {studyAreas.map((area) => (
                                        <option key={area.name} value={area.name}>
                                            {getProvinceName(area.name)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-2">
                                <label className="form-label">{t('startDate')}</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={dateRange.startDate}
                                    onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                                />
                            </div>
                            <div className="col-md-2">
                                <label className="form-label">{t('endDate')}</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={dateRange.endDate}
                                    onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                                />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">{t('layerOpacity')}: {Math.round(opacity * 100)}%</label>
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
                                            {t('loading')}
                                        </>
                                    ) : (
                                        <>
                                            <i className="ph-duotone ph-arrows-clockwise me-2"></i>
                                            {t('update')}
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
                            className="basemap-selector"
                            style={{
                                position: 'absolute',
                                top: '10px',
                                left: '10px',
                                zIndex: 1,
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
                                className="map-legend"
                                style={{
                                    position: 'absolute',
                                    bottom: '20px',
                                    left: '10px',
                                    zIndex: 1,
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
                                                className="legend-color-box"
                                                style={{
                                                    width: '20px',
                                                    height: '20px',
                                                    backgroundColor: color
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
                                        {t('period')}: {format.dateRange(dateRange.startDate, dateRange.endDate)}
                                    </small>
                                </div>
                            </div>
                        )}

                        {/* Index Value Info Box */}
                        {toastMessage && (
                            <div
                                className="card"
                                style={{
                                    position: 'absolute',
                                    top: '10px',
                                    right: '10px',
                                    zIndex: 1,
                                    minWidth: '300px',
                                    maxWidth: '400px'
                                }}
                            >
                                <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center py-2">
                                    <div>
                                        <i className="ph-duotone ph-map-pin me-2"></i>
                                        <strong>{t('indexValue')}</strong>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn-close btn-close-white btn-sm"
                                        onClick={() => setToastMessage(null)}
                                        style={{ fontSize: '0.7rem' }}
                                    ></button>
                                </div>
                                <div className="card-body py-2" style={{ whiteSpace: 'pre-line', fontSize: '0.9rem' }}>
                                    {toastMessage}
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
                            projection="globe"
                        >
                            {/* GEE layers are now added programmatically via useEffect */}
                        </MapComponent>
                    </div>
                </div>
            </div>

            {/* Statistics Card */}
            <div className="col-md-6">
                <div className="card">
                    <div className="card-body">
                        <h5 className="mb-3">{selectedIndex} {t('statistics')}</h5>
                        {stats ? (
                            <>
                                <div className="mb-3">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span>{t('mean')} {selectedIndex}</span>
                                        <span className="badge bg-primary fs-6">{format.indexValue(stats.statistics.mean)}</span>
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
                                        <span>{t('minimum')}</span>
                                        <strong>{format.indexValue(stats.statistics.min)}</strong>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between">
                                        <span>{t('maximum')}</span>
                                        <strong>{format.indexValue(stats.statistics.max)}</strong>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between">
                                        <span>{t('stdDeviation')}</span>
                                        <strong>{format.indexValue(stats.statistics.std_dev)}</strong>
                                    </li>
                                </ul>

                                <div className="alert alert-info mt-3 mb-0">
                                    <strong>{t('interpretation')}:</strong> {stats.interpretation}
                                </div>
                            </>
                        ) : loading ? (
                            <div className="text-center py-4">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">{t('loading')}</span>
                                </div>
                                <p className="mt-2 text-muted">{t('calculating')} {selectedIndex} {t('statistics')}...</p>
                            </div>
                        ) : (
                            <div className="text-center py-4 text-muted">
                                <i className="ph-duotone ph-chart-bar" style={{ fontSize: '48px' }}></i>
                                <p className="mt-2">{t('noStatisticsAvailable')}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Information Card */}
            <div className="col-md-6">
                <div className="card">
                    <div className="card-body">
                        <h5 className="mb-3">{t('about')} {selectedIndex}</h5>
                        {selectedIndex === 'NDVI' ? (
                            <>
                                <p className="mb-3">
                                    {t('ndviDescription')}
                                </p>

                                <h6 className="mb-2">{t('ndviValues')}</h6>
                                <ul className="mb-3">
                                    <li><strong>&lt; 0:</strong> {t('ndviWater')}</li>
                                    <li><strong>0 - 0.2:</strong> {t('ndviVeryLow')}</li>
                                    <li><strong>0.2 - 0.4:</strong> {t('ndviLow')}</li>
                                    <li><strong>0.4 - 0.6:</strong> {t('ndviModerate')}</li>
                                    <li><strong>0.6 - 0.8:</strong> {t('ndviHigh')}</li>
                                    <li><strong>&gt; 0.8:</strong> {t('ndviVeryHigh')}</li>
                                </ul>

                                <div className="alert alert-warning mb-0">
                                    <strong>{t('dataSource')}:</strong> {t('ndviDataSource')}
                                </div>
                            </>
                        ) : selectedIndex === 'NDMI' ? (
                            <>
                                <p className="mb-3">
                                    {t('ndmiDescription')}
                                </p>

                                <h6 className="mb-2">{t('ndmiValues')}</h6>
                                <ul className="mb-3">
                                    <li><strong>&lt; -0.4:</strong> {t('ndmiVeryDry')}</li>
                                    <li><strong>-0.4 to -0.2:</strong> {t('ndmiDry')}</li>
                                    <li><strong>-0.2 to 0:</strong> {t('ndmiSlightlyDry')}</li>
                                    <li><strong>0 to 0.2:</strong> {t('ndmiModerate')}</li>
                                    <li><strong>0.2 to 0.4:</strong> {t('ndmiHigh')}</li>
                                    <li><strong>&gt; 0.4:</strong> {t('ndmiVeryHigh')}</li>
                                </ul>

                                <div className="alert alert-warning mb-0">
                                    <strong>{t('dataSource')}:</strong> {t('ndmiDataSource')}
                                </div>
                            </>
                        ) : (
                            <>
                                <p className="mb-3">
                                    {t('spiDescription')}
                                </p>

                                <h6 className="mb-2">{t('spiValues')}</h6>
                                <ul className="mb-3">
                                    <li><strong>&lt; -30%:</strong> {t('spiSevereDrought')}</li>
                                    <li><strong>-30% to -20%:</strong> {t('spiModerateDrought')}</li>
                                    <li><strong>-20% to -10%:</strong> {t('spiMildDrought')}</li>
                                    <li><strong>-10% to +10%:</strong> {t('spiNearNormal')}</li>
                                    <li><strong>+10% to +20%:</strong> {t('spiSlightlyWet')}</li>
                                    <li><strong>+20% to +30%:</strong> {t('spiModeratelyWet')}</li>
                                    <li><strong>&gt; +30%:</strong> {t('spiVeryWet')}</li>
                                </ul>

                                <div className="alert alert-warning mb-0">
                                    <strong>{t('dataSource')}:</strong> {t('spiDataSource')}
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
