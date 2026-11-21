import React from 'react';
import { MapPin, Coins, FileText, ShieldCheck } from 'lucide-react';

export const BenefitsBar: React.FC = () => {
  const benefits = [
    { icon: MapPin, text: 'Diversas localizações' },
    { icon: Coins, text: 'Condições especiais' },
    { icon: FileText, text: 'Negociação facilitada' },
    { icon: ShieldCheck, text: 'Compra segura' },
  ];

  return (
    <section className="relative w-full bg-[#032215] py-2 px-2 sm:px-6 -mt-6 sm:-mt-8 z-20">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-[#07331f] via-[#0b422a] to-[#07331f] border-2 border-[#d4af37] rounded-full py-2.5 px-2 sm:px-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <div className="flex flex-row items-center justify-between gap-1 sm:gap-2">
            {benefits.map((item, idx) => {
              const IconComponent = item.icon;
              return (
                <div key={idx} className="flex items-center gap-1 sm:gap-2 flex-1 justify-center px-0.5">
                  <div className="flex-shrink-0 w-7 h-7 sm:w-9 sm:h-9 rounded-full sm:rounded-xl bg-[#032215] border border-[#d4af37]/80 flex items-center justify-center text-[#d4af37] shadow-inner">
                    <IconComponent className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <span className="text-white font-bold text-[9px] sm:text-xs tracking-tighter sm:tracking-tight text-left leading-none sm:leading-tight">
                    {item.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
