import React from 'react';

interface HeroSectionProps {
  onCtaClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onCtaClick }) => {
  return (
    <section className="relative w-full bg-[#032215] overflow-hidden flex flex-col items-center justify-start p-0 m-0">
      {/* Hero Banner Image supplied by user - flush against top header */}
      <div className="relative w-full overflow-hidden shadow-2xl bg-[#032215] m-0 p-0">
        <img
          src="/blackfriday/assets/aistudio/black_friday_hero_final.png"
          alt="Black Friday dos Terrenos 2026 - Rafael Tavares"
          className="w-full h-auto object-cover block m-0 p-0"
        />
        
        {/* Interactive Overlay Button matched to artwork position */}
        <div className="absolute inset-x-0 bottom-4 sm:bottom-8 md:bottom-12 flex items-center justify-center">
          <button
            onClick={onCtaClick}
            className="w-36 sm:w-48 md:w-56 h-9 sm:h-11 md:h-12 bg-gradient-to-r from-[#fef08a] via-[#facc15] to-[#ca8a04] hover:from-[#fff] hover:to-[#facc15] text-[#032215] font-black text-[10px] sm:text-xs md:text-sm tracking-widest uppercase rounded-full shadow-[0_0_25px_rgba(250,204,21,0.8)] border border-white transition-all transform hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center"
            aria-label="Explorar Ofertas"
          >
            EXPLORAR OFERTAS
          </button>
        </div>
      </div>
    </section>
  );
};
