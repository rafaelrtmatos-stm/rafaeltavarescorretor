import React, { useEffect, useState } from 'react';
import { CreditCard, ArrowDown, ArrowLeft, MapPin, CheckCircle2, MessageCircle, Ruler, Share2, Check, Play, Maximize2, Flame } from 'lucide-react';
import { Property, GalleryItem, buildLocationWhatsAppUrl, buildVariantLocationWhatsAppUrl } from '../data/properties';
import { GalleryLightbox } from './GalleryLightbox';
import { CardSimulator } from './CardSimulator';
import { parsePrice, brl } from '../data/cardRates';

const INSTAGRAM_URL = 'https://www.instagram.com/rafaeltavarescorretorstm/';

// Preço "de": o triplo do valor atual (ex.: R$ 5.000 -> R$ 15.000).
function triplePrice(price: string): string {
  const n = parseFloat(price.replace(/[^\d,]/g, '').replace(',', '.'));
  if (!isFinite(n)) return '';
  return (n * 3).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }).replace(/ /g, ' ');
}

const PriceTag: React.FC<{ price: string; label?: string; big?: boolean; onSimulate: () => void }> = ({ price, label, big, onSimulate }) => {
  const v = parsePrice(price);
  const pctOff = ((1 - 1 / 3) * 100).toFixed(1).replace('.', ',');
  return (
  <div className="cristal cristal-escuro cristal-preco relative rounded-3xl p-5 text-center">
    {label && <div className="text-xs font-bold text-[#d4af37] uppercase tracking-wider mb-1">{label}</div>}
    <div className="text-xs text-slate-300 uppercase tracking-wide">De</div>
    <div className="relative inline-block">
      <span className="text-xl sm:text-2xl font-bold text-slate-400">{triplePrice(price)}</span>
      <span className="absolute left-[-6%] right-[-6%] top-1/2 h-[3px] bg-red-500 -rotate-6 rounded"></span>
    </div>
    <div className="text-xs text-slate-300 uppercase tracking-wide mt-2">Por apenas</div>
    <div className={`${big ? 'text-5xl sm:text-6xl' : 'text-4xl sm:text-5xl'} font-black text-[#facc15] leading-none drop-shadow`}>
      {price}
    </div>
    <div className="inline-flex items-center gap-1 mt-3 bg-red-600 text-white text-[11px] font-black uppercase px-3 py-1 rounded-full">
      <Flame className="w-3.5 h-3.5" /> Preço Black Friday
    </div>
    <div className="mt-3 text-sm font-black text-white">
      {pctOff}% de desconto · <span className="text-[#facc15]">Você economiza {brl(v * 2)}</span>
    </div>
    <ArrowDown className="w-7 h-7 mx-auto mt-2 text-[#facc15] animate-bounce" aria-hidden="true" />
    <div className="relative">
      <span className="absolute inset-0 rounded-2xl border-2 border-[#facc15] animate-ping opacity-70 pointer-events-none" aria-hidden="true"></span>
      <button
        type="button"
        onClick={onSimulate}
        className="cristal cristal-ouro relative w-full inline-flex items-center justify-center gap-2 text-[#032215] font-black text-sm py-3 rounded-2xl cursor-pointer pulsar"
      >
        <CreditCard className="w-4 h-4" /> Parcelar no cartão de crédito
      </button>
    </div>
  </div>
  );
};

interface PropertyPageProps {
  property: Property;
  onBack: () => void;
  onWhatsAppInquiry: (title: string) => void;
  onSimulatorChange?: (open: boolean) => void;
}

