import React, { useEffect, useState } from 'react';
import { X, MapPin, CheckCircle2, MessageCircle, Ruler, Share2, Check } from 'lucide-react';
import { Property, buildLocationWhatsAppUrl } from '../data/properties';

const INSTAGRAM_URL = 'https://www.instagram.com/rafaeltavarescorretorstm/';

interface PropertyModalProps {
  property: Property | null;
  onClose: () => void;
  onWhatsAppInquiry: (propertyTitle: string) => void;
}

export const PropertyModal: React.FC<PropertyModalProps> = ({ property, onClose, onWhatsAppInquiry }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCopied(false);
    if (!property) return;

    const scrollY = window.scrollY;
    const htmlEl = document.documentElement;
    const bodyEl = document.body;

    const prevHtmlOverflow = htmlEl.style.overflow;
    const prevBodyOverflow = bodyEl.style.overflow;
    const prevBodyPosition = bodyEl.style.position;
    const prevBodyTop = bodyEl.style.top;
    const prevBodyLeft = bodyEl.style.left;
    const prevBodyRight = bodyEl.style.right;
    const prevBodyWidth = bodyEl.style.width;

    htmlEl.style.overflow = 'hidden';
    bodyEl.style.overflow = 'hidden';
    bodyEl.style.position = 'fixed';
    bodyEl.style.top = `-${scrollY}px`;
    bodyEl.style.left = '0';
    bodyEl.style.right = '0';
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
      bodyEl.style.left = prevBodyLeft;
      bodyEl.style.right = prevBodyRight;
      bodyEl.style.width = prevBodyWidth;
      window.scrollTo(0, scrollY);
    };
  }, [property, onClose]);

  if (!property) return null;

  const fullUrl = `${window.location.origin}${property.catalogUrl}`;

  const copyLink = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(fullUrl).then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      }).catch(() => {});
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({ title: `${property.title} | Black Friday Rafael Tavares`, text: property.title, url: fullUrl })
        .catch(() => {});
    } else {
      copyLink();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn overscroll-contain touch-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="property-modal-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-[#032215] border-2 border-[#d4af37] rounded-3xl overflow-hidden shadow-2xl text-white max-h-[90vh] flex flex-col touch-auto overscroll-contain"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header / Image area */}
        <div className="relative h-64 sm:h-72 bg-slate-900 overflow-hidden flex-shrink-0">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${property.image}')` }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#032215] via-[#032215]/40 to-black/30"></div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/70 hover:bg-black text-white rounded-full flex items-center justify-center border border-white/25 transition-all cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-6 h-6" />
          </button>

          {property.badge && (
            <div className="absolute top-4 left-4 bg-red-600 text-white font-black text-xs uppercase px-3 py-1 rounded-full shadow-md border border-red-400">
              {property.badge}
            </div>
          )}

          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-1.5 text-[#d4af37] text-sm font-semibold mb-1">
              <MapPin className="w-4 h-4" /> {property.location}
            </div>
            <h2 id="property-modal-title" className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {property.title}
            </h2>
            <div className="flex items-center justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={handleShare}
                className="w-9 h-9 inline-flex items-center justify-center text-[#facc15] hover:text-white bg-black/50 hover:bg-black/70 border border-[#d4af37]/40 rounded-full transition-colors cursor-pointer"
                aria-label={copied ? 'Link copiado' : 'Compartilhar'}
                title={copied ? 'Link copiado' : 'Compartilhar'}
              >
                {copied ? <Check className="w-4 h-4 text-[#10b981]" /> : <Share2 className="w-4 h-4" />}
              </button>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 inline-flex items-center justify-center text-[#facc15] hover:text-white bg-black/50 hover:bg-black/70 border border-[#d4af37]/40 rounded-full transition-colors cursor-pointer"
                aria-label="Instagram de Rafael Tavares"
                title="Instagram"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 space-y-6 overflow-y-auto overscroll-contain">

          {/* Price & Size */}
          <div className="flex items-center justify-between bg-[#07331f] border border-[#d4af37]/30 p-4 rounded-2xl">
            <div>
              <span className="text-xs text-slate-300 uppercase tracking-wide block">Valor Black Friday</span>
              <span className="text-3xl font-black text-[#facc15]">{property.price}</span>
              {property.originalPrice && (
                <span className="text-xs text-slate-400 line-through ml-2">{property.originalPrice}</span>
              )}
            </div>
            <div className="flex items-center gap-2 bg-[#032215] px-3.5 py-2 rounded-xl border border-[#d4af37]/40">
              <Ruler className="w-5 h-5 text-[#d4af37]" />
              <span className="text-sm font-bold text-white">{property.size}</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-bold text-[#d4af37] uppercase tracking-wider mb-2">Sobre o Terreno</h3>
            <p className="text-slate-200 text-sm leading-relaxed">
              {property.description}
            </p>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-sm font-bold text-[#d4af37] uppercase tracking-wider mb-3">Diferenciais e Vantagens</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {property.features.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2.5 bg-[#052b1b] px-3 py-2.5 rounded-xl border border-[#12412b]">
                  <CheckCircle2 className="w-4 h-4 text-[#10b981] flex-shrink-0" />
                  <span className="text-xs text-slate-200 font-medium">{feat}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer CTA */}
        <div className="p-4 bg-[#02140c] border-t border-[#12412b] flex-shrink-0 flex flex-col sm:flex-row gap-2.5">
          <a
            href={buildLocationWhatsAppUrl(property)}
            target="_blank"
            rel="noopener noreferrer"
            data-direct-wpp="true"
            className="sm:w-auto py-3.5 px-5 bg-[#053d24] hover:bg-[#074e2e] border border-[#d4af37]/60 text-[#facc15] font-bold text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap"
          >
            <MapPin className="w-5 h-5" />
            <span>SOLICITAR LOCALIZAÇÃO</span>
          </a>
          <button
            onClick={() => onWhatsAppInquiry(property.title)}
            className="flex-1 py-3.5 px-5 bg-gradient-to-r from-[#25d366] to-[#20ba59] hover:from-[#20ba59] hover:to-[#1a9c4b] text-white font-black text-sm sm:text-base rounded-2xl shadow-[0_0_20px_rgba(37,211,102,0.4)] flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] cursor-pointer"
          >
            <MessageCircle className="w-5 h-5 fill-current flex-shrink-0" />
            <span>QUERO ESTE TERRENO NO WHATSAPP</span>
          </button>
        </div>

      </div>
    </div>
  );
};
