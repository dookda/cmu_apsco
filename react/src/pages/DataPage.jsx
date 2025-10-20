import React from 'react';
import { DashboardLayout } from '../components/layout';

function DataPage() {
    return (
        <DashboardLayout title="Data Management" breadcrumbItems={[{ name: 'Data' }]}>
            <div className="col-12">
                <div className="card">
                    <div className="card-header">
                        <h5 className="mb-0">
                            <i className="ph-duotone ph-database me-2"></i>
                            Data Management
                        </h5>
                    </div>
                    <div className="card-body">
                        <p>Data management page coming soon...</p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default DataPage;