import React, { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '../layout';
import MapComponent from './MapComponent';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
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
    const [drawnPolygon, setDrawnPolygon] = useState(null);
    const [indexData, setIndexData] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const mapRef = useRef(null);
    const drawRef = useRef(null);
    const drawListenersAddedRef = useRef(false);

    const basemapOptions = {
        positron: { name: 'Light', url: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json', icon: 'ph-sun' },
        'dark-matter': { name: 'Dark', url: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json', icon: 'ph-moon' },
        osm: { name: 'Streets', url: 'https://tiles.openfreemap.org/styles/liberty', icon: 'ph-road-horizon' },
        satellite: {
            name: 'Satellite',
            url: {
                version: 8,
                sources: { 'esri-satellite': { type: 'raster', tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'], tileSize: 256, attribution: 'Esri, Maxar, Earthstar Geographics' } },
                layers: [{ id: 'esri-satellite-layer', type: 'raster', source: 'esri-satellite', minzoom: 0, maxzoom: 22 }]
            },
            icon: 'ph-globe-hemisphere-west'
        }
    };

    // Initialize draw only after map style is loaded
    const handleMapLoad = (map) => {
        mapRef.current = map;

        const initDraw = () => {
            // Only initialize if not already done
            if (drawRef.current) {
                console.log('Draw control already initialized');
                return;
            }

            try {
                // Custom styles for MapLibre GL compatibility
                const drawStyles = [
                    // Polygon fill
                    {
                        id: 'gl-draw-polygon-fill-inactive',
                        type: 'fill',
                        filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
                        paint: {
                            'fill-color': '#3bb2d0',
                            'fill-outline-color': '#3bb2d0',
                            'fill-opacity': 0.1
                        }
                    },
                    {
                        id: 'gl-draw-polygon-fill-active',
                        type: 'fill',
                        filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
                        paint: {
                            'fill-color': '#fbb03b',
                            'fill-outline-color': '#fbb03b',
                            'fill-opacity': 0.1
                        }
                    },
                    // Polygon outline stroke (inactive)
                    {
                        id: 'gl-draw-polygon-stroke-inactive',
                        type: 'line',
                        filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
                        layout: {
                            'line-cap': 'round',
                            'line-join': 'round'
                        },
                        paint: {
                            'line-color': '#3bb2d0',
                            'line-width': 2
                        }
                    },
                    // Polygon outline stroke (active)
                    {
                        id: 'gl-draw-polygon-stroke-active',
                        type: 'line',
                        filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
                        layout: {
                            'line-cap': 'round',
                            'line-join': 'round'
                        },
                        paint: {
                            'line-color': '#fbb03b',
                            'line-dasharray': ['literal', [0.2, 2]],
                            'line-width': 2
                        }
                    },
                    // Vertex points
                    {
                        id: 'gl-draw-polygon-and-line-vertex-stroke-inactive',
                        type: 'circle',
                        filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
                        paint: {
                            'circle-radius': 5,
                            'circle-color': '#fff'
                        }
                    },
                    {
                        id: 'gl-draw-polygon-and-line-vertex-inactive',
                        type: 'circle',
                        filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
                        paint: {
                            'circle-radius': 3,
                            'circle-color': '#fbb03b'
                        }
                    }
                ];

                const draw = new MapboxDraw({
                    displayControlsDefault: false,
                    controls: {
                        polygon: true,
                        trash: true
                    },
                    defaultMode: 'draw_polygon',
                    styles: drawStyles
                });

                // Add the draw control to the bottom-right
                map.addControl(draw, 'bottom-right');
                drawRef.current = draw;

                // Add event listeners
                if (!drawListenersAddedRef.current) {
                    map.on('draw.create', handleDrawCreate);
                    map.on('draw.update', handleDrawUpdate);
                    map.on('draw.delete', handleDrawDelete);
                    drawListenersAddedRef.current = true;
                }

                console.log('MapboxDraw initialized successfully');
            } catch (err) {
                console.error('Failed to initialize draw control:', err);
            }
        };

        // Wait for style to load before initializing draw
        if (map.isStyleLoaded()) {
            initDraw();
        } else {
            map.once('load', initDraw);
        }
    };

    const handleDrawCreate = (e) => { const feature = e.features[0]; setDrawnPolygon(feature.geometry); console.log('Polygon created:', feature.geometry); };
    const handleDrawUpdate = (e) => { const feature = e.features[0]; setDrawnPolygon(feature.geometry); console.log('Polygon updated:', feature.geometry); };
    const handleDrawDelete = () => { setDrawnPolygon(null); setIndexData(null); setStats(null); console.log('Polygon deleted'); };

    useEffect(() => {
        return () => {
            const map = mapRef.current;
            if (!map) return;

            try {
                // Remove draw control
                if (drawRef.current) {
                    map.removeControl(drawRef.current);
                }

                // Remove event listeners
                if (drawListenersAddedRef.current) {
                    map.off('draw.create', handleDrawCreate);
                    map.off('draw.update', handleDrawUpdate);
                    map.off('draw.delete', handleDrawDelete);
                    drawListenersAddedRef.current = false;
                }
            } catch (err) {
                console.warn('Error during SurveyPage cleanup:', err);
            }
        };
    }, []);

    useEffect(() => { if (drawnPolygon && selectedIndex) calculateIndexForPolygon(); }, [drawnPolygon, selectedIndex, dateRange]);

    const calculateIndexForPolygon = async () => {
        if (!drawnPolygon) return;
        setLoading(true); setError(null);
        try {
            let endpoint = 'stats/custom';
            if (selectedIndex === 'SPI') endpoint = 'spi/stats/custom'; else if (selectedIndex === 'NDMI') endpoint = 'ndmi/stats/custom';
            const response = await fetch(`http://localhost:8000/api/ndvi/${endpoint}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ start_date: dateRange.startDate, end_date: dateRange.endDate, geometry: drawnPolygon }) });
            if (!response.ok) throw new Error(`Failed to calculate ${selectedIndex}`);
            const data = await response.json(); setStats(data); console.log(`${selectedIndex} stats:`, data);
        } catch (error) { console.error(`Error calculating ${selectedIndex}:`, error); setError(error.message); } finally { setLoading(false); }
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

    const handleClearForm = () => { setParcelName(''); setDescription(''); setSurveyorName(''); setProvince(''); setLandUse(''); setCropType(''); setNotes(''); setDrawnPolygon(null); setStats(null); if (drawRef.current) drawRef.current.deleteAll(); };

    return (
        <DashboardLayout title="Survey Form" breadcrumbItems={[{ name: 'Survey Form' }]}>
            <div className="row g-3">
                <div className="col-lg-7">
                    <div className="card">
                        <div className="card-body p-0" style={{ position: 'relative' }}>
                            {!drawnPolygon && (
                                <div className="alert alert-info m-3" style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1, maxWidth: '300px' }}>
                                    <small><strong>Instructions:</strong><br />Use the polygon tool (top-left) to draw your survey area on the map.</small>
                                </div>
                            )}
                            <MapComponent initialViewState={{ longitude: mapCenter[0], latitude: mapCenter[1], zoom: mapZoom }} style={{ width: '100%', height: '600px' }} mapStyle={basemapOptions[basemap].url} onMapLoad={handleMapLoad} />
                        </div>
                    </div>

                    {stats && (
                        <div className="card mt-3">
                            <div className="card-header bg-primary text-white"><h5 className="mb-0">{selectedIndex} Report</h5></div>
                            <div className="card-body"> ... </div>
                        </div>
                    )}
                </div>

                <div className="col-lg-5">
                    <div className="card">
                        <div className="card-body">
                            <div className="mb-3">
                                <label className="form-label">Select Drought Index</label>
                                <div className="btn-group w-100" role="group">
                                    <button type="button" className={`btn ${selectedIndex === 'NDVI' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setSelectedIndex('NDVI')}>NDVI</button>
                                    <button type="button" className={`btn ${selectedIndex === 'NDMI' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setSelectedIndex('NDMI')}>NDMI</button>
                                    <button type="button" className={`btn ${selectedIndex === 'SPI' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setSelectedIndex('SPI')}>SPI</button>
                                </div>
                            </div>
                            <div className="mb-3"><label className="form-label">Parcel Name</label><input type="text" className="form-control" value={parcelName} onChange={(e) => setParcelName(e.target.value)} placeholder="Enter parcel name" /></div>
                            <div className="d-grid gap-2"><button className="btn btn-primary btn-lg" onClick={handleSaveParcel} disabled={loading || !drawnPolygon || !parcelName.trim()}>{loading ? 'Saving...' : 'Save Survey Parcel'}</button>
                                <button className="btn btn-outline-secondary" onClick={handleClearForm} disabled={loading}>Clear Form</button></div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default SurveyPage;
