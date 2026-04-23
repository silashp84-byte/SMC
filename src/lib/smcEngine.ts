/**
 * SMC Engine for Forex Analysis
 * Analyzes market structure (BOS, CHOCH) and Liquidity Captures.
 */

export interface Candle {
  time: string | number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface Marker {
  time: string | number;
  position: 'aboveBar' | 'belowBar' | 'inBar';
  color: string;
  shape: 'arrowUp' | 'arrowDown' | 'circle' | 'square';
  text: string;
}

export interface StructureSignal {
  type: 'BOS' | 'CHOCH' | 'Liquidity Capture';
  direction: 'Bullish' | 'Bearish';
  price: number;
  time: string | number;
}

export function analyzeSMC(data: Candle[]): { markers: Marker[], signals: StructureSignal[] } {
  if (data.length < 5) return { markers: [], signals: [] };

  const markers: Marker[] = [];
  const signals: StructureSignal[] = [];

  let lastHigh = data[0].high;
  let lastLow = data[0].low;
  let trend: 'Bullish' | 'Bearish' | 'Neutral' = 'Neutral';

  for (let i = 2; i < data.length; i++) {
    const current = data[i];
    const prev = data[i-1];

    // Detect Liquidity Capture (Fakey / Sweep)
    // Bullish Sweep: Price goes below a significant low then closes above
    if (current.low < lastLow && current.close > lastLow) {
      markers.push({
        time: current.time,
        position: 'belowBar',
        color: '#facc15', // Yellow
        shape: 'circle',
        text: 'Liq Sweep'
      });
      signals.push({
        type: 'Liquidity Capture',
        direction: 'Bullish',
        price: current.low,
        time: current.time
      });
    }

    // Detect Break of Structure (BOS)
    if (trend === 'Bullish' && current.close > lastHigh) {
      markers.push({
        time: current.time,
        position: 'aboveBar',
        color: '#22c55e', // Green
        shape: 'arrowUp',
        text: 'BOS'
      });
      signals.push({
        type: 'BOS',
        direction: 'Bullish',
        price: current.high,
        time: current.time
      });
      lastHigh = current.high;
    } else if (trend === 'Bearish' && current.close < lastLow) {
       markers.push({
        time: current.time,
        position: 'belowBar',
        color: '#ef4444', // Red
        shape: 'arrowDown',
        text: 'BOS'
      });
       signals.push({
        type: 'BOS',
        direction: 'Bearish',
        price: current.low,
        time: current.time
      });
      lastLow = current.low;
    }

    // Initial Trend Detection / CHOCH (Change of Character)
    if (trend === 'Neutral') {
      if (current.close > lastHigh) trend = 'Bullish';
      if (current.close < lastLow) trend = 'Bearish';
    } else if (trend === 'Bearish' && current.close > lastHigh) {
      trend = 'Bullish';
      markers.push({
        time: current.time,
        position: 'aboveBar',
        color: '#3b82f6', // Blue
        shape: 'arrowUp',
        text: 'CHOCH'
      });
      signals.push({
        type: 'CHOCH',
        direction: 'Bullish',
        price: current.high,
        time: current.time
      });
    } else if (trend === 'Bullish' && current.close < lastLow) {
      trend = 'Bearish';
       markers.push({
        time: current.time,
        position: 'belowBar',
        color: '#ec4899', // Pink
        shape: 'arrowDown',
        text: 'CHOCH'
      });
       signals.push({
        type: 'CHOCH',
        direction: 'Bearish',
        price: current.low,
        time: current.time
      });
    }

    // Update swing points (simplified)
    if (current.high > lastHigh) lastHigh = current.high;
    if (current.low < lastLow) lastLow = current.low;
  }

  return { markers, signals };
}
