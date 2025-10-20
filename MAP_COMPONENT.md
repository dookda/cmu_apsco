# MapLibre GL Map Component

## Overview
A fully functional map component for the CMU APSCO Drought Map application using MapLibre GL, an open-source mapping library.

## Features Implemented

### Map Component (`MapComponent.jsx`)
- **Interactive Map**: Pan, zoom, rotate functionality
- **Navigation Controls**: Zoom in/out buttons
- **Scale Control**: Distance scale indicator
- **Geolocate Control**: Find user's current location
- **Fullscreen Control**: Expand map to fullscreen
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Customizable**: Easy to configure and extend

### Map Page (`MapPage.jsx`)
- **Full Dashboard Integration**: Uses the dashboard layout
- **Interactive Markers**: Clickable location markers
- **Popups**: Information popups for each marker
- **Location Table**: List of all markers with details
- **Map Information Card**: Display map statistics

## Installation

Dependencies have been added to `package.json`:
```json
{
  "maplibre-gl": "^4.1.0",
  "react-map-gl": "^7.1.7"
}
```

To install, run:
```bash
cd react
npm install
```

Or with Docker:
```bash
docker-compose exec react-dev npm install
```

## Usage

### Basic Map Component

```jsx
import { MapComponent } from './components/map';

function MyPage() {
  return (
    <MapComponent
      initialViewState={{
        longitude: 100.5,
        latitude: 13.7,
        zoom: 6
      }}
      style={{ width: '100%', height: '500px' }}
    />
  );
}
```

### Map with Markers

```jsx
import { MapComponent } from './components/map';
import { Marker } from 'react-map-gl/maplibre';

function MyMapWithMarkers() {
  return (
    <MapComponent>
      <Marker longitude={100.5} latitude={13.7}>
        <div>📍</div>
      </Marker>
    </MapComponent>
  );
}
```

### Map with Popup

```jsx
import { MapComponent } from './components/map';
import { Marker, Popup } from 'react-map-gl/maplibre';
import { useState } from 'react';

function MyInteractiveMap() {
  const [showPopup, setShowPopup] = useState(false);
  
  return (
    <MapComponent>
      <Marker 
        longitude={100.5} 
        latitude={13.7}
        onClick={() => setShowPopup(true)}
      >
        <div>📍</div>
      </Marker>
      
      {showPopup && (
        <Popup
          longitude={100.5}
          latitude={13.7}
          onClose={() => setShowPopup(false)}
        >
          <div>Location Info</div>
        </Popup>
      )}
    </MapComponent>
  );
}
```

## Props

### MapComponent Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialViewState` | Object | `{longitude: 100.5, latitude: 13.7, zoom: 6}` | Initial map position and zoom |
| `style` | Object | `{width: '100%', height: '600px'}` | Container dimensions |
| `mapStyle` | String | Carto Positron Style | BaseMaps style URL |
| `onMapLoad` | Function | - | Callback when map is loaded |
| `children` | ReactNode | - | Child components (markers, popups, etc.) |

### initialViewState Properties

```javascript
{
  longitude: 100.5,    // Center longitude
  latitude: 13.7,      // Center latitude
  zoom: 6,             // Zoom level (0-22)
  pitch: 0,            // Tilt angle (0-60)
  bearing: 0           // Rotation angle (0-360)
}
```

## Available Base Maps

The component uses Carto Positron by default, but you can use other base maps:

### 1. Carto Positron (Light)
```javascript
mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
```

### 2. Carto Dark Matter (Dark)
```javascript
mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
```

### 3. Carto Voyager (Colored)
```javascript
mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
```

### 4. OpenStreetMap (OSM)
```javascript
mapStyle="https://demotiles.maplibre.org/style.json"
```

### 5. Custom Style
You can create your own style JSON or use Maptiler, MapTiler, or other providers.

## Advanced Features

### Adding Custom Layers

```jsx
import { MapComponent } from './components/map';
import { Source, Layer } from 'react-map-gl/maplibre';

function MapWithLayer() {
  const handleMapLoad = (map) => {
    // Add custom layer when map loads
    console.log('Map loaded', map);
  };

  return (
    <MapComponent onMapLoad={handleMapLoad}>
      <Source
        id="my-data"
        type="geojson"
        data={{
          type: 'FeatureCollection',
          features: []
        }}
      >
        <Layer
          id="my-layer"
          type="circle"
          paint={{
            'circle-radius': 10,
            'circle-color': '#007cbf'
          }}
        />
      </Source>
    </MapComponent>
  );
}
```

### Connecting to PostGIS

```jsx
const handleMapLoad = async (map) => {
  // Fetch GeoJSON from FastAPI backend
  const response = await fetch('http://localhost:8000/api/geodata');
  const geojson = await response.json();
  
  // Add to map
  map.addSource('postgis-data', {
    type: 'geojson',
    data: geojson
  });
  
  map.addLayer({
    id: 'postgis-layer',
    type: 'fill',
    source: 'postgis-data',
    paint: {
      'fill-color': '#088',
      'fill-opacity': 0.5
    }
  });
};
```

## Styling

The map comes with built-in CSS styling in `MapComponent.css`:
- Rounded corners
- Shadow effects
- Responsive controls
- Custom popup styling
- Marker hover effects

## Controls

### Navigation Control
- **Zoom In/Out**: Click +/- buttons
- **Reset North**: Click compass icon

### Geolocate Control
- **Find Location**: Click location icon
- **Track Movement**: Auto-follow user location

### Fullscreen Control
- **Toggle Fullscreen**: Click fullscreen icon

### Scale Control
- Shows distance scale in metric/imperial units

## File Structure

```
react/src/components/map/
├── MapComponent.jsx       # Main map component
├── MapComponent.css       # Map styling
├── MapPage.jsx           # Example map page
└── index.js              # Exports
```

## Integration with App

To use the MapPage in your app routing:

```jsx
// In App.jsx or routing file
import { MapPage } from './components/map';

// Use as a route
<Route path="/map" element={<MapPage />} />

// Or directly in App
function App() {
  return <MapPage />;
}
```

## Performance Tips

1. **Lazy Loading**: Load map component only when needed
2. **Memoization**: Use `React.memo` for marker components
3. **Debouncing**: Debounce map move events if processing data
4. **Clustering**: Use marker clustering for many markers
5. **Vector Tiles**: Use vector tiles for better performance

## Troubleshooting

### Map not loading
- Check if MapLibre GL CSS is imported
- Verify internet connection for base map tiles
- Check browser console for errors

### Markers not showing
- Verify longitude/latitude values are correct
- Check if markers are within viewport
- Ensure marker components are children of MapComponent

### Controls not working
- Verify MapLibre GL JS is loaded
- Check if controls are enabled in MapComponent

## Examples

Check `MapPage.jsx` for a complete working example with:
- Multiple markers
- Interactive popups
- Location table
- Map information display

## Next Steps

1. **Add PostGIS Integration**: Fetch and display data from PostGIS database
2. **Implement Drought Layers**: Add drought visualization layers
3. **Add Drawing Tools**: Allow users to draw shapes on map
4. **Export Features**: Export map as image or PDF
5. **Real-time Updates**: WebSocket integration for live data

## Resources

- [MapLibre GL JS Documentation](https://maplibre.org/maplibre-gl-js-docs/api/)
- [React Map GL Documentation](https://visgl.github.io/react-map-gl/)
- [GeoJSON Specification](https://geojson.org/)
- [PostGIS Documentation](https://postgis.net/documentation/)