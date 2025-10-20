# Hamburger Menu Toggle Functionality

## Overview
The hamburger menu toggle has been implemented to properly collapse/expand the sidebar on both desktop and mobile devices.

## Implementation Details

### Desktop Toggle (Collapse/Expand)
- **Button**: Located in the header (visible on desktop and tablet)
- **ID**: `sidebar-hide`
- **Functionality**: 
  - Toggles the `pc-sidebar-hide` class on sidebar, container, and header
  - Collapses the sidebar to a minimal width (icon-only view)
  - Smooth transition animation (0.3s ease-in-out)

### Mobile Toggle (Show/Hide)
- **Button**: Located in the header (visible on mobile devices)
- **ID**: `mobile-collapse`
- **Functionality**:
  - Toggles the `mob-sidebar-active` class on sidebar
  - Shows sidebar as an overlay on mobile devices
  - Adds semi-transparent backdrop overlay
  - Clicking outside the sidebar closes it automatically

## Components Modified

### 1. Header.jsx
Added two click handler functions:
- `handleSidebarToggle()`: For desktop sidebar collapse/expand
- `handleMobileSidebarToggle()`: For mobile sidebar show/hide

```jsx
const handleSidebarToggle = (e) => {
    e.preventDefault();
    // Toggles pc-sidebar-hide class on sidebar, container, and header
};

const handleMobileSidebarToggle = (e) => {
    e.preventDefault();
    // Toggles mob-sidebar-active class on sidebar
};
```

### 2. DashboardLayout.jsx
Added overlay click handler:
- Detects clicks outside the sidebar when it's active on mobile
- Automatically closes the mobile sidebar when clicking on the overlay

### 3. App.css
Added smooth transitions and mobile overlay styles:
- Sidebar, container, and header transition animations
- Hover effects for the hamburger menu button
- Mobile sidebar overlay with semi-transparent background
- Z-index management for proper layering

### 4. useTheme.js (Simplified)
- Removed duplicate event listener logic
- Now only handles theme initialization
- Click handlers are managed directly in React components

## User Experience

### Desktop/Tablet
1. Click the hamburger menu (☰) in the header
2. Sidebar collapses to icon-only view
3. Content area expands to use more space
4. Click again to restore full sidebar

### Mobile
1. Click the hamburger menu (☰) in the header
2. Sidebar slides in from the left as an overlay
3. Semi-transparent backdrop appears
4. Click outside sidebar or click the button again to close

## CSS Classes Used

- `pc-sidebar-hide`: Applied to sidebar, container, and header for collapsed state
- `mob-sidebar-active`: Applied to sidebar for mobile overlay state

## Smooth Animations
All transitions use CSS animations for smooth user experience:
- Duration: 0.3 seconds
- Easing: ease-in-out
- Properties: margin-left, width

## Testing
To test the functionality:
1. Run the application: `docker-compose up react-dev fastapi postgis`
2. Access at: http://localhost:3000
3. Click hamburger menu on different screen sizes
4. Verify smooth transitions and proper behavior