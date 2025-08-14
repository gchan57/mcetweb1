import React, { useState, useEffect } from 'react';
import { Lightbulb } from 'phosphor-react';

const AIAnalysis = ({ history }) => {
  const [analysis, setAnalysis] = useState('');

  useEffect(() => {
    if (history.length < 10) {
      setAnalysis('Insufficient data for analysis. Waiting for more readings...');
      return;
    }

    const latestHistory = history.slice(-10);
    const avgTemp = latestHistory.reduce((sum, item) => sum + item.temp, 0) / latestHistory.length;
    const avgLevel = latestHistory.reduce((sum, item) => sum + item.level, 0) / latestHistory.length;
    const avgFlow = latestHistory.reduce((sum, item) => sum + item.flow, 0) / latestHistory.length;

    let suggestions = [];

    if (avgTemp > 35) {
      suggestions.push('The average temperature is high. Consider checking the cooling system for blockages.');
    } else if (avgTemp < 15) {
      suggestions.push('The coolant is running cooler than optimal. This might affect efficiency.');
    }

    if (avgLevel < 70) {
      suggestions.push('Coolant level is consistently low. Please check for leaks and top up the coolant.');
    }

    if (avgFlow > 70) {
      suggestions.push('Flow rate is higher than usual. This could indicate a leak or a faulty sensor.');
    } else if (avgFlow < 30 && avgFlow > 0) {
        suggestions.push('Flow rate is lower than usual. This could indicate a blockage in the system.');
    }

    if (suggestions.length === 0) {
      setAnalysis('All systems are operating within normal parameters. No immediate action is required.');
    } else {
      setAnalysis(suggestions.join(' '));
    }
  }, [history]);

  return (
    <div className="ai-analysis-card">
      <div className="ai-analysis-header">
        <Lightbulb size={24} />
        <h3>Rule-Based Analysis</h3>
      </div>
      <p>{analysis}</p>
    </div>
  );
};

export default AIAnalysis;
