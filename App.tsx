
import React, { useState, useEffect, useRef } from 'react';
import { LayoutGrid, Calculator, History, Settings, RefreshCw, AlertCircle } from 'lucide-react';
import { PriceData } from './types';
import { fetchTodayPrices } from './services/priceService';
import Dashboard from './components/Dashboard';
import Translator from './components/Translator';
import DynamicIsland from './components/DynamicIsland';

const PULL_THRESHOLD = 80;

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'calc' | 'history'>('home');
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [currentPrice, setCurrentPrice] = useState<PriceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const startY = useRef(0);
  const mainRef = useRef<HTMLDivElement>(null);

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setIsRefreshing(true);
    
    setError(null);
    try {
      const data = await fetchTodayPrices();
      setPrices(data);
      const currentHour = new Date().getHours();
      const found = data.find(p => p.hour === currentHour);
      setCurrentPrice(found || data[0]);
    } catch (err) {
      console.error("Critical fetch error:", err);
      setError('Sincronización limitada. Usando estimaciones.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
      setPullDistance(0);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3600000);
    return () => clearInterval(interval);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (activeTab !== 'home' || (mainRef.current && mainRef.current.scrollTop > 0)) return;
    startY.current = e.touches[0].pageY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (activeTab !== 'home' || (mainRef.current && mainRef.current.scrollTop > 0) || isRefreshing) return;
    const currentY = e.touches[0].pageY;
    const diff = currentY - startY.current;
    
    if (diff > 0) {
      // Resistencia elástica tipo iOS
      const dampenedDiff = Math.pow(diff, 0.85);
      setPullDistance(Math.min(dampenedDiff, 100));
      
      if (dampenedDiff > PULL_THRESHOLD && pullDistance <= PULL_THRESHOLD) {
        if (window.navigator.vibrate) window.navigator.vibrate(10);
      }
    }
  };

  const handleTouchEnd = () => {
    if (pullDistance > PULL_THRESHOLD) {
      loadData(true);
    } else {
      setPullDistance(0);
    }
  };

  if (loading && !currentPrice) {
    return (
      <div className="h-screen w-full bg-black flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="text-white/20 animate-spin" size={48} />
        <p className="text-white/40 font-medium animate-pulse tracking-wide uppercase text-[10px]">Cargando energía</p>
      </div>
    );
  }

  return (
    <div 
      className="relative h-screen w-full max-w-[430px] mx-auto bg-black text-white overflow-hidden shadow-2xl flex flex-col select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {currentPrice && <DynamicIsland price={currentPrice} />}

      {error && (
        <div className="absolute top-16 left-0 right-0 z-30 px-6">
          <div className="bg-orange-500/20 border border-orange-500/30 backdrop-blur-md rounded-xl p-2 flex items-center justify-center space-x-2">
            <AlertCircle size={14} className="text-orange-500" />
            <span className="text-[10px] font-medium text-orange-200 uppercase tracking-widest">{error}</span>
          </div>
        </div>
      )}

      <main 
        ref={mainRef}
        className="flex-1 overflow-y-auto pt-16 pb-24 transition-transform duration-200 ease-out"
        style={{ transform: `translateY(${pullDistance}px)` }}
      >
        {activeTab === 'home' && currentPrice && (
          <Dashboard 
            price={currentPrice} 
            dailyMin={prices.length ? Math.min(...prices.map(p => p.price)) : 0}
            dailyMax={prices.length ? Math.max(...prices.map(p => p.price)) : 0}
            isRefreshing={isRefreshing}
            pullProgress={pullDistance / PULL_THRESHOLD}
          />
        )}
        {activeTab === 'calc' && currentPrice && <Translator price={currentPrice} />}
        {activeTab === 'history' && (
          <div className="flex flex-col items-center justify-center h-full space-y-4 opacity-40 px-8 text-center">
            <History size={48} />
            <p className="italic text-sm">Historial disponible en 24h.</p>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 h-24 bg-black/40 ios-blur border-t border-white/10 px-8 pb-4 flex items-center justify-between z-40">
        <button 
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center space-y-1 transition-all ${activeTab === 'home' ? 'text-white' : 'text-white/40'}`}
        >
          <LayoutGrid size={24} className={activeTab === 'home' ? 'fill-current' : ''} />
          <span className="text-[10px] font-medium">Hoy</span>
        </button>
        <button 
          onClick={() => setActiveTab('calc')}
          className={`flex flex-col items-center space-y-1 transition-all ${activeTab === 'calc' ? 'text-white' : 'text-white/40'}`}
        >
          <Calculator size={24} className={activeTab === 'calc' ? 'fill-current' : ''} />
          <span className="text-[10px] font-medium">Traductor</span>
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center space-y-1 transition-all ${activeTab === 'history' ? 'text-white' : 'text-white/40'}`}
        >
          <History size={24} />
          <span className="text-[10px] font-medium">Evolución</span>
        </button>
        <button className="flex flex-col items-center space-y-1 text-white/40">
          <Settings size={24} />
          <span className="text-[10px] font-medium">Ajustes</span>
        </button>
      </nav>

      <div className="fixed bottom-2 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-white/20 rounded-full z-50 pointer-events-none" />
    </div>
  );
};

export default App;
