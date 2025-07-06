import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import TradingChart from './components/TradingChart';
import IndicatorsPanel from './components/IndicatorsPanel';
import EventsPanel from './components/EventsPanel';
import AssetSelector from './components/AssetSelector';
import liveDataService from './services/liveDataService';

function App() {
  const [selectedAsset, setSelectedAsset] = useState('BTC');
  const [tradingData, setTradingData] = useState({});
  const [liveAssets, setLiveAssets] = useState([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D');
  const [selectedIndicators, setSelectedIndicators] = useState(['sma', 'ema']);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const assetIds = ['bitcoin', 'ethereum', 'cardano', 'solana', 'polkadot', 'chainlink'];

  // Fetch live asset data
  const fetchLiveAssets = useCallback(async () => {
    try {
      const assets = await liveDataService.getLivePrices(assetIds);
      setLiveAssets(assets);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching live assets:', error);
    }
  }, []);

  // Fetch historical data for selected asset
  const fetchHistoricalData = useCallback(async (symbol) => {
    try {
      const days = selectedTimeframe === '1H' ? 1 : 
                   selectedTimeframe === '4H' ? 1 : 
                   selectedTimeframe === '1D' ? 1 : 
                   selectedTimeframe === '1W' ? 7 : 30;
      
      const data = await liveDataService.getHistoricalData(symbol, days);
      setTradingData(prev => ({
        ...prev,
        [symbol]: data
      }));
    } catch (error) {
      console.error('Error fetching historical data:', error);
    }
  }, [selectedTimeframe]);

  // Fetch live events
  const fetchLiveEvents = useCallback(async () => {
    try {
      const liveEvents = await liveDataService.getLiveEvents();
      setEvents(liveEvents);
    } catch (error) {
      console.error('Error fetching live events:', error);
    }
  }, []);

  // Initial data load
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchLiveAssets(),
        fetchHistoricalData(selectedAsset),
        fetchLiveEvents()
      ]);
      setIsLoading(false);
    };

    initializeData();
  }, [fetchLiveAssets, fetchHistoricalData, fetchLiveEvents, selectedAsset]);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchLiveAssets();
      fetchHistoricalData(selectedAsset);
      fetchLiveEvents();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchLiveAssets, fetchHistoricalData, fetchLiveEvents, selectedAsset]);

  // Handle asset change
  const handleAssetChange = async (symbol) => {
    setSelectedAsset(symbol);
    if (!tradingData[symbol]) {
      await fetchHistoricalData(symbol);
    }
  };

  const timeframes = [
    { value: '1H', label: '1H' },
    { value: '4H', label: '4H' },
    { value: '1D', label: '1D' },
    { value: '1W', label: '1W' },
    { value: '1M', label: '1M' }
  ];

  const availableIndicators = [
    { value: 'sma', label: 'SMA' },
    { value: 'ema', label: 'EMA' },
    { value: 'rsi', label: 'RSI' },
    { value: 'macd', label: 'MACD' },
    { value: 'bollinger', label: 'BB' },
    { value: 'stochastic', label: 'Stoch' }
  ];

  const currentAsset = liveAssets.find(asset => asset.symbol === selectedAsset);
  const currentData = tradingData[selectedAsset] || [];

  if (isLoading) {
    return (
      <div className="App">
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <h2>Loading Live Market Data...</h2>
          <p>Connecting to cryptocurrency exchanges</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-left">
          <h1>Bazaar Trading Dashboard</h1>
          <div className="market-status">
            <span className="status-indicator online"></span>
            <span>Live Market Data</span>
            <span className="last-update">
              {lastUpdate.toLocaleTimeString()}
            </span>
          </div>
        </div>
        
        <div className="header-center">
          <AssetSelector 
            assets={liveAssets}
            selectedAsset={selectedAsset}
            onAssetChange={handleAssetChange}
          />
        </div>
        
        <div className="header-right">
          <div className="timeframe-selector">
            {timeframes.map(tf => (
              <button
                key={tf.value}
                className={`timeframe-btn ${selectedTimeframe === tf.value ? 'active' : ''}`}
                onClick={() => setSelectedTimeframe(tf.value)}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>
      </header>
      
      <main className="app-main">
        <div className="chart-section">
          <div className="asset-info">
            <div className="asset-details">
              <h2>{currentAsset?.symbol} - Live Price</h2>
              <div className="price-display">
                <span className="current-price">${currentAsset?.price?.toLocaleString()}</span>
                <span className={`price-change ${currentAsset?.change >= 0 ? 'positive' : 'negative'}`}>
                  {currentAsset?.change >= 0 ? '+' : ''}{currentAsset?.change?.toFixed(2)}%
                </span>
              </div>
            </div>
            <div className="asset-stats">
              <div className="stat">
                <span className="stat-label">Volume</span>
                <span className="stat-value">{currentAsset?.volume}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Market Cap</span>
                <span className="stat-value">{currentAsset?.marketCap}</span>
              </div>
            </div>
          </div>
          
          <TradingChart 
            data={currentData}
            indicators={selectedIndicators}
            timeframe={selectedTimeframe}
            asset={selectedAsset}
            isLoading={!currentData.length}
          />
        </div>
        
        <div className="side-panels">
          <IndicatorsPanel 
            availableIndicators={availableIndicators}
            selectedIndicators={selectedIndicators}
            onIndicatorsChange={setSelectedIndicators}
          />
          
          <EventsPanel 
            events={events}
            data={currentData}
            selectedAsset={selectedAsset}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
