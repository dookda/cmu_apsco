# Map Component Architecture

## Component Hierarchy

```
App.jsx
  └── DashboardLayout
        └── MapPage / PostGISMapExample
              └── MapComponent
                    ├── NavigationControl
                    ├── ScaleControl
                    ├── GeolocateControl
                    ├── FullscreenControl
                    ├── Marker(s)
                    │     └── Custom Icon/Component
                    ├── Popup(s)
                    │     └── Feature Information
                    └── Source & Layer(s)
                          └── GeoJSON Data
```

## Data Flow

```
PostGIS Database
      ↓
FastAPI Backend (/api/endpoint)
      ↓
mapUtils.fetchGeoJSON()
      ↓
GeoJSON Data
      ↓
mapUtils.addGeoJSONLayer()
      ↓
MapLibre GL Map
      ↓
User Interaction
      ↓
Click Handler
      ↓
Show Popup / Update State
```

## Integration Pattern

### 1. Simple Static Map
```jsx
import { MapComponent } from './components/map';

<MapComponent />
```

### 2. Map with Markers
```jsx
import { MapComponent } from './components/map';
import { Marker } from 'react-map-gl/maplibre';

<MapComponent>
  <Marker longitude={lng} latitude={lat}>
    <CustomMarker />
  </Marker>
</MapComponent>
```

### 3. Map with PostGIS Data
```jsx
import { MapComponent } from './components/map';
import { fetchGeoJSON, addGeoJSONLayer } from '../utils/mapUtils';

const MyMap = () => {
  const handleMapLoad = async (map) => {
    const data = await fetchGeoJSON('endpoint');
    addGeoJSONLayer(map, 'src', data, 'layer');
  };

  return <MapComponent onMapLoad={handleMapLoad} />;
};
```

## State Management

```jsx
const MapPage = () => {
  // Map state
  const [viewState, setViewState] = useState({ ... });
  
  // Feature state
  const [selectedFeature, setSelectedFeature] = useState(null);
  
  // Data state
  const [geoData, setGeoData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Effects
  useEffect(() => {
    // Load data
  }, []);
  
  return <MapComponent />;
};
```

## Styling Layers

### Fill Layer (Polygons)
```javascript
{
  'fill-color': '#088',
  'fill-opacity': 0.5,
  'fill-outline-color': '#000'
}
```

### Circle Layer (Points)
```javascript
{
  'circle-radius': 8,
  'circle-color': '#088',
  'circle-stroke-width': 2
}
```

### Line Layer
```javascript
{
  'line-color': '#088',
  'line-width': 2,
  'line-dasharray': [2, 2]
}
```

### Data-Driven Styling
```javascript
{
  'fill-color': [
    'match',
    ['get', 'category'],
    'high', '#ff0000',
    'medium', '#ff9900',
    'low', '#ffff00',
    '#cccccc'
  ]
}
```

## Event Handlers

### Map Events
```javascript
onMapLoad={(map) => {
  // Map is ready
}}

onMove={(evt) => {
  // Map is moving
}}

onClick={(evt) => {
  // Map clicked
}}
```

### Layer Events
```javascript
map.on('click', 'layer-id', (e) => {
  // Layer feature clicked
  const feature = e.features[0];
});

map.on('mouseenter', 'layer-id', () => {
  // Cursor enters layer
});
```

## Props Reference

### MapComponent Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| initialViewState | Object | Thailand center | Initial position |
| style | Object | Full width/height | Container dimensions |
| mapStyle | String | Carto Positron | Base map style URL |
| onMapLoad | Function | - | Called when map loads |
| children | ReactNode | - | Child components |

### Marker Props
| Prop | Type | Description |
|------|------|-------------|
| longitude | Number | Marker longitude |
| latitude | Number | Marker latitude |
| anchor | String | Anchor position |
| onClick | Function | Click handler |

### Popup Props
| Prop | Type | Description |
|------|------|-------------|
| longitude | Number | Popup longitude |
| latitude | Number | Popup latitude |
| anchor | String | Anchor position |
| onClose | Function | Close handler |

## Best Practices

### 1. Performance
- Use `React.memo` for marker components
- Debounce map move events
- Use clustering for many markers
- Load data on demand

### 2. Error Handling
```javascript
try {
  const data = await fetchGeoJSON('endpoint');
  if (!data) throw new Error('No data');
  addGeoJSONLayer(map, 'src', data, 'layer');
} catch (error) {
  console.error('Error:', error);
  // Show error message to user
}
```

### 3. Loading States
```javascript
const [loading, setLoading] = useState(true);

useEffect(() => {
  loadData().finally(() => setLoading(false));
}, []);

{loading && <LoadingSpinner />}
```

### 4. Cleanup
```javascript
useEffect(() => {
  // Setup
  const map = mapRef.current;
  
  return () => {
    // Cleanup layers, sources, event listeners
    if (map.getLayer('layer-id')) {
      map.removeLayer('layer-id');
    }
  };
}, []);
```

## Common Patterns

### Toggle Layer Visibility
```javascript
const toggleLayer = (layerId, visible) => {
  map.setLayoutProperty(
    layerId,
    'visibility',
    visible ? 'visible' : 'none'
  );
};
```

### Update Layer Data
```javascript
const updateLayer = (sourceId, newData) => {
  const source = map.getSource(sourceId);
  if (source) {
    source.setData(newData);
  }
};
```

### Animate Camera
```javascript
map.flyTo({
  center: [lng, lat],
  zoom: 12,
  duration: 2000
});
```

## Testing

```jsx
import { render } from '@testing-library/react';
import { MapComponent } from './components/map';

test('renders map component', () => {
  const { container } = render(<MapComponent />);
  expect(container.querySelector('.map-container')).toBeInTheDocument();
});
```

## Deployment Checklist

- [ ] Install dependencies
- [ ] Test map loads correctly
- [ ] Verify all controls work
- [ ] Test on mobile devices
- [ ] Check API endpoints
- [ ] Verify PostGIS queries
- [ ] Test error handling
- [ ] Optimize performance
- [ ] Add loading states
- [ ] Document custom features