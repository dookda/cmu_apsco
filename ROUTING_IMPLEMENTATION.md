# React Router Implementation

## Overview
React Router has been successfully integrated into the CMU APSCO Drought Map application, providing client-side routing for seamless navigation between pages.

## What Was Implemented

### 1. Dependencies Added
```json
{
  "react-router-dom": "^6.20.0"
}
```

### 2. Routes Configuration

The application now has the following routes:

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Dashboard | Main dashboard with system status and stats |
| `/map` | MapPage | Interactive MapLibre GL map with markers |
| `/data` | DataPage | Data management page (placeholder) |
| `/charts` | ChartsPage | Charts and analytics (placeholder) |
| `/statistics` | StatisticsPage | Statistics and reports (placeholder) |

### 3. Files Created/Modified

#### New Files
- **`src/pages/Dashboard.jsx`** - Main dashboard page (moved from App.jsx)
- **`src/pages/DataPage.jsx`** - Data management page
- **`src/pages/ChartsPage.jsx`** - Charts page
- **`src/pages/StatisticsPage.jsx`** - Statistics page
- **`src/pages/index.js`** - Page exports

#### Modified Files
- **`src/App.jsx`** - Now uses React Router with Routes
- **`src/components/layout/Sidebar.jsx`** - Uses React Router Link components
- **`src/App.css`** - Added active menu item styling

### 4. Navigation Features

#### Active Link Highlighting
The sidebar now highlights the currently active page:
- Active links have a light blue background
- Active text and icons are highlighted in primary color
- Bold font weight for active menu items

#### React Router Links
All navigation links use React Router's `Link` component:
- No page reloads when navigating
- Browser back/forward buttons work correctly
- URL updates reflect current page

## How It Works

### App.jsx (Main Router)
```jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/map" element={<MapPage />} />
        {/* ... other routes ... */}
      </Routes>
    </Router>
  );
}
```

### Sidebar.jsx (Navigation)
```jsx
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <li className={`pc-item ${isActive('/map')}`}>
      <Link to="/map" className="pc-link">
        <span className="pc-micon">
          <i className="ph-duotone ph-map-pin"></i>
        </span>
        <span className="pc-mtext">Map</span>
      </Link>
    </li>
  );
};
```

## Installation

After pulling the latest code, install the new dependency:

```bash
cd react
npm install

# Or with Docker
docker-compose exec react-dev npm install
```

## Usage

### Navigating Programmatically

If you need to navigate programmatically in your components:

```jsx
import { useNavigate } from 'react-router-dom';

function MyComponent() {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate('/map');
  };
  
  return <button onClick={handleClick}>Go to Map</button>;
}
```

### Getting Current Location

```jsx
import { useLocation } from 'react-router-dom';

function MyComponent() {
  const location = useLocation();
  console.log('Current path:', location.pathname);
}
```

### Link with State

Pass state between routes:

```jsx
import { Link } from 'react-router-dom';

<Link 
  to="/map" 
  state={{ from: 'dashboard', data: someData }}
>
  Go to Map
</Link>

// In the Map component:
import { useLocation } from 'react-router-dom';

const MapPage = () => {
  const location = useLocation();
  const { from, data } = location.state || {};
};
```

## Adding New Routes

To add a new route:

1. **Create the page component** in `src/pages/`:
```jsx
// src/pages/MyNewPage.jsx
import React from 'react';
import { DashboardLayout } from '../components/layout';

function MyNewPage() {
  return (
    <DashboardLayout title="My New Page" breadcrumbItems={[{ name: 'New Page' }]}>
      <div className="col-12">
        <div className="card">
          <div className="card-body">
            <h5>My New Page Content</h5>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default MyNewPage;
```

2. **Export from pages/index.js**:
```jsx
export { default as MyNewPage } from './MyNewPage';
```

3. **Add route in App.jsx**:
```jsx
import { MyNewPage } from './pages';

<Routes>
  {/* existing routes */}
  <Route path="/my-new-page" element={<MyNewPage />} />
</Routes>
```

4. **Add menu item in Sidebar.jsx**:
```jsx
<li className={`pc-item ${isActive('/my-new-page')}`}>
  <Link to="/my-new-page" className="pc-link">
    <span className="pc-micon">
      <i className="ph-duotone ph-file"></i>
    </span>
    <span className="pc-mtext">New Page</span>
  </Link>
</li>
```

## Features

### ✅ Client-Side Navigation
- No page reloads
- Fast transitions
- Maintains state

### ✅ Active Link Highlighting
- Visual feedback for current page
- Automatic styling updates

### ✅ Browser History
- Back/forward buttons work
- URL reflects current page
- Bookmarkable URLs

### ✅ Nested Routes Support
- Can add sub-routes if needed
- Layout nesting support

## Testing Navigation

1. Start the application:
```bash
docker-compose up react-dev fastapi postgis
```

2. Open browser: http://localhost:3000

3. Test navigation:
   - Click "Dashboard" → Should go to `/`
   - Click "Map" → Should go to `/map` and show the map
   - Click "Data" → Should go to `/data`
   - Use browser back button → Should navigate back
   - Refresh page → Should stay on same route

## Troubleshooting

### Links not working
- Verify React Router is installed: `npm list react-router-dom`
- Check that `<Router>` wraps your `<Routes>`
- Ensure `Link` components use `to` prop, not `href`

### Active class not showing
- Check `useLocation()` hook is being called
- Verify CSS for `.active` class is loaded
- Check path matching in `isActive()` function

### Page not found (404)
- Add a catch-all route for 404 pages:
```jsx
<Route path="*" element={<NotFound />} />
```

## Best Practices

1. **Use Link instead of <a>**
   ```jsx
   // ❌ Don't use
   <a href="/map">Map</a>
   
   // ✅ Do use
   <Link to="/map">Map</Link>
   ```

2. **Use absolute paths**
   ```jsx
   // ✅ Good
   <Link to="/map">Map</Link>
   
   // ❌ Avoid relative
   <Link to="map">Map</Link>
   ```

3. **Handle loading states**
   ```jsx
   import { Suspense } from 'react';
   
   <Suspense fallback={<Loading />}>
     <Routes>...</Routes>
   </Suspense>
   ```

## Advanced Features

### Protected Routes
```jsx
function ProtectedRoute({ children }) {
  const isAuthenticated = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

<Route 
  path="/admin" 
  element={
    <ProtectedRoute>
      <AdminPage />
    </ProtectedRoute>
  } 
/>
```

### Route Parameters
```jsx
// Define route with parameter
<Route path="/data/:id" element={<DataDetail />} />

// Access parameter in component
import { useParams } from 'react-router-dom';

function DataDetail() {
  const { id } = useParams();
  return <div>Data ID: {id}</div>;
}
```

### Query Parameters
```jsx
import { useSearchParams } from 'react-router-dom';

function MapPage() {
  const [searchParams] = useSearchParams();
  const zoom = searchParams.get('zoom');
  const lat = searchParams.get('lat');
}

// Navigate with query params
<Link to="/map?zoom=10&lat=13.7">Map</Link>
```

## Summary

✅ React Router successfully integrated
✅ All menu items now use routing
✅ Map page accessible via `/map`
✅ Active link highlighting works
✅ Navigation is smooth and fast
✅ Ready to add more pages as needed

The application now has a professional routing system with proper navigation and visual feedback!