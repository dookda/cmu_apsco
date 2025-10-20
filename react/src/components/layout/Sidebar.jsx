import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path ? 'active' : '';
    };

    return (
        <nav className="pc-sidebar">
            <div className="navbar-wrapper">
                <div className="m-header">
                    <Link to="/" className="b-brand text-primary">
                        {/* ========   APSCO Map Logo   ============ */}
                        <h4 className="mb-0 text-primary fw-bold">Drought Map</h4>
                        <span className="badge bg-brand-color-2 rounded-pill ms-2 theme-version">v1.0</span>
                    </Link>
                </div>
                <div className="navbar-content">
                    <ul className="pc-navbar">
                        <li className={`pc-item ${isActive('/')}`}>
                            <Link to="/" className="pc-link">
                                <span className="pc-micon">
                                    <i className="ph-duotone ph-house"></i>
                                </span>
                                <span className="pc-mtext">Dashboard</span>
                            </Link>
                        </li>
                        <li className={`pc-item ${isActive('/map')}`}>
                            <Link to="/map" className="pc-link">
                                <span className="pc-micon">
                                    <i className="ph-duotone ph-map-pin"></i>
                                </span>
                                <span className="pc-mtext">Map</span>
                            </Link>
                        </li>
                        <li className={`pc-item ${isActive('/data')}`}>
                            <Link to="/data" className="pc-link">
                                <span className="pc-micon">
                                    <i className="ph-duotone ph-database"></i>
                                </span>
                                <span className="pc-mtext">Data</span>
                            </Link>
                        </li>
                        <li className={`pc-item ${isActive('/charts')}`}>
                            <Link to="/charts" className="pc-link">
                                <span className="pc-micon">
                                    <i className="ph-duotone ph-chart-pie"></i>
                                </span>
                                <span className="pc-mtext">Charts</span>
                            </Link>
                        </li>
                        <li className={`pc-item ${isActive('/statistics')}`}>
                            <Link to="/statistics" className="pc-link">
                                <span className="pc-micon">
                                    <i className="ph-duotone ph-projector-screen-chart"></i>
                                </span>
                                <span className="pc-mtext">Statistics</span>
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Sidebar;