export const PropertyPage: React.FC<PropertyPageProps> = ({ property, onBack, onWhatsAppInquiry, onSimulatorChange }) => {
  const [sim, setSim] = useState<{ price: string } | null>(null);
  useEffect(() => {
    onSimulatorChange?.(!!sim);
    return () => onSimulatorChange?.(false);
  }, [sim]);
  const [copied, setCopied] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    setCopied(false);
    setLightboxIndex(null);
  }, [property.id]);

  const fullUrl = `${window.location.origin}${property.catalogUrl}`;
  const hasVariants = !!property.variants && property.variants.length > 1;
  const media: GalleryItem[] =
    property.gallery && property.gallery.length > 0 ? property.gallery : [{ type: 'image', src: property.image }];

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: `${property.title} | Black Friday Rafael Tavares`, text: property.title, url: fullUrl }).catch(() => {});
    } else if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(fullUrl).then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      }).catch(() => {});
    }
  };

  const iconBtn =
    'cristal cristal-verde w-10 h-10 inline-flex items-center justify-center text-[#facc15] hover:text-white rounded-full transition-colors cursor-pointer';

  return (
    <div className="w-full bg-[#02140c] text-white">
      {/* Capa */}
      <section className="relative h-[46vh] min-h-[280px] max-h-[520px] overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${property.image}')` }}></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#02140c] via-[#02140c]/50 to-black/40"></div>
        <div className="relative max-w-4xl mx-auto h-full px-4 flex flex-col justify-between py-5">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onBack}
              className="cristal cristal-verde inline-flex items-center gap-2 text-white text-sm font-bold px-4 py-2 rounded-full cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar ao catálogo
            </button>
            <div className="flex gap-2">
              <button type="button" onClick={handleShare} className={iconBtn} aria-label="Compartilhar" title={copied ? 'Link copiado' : 'Compartilhar'}>
                {copied ? <Check className="w-4 h-4 text-[#10b981]" /> : <Share2 className="w-4 h-4" />}
              </button>
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className={iconBtn} aria-label="Instagram" title="Instagram">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
                </svg>
              </a>
            </div>
          </div>
          <div>
            {property.badge && (
              <span className="inline-block bg-red-600 text-white font-black text-xs uppercase px-3 py-1 rounded-full mb-2">{property.badge}</span>
            )}
            <div className="flex items-center gap-1.5 text-[#d4af37] text-sm font-semibold mb-1">
              <MapPin className="w-4 h-4" /> {property.location}{hasVariants ? ' · 2 localizações' : ''}
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight">{property.title}</h1>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">
        {/* Preço */}
        <section>
          {hasVariants ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {property.variants!.map((v) => (
                <div key={v.label}>
                  <PriceTag price={v.price} label={v.label} onSimulate={() => setSim({ price: v.price })} />
                  <div className="flex items-center justify-center gap-1 text-xs text-slate-300 mt-2">
                    <MapPin className="w-3 h-3 text-[#d4af37]" /> {v.location}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="max-w-md mx-auto">
              <PriceTag price={property.price} big onSimulate={() => setSim({ price: property.price })} />
            </div>
          )}
          <div className="cristal cristal-verde mx-auto w-fit flex items-center justify-center gap-2 mt-4 text-sm font-bold px-5 py-2 rounded-full">
            <Ruler className="w-5 h-5 text-[#d4af37]" /> {property.size}{hasVariants ? ' cada' : ''}
          </div>
        </section>

        {/* Descrição */}
        <section>
          <h2 className="text-sm font-bold text-[#d4af37] uppercase tracking-wider mb-2">Sobre o Terreno</h2>
          <p className="text-slate-200 leading-relaxed">{property.description}</p>
        </section>

        {/* Diferenciais */}
        <section>
          <h2 className="text-sm font-bold text-[#d4af37] uppercase tracking-wider mb-3">Diferenciais e Vantagens</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {property.features.map((f, i) => (
              <div key={i} className="cristal cristal-escuro cristal-linha flex items-center gap-2.5 px-3 py-3 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-[#10b981] flex-shrink-0" />
                <span className="text-sm text-slate-200 font-medium">{f}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Ações */}
        <section className="flex flex-col sm:flex-row gap-3">
          {hasVariants ? (
            property.variants!.map((v, i) => (
              <a
                key={v.label}
                href={buildVariantLocationWhatsAppUrl(property, v)}
                target="_blank"
                rel="noopener noreferrer"
                data-direct-wpp="true"
                className="cristal cristal-verde py-3.5 px-5 text-[#fde047] font-bold text-sm rounded-2xl flex items-center justify-center gap-2 cursor-pointer"
              >
                <MapPin className="w-5 h-5" /> LOCALIZAÇÃO {i + 1}
              </a>
            ))
          ) : (
            <a
              href={buildLocationWhatsAppUrl(property)}
              target="_blank"
              rel="noopener noreferrer"
              data-direct-wpp="true"
              className="cristal cristal-verde py-3.5 px-5 text-[#fde047] font-bold text-sm rounded-2xl flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <MapPin className="w-5 h-5" /> SOLICITAR LOCALIZAÇÃO
            </a>
          )}
          <button
            type="button"
            onClick={() => onWhatsAppInquiry(property.title)}
            className="cristal cristal-wpp flex-1 py-3.5 px-5 text-white font-black text-sm sm:text-base rounded-2xl flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageCircle className="w-5 h-5 fill-current" /> QUERO ESTE TERRENO NO WHATSAPP
          </button>
        </section>

        {/* Galeria */}
        <section id="galeria">
          <h2 className="text-xl font-black mb-1">Fotos e vídeos</h2>
          <p className="text-slate-400 text-sm mb-4">Toque em uma foto ou vídeo para ver em tela cheia.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {media.map((item, i) => (
              <button
                key={item.src}
                type="button"
                onClick={() => setLightboxIndex(i)}
                className={`relative aspect-square overflow-hidden rounded-2xl border border-[#f6dd7a]/80 cristal-galeria bg-slate-900 cursor-pointer group ${
                  media.length % 2 === 1 && i === 0 ? 'col-span-2 sm:col-span-1' : ''
                }`}
                aria-label={`Abrir ${item.type === 'video' ? 'vídeo' : 'foto'} ${i + 1}`}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                  style={{ backgroundImage: `url('${item.type === 'video' ? item.poster ?? '' : item.src}')` }}
                ></div>
                {item.type === 'video' ? (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <span className="w-14 h-14 rounded-full bg-black/60 border border-white/40 flex items-center justify-center">
                      <Play className="w-7 h-7 text-white fill-current" />
                    </span>
                  </span>
                ) : (
                  <span className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center opacity-90">
                    <Maximize2 className="w-4 h-4 text-white" />
                  </span>
                )}
              </button>
            ))}
          </div>
        </section>
      </div>

      {sim && <CardSimulator title={property.title} price={sim.price} onClose={() => setSim(null)} />}

      {lightboxIndex !== null && (
        <GalleryLightbox items={media} startIndex={lightboxIndex} title={property.title} onClose={() => setLightboxIndex(null)} />
      )}
    </div>
  );
};
