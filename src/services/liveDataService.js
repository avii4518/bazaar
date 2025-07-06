// Live cryptocurrency data service
class LiveDataService {
  constructor() {
    this.baseUrl = 'https://api.coingecko.com/api/v3';
    this.binanceUrl = 'https://api.binance.com/api/v3';
    this.cache = new Map();
    this.cacheTimeout = 30000; // 30 seconds
  }

  // Get current prices for multiple cryptocurrencies
  async getLivePrices(symbols) {
    try {
      const response = await fetch(`${this.baseUrl}/simple/price?ids=${symbols.join(',')}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`);
      const data = await response.json();
      
      return Object.keys(data).map(id => {
        const coinData = data[id];
        return {
          id,
          symbol: this.getSymbolFromId(id),
          price: coinData.usd,
          change: coinData.usd_24h_change,
          volume: this.formatVolume(coinData.usd_24h_vol),
          marketCap: this.formatMarketCap(coinData.usd_market_cap)
        };
      });
    } catch (error) {
      console.error('Error fetching live prices:', error);
      return this.getFallbackData();
    }
  }

  // Get historical data for a specific cryptocurrency
  async getHistoricalData(symbol, days = 1) {
    const cacheKey = `${symbol}_${days}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      const id = this.getIdFromSymbol(symbol);
      const response = await fetch(`${this.baseUrl}/coins/${id}/market_chart?vs_currency=usd&days=${days}&interval=hourly`);
      const data = await response.json();
      
      const historicalData = data.prices.map(([timestamp, price], index) => {
        const volume = data.total_volumes[index]?.[1] || 0;
        return {
          timestamp: new Date(timestamp),
          open: price,
          high: price * (1 + Math.random() * 0.02),
          low: price * (1 - Math.random() * 0.02),
          close: price,
          volume: volume
        };
      });

      this.cache.set(cacheKey, {
        data: historicalData,
        timestamp: Date.now()
      });

      return historicalData;
    } catch (error) {
      console.error('Error fetching historical data:', error);
      return this.generateSampleData(symbol);
    }
  }

  // Get live market events and news
  async getLiveEvents() {
    try {
      // Using CryptoCompare API for news
      const response = await fetch('https://min-api.cryptocompare.com/data/v2/news/?lang=EN');
      const data = await response.json();
      
      return data.Data.slice(0, 10).map((news, index) => ({
        id: index + 1,
        timestamp: new Date(news.published_on * 1000),
        type: this.categorizeNews(news.title),
        title: news.title,
        description: news.body.substring(0, 100) + '...',
        impact: this.analyzeSentiment(news.title),
        asset: this.extractAssetFromTitle(news.title),
        source: news.source
      }));
    } catch (error) {
      console.error('Error fetching live events:', error);
      return this.getFallbackEvents();
    }
  }

  // Get live order book data
  async getOrderBook(symbol) {
    try {
      const response = await fetch(`${this.binanceUrl}/depth?symbol=${symbol}USDT&limit=10`);
      const data = await response.json();
      
      return {
        bids: data.bids.map(([price, quantity]) => ({ price: parseFloat(price), quantity: parseFloat(quantity) })),
        asks: data.asks.map(([price, quantity]) => ({ price: parseFloat(price), quantity: parseFloat(quantity) }))
      };
    } catch (error) {
      console.error('Error fetching order book:', error);
      return { bids: [], asks: [] };
    }
  }

  // Get live trades
  async getLiveTrades(symbol) {
    try {
      const response = await fetch(`${this.binanceUrl}/trades?symbol=${symbol}USDT&limit=50`);
      const data = await response.json();
      
      return data.map(trade => ({
        id: trade.id,
        price: parseFloat(trade.price),
        quantity: parseFloat(trade.qty),
        time: new Date(trade.time),
        isBuyerMaker: trade.isBuyerMaker
      }));
    } catch (error) {
      console.error('Error fetching live trades:', error);
      return [];
    }
  }

  // Helper methods
  getSymbolFromId(id) {
    const symbolMap = {
      'bitcoin': 'BTC',
      'ethereum': 'ETH',
      'cardano': 'ADA',
      'solana': 'SOL',
      'polkadot': 'DOT',
      'chainlink': 'LINK',
      'binancecoin': 'BNB',
      'ripple': 'XRP',
      'dogecoin': 'DOGE',
      'avalanche-2': 'AVAX'
    };
    return symbolMap[id] || id.toUpperCase();
  }

  getIdFromSymbol(symbol) {
    const idMap = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'ADA': 'cardano',
      'SOL': 'solana',
      'DOT': 'polkadot',
      'LINK': 'chainlink',
      'BNB': 'binancecoin',
      'XRP': 'ripple',
      'DOGE': 'dogecoin',
      'AVAX': 'avalanche-2'
    };
    return idMap[symbol] || symbol.toLowerCase();
  }

  formatVolume(volume) {
    if (volume >= 1e9) return `${(volume / 1e9).toFixed(1)}B`;
    if (volume >= 1e6) return `${(volume / 1e6).toFixed(1)}M`;
    if (volume >= 1e3) return `${(volume / 1e3).toFixed(1)}K`;
    return volume.toFixed(0);
  }

  formatMarketCap(marketCap) {
    if (marketCap >= 1e12) return `${(marketCap / 1e12).toFixed(1)}T`;
    if (marketCap >= 1e9) return `${(marketCap / 1e9).toFixed(1)}B`;
    if (marketCap >= 1e6) return `${(marketCap / 1e6).toFixed(1)}M`;
    return marketCap.toFixed(0);
  }

  categorizeNews(title) {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('bitcoin') || lowerTitle.includes('btc')) return 'bitcoin';
    if (lowerTitle.includes('ethereum') || lowerTitle.includes('eth')) return 'ethereum';
    if (lowerTitle.includes('sec') || lowerTitle.includes('regulation')) return 'regulatory';
    if (lowerTitle.includes('adoption') || lowerTitle.includes('partnership')) return 'adoption';
    if (lowerTitle.includes('hack') || lowerTitle.includes('security')) return 'security';
    return 'general';
  }

  analyzeSentiment(title) {
    const lowerTitle = title.toLowerCase();
    const positiveWords = ['surge', 'rally', 'jump', 'gain', 'up', 'bullish', 'approval', 'adoption'];
    const negativeWords = ['crash', 'drop', 'fall', 'decline', 'bearish', 'ban', 'hack', 'scam'];
    
    const positiveCount = positiveWords.filter(word => lowerTitle.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerTitle.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  extractAssetFromTitle(title) {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('bitcoin') || lowerTitle.includes('btc')) return 'BTC';
    if (lowerTitle.includes('ethereum') || lowerTitle.includes('eth')) return 'ETH';
    if (lowerTitle.includes('cardano') || lowerTitle.includes('ada')) return 'ADA';
    if (lowerTitle.includes('solana') || lowerTitle.includes('sol')) return 'SOL';
    if (lowerTitle.includes('polkadot') || lowerTitle.includes('dot')) return 'DOT';
    if (lowerTitle.includes('chainlink') || lowerTitle.includes('link')) return 'LINK';
    return 'ALL';
  }

  // Fallback data methods
  getFallbackData() {
    return [
      { id: 'bitcoin', symbol: 'BTC', price: 43250.50, change: 2.34, volume: '2.1B', marketCap: '850B' },
      { id: 'ethereum', symbol: 'ETH', price: 2650.75, change: -1.23, volume: '1.8B', marketCap: '320B' },
      { id: 'cardano', symbol: 'ADA', price: 0.485, change: 5.67, volume: '890M', marketCap: '17B' },
      { id: 'solana', symbol: 'SOL', price: 98.25, change: 3.45, volume: '1.2B', marketCap: '42B' },
      { id: 'polkadot', symbol: 'DOT', price: 7.85, change: -0.89, volume: '450M', marketCap: '9.8B' },
      { id: 'chainlink', symbol: 'LINK', price: 15.20, change: 1.78, volume: '320M', marketCap: '8.9B' }
    ];
  }

  generateSampleData(symbol) {
    const basePrice = this.getBasePrice(symbol);
    const data = [];
    const now = new Date();
    
    for (let i = 99; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
      const change = (Math.random() - 0.5) * (basePrice * 0.02);
      const price = basePrice + change;
      
      data.push({
        timestamp,
        open: price,
        high: price * (1 + Math.random() * 0.01),
        low: price * (1 - Math.random() * 0.01),
        close: price,
        volume: Math.floor(Math.random() * 1000000) + 500000
      });
    }
    
    return data;
  }

  getBasePrice(symbol) {
    const prices = {
      'BTC': 43250,
      'ETH': 2650,
      'ADA': 0.485,
      'SOL': 98.25,
      'DOT': 7.85,
      'LINK': 15.20
    };
    return prices[symbol] || 100;
  }

  getFallbackEvents() {
    return [
      {
        id: 1,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        type: 'bitcoin',
        title: 'Bitcoin ETF Approval Expected Soon',
        description: 'Analysts predict SEC approval of spot Bitcoin ETF applications in the coming weeks...',
        impact: 'positive',
        asset: 'BTC',
        source: 'CryptoNews'
      },
      {
        id: 2,
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
        type: 'ethereum',
        title: 'Ethereum Layer 2 Solutions Gain Traction',
        description: 'Ethereum scaling solutions see increased adoption as gas fees remain high...',
        impact: 'positive',
        asset: 'ETH',
        source: 'DeFiPulse'
      }
    ];
  }
}

export default new LiveDataService(); 