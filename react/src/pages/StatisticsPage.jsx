import React from 'react';
import { DashboardLayout } from '../components/layout';

function StatisticsPage() {
    return (
        <DashboardLayout title="Statistics & Reports" breadcrumbItems={[{ name: 'Statistics' }]}>
            <div className="col-12">
                <div className="card">
                    <div className="card-header">
                        <h5 className="mb-0">
                            <i className="ph-duotone ph-projector-screen-chart me-2"></i>
                            Statistics & Reports
                        </h5>
                    </div>
                    <div className="card-body">
                        <p>Statistics and reports page coming soon...</p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default StatisticsPage;