import React from 'react';
import { Sprout, TrendingUp, Users, Gem } from 'lucide-react';

export const BenefitsCards: React.FC = () => {
  const cards = [
    { icon: Sprout, title: 'Qualidade de vida' },
    { icon: TrendingUp, title: 'Potencial de valorização' },
    { icon: Users, title: 'Segurança para sua família' },
    { icon: Gem, title: 'Investimento inteligente' },
  ];

  return (
    <section className="bg-[#031c11] py-8 px-4 md:px-8 border-t border-[#12412b]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {cards.map((card, idx) => {
            const IconComponent = card.icon;
            return (
              <div
                key={idx}
                className="bg-gradient-to-b from-[#07331f] to-[#042214] border-2 border-[#d4af37]/60 rounded-2xl p-5 sm:p-6 text-center flex flex-col items-center justify-center gap-3 shadow-[0_5px_20px_rgba(0,0,0,0.3)] hover:border-[#d4af37] transition-all transform hover:-translate-y-1"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#032215] border border-[#d4af37] flex items-center justify-center text-[#d4af37] shadow-inner">
                  <IconComponent className="w-7 h-7" />
                </div>
                <h3 className="text-white font-bold text-sm sm:text-base tracking-wide">
                  {card.title}
                </h3>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
