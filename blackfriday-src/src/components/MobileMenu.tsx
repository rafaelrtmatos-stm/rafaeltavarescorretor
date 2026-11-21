import React, { useEffect } from 'react';
import { X, Home, MapPin, Star, MessageSquare, User, FileEdit, Building2, MessageCircle, Flame } from 'lucide-react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onWhatsAppClick: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, onWhatsAppClick }) => {
  useEffect(() => {
    if (!isOpen) return;
    const scrollY = window.scrollY;
    const htmlEl = document.documentElement;
    const bodyEl = document.body;

    const prevHtmlOverflow = htmlEl.style.overflow;
    const prevBodyOverflow = bodyEl.style.overflow;
    const prevBodyPosition = bodyEl.style.position;
    const prevBodyTop = bodyEl.style.top;
    const prevBodyWidth = bodyEl.style.width;

    htmlEl.style.overflow = 'hidden';
    bodyEl.style.overflow = 'hidden';
    bodyEl.style.position = 'fixed';
    bodyEl.style.top = `-${scrollY}px`;
    bodyEl.style.width = '100%';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      htmlEl.style.overflow = prevHtmlOverflow;
      bodyEl.style.overflow = prevBodyOverflow;
      bodyEl.style.position = prevBodyPosition;
      bodyEl.style.top = prevBodyTop;
      bodyEl.style.width = prevBodyWidth;
      window.scrollTo(0, scrollY);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const navigateTo = (href: string) => {
    onClose();
    window.location.href = href;
  };

  return (
    <div
      className="fixed inset-0 z-[999] flex justify-end bg-black/75 backdrop-blur-sm overscroll-contain"
      onClick={onClose}
    >
      <div
        className="w-[290px] bg-black border-l border-[#C9A84C]/20 h-full shadow-2xl flex flex-col text-[#F2EDE4] overflow-y-auto overscroll-contain"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header matching main site drawer */}
        <div className="flex items-center justify-between px-5 pt-[22px] pb-[14px] border-b border-[#C9A84C]/15 flex-shrink-0">
          <div>
            <div className="text-[17px] font-bold text-[#C9A84C] tracking-[2px]">
              Rafael Tavares
            </div>
            <div className="text-[9px] tracking-[2px] text-[#F2EDE4]/35 uppercase mt-[3px]">
              Corretor · CRECI 13919
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-[#0a0a0a] hover:bg-[#1a1a1a] rounded-lg flex items-center justify-center text-[#C9A84C] border border-[#C9A84C]/25 cursor-pointer"
            aria-label="Fechar menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Exact same menu items as index.html */}
        <nav className="py-2 flex-1 overflow-y-auto">
          <button
            onClick={() => navigateTo('/')}
            className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-[#C9A84C]/10 hover:text-[#C9A84C] border-l-2 border-transparent hover:border-[#C9A84C] transition-all cursor-pointer"
          >
            <Home className="w-[18px] h-[18px] text-[#C9A84C] flex-shrink-0" />
            <span className="text-[13px] font-medium text-[#F2EDE4]/85 flex-1">Início</span>
          </button>

          <button
            onClick={() => navigateTo('/#regioes')}
            className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-[#C9A84C]/10 hover:text-[#C9A84C] border-l-2 border-transparent hover:border-[#C9A84C] transition-all cursor-pointer"
          >
            <MapPin className="w-[18px] h-[18px] text-[#C9A84C] flex-shrink-0" />
            <span className="text-[13px] font-medium text-[#F2EDE4]/85 flex-1">Regiões</span>
          </button>

          <button
            onClick={() => navigateTo('/#grupos')}
            className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-[#C9A84C]/10 hover:text-[#C9A84C] border-l-2 border-transparent hover:border-[#C9A84C] transition-all cursor-pointer"
          >
            <Star className="w-[18px] h-[18px] text-[#C9A84C] flex-shrink-0" />
            <span className="text-[13px] font-medium text-[#F2EDE4]/85 flex-1">Grupo VIP</span>
          </button>

          <button
            onClick={() => navigateTo('/#depoimentos')}
            className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-[#C9A84C]/10 hover:text-[#C9A84C] border-l-2 border-transparent hover:border-[#C9A84C] transition-all cursor-pointer"
          >
            <MessageSquare className="w-[18px] h-[18px] text-[#C9A84C] flex-shrink-0" />
            <span className="text-[13px] font-medium text-[#F2EDE4]/85 flex-1">Depoimentos</span>
          </button>

          <button
            onClick={() => navigateTo('/#sobre')}
            className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-[#C9A84C]/10 hover:text-[#C9A84C] border-l-2 border-transparent hover:border-[#C9A84C] transition-all cursor-pointer"
          >
            <User className="w-[18px] h-[18px] text-[#C9A84C] flex-shrink-0" />
            <span className="text-[13px] font-medium text-[#F2EDE4]/85 flex-1">Sobre &amp; Contato</span>
          </button>

          <div className="h-px bg-[#C9A84C]/10 my-1.5 mx-[18px]" />

          <button
            onClick={() => navigateTo('/onde-estamos/santarem/')}
            className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-[#C9A84C]/10 hover:text-[#C9A84C] border-l-2 border-transparent hover:border-[#C9A84C] transition-all cursor-pointer"
          >
            <MapPin className="w-[18px] h-[18px] text-[#C9A84C] flex-shrink-0" />
            <span className="text-[13px] font-medium text-[#F2EDE4]/85 flex-1">Onde Estamos</span>
          </button>

          <div className="h-px bg-[#C9A84C]/10 my-1.5 mx-[18px]" />

          <button
            onClick={() => navigateTo('/reserva/')}
            className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-[#C9A84C]/10 hover:text-[#C9A84C] border-l-2 border-transparent hover:border-[#C9A84C] transition-all cursor-pointer"
          >
            <FileEdit className="w-[18px] h-[18px] text-[#C9A84C] flex-shrink-0" />
            <span className="text-[13px] font-medium text-[#F2EDE4]/85 flex-1">Formulário de Reserva</span>
            <em className="text-[9px] px-2 py-0.5 rounded-full not-italic font-bold tracking-wider bg-[#C9A84C]/15 text-[#C9A84C] border border-[#C9A84C]/30">
              RESERVAR
            </em>
          </button>

          <button
            onClick={() => navigateTo('/blackfriday/')}
            className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-[#C9A84C]/10 hover:text-[#C9A84C] border-l-2 border-transparent hover:border-[#C9A84C] transition-all cursor-pointer"
          >
            <Flame className="w-[18px] h-[18px] text-[#C9A84C] flex-shrink-0" />
            <span className="text-[13px] font-medium text-[#F2EDE4]/85 flex-1">Black Friday dos Terrenos</span>
            <em className="text-[9px] px-2 py-0.5 rounded-full not-italic font-bold tracking-wider bg-[#f87171]/15 text-[#f87171] border border-[#f87171]/30">
              OFERTAS
            </em>
          </button>

          <button
            onClick={() => navigateTo('/alugueis/')}
            className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-[#C9A84C]/10 hover:text-[#C9A84C] border-l-2 border-transparent hover:border-[#C9A84C] transition-all cursor-pointer"
          >
            <Building2 className="w-[18px] h-[18px] text-[#C9A84C] flex-shrink-0" />
            <span className="text-[13px] font-medium text-[#F2EDE4]/85 flex-1">Imóveis para Alugar</span>
            <em className="text-[9px] px-2 py-0.5 rounded-full not-italic font-bold tracking-wider bg-[#25d366]/15 text-[#25d366] border border-[#25d366]/25">
              NOVO
            </em>
          </button>
        </nav>

        {/* Bottom WhatsApp Button matching main site drawer */}
        <div className="px-[18px] py-[14px] border-t border-[#C9A84C]/15 flex-shrink-0">
          <button
            onClick={() => {
              onClose();
              onWhatsAppClick();
            }}
            className="w-full py-[13px] bg-[#25d366] hover:bg-[#20ba59] text-black font-bold text-[13px] rounded-[10px] shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <MessageCircle className="w-[17px] h-[17px] fill-current" />
            <span>Falar com Rafael</span>
          </button>
        </div>
      </div>
    </div>
  );
};
