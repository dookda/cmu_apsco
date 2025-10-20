// Theme utility functions to handle the Light Able theme scripts

export const initializeTheme = () => {
    // Initialize theme settings
    if (typeof window !== 'undefined') {
        // Set theme to light mode by default
        if (window.layout_change) {
            window.layout_change('light');
        }
        if (window.layout_sidebar_change) {
            window.layout_sidebar_change('light');
        }
        if (window.change_box_container) {
            window.change_box_container('false');
        }
        if (window.layout_caption_change) {
            window.layout_caption_change('true');
        }
        if (window.layout_rtl_change) {
            window.layout_rtl_change('false');
        }
        if (window.preset_change) {
            window.preset_change('preset-1');
        }
    }
};

export const toggleTheme = (theme = 'light') => {
    if (typeof window !== 'undefined' && window.layout_change) {
        window.layout_change(theme);
    }
};

export const toggleSidebar = () => {
    const sidebar = document.querySelector('.pc-sidebar');
    const container = document.querySelector('.pc-container');

    if (sidebar && container) {
        sidebar.classList.toggle('pc-sidebar-hide');
    }
};

// Handle responsive sidebar for mobile
export const handleMobileSidebar = () => {
    const mobileTrigger = document.getElementById('mobile-collapse');
    const sidebar = document.querySelector('.pc-sidebar');

    if (mobileTrigger && sidebar) {
        mobileTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            sidebar.classList.toggle('mob-sidebar-active');
        });
    }
};

// Initialize dropdown functionality
export const initializeDropdowns = () => {
    // This would normally be handled by Bootstrap JS
    // For now, we'll rely on the Bootstrap scripts loaded in index.html
    if (typeof window !== 'undefined' && window.bootstrap) {
        // Bootstrap is loaded, dropdowns should work automatically
        console.log('Bootstrap dropdowns initialized');
    }
};

// Function to ensure theme scripts are loaded
export const ensureThemeScripts = () => {
    return new Promise((resolve) => {
        if (typeof window !== 'undefined') {
            // Check if main theme functions are available
            const checkScripts = () => {
                if (window.layout_change && window.preset_change) {
                    resolve(true);
                } else {
                    setTimeout(checkScripts, 100);
                }
            };
            checkScripts();
        } else {
            resolve(false);
        }
    });
};