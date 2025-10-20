import React, { useEffect } from 'react';
import { useTheme } from '../../hooks/useTheme';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import Breadcrumb from './Breadcrumb';

const DashboardLayout = ({ children, title = "Dashboard", breadcrumbItems = [] }) => {
    // Initialize theme
    useTheme();

    // Handle overlay click to close mobile sidebar
    useEffect(() => {
        const handleOverlayClick = (e) => {
            const sidebar = document.querySelector('.pc-sidebar');
            const sidebarWrapper = document.querySelector('.navbar-wrapper');

            // Check if click is on the overlay (not on sidebar content)
            if (sidebar && sidebar.classList.contains('mob-sidebar-active')) {
                if (!sidebarWrapper.contains(e.target)) {
                    sidebar.classList.remove('mob-sidebar-active');
                }
            }
        };

        // Add click listener to document
        document.addEventListener('click', handleOverlayClick);

        return () => {
            document.removeEventListener('click', handleOverlayClick);
        };
    }, []);

    return (
        <>
            {/* Sidebar */}
            <Sidebar />

            {/* Header */}
            <Header />

            {/* Main Content */}
            <div className="pc-container">
                <div className="pc-content">
                    {/* Breadcrumb */}
                    <Breadcrumb title={title} items={breadcrumbItems} />

                    {/* Page Content */}
                    <div className="row">
                        {children}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <Footer />
        </>
    );
};

export default DashboardLayout;