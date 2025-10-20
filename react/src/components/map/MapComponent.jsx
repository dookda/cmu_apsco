import React, { useRef, useEffect, useState } from 'react';
import Map, { NavigationControl, ScaleControl, GeolocateControl, FullscreenControl } from 'react-map-gl/maplibre';
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
                <NavigationControl position="bottom-right" />

                {/* Scale Control */}
                {/* <ScaleControl position="bottom-left" /> */}

                {/* Geolocate Control (Find my location) */}
                <GeolocateControl
                    position="bottom-right"
                    trackUserLocation
                    showUserHeading
                />

                {/* Fullscreen Control */}
                <FullscreenControl position="bottom-right" />

                {/* Allow children components (markers, popups, layers, etc.) */}
                {children}
            </Map>
        </div>
    );
};

export default MapComponent;