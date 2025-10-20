import React, { useRef, useEffect, useState } from 'react';
import Map, { NavigationControl, ScaleControl, GeolocateControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import './MapComponent.css';

const MapComponent = ({
    initialViewState = {
        longitude: 100.5,
        latitude: 13.7,
        zoom: 6
    },
    style = { width: '100%', height: '600px' },
    mapStyle = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    onMapLoad,
    children,
    projection,
}) => {
    const mapRef = useRef(null);
    const [viewState, setViewState] = useState(initialViewState);

    useEffect(() => {
        // Call onMapLoad callback when map is ready
        if (mapRef.current && onMapLoad) {
            onMapLoad(mapRef.current.getMap());
        }
    }, [onMapLoad]);

    const handleMapLoad = () => {
        if (mapRef.current && onMapLoad) {
            onMapLoad(mapRef.current.getMap());
        }
    };

    return (
        <div className="map-container" style={style}>
            <Map
                ref={mapRef}
                {...viewState}
                onMove={evt => setViewState(evt.viewState)}
                mapStyle={mapStyle}
                onLoad={handleMapLoad}
                attributionControl={true}
                projection={projection}
            >
                {/* Navigation Controls (Zoom +/-) */}
                <NavigationControl position="top-right" />

                {/* Geolocate Control (Find my location) */}
                <GeolocateControl
                    position="top-right"
                    trackUserLocation
                    showUserHeading
                />

                {/* Scale Control */}
                {/* <ScaleControl position="bottom-left" /> */}

                {/* Allow children components (markers, popups, layers, etc.) */}
                {children}
            </Map>
        </div>
    );
};

export default MapComponent;