import React, { useState } from 'react';
import { DashboardLayout } from '../layout';
import MapComponent from './MapComponent';
import { Marker, Popup } from 'react-map-gl/maplibre';

const MapPage = () => {
    const [selectedMarker, setSelectedMarker] = useState(null);
    const [selectedBasemap, setSelectedBasemap] = useState('positron');

    // Define available basemaps
    const basemaps = [
        {
            id: 'positron',
            name: 'Light',
            url: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
            description: 'Clean and minimal style'
        },
        {
            id: 'dark-matter',
            name: 'Dark',
            url: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
            description: 'Dark theme style'
        },
        {
            id: 'voyager',
            name: 'Voyager',
            url: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
            description: 'Colorful and detailed'
        },
        {
            id: 'osm-bright',
            name: 'OSM Bright',
            url: 'https://tiles.openfreemap.org/styles/bright',
            description: 'OpenStreetMap style'
        },
        {
            id: 'satellite',
            name: 'Satellite',
            url: 'https://api.maptiler.com/maps/hybrid/style.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL',
            description: 'Satellite imagery'
        }
    ];

    // Example markers for Thailand
    const markers = [
        {
            id: 1,
            name: 'Chiang Mai',
            longitude: 98.9853,
            latitude: 18.7883,
            description: 'Northern Thailand - Cultural Hub'
        },
        {
            id: 2,
            name: 'Bangkok',
            longitude: 100.5018,
            latitude: 13.7563,
            description: 'Capital City'
        },
        {
            id: 3,
            name: 'Phuket',
            longitude: 98.3923,
            latitude: 7.8804,
            description: 'Southern Thailand - Beach Paradise'
        }
    ];

    const handleMapLoad = (map) => {
        console.log('Map loaded successfully', map);
        // You can add custom layers, sources, or perform other map operations here
    };

    return (
        <DashboardLayout
            title="Interactive Map"
            breadcrumbItems={[{ name: 'Map' }]}
        >
            <div className="col-12">
                <div className="card">
                    <div className="card-body p-0" style={{ position: 'relative' }}>
                        {/* Basemap Switcher Control */}
                        <div
                            style={{
                                position: 'absolute',
                                top: '10px',
                                left: '10px',
                                zIndex: 1,
                                backgroundColor: 'white',
                                borderRadius: '8px',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                padding: '12px',
                                maxWidth: '200px'
                            }}
                        >
                            <h6 className="mb-2" style={{ fontSize: '14px', fontWeight: 'bold' }}>
                                <i className="ph-duotone ph-map me-2"></i>
                                Basemap
                            </h6>
                            <div className="d-flex flex-column gap-2">
                                {basemaps.map(basemap => (
                                    <div key={basemap.id} className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name="basemap"
                                            id={`basemap-${basemap.id}`}
                                            value={basemap.id}
                                            checked={selectedBasemap === basemap.id}
                                            onChange={(e) => setSelectedBasemap(e.target.value)}
                                        />
                                        <label
                                            className="form-check-label"
                                            htmlFor={`basemap-${basemap.id}`}
                                            style={{ fontSize: '13px', cursor: 'pointer' }}
                                        >
                                            {basemap.name}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <MapComponent
                            initialViewState={{
                                longitude: 100.5,
                                latitude: 13.7,
                                zoom: 5.5
                            }}
                            style={{ width: '100%', height: '600px' }}
                            mapStyle={basemaps.find(b => b.id === selectedBasemap)?.url}
                            onMapLoad={handleMapLoad}
                        >
                            {/* Add markers */}
                            {markers.map(marker => (
                                <Marker
                                    key={marker.id}
                                    longitude={marker.longitude}
                                    latitude={marker.latitude}
                                    anchor="bottom"
                                    onClick={(e) => {
                                        e.originalEvent.stopPropagation();
                                        setSelectedMarker(marker);
                                    }}
                                >
                                    <div className="custom-marker">
                                        <i
                                            className="ph-duotone ph-map-pin"
                                            style={{
                                                fontSize: '32px',
                                                color: '#e74c3c',
                                                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                                            }}
                                        ></i>
                                    </div>
                                </Marker>
                            ))}

                            {/* Show popup for selected marker */}
                            {selectedMarker && (
                                <Popup
                                    longitude={selectedMarker.longitude}
                                    latitude={selectedMarker.latitude}
                                    anchor="top"
                                    onClose={() => setSelectedMarker(null)}
                                    closeOnClick={false}
                                >
                                    <div>
                                        <h6 className="mb-2">{selectedMarker.name}</h6>
                                        <p className="mb-0 text-muted small">{selectedMarker.description}</p>
                                    </div>
                                </Popup>
                            )}
                        </MapComponent>
                    </div>
                </div>
            </div>

            {/* Map Info Card */}
            <div className="col-md-4">
                <div className="card">
                    <div className="card-header">
                        <h5 className="mb-0">Map Information</h5>
                    </div>
                    <div className="card-body">
                        <ul className="list-group list-group-flush">
                            <li className="list-group-item d-flex justify-content-between align-items-center">
                                <span>Map Library</span>
                                <span className="badge bg-primary">MapLibre GL</span>
                            </li>
                            <li className="list-group-item d-flex justify-content-between align-items-center">
                                <span>Markers</span>
                                <span className="badge bg-success">{markers.length}</span>
                            </li>
                            <li className="list-group-item d-flex justify-content-between align-items-center">
                                <span>Base Map</span>
                                <span className="badge bg-info">
                                    {basemaps.find(b => b.id === selectedBasemap)?.name || 'Light'}
                                </span>
                            </li>
                            <li className="list-group-item d-flex justify-content-between align-items-center">
                                <span>Projection</span>
                                <span className="badge bg-secondary">Web Mercator</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Markers List */}
            <div className="col-md-8">
                <div className="card">
                    <div className="card-header">
                        <h5 className="mb-0">Locations</h5>
                    </div>
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Location</th>
                                        <th>Longitude</th>
                                        <th>Latitude</th>
                                        <th>Description</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {markers.map(marker => (
                                        <tr key={marker.id}>
                                            <td>
                                                <i className="ph-duotone ph-map-pin me-2 text-danger"></i>
                                                <strong>{marker.name}</strong>
                                            </td>
                                            <td>{marker.longitude.toFixed(4)}</td>
                                            <td>{marker.latitude.toFixed(4)}</td>
                                            <td>{marker.description}</td>
                                            <td>
                                                <button
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={() => setSelectedMarker(marker)}
                                                >
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default MapPage;