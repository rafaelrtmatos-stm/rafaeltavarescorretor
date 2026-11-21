import React from 'react';
import { X, Home, MapPin, Sparkles, MessageCircle, ShieldCheck } from 'lucide-react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onWhatsAppClick: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, onWhatsAppClick }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-xs bg-[#032215] border-l-2 border-[#d4af37] h-full shadow-2xl flex flex-col p-6 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-[#14422b]">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 bg-[#07331f] border border-[#d4af37] rounded-xl text-[#d4af37] font-black">
              RT
            </div>
            <div>
              <span className="font-bold text-sm block">Rafael Tavares</span>
              <span className="text-[10px] text-[#a3e2c3]">CRECI 13919</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 bg-[#07331f] hover:bg-[#0b422a] rounded-full flex items-center justify-center text-white border border-white/10"
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu Links */}
        <div className="py-6 flex flex-col gap-4 flex-grow">
          <a
            href="#explore"
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#07331f]/50 hover:bg-[#07331f] text-sm font-semibold transition-colors"
          >
            <MapPin className="w-5 h-5 text-[#d4af37]" />
            <span>Oportunidades</span>
          </a>
          <a
            href="#patrimonio"
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#07331f]/50 hover:bg-[#07331f] text-sm font-semibold transition-colors"
          >
            <Sparkles className="w-5 h-5 text-[#d4af37]" />
            <span>Seu Patrimônio</span>
          </a>
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#07331f]/30 text-sm font-semibold text-slate-300">
            <ShieldCheck className="w-5 h-5 text-[#10b981]" />
            <span>Compra 100% Segura</span>
          </div>
        </div>

        {/* Bottom WhatsApp Button */}
        <div className="pt-4 border-t border-[#14422b]">
          <button
            onClick={() => {
              onClose();
              onWhatsAppClick();
            }}
            className="w-full py-3.5 bg-[#25d366] hover:bg-[#20ba59] text-white font-bold text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all"
          >
            <MessageCircle className="w-5 h-5 fill-current" />
            <span>Falar no WhatsApp</span>
          </button>
        </div>

      </div>
    </div>
  );
};
