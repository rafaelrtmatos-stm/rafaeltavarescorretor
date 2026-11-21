import React from 'react';

interface FooterProps {
  onWhatsAppClick: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onWhatsAppClick }) => {
  return (
    <footer className="relative z-0 w-full bg-[#02150d] overflow-hidden -mt-[10px] sm:-mt-[60px] md:-mt-[120px]">
      {/* Footer Contact Banner Image supplied by user (transparent PNG) */}
      <div 
        onClick={onWhatsAppClick}
        className="relative w-full aspect-[1181/1008] cursor-pointer group overflow-hidden bg-transparent"
      >
        <img
          src="/blackfriday/assets/aistudio/01_b8756333.png"
          alt="Fale agora com Rafael Tavares - Corretor de Imóveis CRECI 13919 - (93) 99233-2012"
          className="w-full h-full object-cover object-center group-hover:scale-[1.01] transition-transform duration-300"
        />
      </div>
    </footer>
  );
};
