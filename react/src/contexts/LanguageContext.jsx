import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

const translations = {
    en: {
        // Header
        search: 'Search...',
        dark: 'Dark',
        light: 'Light',
        default: 'Default',
        myAccount: 'My Account',
        settings: 'Settings',
        support: 'Support',
        lockScreen: 'Lock Screen',
        logout: 'Logout',
        systemStatusUpdate: 'System Status Update',
        databaseConnection: 'Database Connection',
        newDataAvailable: 'New Data Available',

        // Sidebar
        dashboard: 'Dashboard',
        droughtMonitoring: 'Drought Monitoring',

        // NDVI Page
        droughtIndices: 'Drought Indices',
        analysis: 'Analysis',
        studyArea: 'Study Area',
        startDate: 'Start Date',
        endDate: 'End Date',
        layerOpacity: 'Layer Opacity',
        update: 'Update',
        loading: 'Loading...',
        showLayer: 'Show Layer',

        // Index Types
        ndvi: 'NDVI',
        ndmi: 'NDMI',
        spi: 'SPI',
        ndviLong: 'Normalized Difference Vegetation Index',
        ndmiLong: 'Normalized Difference Moisture Index',
        spiLong: 'Standardized Precipitation Index',

        // Statistics
        statistics: 'Statistics',
        mean: 'Mean',
        minimum: 'Minimum',
        maximum: 'Maximum',
        stdDeviation: 'Std Deviation',
        interpretation: 'Interpretation',
        noStatisticsAvailable: 'No statistics available',
        calculating: 'Calculating',

        // About
        about: 'About',
        dataSource: 'Data Source',
        period: 'Period',

        // NDVI Info
        ndviDescription: 'The Normalized Difference Vegetation Index (NDVI) is used to monitor vegetation health and detect drought stress.',
        ndviValues: 'NDVI Values:',
        ndviWater: 'Water or bare soil',
        ndviVeryLow: 'Very low vegetation (drought stress)',
        ndviLow: 'Low vegetation density',
        ndviModerate: 'Moderate vegetation',
        ndviHigh: 'High vegetation density',
        ndviVeryHigh: 'Very dense vegetation',
        ndviDataSource: 'MODIS Terra MOD13Q1 (250m, 16-day) via Google Earth Engine',

        // NDMI Info
        ndmiDescription: 'The Normalized Difference Moisture Index (NDMI) measures vegetation water content and is sensitive to vegetation moisture stress.',
        ndmiValues: 'NDMI Values:',
        ndmiVeryDry: 'Very dry (severe water stress)',
        ndmiDry: 'Dry (moderate water stress)',
        ndmiSlightlyDry: 'Slightly dry (low water content)',
        ndmiModerate: 'Moderate moisture (normal)',
        ndmiHigh: 'High moisture (good water content)',
        ndmiVeryHigh: 'Very high moisture (saturated)',
        ndmiDataSource: 'MODIS Terra MOD09A1 (500m, 8-day) via Google Earth Engine',

        // SPI Info
        spiDescription: 'The Standardized Precipitation Index (SPI) measures precipitation anomalies (10 years) compared to historical averages to identify drought or wet conditions.',
        spiValues: 'SPI Values:',
        spiSevereDrought: 'Severe drought',
        spiModerateDrought: 'Moderate drought',
        spiMildDrought: 'Mild drought',
        spiNearNormal: 'Near normal',
        spiSlightlyWet: 'Slightly wet',
        spiModeratelyWet: 'Moderately wet',
        spiVeryWet: 'Very wet',
        spiDataSource: 'CHIRPS precipitation data via Google Earth Engine',

        // Map
        indexValue: 'Index Value',
        noDataAvailable: 'No data available at this location',
        errorFetchingValue: 'Error fetching pixel value',

        // Basemap
        basemapLight: 'Light',
        basemapDark: 'Dark',
        basemapVoyager: 'Voyager',
        basemapStreets: 'Streets',
        basemapSatellite: 'Satellite',
    },
    th: {
        // Header
        search: 'ค้นหา...',
        dark: 'มืด',
        light: 'สว่าง',
        default: 'ค่าเริ่มต้น',
        myAccount: 'บัญชีของฉัน',
        settings: 'การตั้งค่า',
        support: 'ฝ่ายสนับสนุน',
        lockScreen: 'ล็อคหน้าจอ',
        logout: 'ออกจากระบบ',
        systemStatusUpdate: 'อัปเดตสถานะระบบ',
        databaseConnection: 'การเชื่อมต่อฐานข้อมูล',
        newDataAvailable: 'มีข้อมูลใหม่',

        // Sidebar
        dashboard: 'แดชบอร์ด',
        droughtMonitoring: 'ระบบติดตามภัยแล้ง',

        // NDVI Page
        droughtIndices: 'ดัชนีภัยแล้ง',
        analysis: 'การวิเคราะห์',
        studyArea: 'พื้นที่ศึกษา',
        startDate: 'วันที่เริ่มต้น',
        endDate: 'วันที่สิ้นสุด',
        layerOpacity: 'ความทึบของชั้นข้อมูล',
        update: 'อัปเดต',
        loading: 'กำลังโหลด...',
        showLayer: 'แสดงชั้นข้อมูล',

        // Index Types
        ndvi: 'NDVI',
        ndmi: 'NDMI',
        spi: 'SPI',
        ndviLong: 'ดัชนีความแตกต่างของพืชพรรณ',
        ndmiLong: 'ดัชนีความชื้นของพืชพรรณ',
        spiLong: 'ดัชนีฝนมาตรฐาน',

        // Statistics
        statistics: 'สถิติ',
        mean: 'ค่าเฉลี่ย',
        minimum: 'ค่าต่ำสุด',
        maximum: 'ค่าสูงสุด',
        stdDeviation: 'ค่าเบี่ยงเบนมาตรฐาน',
        interpretation: 'การตีความ',
        noStatisticsAvailable: 'ไม่มีข้อมูลสถิติ',
        calculating: 'กำลังคำนวณ',

        // About
        about: 'เกี่ยวกับ',
        dataSource: 'แหล่งข้อมูล',
        period: 'ช่วงเวลา',

        // NDVI Info
        ndviDescription: 'ดัชนี NDVI ใช้ในการติดตามสุขภาพของพืชพรรณและตรวจจับภาวะความเครียดจากภัยแล้ง',
        ndviValues: 'ค่า NDVI:',
        ndviWater: 'น้ำหรือดินเปลือย',
        ndviVeryLow: 'พืชพรรณน้อยมาก (ความเครียดจากภัยแล้ง)',
        ndviLow: 'ความหนาแน่นของพืชพรรณต่ำ',
        ndviModerate: 'พืชพรรณปานกลาง',
        ndviHigh: 'ความหนาแน่นของพืchพรรณสูง',
        ndviVeryHigh: 'พืชพรรณหนาแน่นมาก',
        ndviDataSource: 'MODIS Terra MOD13Q1 (250m, 16 วัน) ผ่าน Google Earth Engine',

        // NDMI Info
        ndmiDescription: 'ดัชนี NDMI วัดปริมาณน้ำในพืชพรรณและมีความไวต่อภาวะความเครียดจากความชื้นของพืชพรรณ',
        ndmiValues: 'ค่า NDMI:',
        ndmiVeryDry: 'แห้งมาก (ความเครียดจากน้ำรุนแรง)',
        ndmiDry: 'แห้ง (ความเครียดจากน้ำปานกลาง)',
        ndmiSlightlyDry: 'แห้งเล็กน้อย (ปริมาณน้ำต่ำ)',
        ndmiModerate: 'ความชื้นปานกลาง (ปกติ)',
        ndmiHigh: 'ความชื้นสูง (ปริมาณน้ำดี)',
        ndmiVeryHigh: 'ความชื้นสูงมาก (อิ่มตัว)',
        ndmiDataSource: 'MODIS Terra MOD09A1 (500m, 8 วัน) ผ่าน Google Earth Engine',

        // SPI Info
        spiDescription: 'ดัชนี SPI วัดความผิดปกติของฝน (10 ปี) เปรียบเทียบกับค่าเฉลี่ยในอดีตเพื่อระบุภาวะแล้งหรือเปียกชื้น',
        spiValues: 'ค่า SPI:',
        spiSevereDrought: 'ภัยแล้งรุนแรง',
        spiModerateDrought: 'ภัยแล้งปานกลาง',
        spiMildDrought: 'ภัยแล้งเล็กน้อย',
        spiNearNormal: 'ใกล้เคียงปกติ',
        spiSlightlyWet: 'ชื้นเล็กน้อย',
        spiModeratelyWet: 'ชื้นปานกลาง',
        spiVeryWet: 'ชื้นมาก',
        spiDataSource: 'ข้อมูลฝน CHIRPS ผ่าน Google Earth Engine',

        // Map
        indexValue: 'ค่าดัชนี',
        noDataAvailable: 'ไม่มีข้อมูลในตำแหน่งนี้',
        errorFetchingValue: 'เกิดข้อผิดพลาดในการดึงข้อมูล',

        // Basemap
        basemapLight: 'สว่าง',
        basemapDark: 'มืด',
        basemapVoyager: 'วอยเอเจอร์',
        basemapStreets: 'ถนน',
        basemapSatellite: 'ดาวเทียม',
    }
};

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(() => {
        // Get saved language from localStorage or default to 'en'
        return localStorage.getItem('language') || 'en';
    });

    useEffect(() => {
        // Save language preference to localStorage
        localStorage.setItem('language', language);
    }, [language]);

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'en' ? 'th' : 'en');
    };

    const t = (key) => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};
