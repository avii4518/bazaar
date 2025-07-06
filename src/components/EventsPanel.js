import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';

const EventsPanel = ({ events, data, selectedAsset }) => {
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('time');

  const getEventIcon = (type) => {
    const icons = {
      earnings: '💰',
      news: '📰',
      technical: '📊',
      economic: '🏛️',
      company: '🏢',
      announcement: '📢',
      partnership: '🤝',
      regulation: '⚖️'
    };
    return icons[type] || '📌';
  };

  const getImpactLevel = (impact) => {
    const levels = {
      high: 'high',
      medium: 'medium',
      low: 'low'
    };
    return levels[impact] || 'low';
  };

  const getImpactLabel = (impact) => {
    const labels = {
      high: 'High Impact',
      medium: 'Medium Impact',
      low: 'Low Impact'
    };
    return labels[impact] || 'Low Impact';
  };

  const formatVolume = (volume) => {
    if (!volume) return '0';
    if (volume >= 1000000000) {
      return `${(volume / 1000000000).toFixed(1)}B`;
    }
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`;
    }
    if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`;
    }
    return volume.toLocaleString();
  };

  // Filter events by selected asset or show all events
  const filteredEvents = useMemo(() => {
    let filtered = events.filter(event => 
      event.asset === selectedAsset || event.asset === 'ALL'
    );

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(event => event.type === filterType);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'time':
          return b.timestamp - a.timestamp;
        case 'impact':
          const impactOrder = { high: 3, medium: 2, low: 1 };
          return impactOrder[b.impact] - impactOrder[a.impact];
        case 'type':
          return a.type.localeCompare(b.type);
        default:
          return b.timestamp - a.timestamp;
      }
    });

    return filtered;
  }, [events, selectedAsset, filterType, sortBy]);

  const calculateStats = () => {
    if (!data.length) return null;
    
    const high = Math.max(...data.map(d => d.high));
    const low = Math.min(...data.map(d => d.low));
    const volume = data[data.length - 1].volume;
    const change = ((data[data.length - 1].close - data[0].close) / data[0].close * 100);
    
    return { high, low, volume, change };
  };

  const stats = calculateStats();

  const eventTypes = [
    { value: 'all', label: 'All Types', icon: '📊' },
    { value: 'news', label: 'News', icon: '📰' },
    { value: 'earnings', label: 'Earnings', icon: '💰' },
    { value: 'technical', label: 'Technical', icon: '📈' },
    { value: 'economic', label: 'Economic', icon: '🏛️' },
    { value: 'company', label: 'Company', icon: '🏢' }
  ];

  const sortOptions = [
    { value: 'time', label: 'Time', icon: '⏰' },
    { value: 'impact', label: 'Impact', icon: '⚡' },
    { value: 'type', label: 'Type', icon: '🏷️' }
  ];

  return (
    <div className="events-panel">
      <h3>Market Events</h3>
      
      {/* Controls */}
      <div className="events-controls">
        <div className="filter-controls">
          <div className="filter-group">
            <label className="filter-label">Filter:</label>
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select"
            >
              {eventTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label className="filter-label">Sort:</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.icon} {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      <div className="events-list">
        {filteredEvents.slice(0, 8).map(event => (
          <div key={event.id} className="event-item">
            <div className="event-header">
              <span className="event-icon">{getEventIcon(event.type)}</span>
              <span className="event-time">
                {format(event.timestamp, 'HH:mm')}
              </span>
              <span className={`event-impact ${getImpactLevel(event.impact)}`}>
                {getImpactLabel(event.impact)}
              </span>
            </div>
            
            <div className="event-content">
              <h4 className="event-title">{event.title}</h4>
              <p className="event-description">{event.description}</p>
            </div>
            
            <div className="event-meta">
              <span className="event-type">{event.type.toUpperCase()}</span>
            </div>
          </div>
        ))}
        
        {filteredEvents.length === 0 && (
          <div className="event-item">
            <div className="event-content">
              <p className="event-description" style={{ textAlign: 'center', color: '#6b7280' }}>
                No events available for {selectedAsset}
              </p>
            </div>
          </div>
        )}
      </div>
      
      <div className="market-summary">
        <h4>Quick Stats</h4>
        {stats ? (
          <div className="summary-stats">
            <div className="stat-item">
              <span className="stat-label">24h High:</span>
              <span className="stat-value">
                ${stats.high.toFixed(2)}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">24h Low:</span>
              <span className="stat-value">
                ${stats.low.toFixed(2)}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Volume:</span>
              <span className="stat-value">
                {formatVolume(stats.volume)}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Change:</span>
              <span className={`stat-value ${stats.change >= 0 ? 'positive' : 'negative'}`}>
                {stats.change >= 0 ? '+' : ''}{stats.change.toFixed(2)}%
              </span>
            </div>
          </div>
        ) : (
          <div className="summary-stats">
            <div className="stat-item">
              <span className="stat-label">Loading stats...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPanel; 