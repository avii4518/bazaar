// Generate realistic sample trading data
export const generateSampleData = (basePrice = 150) => {
  const data = [];
  const now = new Date();
  let currentPrice = basePrice;
  
  // Generate 100 data points
  for (let i = 99; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000); // Hourly data
    
    // Add some realistic price movement
    const change = (Math.random() - 0.5) * (basePrice * 0.02); // 2% max change
    currentPrice += change;
    
    // Generate OHLC data
    const open = currentPrice;
    const high = open + Math.random() * (basePrice * 0.01);
    const low = open - Math.random() * (basePrice * 0.01);
    const close = open + (Math.random() - 0.5) * (basePrice * 0.005);
    const volume = Math.floor(Math.random() * 1000000) + 500000;
    
    data.push({
      timestamp,
      open: parseFloat(open.toFixed(4)),
      high: parseFloat(high.toFixed(4)),
      low: parseFloat(low.toFixed(4)),
      close: parseFloat(close.toFixed(4)),
      volume
    });
  }
  
  return data;
};

// Calculate Simple Moving Average
export const calculateSMA = (data, period = 20) => {
  const sma = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      sma.push(null);
    } else {
      const sum = data.slice(i - period + 1, i + 1).reduce((acc, point) => acc + point.close, 0);
      sma.push(parseFloat((sum / period).toFixed(2)));
    }
  }
  return sma;
};

// Calculate Exponential Moving Average
export const calculateEMA = (data, period = 20) => {
  const ema = [];
  const multiplier = 2 / (period + 1);
  
  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      ema.push(data[i].close);
    } else {
      const newEMA = (data[i].close * multiplier) + (ema[i - 1] * (1 - multiplier));
      ema.push(parseFloat(newEMA.toFixed(2)));
    }
  }
  return ema;
};

// Calculate RSI
export const calculateRSI = (data, period = 14) => {
  const rsi = [];
  const gains = [];
  const losses = [];
  
  for (let i = 1; i < data.length; i++) {
    const change = data[i].close - data[i - 1].close;
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }
  
  for (let i = 0; i < data.length; i++) {
    if (i < period) {
      rsi.push(null);
    } else {
      const avgGain = gains.slice(i - period, i).reduce((a, b) => a + b, 0) / period;
      const avgLoss = losses.slice(i - period, i).reduce((a, b) => a + b, 0) / period;
      const rs = avgGain / avgLoss;
      const rsiValue = 100 - (100 / (1 + rs));
      rsi.push(parseFloat(rsiValue.toFixed(2)));
    }
  }
  
  return rsi;
};

// Calculate MACD
export const calculateMACD = (data, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) => {
  const fastEMA = calculateEMA(data, fastPeriod);
  const slowEMA = calculateEMA(data, slowPeriod);
  
  const macdLine = fastEMA.map((fast, i) => {
    if (fast === null || slowEMA[i] === null) return null;
    return parseFloat((fast - slowEMA[i]).toFixed(2));
  });
  
  const signalLine = calculateEMA(macdLine.filter(val => val !== null), signalPeriod);
  const histogram = macdLine.map((macd, i) => {
    if (macd === null || signalLine[i] === null) return null;
    return parseFloat((macd - signalLine[i]).toFixed(2));
  });
  
  return {
    macd: macdLine,
    signal: signalLine,
    histogram: histogram
  };
};

// Calculate Bollinger Bands
export const calculateBollingerBands = (data, period = 20, stdDev = 2) => {
  const sma = calculateSMA(data, period);
  const upper = [];
  const lower = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      upper.push(null);
      lower.push(null);
    } else {
      const slice = data.slice(i - period + 1, i + 1);
      const mean = sma[i];
      const variance = slice.reduce((acc, point) => acc + Math.pow(point.close - mean, 2), 0) / period;
      const standardDeviation = Math.sqrt(variance);
      
      upper.push(parseFloat((mean + (stdDev * standardDeviation)).toFixed(2)));
      lower.push(parseFloat((mean - (stdDev * standardDeviation)).toFixed(2)));
    }
  }
  
  return { upper, lower, middle: sma };
};

// Calculate Stochastic Oscillator
export const calculateStochastic = (data, kPeriod = 14, dPeriod = 3) => {
  const kValues = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i < kPeriod - 1) {
      kValues.push(null);
    } else {
      const slice = data.slice(i - kPeriod + 1, i + 1);
      const highestHigh = Math.max(...slice.map(point => point.high));
      const lowestLow = Math.min(...slice.map(point => point.low));
      const currentClose = data[i].close;
      
      const kValue = ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100;
      kValues.push(parseFloat(kValue.toFixed(2)));
    }
  }
  
  const dValues = calculateSMA(kValues.filter(val => val !== null), dPeriod);
  
  return { k: kValues, d: dValues };
};

// Calculate Williams %R
export const calculateWilliamsR = (data, period = 14) => {
  const williamsR = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      williamsR.push(null);
    } else {
      const slice = data.slice(i - period + 1, i + 1);
      const highestHigh = Math.max(...slice.map(point => point.high));
      const lowestLow = Math.min(...slice.map(point => point.low));
      const currentClose = data[i].close;
      
      const rValue = ((highestHigh - currentClose) / (highestHigh - lowestLow)) * -100;
      williamsR.push(parseFloat(rValue.toFixed(2)));
    }
  }
  
  return williamsR;
}; 