import React from 'react';

const GoldGradientDefs = () => (
  <svg width="0" height="0" className="absolute pointer-events-none" aria-hidden="true">
    <defs>
      <linearGradient id="bf-gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="45%" stopColor="#facc15" />
        <stop offset="100%" stopColor="#b47e12" />
      </linearGradient>
    </defs>
  </svg>
);

const LeafIcon = () => (
  <svg viewBox="0 0 48 48" className="w-7 h-7 sm:w-10 sm:h-10 md:w-11 md:h-11 drop-shadow-[0_2px_8px_rgba(250,204,21,0.4)]">
    <path
      fill="url(#bf-gold-grad)"
      d="M24 38V24m0 0C24 14 33 9 42 10c1 9-4 18-14 18-1.5 0-3-.2-4-.6M24 26C24 17 16 11 6 12c-1 9 4 17 14 17 1.5 0 2.8-.2 4-.6"
      stroke="url(#bf-gold-grad)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M24 27c4-5 10-9 16-12M24 27c-4-5-9-8-15-10"
      stroke="#042a17"
      strokeWidth="1.6"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

const ChartIcon = () => (
  <svg viewBox="0 0 48 48" className="w-7 h-7 sm:w-10 sm:h-10 md:w-11 md:h-11 drop-shadow-[0_2px_8px_rgba(250,204,21,0.4)]">
    <rect x="8" y="30" width="6" height="9" rx="1" fill="url(#bf-gold-grad)" />
    <rect x="17" y="25" width="6" height="14" rx="1" fill="url(#bf-gold-grad)" />
    <rect x="26" y="20" width="6" height="19" rx="1" fill="url(#bf-gold-grad)" />
    <rect x="35" y="15" width="6" height="24" rx="1" fill="url(#bf-gold-grad)" />
    <path
      d="M8 23c9-1 19-6 29-14m0 0h-8m8 0v8"
      stroke="url(#bf-gold-grad)"
      strokeWidth="3.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

const FamilyIcon = () => (
  <svg viewBox="0 0 48 48" className="w-7 h-7 sm:w-10 sm:h-10 md:w-11 md:h-11 drop-shadow-[0_2px_8px_rgba(250,204,21,0.4)]" fill="none">
    <circle cx="24" cy="13" r="4.2" stroke="url(#bf-gold-grad)" strokeWidth="2.8" />
    <circle cx="13" cy="17" r="3.4" stroke="url(#bf-gold-grad)" strokeWidth="2.6" />
    <circle cx="35" cy="17" r="3.4" stroke="url(#bf-gold-grad)" strokeWidth="2.6" />
    <path
      d="M17.5 37V26.5c0-3.3 2.9-6 6.5-6s6.5 2.7 6.5 6V37"
      stroke="url(#bf-gold-grad)"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <path
      d="M8.5 36v-6.5c0-2.8 2-5 4.5-5 1.8 0 3.3 1 4 2.5M39.5 36v-6.5c0-2.8-2-5-4.5-5-1.8 0-3.3 1-4 2.5"
      stroke="url(#bf-gold-grad)"
      strokeWidth="2.8"
      strokeLinecap="round"
    />
  </svg>
);

const DiamondIcon = () => (
  <svg viewBox="0 0 48 48" className="w-7 h-7 sm:w-10 sm:h-10 md:w-11 md:h-11 drop-shadow-[0_2px_8px_rgba(250,204,21,0.4)]" fill="none">
    <path
      d="M14 11h20l7 9-17 19L7 20l7-9z"
      stroke="url(#bf-gold-grad)"
      strokeWidth="2.8"
      strokeLinejoin="round"
    />
    <path
      d="M7 20h34M14 11l4 9 6 19 6-19 4-9M18 20l6-9 6 9"
      stroke="url(#bf-gold-grad)"
      strokeWidth="2.2"
      strokeLinejoin="round"
    />
  </svg>
);

export const BenefitsCards: React.FC = () => {
  const cards = [
    { icon: <LeafIcon />, title: 'Qualidade\nde vida' },
    { icon: <ChartIcon />, title: 'Potencial de\nvalorização' },
    { icon: <FamilyIcon />, title: 'Segurança\npara sua família' },
    { icon: <DiamondIcon />, title: 'Investimento\ninteligente' },
  ];

  return (
    <section className="relative z-10 bg-gradient-to-b from-[#031c11] via-[#031c11] to-[#02150d] pt-[50px] pb-0 px-2 sm:px-6">
      <GoldGradientDefs />
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-row items-stretch justify-between gap-1 sm:gap-2.5 md:gap-3.5">
          {cards.map((card, idx) => (
            <React.Fragment key={idx}>
              <div
                className="flex-1 min-w-0 bg-gradient-to-b from-[#063a21] via-[#042b18] to-[#021c0f] border border-[#d4af37]/55 rounded-xl sm:rounded-2xl px-1 py-2.5 sm:px-3 sm:py-4 md:px-4 md:py-5 text-center flex flex-col items-center justify-center gap-1.5 sm:gap-2.5 shadow-[0_6px_18px_rgba(0,0,0,0.45),0_0_14px_rgba(212,175,55,0.16),inset_0_1px_0_rgba(254,240,138,0.35)] hover:border-[#facc15] hover:shadow-[0_8px_22px_rgba(0,0,0,0.5),0_0_18px_rgba(250,204,21,0.3)] transition-all"
              >
                <div className="flex items-center justify-center flex-shrink-0">
                  {card.icon}
                </div>
                <h3 className="text-white font-bold text-[9px] sm:text-xs md:text-sm leading-[1.15] tracking-tight whitespace-pre-line">
                  {card.title}
                </h3>
              </div>

              {idx < cards.length - 1 && (
                <div
                  className="w-[1px] sm:w-[1.5px] self-stretch my-2 sm:my-3 bg-gradient-to-b from-transparent via-[#facc15]/85 to-transparent shadow-[0_0_8px_rgba(250,204,21,0.8)] flex-shrink-0"
                  aria-hidden="true"
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};
