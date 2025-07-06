import React, { useState, useMemo } from 'react';

const IndicatorsPanel = ({ availableIndicators, selectedIndicators, onIndicatorsChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const handleIndicatorToggle = (indicator) => {
    const newSelected = selectedIndicators.includes(indicator)
      ? selectedIndicators.filter(i => i !== indicator)
      : [...selectedIndicators, indicator];
    onIndicatorsChange(newSelected);
  };

  const getIndicatorColor = (indicator) => {
    const colors = {
      sma: '#f59e0b',
      ema: '#8b5cf6',
      rsi: '#ec4899',
      macd: '#06b6d4',
      bollinger: '#10b981',
      stochastic: '#8b5cf6'
    };
    return colors[indicator] || '#6b7280';
  };

  const getIndicatorCategory = (indicator) => {
    const categories = {
      sma: 'trend',
      ema: 'trend',
      rsi: 'momentum',
      macd: 'momentum',
      bollinger: 'volatility',
      stochastic: 'momentum'
    };
    return categories[indicator] || 'other';
  };

  const getIndicatorDescription = (indicator) => {
    const descriptions = {
      sma: {
        name: 'Simple Moving Average',
        description: 'Average price over a specified period, helps identify trends and support/resistance levels.',
        usage: 'Use to identify trend direction and potential reversal points.',
        category: 'Trend',
        period: '20 periods'
      },
      ema: {
        name: 'Exponential Moving Average',
        description: 'Weighted average that gives more importance to recent prices, more responsive than SMA.',
        usage: 'Better for short-term trend analysis and momentum identification.',
        category: 'Trend',
        period: '20 periods'
      },
      rsi: {
        name: 'Relative Strength Index',
        description: 'Momentum oscillator measuring speed and change of price movements on a scale of 0-100.',
        usage: 'Overbought (>70) and oversold (<30) conditions indicate potential reversals.',
        category: 'Momentum',
        period: '14 periods'
      },
      macd: {
        name: 'Moving Average Convergence Divergence',
        description: 'Trend-following momentum indicator showing relationship between two moving averages.',
        usage: 'Signal line crossovers and histogram patterns indicate trend changes.',
        category: 'Momentum',
        period: '12,26,9 periods'
      },
      bollinger: {
        name: 'Bollinger Bands',
        description: 'Volatility indicator with upper and lower bands around a moving average.',
        usage: 'Price touching bands indicates potential reversal or continuation patterns.',
        category: 'Volatility',
        period: '20 periods'
      },
      stochastic: {
        name: 'Stochastic Oscillator',
        description: 'Momentum indicator comparing closing price to price range over time.',
        usage: 'Overbought (>80) and oversold (<20) conditions indicate potential reversals.',
        category: 'Momentum',
        period: '14 periods'
      }
    };
    return descriptions[indicator] || { name: indicator, description: '', usage: '', category: 'Other', period: 'N/A' };
  };

  const categories = [
    { id: 'all', name: 'All', icon: '📊' },
    { id: 'trend', name: 'Trend', icon: '📈' },
    { id: 'momentum', name: 'Momentum', icon: '⚡' },
    { id: 'volatility', name: 'Volatility', icon: '🌊' }
  ];

  const filteredIndicators = useMemo(() => {
    return availableIndicators.filter(indicator => {
      const matchesSearch = indicator.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           getIndicatorDescription(indicator.value).name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === 'all' || getIndicatorCategory(indicator.value) === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [availableIndicators, searchTerm, activeCategory]);

  const selectedIndicatorsInfo = useMemo(() => {
    return selectedIndicators.map(indicator => {
      const info = getIndicatorDescription(indicator);
      return { ...info, value: indicator };
    });
  }, [selectedIndicators]);

  return (
    <div className="indicators-panel">
      <h3>Technical Indicators</h3>
      
      {/* Search and Filter */}
      <div className="indicators-controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search indicators..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="indicator-search"
          />
          <span className="search-icon">🔍</span>
        </div>
        
        <div className="category-tabs">
          {categories.map(category => (
            <button
              key={category.id}
              className={`category-tab ${activeCategory === category.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(category.id)}
            >
              <span className="category-icon">{category.icon}</span>
              <span className="category-name">{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Indicators List */}
      <div className="indicators-list">
        {filteredIndicators.length > 0 ? (
          filteredIndicators.map(indicator => (
            <div key={indicator.value} className="indicator-item">
              <label className="indicator-checkbox">
                <input
                  type="checkbox"
                  checked={selectedIndicators.includes(indicator.value)}
                  onChange={() => handleIndicatorToggle(indicator.value)}
                />
                <span 
                  className="indicator-color" 
                  style={{ backgroundColor: getIndicatorColor(indicator.value) }}
                ></span>
                <span className="indicator-label">{indicator.label}</span>
                <span className="indicator-category">
                  {getIndicatorDescription(indicator.value).category}
                </span>
              </label>
            </div>
          ))
        ) : (
          <div className="no-results">
            <span className="no-results-icon">🔍</span>
            <p>No indicators found</p>
          </div>
        )}
      </div>
      
      {/* Selected Indicators Info */}
      <div className="indicator-info">
        <h4>Indicator Guide</h4>
        <div className="info-list">
          {selectedIndicatorsInfo.map(indicator => (
            <div key={indicator.value} className="info-item">
              <div className="info-header">
                <strong>{indicator.name}</strong>
                <span className="info-period">{indicator.period}</span>
              </div>
              <p>{indicator.description}</p>
              <p className="info-usage">
                💡 {indicator.usage}
              </p>
              <div className="info-category">
                <span className="category-badge">{indicator.category}</span>
              </div>
            </div>
          ))}
          {selectedIndicators.length === 0 && (
            <div className="info-item">
              <p style={{ color: '#6b7280', fontStyle: 'italic', textAlign: 'center' }}>
                Select indicators above to see detailed descriptions and usage tips.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IndicatorsPanel; 