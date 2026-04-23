/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  TrendingDown, 
  Bell, 
  Target, 
  ShieldAlert, 
  Zap, 
  BarChart3, 
  Activity,
  ChevronRight,
  BrainCircuit,
  Binary
} from 'lucide-react';
import { TradingChart } from './components/TradingChart';
import { Candle, analyzeSMC, StructureSignal } from './lib/smcEngine';
import { analyzeMarketStructure } from './lib/gemini';
import { format } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Simulated data generation
const generateSimulatedData = (count: number): Candle[] => {
  const data: Candle[] = [];
  let price = 1.0850;
  const now = Math.floor(Date.now() / 1000);
  
  for (let i = 0; i < count; i++) {
    const open = price;
    const change = (Math.random() - 0.5) * 0.0020;
    const high = open + Math.abs(change) + Math.random() * 0.0005;
    const low = open - Math.abs(change) - Math.random() * 0.0005;
    const close = open + change;
    
    data.push({
      time: now - (count - i) * 900, // 15m intervals
      open,
      high,
      low,
      close
    });
    price = close;
  }
  return data;
};

export default function App() {
  const [activeAsset, setActiveAsset] = useState('EUR/USD');
  const [data, setData] = useState<Candle[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLive, setIsLive] = useState(true);

  // Initial historic data load
  useEffect(() => {
    setData(generateSimulatedData(60));
  }, [activeAsset]);

  // Real-time update loop
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setData(currentData => {
        if (currentData.length === 0) return currentData;
        
        const lastCandle = currentData[currentData.length - 1];
        const nextPrice = lastCandle.close + (Math.random() - 0.5) * 0.0004;
        
        // Update the current candle (simulating internal price action)
        const updatedLastCandle = {
          ...lastCandle,
          close: nextPrice,
          high: Math.max(lastCandle.high, nextPrice),
          low: Math.min(lastCandle.low, nextPrice)
        };

        // Every 20 ticks, simulate a new 15m candle close
        // In a real app, this would happen every 15 minutes
        const shouldClose = Math.random() > 0.92;
        
        if (shouldClose) {
          const newCandle: Candle = {
            time: (lastCandle.time as number) + 900,
            open: nextPrice,
            high: nextPrice + Math.random() * 0.0002,
            low: nextPrice - Math.random() * 0.0002,
            close: nextPrice
          };
          return [...currentData.slice(-100), newCandle];
        }

        return [...currentData.slice(0, -1), updatedLastCandle];
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isLive, activeAsset]);

  const { markers, signals } = useMemo(() => analyzeSMC(data), [data]);
  const latestSignal = signals[signals.length - 1];

  // Auto-trigger AI Analysis when a new signal appears
  useEffect(() => {
    if (latestSignal && !isAnalyzing) {
       // Optional: Auto-trigger or just keep UI updated
    }
  }, [latestSignal]);

  const handleAiAnalyze = async () => {
    setIsAnalyzing(true);
    const result = await analyzeMarketStructure(activeAsset, signals);
    setAiAnalysis(result || '');
    setIsAnalyzing(false);
  };

  const assets = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'XAU/USD'];

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans p-6 lg:p-10 flex flex-col">
      {/* Header Section */}
      <header className="flex justify-between items-start mb-12 border-b border-zinc-900 pb-8">
        <div className="space-y-1">
          <h1 className="text-7xl font-black tracking-tighter leading-none italic font-display">FX.CORE</h1>
          <p className="text-[10px] tracking-mega font-bold text-emerald-500 uppercase">Institutional Orderflow Engine</p>
        </div>
        <div className="text-right hidden md:block">
          <div className="text-[10px] text-zinc-500 tracking-widest uppercase mb-1 font-mono flex items-center justify-end gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Live Protocol
          </div>
          <div className="text-2xl font-mono font-bold leading-none text-emerald-400">STREAMING v.3.1</div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 grid grid-cols-12 gap-10">
        
        {/* Left Column: Priority Signal & Analysis */}
        <section className="col-span-12 lg:col-span-8 flex flex-col gap-10">
          
          {/* Signal Hero Card */}
          <div className="bg-zinc-900/30 border-l-8 border-emerald-500 p-8 flex flex-col justify-between relative overflow-hidden backdrop-blur-sm shadow-2xl">
            <div className="absolute top-0 right-0 p-4 opacity-10">
               <TrendingUp className="w-32 h-32 scale-150 rotate-12" />
            </div>
            <div className="flex items-center gap-4 mb-6">
              <span className="px-3 py-1 bg-emerald-500 text-black font-black text-[10px] uppercase tracking-wider">Active Analysis</span>
              <span className="text-zinc-500 text-[10px] font-mono tracking-widest uppercase">M15 TIMEFRAME • SMART MONEY CONCEPTS</span>
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-baseline mb-8 gap-4">
              <h2 className="text-[140px] font-black leading-none tracking-tighter italic font-display -ml-1 text-white">
                {activeAsset.split('/')[0]}
                <span className="text-zinc-700 text-6xl italic not-italic">/{activeAsset.split('/')[1]}</span>
              </h2>
              <div className="flex flex-col items-end">
                <span className={cn(
                  "text-5xl font-black italic tracking-tighter",
                  latestSignal?.direction === 'Bullish' ? "text-emerald-500" : "text-rose-600"
                )}>
                  {latestSignal?.direction === 'Bullish' ? 'LONG' : 'SHORT'}
                </span>
                <span className="text-zinc-500 font-mono text-xs mt-1 uppercase tracking-widest">Market Bias</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-4 border-t border-zinc-800 pt-8">
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2 font-mono italic">Entry Point</p>
                <p className="text-5xl font-mono font-bold tracking-tighter italic">
                  {data[data.length-1]?.close.toFixed(5)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-emerald-500 uppercase tracking-widest mb-2 font-mono italic">Expansion Target</p>
                <p className="text-5xl font-mono font-bold text-emerald-400 tracking-tighter italic">
                  {(latestSignal?.price * (latestSignal?.direction === 'Bullish' ? 1.002 : 0.998)).toFixed(5) || '1.08900'}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2 font-mono italic">Asset Select</p>
                <div className="flex gap-2">
                  {assets.map(a => (
                    <button 
                      key={a}
                      onClick={() => setActiveAsset(a)}
                      className={cn(
                        "font-mono text-xs border border-zinc-800 px-2 py-1 transition-all",
                        activeAsset === a ? "bg-white text-black border-white" : "hover:bg-zinc-800"
                      )}
                    >
                      {a.split('/')[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Chart Section */}
          <div className="bg-zinc-900 shadow-2xl p-2 border border-zinc-800">
            <TradingChart data={data} markers={markers} />
          </div>

          {/* AI Reasoning Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-zinc-900/50 p-8 border-t border-emerald-500/30">
              <div className="flex items-center justify-between mb-6">
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">AI Reasoning Engine</p>
                <button onClick={handleAiAnalyze} disabled={isAnalyzing} className="text-emerald-500 hover:text-emerald-400 flex items-center gap-2">
                  <Zap className={cn("w-4 h-4", isAnalyzing && "animate-pulse")} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Execute Scan</span>
                </button>
              </div>
              <div className="min-h-[100px]">
                {isAnalyzing ? (
                  <div className="space-y-3">
                    <div className="h-2 bg-emerald-500/10 rounded w-full animate-pulse" />
                    <div className="h-2 bg-emerald-500/10 rounded w-5/6 animate-pulse" />
                  </div>
                ) : (
                  <p className="text-sm border-l-2 border-emerald-900 pl-4 py-2 text-zinc-400 italic">
                    {aiAnalysis || "Aguardando inicialização do motor de inferência..."}
                  </p>
                )}
              </div>
            </div>

            <div className="bg-[#10b981] p-8 text-black flex flex-col justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest mb-1">Structure Integrity</p>
                <p className="text-4xl font-black italic tracking-tighter">SECURED</p>
              </div>
              <div className="flex gap-2 mt-4">
                <span className="text-[10px] font-black uppercase p-1 bg-black text-white px-2">BOS Detected</span>
                <span className="text-[10px] font-black uppercase p-1 bg-black/10 border border-black/20 px-2">SMC v4.5</span>
              </div>
            </div>
          </div>

        </section>

        {/* Right Column: Signal Feed */}
        <aside className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <div className="bg-zinc-900/40 border-t border-white/5 flex flex-col flex-1 max-h-[900px]">
             <div className="p-8 border-b border-zinc-800">
               <h3 className="text-xs font-black text-zinc-500 uppercase tracking-mega">Orderflow Feed</h3>
             </div>
             
             <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                <AnimatePresence mode='popLayout'>
                  {signals.slice().reverse().map((signal, idx) => (
                    <motion.div 
                      key={`${signal.time}-${idx}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="group block border-b border-zinc-800 pb-6 hover:border-emerald-500/50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className={cn(
                          "text-xl font-bold tracking-tighter uppercase italic",
                          signal.direction === 'Bullish' ? "text-emerald-500" : "text-rose-500"
                        )}>
                          {signal.type}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-600 italic">
                          {format(new Date((signal.time as number) * 1000), 'HH:mm')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-black italic tracking-wide text-zinc-400 underline decoration-emerald-500/30">
                          {activeAsset}
                        </span>
                        <span className="text-xs font-mono font-bold">{signal.price.toFixed(5)}</span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
             </div>

             <div className="p-8 bg-emerald-500 text-black">
                <p className="text-[10px] font-black uppercase tracking-widest mb-1">Signal Intensity</p>
                <p className="text-5xl font-black italic tracking-tighter leading-none">HIGH_VOL</p>
                <div className="mt-4 h-1.5 bg-black/20 w-full rounded-full overflow-hidden">
                  <div className="h-full bg-black w-[85%]" />
                </div>
             </div>
          </div>
        </aside>
      </main>

      {/* Footer Section */}
      <footer className="mt-12 flex flex-col md:flex-row justify-between items-center border-t border-zinc-900 pt-8 pb-4">
        <div className="flex gap-12 text-[10px] font-black text-zinc-600 tracking-widest uppercase mb-4 md:mb-0">
          <div>Status: <span className="text-emerald-400">Core ONLINE</span></div>
          <div>Volatility: <span className="text-white italic">Aggressive</span></div>
          <div>Engine: <span className="text-white italic font-mono uppercase">smc_PRO_v3</span></div>
        </div>
        <div className="text-[10px] text-zinc-800 font-mono italic tracking-tighter">
          © 2024 FX.CORE PRO PRIETARY SYSTEMS • INSTITUTIONAL GRADE TRADING
        </div>
      </footer>
    </div>
  );
}
