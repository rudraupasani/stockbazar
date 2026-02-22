import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from '../Pages/HomePage';
import AllCoins from '../components/AllCoins';
import MarketPage from '../Pages/MarketPage';
import WatchlistPage from '../Pages/WatchlistPage';
import AnalysisPage from '../Pages/AnalysisPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/allcoins" element={<AllCoins />} />
      <Route path="/market" element={<MarketPage />} />
      <Route path="/watchlist" element={<WatchlistPage />} />
      <Route path="/analysis" element={<AnalysisPage />} />
    </Routes>
  );
};

export default AppRoutes;
