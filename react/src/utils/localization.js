/**
 * Localization utilities for date and number formatting
 */

/**
 * Format date according to locale
 * @param {Date|string} date - Date to format
 * @param {string} language - Language code ('en' or 'th')
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export const formatDate = (date, language = 'en', options = {}) => {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  };

  // For Thai, convert to Buddhist Era (BE) by adding 543 years
  if (language === 'th') {
    const formatter = new Intl.DateTimeFormat('th-TH', defaultOptions);
    return formatter.format(dateObj);
  }

  // For English, use Gregorian calendar
  const formatter = new Intl.DateTimeFormat('en-US', defaultOptions);
  return formatter.format(dateObj);
};

/**
 * Format date in short format (DD/MM/YYYY or MM/DD/YYYY)
 * @param {Date|string} date - Date to format
 * @param {string} language - Language code ('en' or 'th')
 * @returns {string} Formatted date string
 */
export const formatDateShort = (date, language = 'en') => {
  return formatDate(date, language, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

/**
 * Format date range
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @param {string} language - Language code ('en' or 'th')
 * @returns {string} Formatted date range
 */
export const formatDateRange = (startDate, endDate, language = 'en') => {
  const separator = language === 'th' ? ' ถึง ' : ' to ';
  return `${formatDate(startDate, language)} ${separator} ${formatDate(endDate, language)}`;
};

/**
 * Format number according to locale
 * @param {number} value - Number to format
 * @param {string} language - Language code ('en' or 'th')
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number string
 */
export const formatNumber = (value, language = 'en', decimals = 2) => {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';

  const locale = language === 'th' ? 'th-TH' : 'en-US';

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
};

/**
 * Format number with unit
 * @param {number} value - Number to format
 * @param {string} unit - Unit to append (e.g., 'km²', '%')
 * @param {string} language - Language code ('en' or 'th')
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number with unit
 */
export const formatNumberWithUnit = (value, unit, language = 'en', decimals = 2) => {
  const formattedNumber = formatNumber(value, language, decimals);
  return `${formattedNumber} ${unit}`;
};

/**
 * Format area in square kilometers
 * @param {number} area - Area in km²
 * @param {string} language - Language code ('en' or 'th')
 * @returns {string} Formatted area string
 */
export const formatArea = (area, language = 'en') => {
  return formatNumberWithUnit(area, 'km²', language, 2);
};

/**
 * Format percentage
 * @param {number} value - Value to format as percentage
 * @param {string} language - Language code ('en' or 'th')
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value, language = 'en', decimals = 1) => {
  return formatNumberWithUnit(value, '%', language, decimals);
};

/**
 * Format index value (NDVI, NDMI, SPI)
 * @param {number} value - Index value
 * @param {string} language - Language code ('en' or 'th')
 * @returns {string} Formatted index value
 */
export const formatIndexValue = (value, language = 'en') => {
  return formatNumber(value, language, 4);
};

/**
 * Get month name
 * @param {number} month - Month number (0-11)
 * @param {string} language - Language code ('en' or 'th')
 * @param {string} format - 'long' or 'short'
 * @returns {string} Month name
 */
export const getMonthName = (month, language = 'en', format = 'long') => {
  const date = new Date(2000, month, 1);
  const locale = language === 'th' ? 'th-TH' : 'en-US';

  return new Intl.DateTimeFormat(locale, { month: format }).format(date);
};

/**
 * Get day name
 * @param {number} day - Day of week (0-6, Sunday = 0)
 * @param {string} language - Language code ('en' or 'th')
 * @param {string} format - 'long' or 'short'
 * @returns {string} Day name
 */
export const getDayName = (day, language = 'en', format = 'long') => {
  const date = new Date(2000, 0, day + 2); // Start from Sunday
  const locale = language === 'th' ? 'th-TH' : 'en-US';

  return new Intl.DateTimeFormat(locale, { weekday: format }).format(date);
};

/**
 * Format relative time (e.g., "2 days ago")
 * @param {Date|string} date - Date to format
 * @param {string} language - Language code ('en' or 'th')
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date, language = 'en') => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now - dateObj) / 1000);

  const locale = language === 'th' ? 'th-TH' : 'en-US';
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  const units = [
    { unit: 'year', seconds: 31536000 },
    { unit: 'month', seconds: 2592000 },
    { unit: 'week', seconds: 604800 },
    { unit: 'day', seconds: 86400 },
    { unit: 'hour', seconds: 3600 },
    { unit: 'minute', seconds: 60 },
    { unit: 'second', seconds: 1 }
  ];

  for (const { unit, seconds } of units) {
    if (Math.abs(diffInSeconds) >= seconds) {
      const value = Math.floor(diffInSeconds / seconds);
      return rtf.format(-value, unit);
    }
  }

  return rtf.format(0, 'second');
};

/**
 * Parse date from input (handles both Gregorian and Buddhist calendar)
 * @param {string} dateString - Date string to parse
 * @param {string} language - Language code ('en' or 'th')
 * @returns {Date} Parsed date object
 */
export const parseDate = (dateString, language = 'en') => {
  if (!dateString) return null;

  // If Thai calendar (Buddhist Era), subtract 543 years
  if (language === 'th' && dateString.includes('พ.ศ.')) {
    const year = parseInt(dateString.match(/\d{4}/)?.[0]) - 543;
    const modifiedString = dateString.replace(/\d{4}/, year);
    return new Date(modifiedString);
  }

  return new Date(dateString);
};

export default {
  formatDate,
  formatDateShort,
  formatDateRange,
  formatNumber,
  formatNumberWithUnit,
  formatArea,
  formatPercentage,
  formatIndexValue,
  getMonthName,
  getDayName,
  formatRelativeTime,
  parseDate
};
