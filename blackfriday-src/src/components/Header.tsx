import React from 'react';
import { MessageCircle, Menu } from 'lucide-react';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onWhatsAppClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu, onWhatsAppClick }) => {
  return (
    <header className="w-full bg-gradient-to-b from-black/95 via-[#02180e]/95 to-[#02180e] border-b border-[#C9A84C]/20 py-3.5 px-4 sm:px-7 relative shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        
        {/* Logo & Branding matching main site nav */}
        <div className="flex items-center gap-3.5">
          <a href="/" className="inline-flex leading-none flex-shrink-0">
            <img
              src="/logo-rt.png"
              alt="RT Corretor"
              className="w-[46px] h-[46px] sm:w-[52px] sm:h-[52px] object-contain rounded-[12px] cursor-pointer"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/apple-touch-icon.png';
              }}
            />
          </a>
          <div className="flex flex-col">
            <div className="text-[13px] sm:text-[14px] font-bold text-[#F2EDE4] tracking-[2px] leading-[1.1] drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              <span className="text-[#C9A84C]">RAFAEL</span> <span>TAVARES</span>
            </div>
            <div className="text-[8px] tracking-[2px] text-[#F2EDE4]/55 uppercase mt-[3px]">
              Corretor de Imóveis · CRECI 13919
            </div>
          </div>
        </div>

        {/* Right Actions: FALAR COM RAFAEL + Hamburger Menu */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            onClick={onWhatsAppClick}
            className="inline-flex items-center gap-[7px] bg-[#C9A84C] hover:bg-[#E8C96A] text-black text-[10px] font-extrabold tracking-[0.4px] whitespace-nowrap p-2.5 sm:px-4 sm:py-2.5 rounded-full transition-colors cursor-pointer shadow-md"
            aria-label="Falar com Rafael"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="#000" className="flex-shrink-0">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.555 4.122 1.524 5.855L0 24l6.341-1.494A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.8 9.8 0 01-4.989-1.366l-.357-.212-3.766.887.937-3.667-.233-.376A9.818 9.818 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.421 0 9.818 4.398 9.818 9.818 0 5.421-4.397 9.818-9.818 9.818z" />
            </svg>
            <span className="hidden sm:inline">FALAR COM RAFAEL</span>
          </button>
          
          <button
            onClick={onOpenMobileMenu}
            className="flex items-center justify-center w-10 h-10 bg-black/80 hover:bg-[#07331f] border border-[#C9A84C]/30 text-[#C9A84C] rounded-[10px] transition-colors shadow-sm cursor-pointer"
            aria-label="Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

      </div>
    </header>
  );
};
