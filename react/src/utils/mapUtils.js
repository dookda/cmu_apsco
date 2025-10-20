// Utility functions for working with PostGIS and MapLibre GL

/**
 * Fetch GeoJSON data from FastAPI backend
 * @param {string} endpoint - API endpoint to fetch from
 * @returns {Promise<Object>} GeoJSON data
 */
export const fetchGeoJSON = async (endpoint) => {
    try {
        const response = await fetch(`http://localhost:8000/api/${endpoint}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching GeoJSON:', error);
        return null;
    }
};

/**
 * Add a GeoJSON layer to the map
 * @param {Object} map - MapLibre GL map instance
 * @param {string} sourceId - Unique ID for the source
 * @param {Object} geojson - GeoJSON data
 * @param {string} layerId - Unique ID for the layer
 * @param {Object} layerStyle - Layer paint properties
 */
export const addGeoJSONLayer = (map, sourceId, geojson, layerId, layerStyle = {}) => {
    // Remove existing source and layer if they exist
    if (map.getLayer(layerId)) {
        map.removeLayer(layerId);
    }
    if (map.getSource(sourceId)) {
        map.removeSource(sourceId);
    }

    // Add source
    map.addSource(sourceId, {
        type: 'geojson',
        data: geojson
    });

    // Determine layer type based on geometry
    const geometryType = geojson.features?.[0]?.geometry?.type;
    let layerType = 'fill';

    if (geometryType === 'Point' || geometryType === 'MultiPoint') {
        layerType = 'circle';
    } else if (geometryType === 'LineString' || geometryType === 'MultiLineString') {
        layerType = 'line';
    }

    // Default styles based on layer type
    const defaultStyles = {
        fill: {
            'fill-color': '#088',
            'fill-opacity': 0.5,
            'fill-outline-color': '#000'
        },
        line: {
            'line-color': '#088',
            'line-width': 2
        },
        circle: {
            'circle-radius': 8,
            'circle-color': '#088',
            'circle-stroke-width': 2,
            'circle-stroke-color': '#fff'
        }
    };

    // Add layer
    map.addLayer({
        id: layerId,
        type: layerType,
        source: sourceId,
        paint: { ...defaultStyles[layerType], ...layerStyle }
    });
};

/**
 * Convert PostGIS query result to GeoJSON
 * @param {Array} rows - PostGIS query result rows
 * @param {string} geomColumn - Name of the geometry column (default: 'geom')
 * @returns {Object} GeoJSON FeatureCollection
 */
export const rowsToGeoJSON = (rows, geomColumn = 'geom') => {
    return {
        type: 'FeatureCollection',
        features: rows.map(row => ({
            type: 'Feature',
            geometry: row[geomColumn],
            properties: Object.keys(row).reduce((props, key) => {
                if (key !== geomColumn) {
                    props[key] = row[key];
                }
                return props;
            }, {})
        }))
    };
};

/**
 * Add click event to show feature properties in popup
 * @param {Object} map - MapLibre GL map instance
 * @param {string} layerId - Layer ID to add click handler
 * @param {Function} callback - Callback function with feature data
 */
export const addLayerClickHandler = (map, layerId, callback) => {
    map.on('click', layerId, (e) => {
        if (e.features && e.features.length > 0) {
            const feature = e.features[0];
            callback(feature, e.lngLat);
        }
    });

    // Change cursor on hover
    map.on('mouseenter', layerId, () => {
        map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', layerId, () => {
        map.getCanvas().style.cursor = '';
    });
};

/**
 * Fit map bounds to GeoJSON data
 * @param {Object} map - MapLibre GL map instance
 * @param {Object} geojson - GeoJSON data
 * @param {Object} options - Fit bounds options
 */
export const fitToGeoJSON = (map, geojson, options = {}) => {
    if (!geojson || !geojson.features || geojson.features.length === 0) {
        return;
    }

    // Calculate bounds
    let minLng = Infinity, minLat = Infinity;
    let maxLng = -Infinity, maxLat = -Infinity;

    geojson.features.forEach(feature => {
        const coords = feature.geometry.coordinates;

        const processCoords = (coord) => {
            if (Array.isArray(coord[0])) {
                coord.forEach(processCoords);
            } else {
                const [lng, lat] = coord;
                minLng = Math.min(minLng, lng);
                minLat = Math.min(minLat, lat);
                maxLng = Math.max(maxLng, lng);
                maxLat = Math.max(maxLat, lat);
            }
        };

        processCoords(coords);
    });

    // Fit bounds with padding
    map.fitBounds(
        [[minLng, minLat], [maxLng, maxLat]],
        { padding: 50, duration: 1000, ...options }
    );
};

/**
 * Create a heatmap layer from point data
 * @param {Object} map - MapLibre GL map instance
 * @param {string} sourceId - Source ID
 * @param {Object} geojson - GeoJSON with Point features
 * @param {string} layerId - Layer ID
 * @param {string} weightProperty - Property name for heatmap weight
 */
export const addHeatmapLayer = (map, sourceId, geojson, layerId, weightProperty = null) => {
    // Remove existing
    if (map.getLayer(layerId)) {
        map.removeLayer(layerId);
    }
    if (map.getSource(sourceId)) {
        map.removeSource(sourceId);
    }

    // Add source
    map.addSource(sourceId, {
        type: 'geojson',
        data: geojson
    });

    // Add heatmap layer
    const heatmapLayer = {
        id: layerId,
        type: 'heatmap',
        source: sourceId,
        paint: {
            'heatmap-weight': weightProperty
                ? ['get', weightProperty]
                : 1,
            'heatmap-intensity': 1,
            'heatmap-color': [
                'interpolate',
                ['linear'],
                ['heatmap-density'],
                0, 'rgba(33,102,172,0)',
                0.2, 'rgb(103,169,207)',
                0.4, 'rgb(209,229,240)',
                0.6, 'rgb(253,219,199)',
                0.8, 'rgb(239,138,98)',
                1, 'rgb(178,24,43)'
            ],
            'heatmap-radius': 20,
            'heatmap-opacity': 0.8
        }
    };

    map.addLayer(heatmapLayer);
};

/**
 * Add 3D extrusion layer for polygon data
 * @param {Object} map - MapLibre GL map instance
 * @param {string} sourceId - Source ID
 * @param {Object} geojson - GeoJSON with Polygon features
 * @param {string} layerId - Layer ID
 * @param {string} heightProperty - Property name for extrusion height
 */
export const add3DExtrusionLayer = (map, sourceId, geojson, layerId, heightProperty) => {
    // Remove existing
    if (map.getLayer(layerId)) {
        map.removeLayer(layerId);
    }
    if (map.getSource(sourceId)) {
        map.removeSource(sourceId);
    }

    // Add source
    map.addSource(sourceId, {
        type: 'geojson',
        data: geojson
    });

    // Add 3D extrusion layer
    map.addLayer({
        id: layerId,
        type: 'fill-extrusion',
        source: sourceId,
        paint: {
            'fill-extrusion-color': '#088',
            'fill-extrusion-height': ['get', heightProperty],
            'fill-extrusion-base': 0,
            'fill-extrusion-opacity': 0.8
        }
    });
};

export default {
    fetchGeoJSON,
    addGeoJSONLayer,
    rowsToGeoJSON,
    addLayerClickHandler,
    fitToGeoJSON,
    addHeatmapLayer,
    add3DExtrusionLayer
};