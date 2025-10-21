import { useState, useCallback, useEffect } from 'react';

/**
 * Custom hook for polygon drawing on MapLibre GL maps
 * Provides a simple, native implementation without external dependencies
 */
const usePolygonDrawing = (map) => {
    const [isDrawing, setIsDrawing] = useState(false);
    const [points, setPoints] = useState([]);
    const [polygon, setPolygon] = useState(null);

    // Start drawing mode
    const startDrawing = useCallback(() => {
        if (!map) return;

        // Clear any existing polygon
        setPoints([]);
        setPolygon(null);
        setIsDrawing(true);

        // Change cursor to crosshair
        map.getCanvas().style.cursor = 'crosshair';

        console.log('Started drawing mode');
    }, [map]);

    // Add a point to the polygon
    const addPoint = useCallback((lngLat) => {
        if (!isDrawing) return;

        const newPoint = [lngLat.lng, lngLat.lat];
        setPoints(prev => [...prev, newPoint]);

        console.log('Added point:', newPoint);
    }, [isDrawing]);

    // Finish drawing and create polygon
    const finishDrawing = useCallback(() => {
        if (!map || points.length < 3) {
            alert('Please add at least 3 points to create a polygon');
            return null;
        }

        // Close the polygon by adding the first point at the end
        const closedPoints = [...points, points[0]];

        const polygonGeometry = {
            type: 'Polygon',
            coordinates: [closedPoints]
        };

        setPolygon(polygonGeometry);
        setIsDrawing(false);
        setPoints([]);

        // Reset cursor
        if (map) {
            map.getCanvas().style.cursor = '';
        }

        console.log('Finished drawing polygon:', polygonGeometry);
        return polygonGeometry;
    }, [map, points]);

    // Clear all drawing data
    const clearDrawing = useCallback(() => {
        setPoints([]);
        setPolygon(null);
        setIsDrawing(false);

        // Reset cursor
        if (map) {
            map.getCanvas().style.cursor = '';
        }

        console.log('Cleared drawing');
    }, [map]);

    // Update map layers when points or polygon change
    useEffect(() => {
        if (!map) return;

        const updateLayers = () => {
            // Remove existing layers and sources
            const layersToRemove = ['drawing-fill', 'drawing-line', 'drawing-points'];
            const sourcesToRemove = ['drawing-source', 'points-source'];

            layersToRemove.forEach(layerId => {
                if (map.getLayer(layerId)) {
                    map.removeLayer(layerId);
                }
            });

            sourcesToRemove.forEach(sourceId => {
                if (map.getSource(sourceId)) {
                    map.removeSource(sourceId);
                }
            });

            // If we have points while drawing, show them
            if (isDrawing && points.length > 0) {
                // Add points source
                map.addSource('points-source', {
                    type: 'geojson',
                    data: {
                        type: 'FeatureCollection',
                        features: points.map(point => ({
                            type: 'Feature',
                            geometry: {
                                type: 'Point',
                                coordinates: point
                            }
                        }))
                    }
                });

                // Add points layer (vertex circles)
                map.addLayer({
                    id: 'drawing-points',
                    type: 'circle',
                    source: 'points-source',
                    paint: {
                        'circle-radius': 6,
                        'circle-color': '#fbb03b',
                        'circle-stroke-width': 2,
                        'circle-stroke-color': '#fff'
                    }
                });

                // If we have at least 2 points, draw lines between them
                if (points.length >= 2) {
                    const lineCoordinates = points.length === 2
                        ? points
                        : [...points, points[0]]; // Close the line if 3+ points

                    map.addSource('drawing-source', {
                        type: 'geojson',
                        data: {
                            type: 'Feature',
                            geometry: {
                                type: 'LineString',
                                coordinates: lineCoordinates
                            }
                        }
                    });

                    map.addLayer({
                        id: 'drawing-line',
                        type: 'line',
                        source: 'drawing-source',
                        paint: {
                            'line-color': '#fbb03b',
                            'line-width': 2,
                            'line-dasharray': [2, 2]
                        }
                    });
                }
            }

            // If we have a completed polygon, show it
            if (polygon) {
                map.addSource('drawing-source', {
                    type: 'geojson',
                    data: {
                        type: 'Feature',
                        geometry: polygon
                    }
                });

                // Add fill layer
                map.addLayer({
                    id: 'drawing-fill',
                    type: 'fill',
                    source: 'drawing-source',
                    paint: {
                        'fill-color': '#3bb2d0',
                        'fill-opacity': 0.2
                    }
                });

                // Add outline layer
                map.addLayer({
                    id: 'drawing-line',
                    type: 'line',
                    source: 'drawing-source',
                    paint: {
                        'line-color': '#3bb2d0',
                        'line-width': 3
                    }
                });

                // Add vertex points
                const vertexPoints = polygon.coordinates[0].slice(0, -1); // Remove the duplicate closing point
                map.addSource('points-source', {
                    type: 'geojson',
                    data: {
                        type: 'FeatureCollection',
                        features: vertexPoints.map(point => ({
                            type: 'Feature',
                            geometry: {
                                type: 'Point',
                                coordinates: point
                            }
                        }))
                    }
                });

                map.addLayer({
                    id: 'drawing-points',
                    type: 'circle',
                    source: 'points-source',
                    paint: {
                        'circle-radius': 5,
                        'circle-color': '#3bb2d0',
                        'circle-stroke-width': 2,
                        'circle-stroke-color': '#fff'
                    }
                });
            }
        };

        // Wait for map to be loaded
        if (map.isStyleLoaded()) {
            updateLayers();
        } else {
            map.once('load', updateLayers);
        }

        // Cleanup function
        return () => {
            const layersToRemove = ['drawing-fill', 'drawing-line', 'drawing-points'];
            const sourcesToRemove = ['drawing-source', 'points-source'];

            layersToRemove.forEach(layerId => {
                if (map.getLayer(layerId)) {
                    map.removeLayer(layerId);
                }
            });

            sourcesToRemove.forEach(sourceId => {
                if (map.getSource(sourceId)) {
                    map.removeSource(sourceId);
                }
            });
        };
    }, [map, points, polygon, isDrawing]);

    // Handle map clicks for adding points
    useEffect(() => {
        if (!map || !isDrawing) return;

        const handleMapClick = (e) => {
            addPoint(e.lngLat);
        };

        map.on('click', handleMapClick);

        return () => {
            map.off('click', handleMapClick);
        };
    }, [map, isDrawing, addPoint]);

    return {
        isDrawing,
        points,
        polygon,
        startDrawing,
        finishDrawing,
        clearDrawing,
        pointCount: points.length
    };
};

export default usePolygonDrawing;
