# Bilingual Web Application Implementation Guide
## Thai/English Language Support for CMU APSCO

This document explains the complete bilingual implementation for the CMU APSCO drought monitoring system.

---

## 📁 Project Structure

```
react/
├── src/
│   ├── locales/              # Translation files (NEW)
│   │   ├── en/               # English translations
│   │   │   ├── common.json   # Common UI elements
│   │   │   ├── header.json   # Header/navigation
│   │   │   ├── sidebar.json  # Sidebar menu
│   │   │   ├── drought.json  # Drought indices
│   │   │   ├── survey.json   # Survey form
│   │   │   ├── provinces.json # Province names
│   │   │   └── index.js      # Loader
│   │   └── th/               # Thai translations (same structure)
│   ├── utils/
│   │   └── localization.js   # Date/number formatting (NEW)
│   └── contexts/
│       └── LanguageContext.jsx # Updated with new features
```

---

## 🌍 Features Implemented

### 1. **Organized Translation Structure**
- ✅ Separated translations into logical modules (common, header, sidebar, drought, survey, provinces)
- ✅ Easy to maintain and extend
- ✅ Supports nested translation keys with dot notation

### 2. **Province Name Translations**
- ✅ All 77 Thai provinces translated
- ✅ Automatic translation using `getProvinceName()` function

### 3. **Date & Number Localization**
- ✅ Thai Buddhist calendar (พ.ศ.) support
- ✅ Number formatting for both languages
- ✅ Date range formatting
- ✅ Area, percentage, and index value formatting

### 4. **Translation Features**
- ✅ Variable replacement (e.g., `{index}`, `{count}`)
- ✅ Nested object access
- ✅ LocalStorage persistence
- ✅ Language toggle button in header

---

## 🚀 How to Use in Your Components

### Basic Translation

```javascript
import { useLanguage } from '../../contexts/LanguageContext';

function MyComponent() {
    const { t } = useLanguage();

    return (
        <div>
            <h1>{t('droughtIndices')}</h1>
            <p>{t('ndviDescription')}</p>
        </div>
    );
}
```

### Translation with Variables

```javascript
const { t } = useLanguage();

// In your JSX:
<button>{t('calculateIndex', { index: 'NDVI' })}</button>
// English: "Calculate NDVI"
// Thai: "คำนวณ NDVI"
```

### Province Names

```javascript
const { getProvinceName } = useLanguage();

// Convert English province names to current language
const provinceDisplay = getProvinceName('Chiang Mai');
// English: "Chiang Mai"
// Thai: "เชียงใหม่"
```

### Date Formatting

```javascript
const { format } = useLanguage();

// Format single date
<p>{format.date(new Date())}</p>
// English: "January 21, 2025"
// Thai: "21 มกราคม พ.ศ. 2568" (Buddhist calendar)

// Format date range
<p>{format.dateRange('2024-01-01', '2024-12-31')}</p>
// English: "January 1, 2024 to December 31, 2024"
// Thai: "1 มกราคม พ.ศ. 2567 ถึง 31 ธันวาคม พ.ศ. 2567"
```

### Number Formatting

```javascript
const { format } = useLanguage();

// Format numbers
format.number(1234.5678, 2)  // "1,234.57" or "1,234.57"

// Format area
format.area(125.456)  // "125.46 km²"

// Format percentage
format.percentage(85.5)  // "85.5%"

// Format index values (4 decimal places)
format.indexValue(0.7654)  // "0.7654"
```

---

## 📝 Adding New Translations

### Step 1: Add to Translation Files

Edit both English and Thai files:

**`react/src/locales/en/common.json`**
```json
{
  "myNewKey": "My English Text",
  "anotherKey": "Another Text"
}
```

**`react/src/locales/th/common.json`**
```json
{
  "myNewKey": "ข้อความภาษาไทย",
  "anotherKey": "ข้อความอีกอัน"
}
```

### Step 2: Use in Component

```javascript
const { t } = useLanguage();

<h1>{t('myNewKey')}</h1>
```

---

## 🎯 Example: Complete Component

