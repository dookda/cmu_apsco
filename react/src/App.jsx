import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Dashboard, DataPage, ChartsPage, StatisticsPage } from './pages';
import { MapPage, NDVIPage, SurveyPage } from './components/map';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/ndvi" element={<NDVIPage />} />
            <Route path="/survey" element={<SurveyPage />} />
            <Route path="/data" element={<DataPage />} />
            <Route path="/charts" element={<ChartsPage />} />
            <Route path="/statistics" element={<StatisticsPage />} />
          </Routes>
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
