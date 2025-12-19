
import React, { useState, useEffect } from 'react';
import { TrendingDown, TrendingUp, Zap } from 'lucide-react';
import { PriceData } from '../types';

interface Props {
  price: PriceData;
}

const DynamicIsland: React.FC<Props> = ({ price }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsExpanded(false), 3000);
    return () => clearTimeout(timer);
  }, [price]);

  return (
    <div className="fixed top-2 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className={`
          pointer-events-auto cursor-pointer
          bg-black text-white 
          transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
          flex items-center justify-between px-4
          ${isExpanded ? 'w-[350px] h-[160px] rounded-[40px] pt-4 flex-col' : 'w-[126px] h-[37px] rounded-full'}
        `}
      >
        {!isExpanded ? (
          <>
            <Zap size={14} className="text-yellow-400 fill-yellow-400" />
            <span className="text-[13px] font-semibold">{(price.price * 1).toFixed(2)}€/uso</span>
            {price.level === 'low' ? <TrendingDown size={14} className="text-green-400" /> : <TrendingUp size={14} className="text-red-400" />}
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center space-y-2 opacity-100 transition-opacity">
            <div className="flex items-center space-x-3 w-full justify-center">
              <div className={`w-3 h-3 rounded-full ${price.level === 'low' ? 'bg-green-500' : price.level === 'high' ? 'bg-red-500' : 'bg-orange-500'}`} />
              <span className="text-sm font-medium">Estado de la Red</span>
            </div>
            <div className="text-3xl font-bold">{(price.price * 100).toFixed(0)} cént/kWh</div>
            <div className="text-[12px] opacity-60">Siguiente cambio a las {(price.hour + 1) % 24}:00</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DynamicIsland;