```javascript
import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const ExampleComponent = () => {
    const { t, format, getProvinceName, language } = useLanguage();
    const [selectedProvince, setSelectedProvince] = useState('Chiang Mai');

    return (
        <div>
            {/* Title */}
            <h1>{t('droughtMonitoring')}</h1>

            {/* Province Selection */}
            <select value={selectedProvince} onChange={(e) => setSelectedProvince(e.target.value)}>
                <option value="">{ t('selectStudyArea')}</option>
                <option value="Chiang Mai">{getProvinceName('Chiang Mai')}</option>
                <option value="Khon Kaen">{getProvinceName('Khon Kaen')}</option>
            </select>

            {/* Date Display */}
            <p>{t('period')}: {format.dateRange('2024-01-01', '2024-12-31')}</p>

            {/* Number Display */}
            <p>{t('area')}: {format.area(123.45)}</p>

            {/* Current Language */}
            <p>Current Language: {language}</p>
        </div>
    );
};

export default ExampleComponent;
```

---

## 🔧 Advanced Features

### 1. Nested Translation Keys

Access nested objects using dot notation:

```javascript
// In provinces.json:
{
  "provinces": {
    "provinces": {
      "Chiang Mai": "เชียงใหม่"
    }
  }
}

// In component:
t('provinces.provinces.Chiang Mai')  // "เชียงใหม่"
```

### 2. Dynamic Variable Replacement

```javascript
// In survey.json:
{
  "clickToCalculate": "Click to calculate {index} for the drawn polygon"
}

// In component:
t('clickToCalculate', { index: selectedIndex })
// Result: "Click to calculate NDVI for the drawn polygon"
```

### 3. Conditional Text Based on Language

```javascript
const { language } = useLanguage();

return (
    <div>
        {language === 'th' ? (
            <p>เนื้อหาเฉพาะภาษาไทย</p>
        ) : (
            <p>English-only content</p>
        )}
    </div>
);
```

---

## 📊 Translation Coverage

### ✅ Fully Translated Pages:
- ✅ **SurveyPage.jsx** - All UI elements, form labels, buttons, alerts
- ✅ **Header.jsx** - Language toggle, notifications, user menu
- ✅ **NDVIPage.jsx** - Drought indices, statistics, interpretation

### 🔄 To Be Translated (Optional):
- Dashboard.jsx
- DataPage.jsx
- ChartsPage.jsx
- StatisticsPage.jsx
- Sidebar.jsx (menu items)
- Footer.jsx

---

## 🌐 Available Localization Utilities

### Date Functions

| Function | Description | Example |
|----------|-------------|---------|
| `format.date(date, options)` | Format date | `format.date(new Date())` |
| `format.dateShort(date)` | Short date format | `format.dateShort(new Date())` |
| `format.dateRange(start, end)` | Date range | `format.dateRange('2024-01-01', '2024-12-31')` |

### Number Functions

| Function | Description | Example |
|----------|-------------|---------|
| `format.number(value, decimals)` | Format number | `format.number(1234.56, 2)` |
| `format.area(value)` | Format area in km² | `format.area(123.45)` |
| `format.percentage(value, decimals)` | Format percentage | `format.percentage(85.5)` |
| `format.indexValue(value)` | Format index (4 decimals) | `format.indexValue(0.7654)` |
| `format.numberWithUnit(value, unit, decimals)` | Number with custom unit | `format.numberWithUnit(25.5, '°C', 1)` |

---

## 🎨 Best Practices

### 1. **Always Use Translation Keys**
❌ Bad:
```javascript
<h1>Drought Monitoring</h1>
```

✅ Good:
```javascript
<h1>{t('droughtMonitoring')}</h1>
```

### 2. **Use Format Functions for Numbers/Dates**
❌ Bad:
```javascript
<p>{area.toFixed(2)} km²</p>
```

✅ Good:
```javascript
<p>{format.area(area)}</p>
```

### 3. **Translate Province Names**
❌ Bad:
```javascript
<option value="Chiang Mai">Chiang Mai</option>
```

✅ Good:
```javascript
<option value="Chiang Mai">{getProvinceName('Chiang Mai')}</option>
```

### 4. **Keep English Keys**
Use English for translation keys (even in Thai files) for consistency:

```json
{
  "startDate": "วันที่เริ่มต้น",
  "endDate": "วันที่สิ้นสุด"
}
```

---

## 🔄 Language Switching

The language toggle button is already implemented in the Header component:

```javascript
// In Header.jsx
<a
    href="#!"
    className="pc-head-link me-0"
    onClick={(e) => {
        e.preventDefault();
        toggleLanguage();
    }}
    title={language === 'en' ? 'Switch to Thai' : 'เปลี่ยนเป็นภาษาอังกฤษ'}
>
    <i className="ph-duotone ph-translate"></i>
    <span className="ms-1 d-none d-md-inline-block fw-bold">
        {language === 'en' ? 'TH' : 'EN'}
    </span>
</a>
```

