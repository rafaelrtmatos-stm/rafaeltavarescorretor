import React from 'react';
import { MessageCircle, Menu } from 'lucide-react';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onWhatsAppClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu, onWhatsAppClick }) => {
  return (
    <header className="w-full bg-[#02180e] border-b border-[#12412b] py-3 px-4 md:px-8 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo & Branding matching exact reference image */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl overflow-hidden bg-black border border-[#d4af37]/60 flex items-center justify-center shadow-md flex-shrink-0">
            <img
              src="/blackfriday/assets/aistudio/image_ee8f5d17.png"
              alt="Logo RT"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-[#facc15] font-bold text-base md:text-lg tracking-tight font-sans leading-tight">
              Rafael Tavares
            </span>
            <span className="text-slate-300 text-[10px] md:text-xs font-medium tracking-wide uppercase">
              CORRETOR DE IMÓVEIS - CRECI 13919
            </span>
          </div>
        </div>

        {/* Right Actions matching exact reference image */}
        <div className="flex items-center gap-3">
          <button
            onClick={onWhatsAppClick}
            className="flex items-center justify-center w-10 h-10 md:w-11 md:h-11 bg-[#facc15] hover:bg-[#eab308] text-[#032215] rounded-full shadow-[0_0_15px_rgba(250,204,21,0.4)] transition-all transform hover:scale-105"
            aria-label="WhatsApp"
          >
            <MessageCircle className="w-5 h-5 fill-current" />
          </button>
          
          <button
            onClick={onOpenMobileMenu}
            className="flex items-center justify-center w-10 h-10 md:w-11 md:h-11 bg-[#052214] hover:bg-[#07331f] border border-[#d4af37]/60 text-[#facc15] rounded-xl transition-colors shadow-sm"
            aria-label="Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

      </div>
    </header>
  );
};
