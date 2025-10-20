import { useEffect } from 'react';
import { initializeTheme, ensureThemeScripts } from '../utils/theme';

export const useTheme = () => {
    useEffect(() => {
        const initTheme = async () => {
            // Wait for theme scripts to load
            await ensureThemeScripts();

            // Initialize theme
            initializeTheme();
        };

        initTheme();

        // Cleanup function
        return () => {
            // Cleanup if needed
        };
    }, []);
};

export default useTheme;