**Features:**
- ✅ Icon with language indicator
- ✅ Tooltip shows what language it will switch to
- ✅ Persists to localStorage
- ✅ Instant page update

---

## 📚 Translation File Examples

### Common Patterns

**Land Use Types:**
```json
{
  "landUseTypes": {
    "agriculture": "Agriculture",
    "forest": "Forest",
    "urban": "Urban"
  }
}

// Usage:
<option value="agriculture">{t('landUseTypes.agriculture')}</option>
```

**Error Messages:**
```json
{
  "errors": {
    "noPolygon": "Please draw a polygon on the map first",
    "calculationError": "Error calculating {index}. Please try again."
  }
}

// Usage:
alert(t('errors.noPolygon'));
setError(t('errors.calculationError', { index: selectedIndex }));
```

---

## 🧪 Testing Your Translations

### Quick Test Checklist:

1. ✅ **Switch language** using the header toggle button
2. ✅ **Check all pages** - navigate through the app
3. ✅ **Test forms** - check labels and placeholders
4. ✅ **Test alerts** - trigger success/error messages
5. ✅ **Check dates** - verify Buddhist calendar in Thai
6. ✅ **Check numbers** - verify thousand separators
7. ✅ **Test province names** - check dropdown menus
8. ✅ **Refresh page** - verify language persists

---

## 🐛 Troubleshooting

### Issue: Translation not showing

**Problem:** Shows translation key instead of text
```javascript
// Shows: "droughtMonitoring" instead of "Drought Monitoring"
```

**Solution:** Check if the key exists in the translation file:
```bash
# Check if key exists
grep -r "droughtMonitoring" react/src/locales/
```

### Issue: Variables not replacing

**Problem:**
```javascript
t('calculateIndex', { index: 'NDVI' })
// Shows: "Calculate {index}" instead of "Calculate NDVI"
```

**Solution:** Make sure you're passing the variables object:
```javascript
// ❌ Wrong:
t('calculateIndex')

// ✅ Correct:
t('calculateIndex', { index: selectedIndex })
```

### Issue: Date not showing in Thai calendar

**Problem:** Thai dates show Gregorian year instead of Buddhist Era

**Solution:** Make sure you're using `format.date()`:
```javascript
// ❌ Wrong:
new Date().toLocaleDateString()

// ✅ Correct:
format.date(new Date())
```

---

## 📈 Future Enhancements

### Potential Additions:

1. **More Languages**
   - Add Lao, Burmese, or other regional languages
   - Just create `locales/lo/` or `locales/my/` directories

2. **RTL Support**
   - For Arabic or other RTL languages
   - Add direction detection in LanguageContext

3. **Pluralization**
   - Handle singular/plural forms
   - Example: "1 item" vs "2 items"

4. **Currency Formatting**
   - Format Thai Baht vs USD
   - `format.currency(1000, 'THB')`

5. **Time Zone Support**
   - Handle Bangkok vs UTC time
   - Timezone-aware date formatting

---

## 🎓 Learning Resources

### Thai Buddhist Calendar:
- Buddhist Era (พ.ศ.) = Gregorian Year + 543
- Example: 2025 CE = 2568 BE

### Thai Number Format:
- Uses same separators as English
- Example: 1,234.56 (same in Thai)

### Province Names:
- Always use English as the key
- Store translations in `provinces.json`

---

## ✅ Summary

You now have a **complete bilingual system** with:

- ✅ Organized translation structure
- ✅ 77 provinces translated
- ✅ Date formatting (Buddhist calendar)
- ✅ Number formatting
- ✅ Language toggle
- ✅ LocalStorage persistence
- ✅ Variable replacement
- ✅ Nested translations
- ✅ Format utilities

**To add translations to other pages:**
1. Import `useLanguage` hook
2. Replace hardcoded text with `t('key')`
3. Add keys to appropriate JSON files
4. Use `format.*` for dates/numbers
5. Use `getProvinceName()` for provinces

---

## 📞 Quick Reference

```javascript
import { useLanguage } from '../../contexts/LanguageContext';

const {
    t,                  // Translate text
    language,           // Current language ('en' or 'th')
    toggleLanguage,     // Switch language
    getProvinceName,    // Translate province name
    format              // Formatting utilities
} = useLanguage();

// Examples:
t('droughtMonitoring')
t('calculateIndex', { index: 'NDVI' })
getProvinceName('Chiang Mai')
format.date(new Date())
format.area(123.45)
```

---

**Author:** Claude Code
**Date:** October 21, 2025
**Version:** 1.0.0
