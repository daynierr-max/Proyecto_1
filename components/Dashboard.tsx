
import React, { useEffect, useState, useRef } from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { THEME } from '../constants';
import { PriceData } from '../types';
import { getSmartInsight } from '../services/geminiService';

interface Props {
  price: PriceData;
  dailyMin: number;
  dailyMax: number;
  isRefreshing?: boolean;
  pullProgress?: number;
}

type InfoMode = 'perUse' | 'perKwh' | 'validity';

const FadeTransitionItem = ({ children, timeout = 400, classNames = "fade", ...props }: any) => {
  const nodeRef = useRef(null);
  return (
    <CSSTransition
      {...props}
      nodeRef={nodeRef}
      timeout={timeout}
      classNames={classNames}
    >
      <div ref={nodeRef} className="absolute w-full flex flex-col items-center justify-center">
        {children}
      </div>
    </CSSTransition>
  );
};

const Dashboard: React.FC<Props> = ({ price, dailyMin, dailyMax, isRefreshing = false, pullProgress = 0 }) => {
  const [insight, setInsight] = useState("Analizando el mercado...");
  const [infoMode, setInfoMode] = useState<InfoMode>('perUse');
  const theme = THEME[price.level];

  useEffect(() => {
    const fetchInsight = async () => {
      const text = await getSmartInsight(price);
      setInsight(text);
    };
    fetchInsight();
  }, [price]);

  useEffect(() => {
    const modes: InfoMode[] = ['perUse', 'perKwh', 'validity'];
    const interval = setInterval(() => {
      setInfoMode((prev) => {
        const currentIndex = modes.indexOf(prev);
        return modes[(currentIndex + 1) % modes.length];
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleImpact = () => {
    if (isRefreshing || !window.navigator.vibrate) return;
    switch (price.level) {
      case 'low': window.navigator.vibrate([15, 30, 15]); break;
      case 'medium': window.navigator.vibrate(40); break;
      case 'high': window.navigator.vibrate([60, 40, 60, 40, 60]); break;
      default: window.navigator.vibrate(10);
    }
    const modes: InfoMode[] = ['perUse', 'perKwh', 'validity'];
    setInfoMode((prev) => {
      const currentIndex = modes.indexOf(prev);
      return modes[(currentIndex + 1) % modes.length];
    });
  };

  const renderRotatingContent = () => {
    if (isRefreshing) {
      return (
        <div className="flex flex-col items-center animate-pulse">
          <span className="text-[12px] font-bold tracking-[0.2em] opacity-60 uppercase mb-1">Actualizando</span>
          <span className="text-3xl font-bold">...</span>
        </div>
      );
    }

    switch (infoMode) {
      case 'perUse':
        return (
          <div className="flex flex-col items-center">
            <span className="text-5xl font-bold mt-1 tabular-nums">{(price.price * 1).toFixed(2)}€</span>
            <span className="text-[13px] opacity-60 font-medium">por ciclo medio</span>
          </div>
        );
      case 'perKwh':
        return (
          <div className="flex flex-col items-center">
            <span className="text-4xl font-bold mt-1 tabular-nums">{(price.price * 100).toFixed(1)}</span>
            <span className="text-[13px] opacity-60 font-medium">céntimos / kWh</span>
          </div>
        );
      case 'validity':
        return (
          <div className="flex flex-col items-center">
            <span className="text-3xl font-bold mt-1 tabular-nums">{price.hour}:00</span>
            <span className="text-[12px] opacity-60 font-medium text-center px-4">Hasta las {(price.hour + 1) % 24}:00</span>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col items-center justify-between min-h-full py-6 px-6 space-y-6">
      <div 
        onClick={handleImpact}
        className="relative flex items-center justify-center cursor-pointer transition-all duration-300"
        style={{ transform: `scale(${1 + (pullProgress * 0.1)})` }}
      >
        {/* Glow de fondo respirando */}
        <div className={`absolute w-60 h-60 rounded-full ${!isRefreshing ? 'animate-breathe' : ''} ${theme.bg} ${theme.glow} blur-3xl opacity-30`} />
        
        {/* Anillo de progreso / refresco */}
        <div className={`absolute w-64 h-64 rounded-full border-2 border-white/5 ${isRefreshing ? 'animate-spin border-t-white/40' : ''}`} 
             style={{ 
               opacity: isRefreshing || pullProgress > 0 ? 1 : 0,
               transform: !isRefreshing ? `rotate(${pullProgress * 360}deg)` : undefined 
             }} 
        />

        <div className={`
          w-56 h-56 rounded-full border-8 transition-all duration-500
          ${theme.bg.replace('bg-', 'border-')} 
          flex flex-col items-center justify-center z-10 
          bg-white/10 backdrop-blur-md shadow-inner
          ${isRefreshing ? 'scale-95' : ''}
        `}>
          <span className="text-[14px] font-medium tracking-wide opacity-70 uppercase mb-1">
            {isRefreshing ? 'REE' : theme.label}
          </span>
          
          <div className="relative w-full h-24 flex items-center justify-center overflow-hidden">
            <TransitionGroup component={null}>
              <FadeTransitionItem key={isRefreshing ? 'loading' : infoMode}>
                {renderRotatingContent()}
              </FadeTransitionItem>
            </TransitionGroup>
          </div>

          <div className="flex space-x-1.5 mt-4">
            {(['perUse', 'perKwh', 'validity'] as InfoMode[]).map((mode) => (
              <div 
                key={mode} 
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${infoMode === mode && !isRefreshing ? 'bg-white w-3' : 'bg-white/20'}`} 
              />
            ))}
          </div>
        </div>
      </div>

      <div className="text-center space-y-2 z-10 flex-grow flex flex-col justify-center w-full">
        <h1 className="text-3xl font-bold tracking-tight text-white">{isRefreshing ? 'Conectando...' : theme.message}</h1>
        <div className="relative h-20 w-full flex items-center justify-center px-4">
          <TransitionGroup component={null}>
            <FadeTransitionItem key={isRefreshing ? 'ref' : insight} timeout={800} classNames="insight">
              <p className="text-base text-white/60 leading-snug text-center italic">
                {isRefreshing ? "Obteniendo los precios más recientes de Red Eléctrica..." : `"${insight}"`}
              </p>
            </FadeTransitionItem>
          </TransitionGroup>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 w-full shrink-0">
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10 backdrop-blur-sm">
          <p className="text-[10px] text-white/40 mb-0.5 uppercase tracking-wider font-semibold">Mínimo Hoy</p>
          <p className="text-lg font-semibold text-green-400">{dailyMin.toFixed(2)}€</p>
        </div>
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10 backdrop-blur-sm">
          <p className="text-[10px] text-white/40 mb-0.5 uppercase tracking-wider font-semibold">Máximo Hoy</p>
          <p className="text-lg font-semibold text-red-400">{dailyMax.toFixed(2)}€</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
