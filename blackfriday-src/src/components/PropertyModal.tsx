import React from 'react';
import { X, MapPin, CheckCircle2, MessageCircle, Ruler, Tag } from 'lucide-react';
import { Property } from '../data/properties';

interface PropertyModalProps {
  property: Property | null;
  onClose: () => void;
  onWhatsAppInquiry: (propertyTitle: string) => void;
}

export const PropertyModal: React.FC<PropertyModalProps> = ({ property, onClose, onWhatsAppInquiry }) => {
  if (!property) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-xl bg-[#032215] border-2 border-[#d4af37] rounded-3xl overflow-hidden shadow-2xl text-white max-h-[90vh] flex flex-col"
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
            className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/60 hover:bg-black text-white rounded-full flex items-center justify-center border border-white/20 transition-all"
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
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {property.title}
            </h2>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 space-y-6 overflow-y-auto">
          
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
        <div className="p-4 bg-[#02140c] border-t border-[#12412b] flex-shrink-0">
          <button
            onClick={() => onWhatsAppInquiry(property.title)}
            className="w-full py-4 bg-gradient-to-r from-[#25d366] to-[#20ba59] hover:from-[#20ba59] hover:to-[#1a9c4b] text-white font-black text-base rounded-2xl shadow-[0_0_20px_rgba(37,211,102,0.4)] flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02]"
          >
            <MessageCircle className="w-6 h-6 fill-current" />
            <span>QUERO ESTE TERRENO NO WHATSAPP</span>
          </button>
        </div>

      </div>
    </div>
  );
};
