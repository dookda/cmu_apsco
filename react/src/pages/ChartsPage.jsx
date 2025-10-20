import React from 'react';
import { DashboardLayout } from '../components/layout';

function ChartsPage() {
    return (
        <DashboardLayout title="Charts & Analytics" breadcrumbItems={[{ name: 'Charts' }]}>
            <div className="col-12">
                <div className="card">
                    <div className="card-header">
                        <h5 className="mb-0">
                            <i className="ph-duotone ph-chart-pie me-2"></i>
                            Charts & Analytics
                        </h5>
                    </div>
                    <div className="card-body">
                        <p>Charts and analytics page coming soon...</p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default ChartsPage;