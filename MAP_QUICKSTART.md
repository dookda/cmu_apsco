# Quick Start - MapLibre GL Integration

## Installation Steps

### 1. Install Dependencies
```bash
# Navigate to react directory
cd react

# Install MapLibre GL and React Map GL
npm install

# Or if using Docker
docker-compose exec react-dev npm install
```

### 2. Import and Use

```jsx
// Import the MapPage component
import { MapPage } from './components/map';

// Or import MapComponent for custom implementation
import { MapComponent } from './components/map';
```

### 3. Run the Application

```bash
# From the root directory
docker-compose up react-dev fastapi postgis

# Or if running locally
cd react
npm run dev
```

### 4. Access the Map
- Open browser: http://localhost:3000
- Click on "Map" in the sidebar navigation
- Interact with the map!

## Quick Example

```jsx
import { MapComponent } from './components/map';
import { Marker } from 'react-map-gl/maplibre';

function MyMap() {
  return (
    <MapComponent
      initialViewState={{
        longitude: 100.5,
        latitude: 13.7,
        zoom: 6
      }}
      style={{ width: '100%', height: '500px' }}
    >
      <Marker longitude={100.5} latitude={13.7}>
        <div style={{ fontSize: '24px' }}>📍</div>
      </Marker>
    </MapComponent>
  );
}
```

## What You Get

✅ Interactive map with pan/zoom
✅ Navigation controls (zoom +/-)
✅ Geolocate (find my location)
✅ Fullscreen mode
✅ Scale indicator
✅ Markers with popups
✅ Responsive design
✅ Dashboard integration

## Need Help?

See `MAP_COMPONENT.md` for detailed documentation.