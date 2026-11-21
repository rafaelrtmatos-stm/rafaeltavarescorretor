import React from 'react';

interface HeroSectionProps {
  onCtaClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onCtaClick }) => {
  return (
    <section className="relative w-full bg-[#032215] overflow-hidden flex justify-center items-center">
      {/* Hero Banner Image supplied by user */}
      <div className="relative w-full max-w-7xl aspect-[16/9] sm:aspect-[21/9] md:aspect-[2.4/1] overflow-hidden shadow-xl bg-[#032215]">
        <img
          src="/blackfriday/assets/aistudio/Black_Friday_Santar_m__Terrenos_2026_74f93fc2.png"
          alt="Black Friday dos Terrenos 2026 - Rafael Tavares"
          className="w-full h-full object-contain sm:object-cover object-center"
        />
        
        {/* Interactive Overlay Button positioned higher and smaller matching artwork */}
        <div className="absolute inset-0 flex items-end justify-center pb-8 sm:pb-14 md:pb-20">
          <button
            onClick={onCtaClick}
            className="w-36 sm:w-48 md:w-56 h-8 sm:h-10 md:h-11 bg-gradient-to-r from-[#fef08a] via-[#facc15] to-[#ca8a04] hover:from-[#fff] hover:to-[#facc15] text-[#032215] font-black text-[10px] sm:text-xs md:text-sm tracking-widest uppercase rounded-full shadow-[0_0_25px_rgba(250,204,21,0.8)] border border-white transition-all transform hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center"
            aria-label="Explorar Ofertas"
          >
            EXPLORAR OFERTAS
          </button>
        </div>
      </div>
    </section>
  );
};
