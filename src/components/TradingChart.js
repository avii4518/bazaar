import React, { useMemo } from 'react';
import {
  ComposedChart,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart
} from 'recharts';
import { format } from 'date-fns';
import {
  calculateSMA,
  calculateEMA,
  calculateRSI,
  calculateBollingerBands,
  calculateMACD,
  calculateStochastic,
  calculateWilliamsR
} from '../utils/dataGenerator';

const TradingChart = ({ data, indicators, timeframe, asset }) => {
  const chartData = useMemo(() => {
    if (!data.length) return [];
    
    return data.map((item, index) => {
      const point = {
        ...item,
        time: format(item.timestamp, 'HH:mm'),
        date: format(item.timestamp, 'MMM dd'),
        sma: null,
        ema: null,
        rsi: null,
        bbUpper: null,
        bbLower: null,
        bbMiddle: null,
        macd: null,
        macdSignal: null,
        macdHistogram: null,
        stochasticK: null,
        stochasticD: null,
        williamsR: null
      };
      
      return point;
    });
  }, [data]);

  const indicatorData = useMemo(() => {
    if (!data.length) return { 
      sma: [], 
      ema: [], 
      rsi: [], 
      bollinger: {},
      macd: {},
      stochastic: {},
      williamsR: []
    };
    
    const sma = calculateSMA(data, 20);
    const ema = calculateEMA(data, 20);
    const rsi = calculateRSI(data, 14);
    const bollinger = calculateBollingerBands(data, 20, 2);
    const macd = calculateMACD(data, 12, 26, 9);
    const stochastic = calculateStochastic(data, 14, 3);
    const williamsR = calculateWilliamsR(data, 14);
    
    return { sma, ema, rsi, bollinger, macd, stochastic, williamsR };
  }, [data]);

  const finalData = useMemo(() => {
    return chartData.map((item, index) => ({
      ...item,
      sma: indicatorData.sma[index],
      ema: indicatorData.ema[index],
      rsi: indicatorData.rsi[index],
      bbUpper: indicatorData.bollinger.upper?.[index],
      bbLower: indicatorData.bollinger.lower?.[index],
      bbMiddle: indicatorData.bollinger.middle?.[index],
      macd: indicatorData.macd.macd?.[index],
      macdSignal: indicatorData.macd.signal?.[index],
      macdHistogram: indicatorData.macd.histogram?.[index],
      stochasticK: indicatorData.stochastic.k?.[index],
      stochasticD: indicatorData.stochastic.d?.[index],
      williamsR: indicatorData.williamsR[index]
    }));
  }, [chartData, indicatorData]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="tooltip-time">{data.date} {data.time}</p>
          <p className="tooltip-price">
            <span>O: ${data.open?.toFixed(2)}</span>
            <span>H: ${data.high?.toFixed(2)}</span>
            <span>L: ${data.low?.toFixed(2)}</span>
            <span>C: ${data.close?.toFixed(2)}</span>
          </p>
          <p className="tooltip-volume">Volume: {data.volume?.toLocaleString()}</p>
          {indicators.includes('sma') && data.sma && (
            <p className="tooltip-indicator">SMA: ${data.sma?.toFixed(2)}</p>
          )}
          {indicators.includes('ema') && data.ema && (
            <p className="tooltip-indicator">EMA: ${data.ema?.toFixed(2)}</p>
          )}
          {indicators.includes('rsi') && data.rsi && (
            <p className="tooltip-indicator">RSI: {data.rsi?.toFixed(1)}</p>
          )}
          {indicators.includes('macd') && data.macd && (
            <div className="tooltip-macd">
              <p className="tooltip-indicator">MACD: {data.macd?.toFixed(2)}</p>
              <p className="tooltip-indicator">Signal: {data.macdSignal?.toFixed(2)}</p>
              <p className="tooltip-indicator">Histogram: {data.macdHistogram?.toFixed(2)}</p>
            </div>
          )}
          {indicators.includes('bollinger') && data.bbUpper && (
            <div className="tooltip-bollinger">
              <p className="tooltip-indicator">BB Upper: ${data.bbUpper?.toFixed(2)}</p>
              <p className="tooltip-indicator">BB Middle: ${data.bbMiddle?.toFixed(2)}</p>
              <p className="tooltip-indicator">BB Lower: ${data.bbLower?.toFixed(2)}</p>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  if (!data.length) {
    return (
      <div className="trading-chart">
        <div className="chart-container">
          <div className="chart-placeholder">
            <div className="placeholder-icon">📈</div>
            <p>Loading chart data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="trading-chart">
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={finalData}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6b7280" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#6b7280" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="rgba(59, 130, 246, 0.1)" 
              strokeWidth={0.5}
            />
            <XAxis 
              dataKey="time" 
              stroke="rgba(156, 163, 175, 0.6)"
              fontSize={9}
              interval="preserveStartEnd"
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="rgba(156, 163, 175, 0.6)"
              fontSize={9}
              domain={['dataMin - 5', 'dataMax + 5']}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value.toFixed(0)}`}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Price area with gradient */}
            <Area
              type="monotone"
              dataKey="close"
              stroke="none"
              fill="url(#priceGradient)"
              fillOpacity={0.3}
            />
            
            {/* Price line */}
            <Line
              type="monotone"
              dataKey="close"
              stroke="#3b82f6"
              strokeWidth={2.5}
              dot={false}
              name="Price"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Bollinger Bands */}
            {indicators.includes('bollinger') && (
              <>
                <Area
                  type="monotone"
                  dataKey="bbUpper"
                  stroke="none"
                  fill="rgba(16, 185, 129, 0.1)"
                  fillOpacity={0.2}
                />
                <Line
                  type="monotone"
                  dataKey="bbUpper"
                  stroke="rgba(16, 185, 129, 0.6)"
                  strokeWidth={1}
                  dot={false}
                  name="BB Upper"
                  strokeDasharray="3 3"
                />
                <Line
                  type="monotone"
                  dataKey="bbLower"
                  stroke="rgba(16, 185, 129, 0.6)"
                  strokeWidth={1}
                  dot={false}
                  name="BB Lower"
                  strokeDasharray="3 3"
                />
                <Line
                  type="monotone"
                  dataKey="bbMiddle"
                  stroke="rgba(107, 114, 128, 0.8)"
                  strokeWidth={1}
                  dot={false}
                  name="BB Middle"
                />
              </>
            )}
            
            {/* Indicators */}
            {indicators.includes('sma') && (
              <Line
                type="monotone"
                dataKey="sma"
                stroke="#f59e0b"
                strokeWidth={1.5}
                dot={false}
                name="SMA"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            
            {indicators.includes('ema') && (
              <Line
                type="monotone"
                dataKey="ema"
                stroke="#8b5cf6"
                strokeWidth={1.5}
                dot={false}
                name="EMA"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      
      {/* Volume Chart */}
      <div className="volume-chart">
        <ResponsiveContainer width="100%" height={50}>
          <BarChart data={finalData}>
            <defs>
              <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6b7280" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="#6b7280" stopOpacity={0.2}/>
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="rgba(59, 130, 246, 0.05)" 
              strokeWidth={0.5}
            />
            <XAxis 
              dataKey="time" 
              stroke="rgba(156, 163, 175, 0.4)"
              fontSize={7}
              interval="preserveStartEnd"
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="rgba(156, 163, 175, 0.4)"
              fontSize={7}
              hide
            />
            <Bar 
              dataKey="volume" 
              fill="url(#volumeGradient)"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* RSI Chart */}
      {indicators.includes('rsi') && (
        <div className="rsi-chart">
          <ResponsiveContainer width="100%" height={60}>
            <LineChart data={finalData}>
              <defs>
                <linearGradient id="rsiGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="rgba(59, 130, 246, 0.05)" 
                strokeWidth={0.5}
              />
              <XAxis 
                dataKey="time" 
                stroke="rgba(156, 163, 175, 0.4)"
                fontSize={7}
                interval="preserveStartEnd"
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="rgba(156, 163, 175, 0.4)"
                fontSize={7}
                domain={[0, 100]}
                tickLine={false}
                axisLine={false}
              />
              <Area
                type="monotone"
                dataKey="rsi"
                stroke="none"
                fill="url(#rsiGradient)"
                fillOpacity={0.3}
              />
              <Line
                type="monotone"
                dataKey="rsi"
                stroke="#ec4899"
                strokeWidth={1.5}
                dot={false}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <ReferenceLine y={70} stroke="rgba(239, 68, 68, 0.6)" strokeDasharray="3 3" strokeWidth={1} />
              <ReferenceLine y={30} stroke="rgba(34, 197, 94, 0.6)" strokeDasharray="3 3" strokeWidth={1} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      
      {/* MACD Chart */}
      {indicators.includes('macd') && (
        <div className="macd-chart">
          <ResponsiveContainer width="100%" height={80}>
            <ComposedChart data={finalData}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="rgba(59, 130, 246, 0.05)" 
                strokeWidth={0.5}
              />
              <XAxis 
                dataKey="time" 
                stroke="rgba(156, 163, 175, 0.4)"
                fontSize={7}
                interval="preserveStartEnd"
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="rgba(156, 163, 175, 0.4)"
                fontSize={7}
                tickLine={false}
                axisLine={false}
              />
              <Bar 
                dataKey="macdHistogram" 
                fill="rgba(6, 182, 212, 0.6)"
                radius={[1, 1, 0, 0]}
              />
              <Line
                type="monotone"
                dataKey="macd"
                stroke="#06b6d4"
                strokeWidth={1.5}
                dot={false}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Line
                type="monotone"
                dataKey="macdSignal"
                stroke="#f59e0b"
                strokeWidth={1.5}
                dot={false}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <ReferenceLine y={0} stroke="rgba(156, 163, 175, 0.4)" strokeWidth={1} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
      
      {/* Stochastic Chart */}
      {indicators.includes('stochastic') && (
        <div className="stochastic-chart">
          <ResponsiveContainer width="100%" height={60}>
            <LineChart data={finalData}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="rgba(59, 130, 246, 0.05)" 
                strokeWidth={0.5}
              />
              <XAxis 
                dataKey="time" 
                stroke="rgba(156, 163, 175, 0.4)"
                fontSize={7}
                interval="preserveStartEnd"
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="rgba(156, 163, 175, 0.4)"
                fontSize={7}
                domain={[0, 100]}
                tickLine={false}
                axisLine={false}
              />
              <Line
                type="monotone"
                dataKey="stochasticK"
                stroke="#8b5cf6"
                strokeWidth={1.5}
                dot={false}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Line
                type="monotone"
                dataKey="stochasticD"
                stroke="#f59e0b"
                strokeWidth={1.5}
                dot={false}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <ReferenceLine y={80} stroke="rgba(239, 68, 68, 0.6)" strokeDasharray="3 3" strokeWidth={1} />
              <ReferenceLine y={20} stroke="rgba(34, 197, 94, 0.6)" strokeDasharray="3 3" strokeWidth={1} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default TradingChart; 