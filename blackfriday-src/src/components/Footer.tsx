import React from 'react';

interface FooterProps {
  onWhatsAppClick: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onWhatsAppClick }) => {
  return (
    <footer className="w-full bg-[#02120a] border-t border-[#12412b] overflow-hidden">
      {/* Footer Contact Banner Image supplied by user */}
      <div 
        onClick={onWhatsAppClick}
        className="relative w-full aspect-[16/9] sm:aspect-[21/9] md:aspect-[3/1] cursor-pointer group overflow-hidden shadow-2xl"
      >
        <img
          src="/blackfriday/assets/aistudio/Banner_de_Contato_Imobili_rio_com_Rafael_Tavares_22845a18.png"
          alt="Fale agora com Rafael Tavares - Corretor de Imóveis CRECI 13919"
          className="w-full h-full object-contain sm:object-cover object-center group-hover:scale-[1.01] transition-transform duration-300"
        />
        
        {/* Interactive click overlay mapping to FALAR COM O CORRETOR button area */}
        <div className="absolute inset-0 flex items-end justify-center pb-3 sm:pb-6 md:pb-8">
          <div className="w-48 sm:w-72 md:w-80 h-10 sm:h-12 md:h-14 opacity-0 group-hover:opacity-100 bg-[#facc15]/20 border-2 border-[#facc15] rounded-full transition-all flex items-center justify-center font-bold text-xs sm:text-sm text-[#032215] bg-[#facc15]">
            FALAR COM O CORRETOR
          </div>
        </div>
      </div>
    </footer>
  );
};
