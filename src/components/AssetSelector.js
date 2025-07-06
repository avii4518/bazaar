import React from 'react';

const AssetSelector = ({ assets, selectedAsset, onAssetChange }) => {
  if (!assets.length) {
    return (
      <div className="asset-selector">
        <div className="asset-tabs">
          <div className="asset-tab active">
            <div className="asset-symbol">Loading...</div>
            <div className="asset-price">$0.00</div>
            <div className="asset-change">0.00%</div>
          </div>
        </div>
      </div>
    );
  }

  const formatPrice = (price) => {
    if (!price) return '$0.00';
    if (price >= 1000) {
      return `$${(price / 1000).toFixed(1)}K`;
    }
    return `$${price.toFixed(2)}`;
  };

  const formatChange = (change) => {
    if (!change) return '0.00%';
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  return (
    <div className="asset-selector">
      <div className="asset-tabs">
        {assets.map(asset => (
          <div
            key={asset.symbol}
            className={`asset-tab ${selectedAsset === asset.symbol ? 'active' : ''}`}
            onClick={() => onAssetChange(asset.symbol)}
          >
            <div className="asset-symbol">{asset.symbol}</div>
            <div className="asset-price">{formatPrice(asset.price)}</div>
            <div className={`asset-change ${asset.change >= 0 ? 'positive' : 'negative'}`}>
              {formatChange(asset.change)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssetSelector; 