import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, ISeriesApi, CandlestickData } from 'lightweight-charts';
import { Candle, Marker } from '../lib/smcEngine';

interface ChartProps {
  data: Candle[];
  markers: Marker[];
}

export const TradingChart: React.FC<ChartProps> = ({ data, markers }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create the chart with options
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#09090b' },
        textColor: '#a1a1aa',
      },
      grid: {
        vertLines: { color: '#18181b' },
        horzLines: { color: '#18181b' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 500,
      timeScale: {
        borderColor: '#27272a',
        timeVisible: true,
      },
    });

    // Check if the expected function exists before calling
    if (typeof (chart as any).addCandlestickSeries !== 'function') {
      console.error('addCandlestickSeries is not a function on the chart object:', chart);
      return;
    }

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#f43f5e',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#f43f5e',
    });

    seriesRef.current = candlestickSeries;
    chartRef.current = chart;

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
        seriesRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (seriesRef.current && data.length > 0) {
      // Ensure data is in the correct format for lightweight-charts
      const formattedData: CandlestickData[] = data.map(item => ({
        time: item.time as any,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
      }));
      
      seriesRef.current.setData(formattedData);
      
      if (markers && markers.length > 0) {
        seriesRef.current.setMarkers(markers as any);
      }
    }
  }, [data, markers]);

  return (
    <div 
      ref={chartContainerRef} 
      className="w-full h-[500px] rounded-lg overflow-hidden border border-zinc-800" 
      id="trading-chart-container"
    />
  );
};
