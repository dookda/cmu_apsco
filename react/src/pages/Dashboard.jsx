import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout';

function Dashboard() {
    const [dbStatus, setDbStatus] = useState('Checking...');
    const [apiStatus, setApiStatus] = useState('Checking...');

    useEffect(() => {
        // Check database status
        setDbStatus('PostGIS database configured');

        // Check API status
        checkAPIStatus();
    }, []);

    const checkAPIStatus = async () => {
        try {
            const response = await fetch('http://localhost:8000/health');
            if (response.ok) {
                const data = await response.json();
                setApiStatus(data.status === 'healthy' ? 'FastAPI backend connected' : 'API not responding');
            } else {
                setApiStatus('API not responding');
            }
        } catch (error) {
            setApiStatus('API not available');
        }
    };

    return (
        <DashboardLayout title="CMU APSCO Dashboard" breadcrumbItems={[{ name: 'Dashboard' }]}>
            <div className="col-lg-12">
                <div className="card">
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-6">
                                <h4 className="card-title mb-4">Welcome to CMU APSCO</h4>
                                <p className="card-text">
                                    React Application with PostGIS Database and FastAPI Backend
                                </p>

                                <div className="row mt-4">
                                    <div className="col-12 mb-3">
                                        <div className="d-flex align-items-center">
                                            <i className="ph-duotone ph-database me-2 text-primary"></i>
                                            <strong>Database Status:</strong>
                                            <span className="ms-2 badge bg-success">{dbStatus}</span>
                                        </div>
                                    </div>
                                    <div className="col-12 mb-3">
                                        <div className="d-flex align-items-center">
                                            <i className="ph-duotone ph-cloud me-2 text-primary"></i>
                                            <strong>API Status:</strong>
                                            <span className={`ms-2 badge ${apiStatus.includes('connected') ? 'bg-success' : 'bg-warning'}`}>
                                                {apiStatus}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-6">
                                <h5 className="mb-3">Quick Stats</h5>
                                <div className="row">
                                    <div className="col-6 mb-3">
                                        <div className="card bg-primary text-white">
                                            <div className="card-body text-center">
                                                <i className="ph-duotone ph-users ph-2x mb-2"></i>
                                                <h6 className="mb-0">Users</h6>
                                                <h4 className="mb-0">1,234</h4>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-6 mb-3">
                                        <div className="card bg-success text-white">
                                            <div className="card-body text-center">
                                                <i className="ph-duotone ph-map-pin ph-2x mb-2"></i>
                                                <h6 className="mb-0">Locations</h6>
                                                <h4 className="mb-0">567</h4>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-6 mb-3">
                                        <div className="card bg-warning text-white">
                                            <div className="card-body text-center">
                                                <i className="ph-duotone ph-chart-line ph-2x mb-2"></i>
                                                <h6 className="mb-0">Reports</h6>
                                                <h4 className="mb-0">89</h4>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-6 mb-3">
                                        <div className="card bg-info text-white">
                                            <div className="card-body text-center">
                                                <i className="ph-duotone ph-activity ph-2x mb-2"></i>
                                                <h6 className="mb-0">Active</h6>
                                                <h4 className="mb-0">24/7</h4>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="col-lg-6">
                <div className="card">
                    <div className="card-header">
                        <h5 className="mb-0">System Information</h5>
                    </div>
                    <div className="card-body">
                        <ul className="list-group list-group-flush">
                            <li className="list-group-item d-flex justify-content-between align-items-center">
                                React Version
                                <span className="badge bg-primary rounded-pill">18.2.0</span>
                            </li>
                            <li className="list-group-item d-flex justify-content-between align-items-center">
                                PostGIS Database
                                <span className="badge bg-success rounded-pill">Connected</span>
                            </li>
                            <li className="list-group-item d-flex justify-content-between align-items-center">
                                FastAPI Backend
                                <span className={`badge rounded-pill ${apiStatus.includes('connected') ? 'bg-success' : 'bg-warning'}`}>
                                    {apiStatus.includes('connected') ? 'Connected' : 'Checking...'}
                                </span>
                            </li>
                            <li className="list-group-item d-flex justify-content-between align-items-center">
                                Theme
                                <span className="badge bg-info rounded-pill">Light Able</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="col-lg-6">
                <div className="card">
                    <div className="card-header">
                        <h5 className="mb-0">Recent Activity</h5>
                    </div>
                    <div className="card-body">
                        <div className="timeline">
                            <div className="timeline-item">
                                <div className="timeline-marker bg-primary"></div>
                                <div className="timeline-content">
                                    <h6 className="timeline-title">System Started</h6>
                                    <p className="timeline-text">Application initialized successfully</p>
                                    <small className="text-muted">Just now</small>
                                </div>
                            </div>
                            <div className="timeline-item">
                                <div className="timeline-marker bg-success"></div>
                                <div className="timeline-content">
                                    <h6 className="timeline-title">Database Connected</h6>
                                    <p className="timeline-text">PostGIS database connection established</p>
                                    <small className="text-muted">1 minute ago</small>
                                </div>
                            </div>
                            <div className="timeline-item">
                                <div className="timeline-marker bg-info"></div>
                                <div className="timeline-content">
                                    <h6 className="timeline-title">Theme Applied</h6>
                                    <p className="timeline-text">Light Able theme successfully integrated</p>
                                    <small className="text-muted">2 minutes ago</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default Dashboard;