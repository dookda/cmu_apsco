import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Dashboard, DataPage, ChartsPage, StatisticsPage } from './pages';
import { MapPage, NDVIPage } from './components/map';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/ndvi" element={<NDVIPage />} />
        <Route path="/data" element={<DataPage />} />
        <Route path="/charts" element={<ChartsPage />} />
        <Route path="/statistics" element={<StatisticsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
