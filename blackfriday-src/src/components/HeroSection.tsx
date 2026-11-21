import React from 'react';

interface HeroSectionProps {
  onCtaClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onCtaClick }) => {
  return (
    <section className="relative w-full bg-white overflow-hidden flex flex-col items-center justify-start p-0 m-0">
      {/* Hero Banner Image supplied by user - flush against top header, clipped cleanly below gold wave */}
      <div className="relative w-full aspect-[1199/918] overflow-hidden bg-white m-0 p-0">
        <img
          src="/blackfriday/assets/aistudio/black_friday_hero_final.png"
          alt="Black Friday dos Terrenos 2026 - Rafael Tavares"
          className="w-full h-full object-cover object-top block m-0 p-0 bg-[#ffffff]"
        />
      </div>

      {/* CTA Button positioned ~50px below the wave center */}
      <div className="w-full flex items-center justify-center bg-white mt-[30px] md:mt-0 px-4">
        <button
          onClick={onCtaClick}
          className="w-[300px] h-[45px] bg-gradient-to-r from-[#fef08a] via-[#facc15] to-[#ca8a04] hover:from-[#fff] hover:to-[#facc15] text-[#032215] font-black text-[21px] leading-[16px] tracking-widest uppercase rounded-full shadow-[0_0_25px_rgba(250,204,21,0.8)] border border-white transition-all transform hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center"
          aria-label="Explorar Ofertas"
        >
          EXPLORAR OFERTAS
        </button>
      </div>
    </section>
  );
};
