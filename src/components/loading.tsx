import React from 'react';
import './LoadingScreen.css'; // Make sure this CSS file exists

const LoadingScreen: React.FC = () => {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <div className="loading-text">Loading dashboard...</div>
    </div>
  );
};

export default LoadingScreen;
