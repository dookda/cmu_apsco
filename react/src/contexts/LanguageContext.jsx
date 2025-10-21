import React, { createContext, useContext, useState, useEffect } from 'react';
import enTranslations from '../locales/en/index.js';
import thTranslations from '../locales/th/index.js';
import { formatDate, formatDateShort, formatDateRange, formatNumber, formatNumberWithUnit, formatArea, formatPercentage, formatIndexValue } from '../utils/localization';

const LanguageContext = createContext();

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

const translations = {
    en: enTranslations,
    th: thTranslations
};

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(() => {
        // Get saved language from localStorage or default to 'en'
        return localStorage.getItem('language') || 'en';
    });

    useEffect(() => {
        // Save language preference to localStorage
        localStorage.setItem('language', language);

        // Update HTML lang attribute for accessibility
        document.documentElement.lang = language === 'th' ? 'th' : 'en';
    }, [language]);

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'en' ? 'th' : 'en');
    };

    /**
     * Translation function with variable replacement
     * @param {string} key - Translation key (supports dot notation for nested objects)
     * @param {object} variables - Variables to replace in the translation string
     * @returns {string} Translated string
     */
    const t = (key, variables = {}) => {
        // Support for nested keys (e.g., 'provinces.provinces.Chiang Mai')
        const keys = key.split('.');
        let value = translations[language];

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                // If key not found, return the key itself
                return key;
            }
        }

        // If the final value is an object, return it (for accessing entire sub-objects)
        if (typeof value === 'object') {
            return value;
        }

        // Replace variables in the string (e.g., {index}, {count})
        let result = value;
        Object.keys(variables).forEach(varKey => {
            result = result.replace(new RegExp(`{${varKey}}`, 'g'), variables[varKey]);
        });

        return result;
    };

    /**
     * Get province name in current language
     * @param {string} provinceNameEn - Province name in English
     * @returns {string} Province name in current language
     */
    const getProvinceName = (provinceNameEn) => {
        return t(`provinces.provinces.${provinceNameEn}`) || provinceNameEn;
    };

    /**
     * Format utilities wrapped with current language
     */
    const format = {
        date: (date, options) => formatDate(date, language, options),
        dateShort: (date) => formatDateShort(date, language),
        dateRange: (startDate, endDate) => formatDateRange(startDate, endDate, language),
        number: (value, decimals) => formatNumber(value, language, decimals),
        numberWithUnit: (value, unit, decimals) => formatNumberWithUnit(value, unit, language, decimals),
        area: (area) => formatArea(area, language),
        percentage: (value, decimals) => formatPercentage(value, language, decimals),
        indexValue: (value) => formatIndexValue(value, language)
    };

    return (
        <LanguageContext.Provider value={{
            language,
            toggleLanguage,
            t,
            getProvinceName,
            format
        }}>
            {children}
        </LanguageContext.Provider>
    );
};
