
import React from 'react';
import { APPLIANCES } from '../constants';
import { PriceData } from '../types';

interface Props {
  price: PriceData;
}

const Translator: React.FC<Props> = ({ price }) => {
  return (
    <div className="flex flex-col h-full px-6 pt-12">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Calculadora</h2>
        <p className="text-white/50">¿Cuánto cuesta usar tus electrodomésticos ahora?</p>
      </div>

      <div className="space-y-4 overflow-y-auto pb-32">
        {APPLIANCES.map((app) => {
          const cost = (app.avgConsumption * price.price).toFixed(2);
          return (
            <div 
              key={app.id}
              className="group bg-white/5 active:bg-white/10 p-5 rounded-3xl border border-white/10 flex items-center justify-between transition-all"
            >
              <div className="flex items-center space-x-4">
                <div className="text-3xl bg-white/10 w-14 h-14 flex items-center justify-center rounded-2xl">
                  {app.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{app.name}</h3>
                  <p className="text-xs text-white/40">{app.description}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">{cost}€</p>
                <p className="text-[10px] text-white/30 font-medium">COSTE ESTIMADO</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Translator;
