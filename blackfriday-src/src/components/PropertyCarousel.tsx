import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { Property, buildLocationWhatsAppUrl, buildVariantLocationWhatsAppUrl } from '../data/properties';

interface PropertyCarouselProps {
  properties: Property[];
  initialIndex?: number;
  onSelectProperty: (property: Property) => void;
}

export const PropertyCarousel: React.FC<PropertyCarouselProps> = ({ properties, initialIndex = 1, onSelectProperty }) => {
  const safeInitial = initialIndex >= 0 && initialIndex < properties.length ? initialIndex : 0;
  const [activeIndex, setActiveIndex] = useState<number>(safeInitial);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScroll = useRef<boolean>(false);
  const scrollTimeoutRef = useRef<number | null>(null);

  const scrollToIndex = (index: number, behavior: ScrollBehavior = 'smooth') => {
    const targetIndex = (index + properties.length) % properties.length;
    setActiveIndex(targetIndex);
    if (scrollRef.current) {
      const container = scrollRef.current;
      const card = container.children[targetIndex] as HTMLElement;
      if (card) {
        isProgrammaticScroll.current = true;
        if (scrollTimeoutRef.current) {
          window.clearTimeout(scrollTimeoutRef.current);
        }
        container.scrollTo({
          left: card.offsetLeft - container.clientWidth / 2 + card.clientWidth / 2,
          behavior,
        });
        scrollTimeoutRef.current = window.setTimeout(() => {
          isProgrammaticScroll.current = false;
        }, behavior === 'auto' ? 50 : 450);
      }
    }
  };

  useEffect(() => {
    const raf = window.requestAnimationFrame(() => {
      scrollToIndex(safeInitial, 'auto');
    });
    return () => {
      window.cancelAnimationFrame(raf);
      if (scrollTimeoutRef.current) {
        window.clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [safeInitial]);

  const handleScroll = () => {
    if (!scrollRef.current || isProgrammaticScroll.current) return;
    const container = scrollRef.current;
    const scrollCenter = container.scrollLeft + container.clientWidth / 2;

    let closestIndex = 0;
    let minDistance = Infinity;

    Array.from(container.children).forEach((child, idx) => {
      const card = child as HTMLElement;
      const cardCenter = card.offsetLeft + card.clientWidth / 2;
      const distance = Math.abs(scrollCenter - cardCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = idx;
      }
    });

    if (closestIndex !== activeIndex) {
      setActiveIndex(closestIndex);
    }
  };

  return (
    <section className="bg-white pt-[18px] pb-[50px] px-0 relative overflow-hidden">
      <div className="max-w-6xl mx-auto relative">

        {/* Navigation Arrows - Always Visible */}
        <button
          onClick={() => scrollToIndex(activeIndex - 1)}
          className="absolute left-1.5 sm:left-4 top-[44%] -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 bg-[#032215]/90 hover:bg-[#032215] text-[#d4af37] rounded-full flex items-center justify-center shadow-lg backdrop-blur-md transition-all border border-[#d4af37]/60 cursor-pointer"
          aria-label="Anterior"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <button
          onClick={() => scrollToIndex(activeIndex + 1)}
          className="absolute right-1.5 sm:right-4 top-[44%] -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 bg-[#032215]/90 hover:bg-[#032215] text-[#d4af37] rounded-full flex items-center justify-center shadow-lg backdrop-blur-md transition-all border border-[#d4af37]/60 cursor-pointer"
          aria-label="Próximo"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Carousel Scroll Container */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-0 overflow-x-auto snap-x snap-mandatory scrollbar-none py-5 px-[calc(50%-112px)] sm:px-[calc(50%-140px)] md:px-[calc(50%-170px)] items-center justify-start touch-pan-x"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {properties.map((prop, idx) => {
            const isActive = idx === activeIndex;
            return (
              <div
                key={prop.id}
                onClick={() => {
                  if (isActive) {
                    onSelectProperty(prop);
                  } else {
                    scrollToIndex(idx);
                  }
                }}
                className={`flex-shrink-0 w-[224px] sm:w-[280px] md:w-[340px] snap-center transition-all duration-300 cursor-pointer rounded-2xl overflow-hidden bg-[#032215] border-2 transform ${
                  isActive
                    ? 'border-[#d4af37] scale-105 shadow-[0_14px_34px_rgba(0,0,0,0.35)] z-20 opacity-100 mx-1 sm:mx-2'
                    : 'border-[#1b583c]/70 scale-[0.82] opacity-95 hover:opacity-100 z-10 -mx-3 sm:-mx-4 shadow-lg'
                }`}
              >
                {/* Card Top Image */}
                <div className="relative h-[108px] sm:h-[138px] md:h-[168px] overflow-hidden bg-slate-900">
                  <div
                    className="absolute inset-0 bg-cover bg-center transform hover:scale-105 transition-transform duration-500"
                    style={{
                      backgroundImage: `url('${prop.image}')`,
                    }}
                  ></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#032215] via-[#032215]/25 to-black/15"></div>

                  {/* Black Friday Red Diagonal Ribbon */}
                  {prop.badge && (
                    <div className="absolute top-[11px] -left-[36px] sm:top-[14px] sm:-left-[40px] w-[132px] sm:w-[156px] bg-gradient-to-r from-red-700 via-red-600 to-red-700 text-white font-black uppercase py-1 transform -rotate-45 shadow-lg border-y border-red-400/70 text-center leading-none">
                      <span className="block text-[9px] sm:text-[11px] tracking-wider">OFERTA</span>
                      <span className="block text-[6.5px] sm:text-[8px] text-[#fef08a] tracking-wide mt-[1px]">BLACK FRIDAY</span>
                    </div>
                  )}

                  {/* Centered Location & Title over bottom gradient */}
                  <div className="absolute bottom-1.5 inset-x-2 flex items-center justify-center gap-1">
                    <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#facc15] flex-shrink-0" />
                    <span className="text-white text-[12px] sm:text-[15px] md:text-[17px] font-bold leading-tight drop-shadow text-center line-clamp-2">
                      {prop.title}
                    </span>
                  </div>
                </div>

                {/* Card Bottom Price & Action Area */}
                <div className="px-2.5 pb-2.5 pt-1 sm:px-3.5 sm:pb-3.5 bg-gradient-to-b from-[#032215] to-[#01140b]">
                  {prop.variants && prop.variants.length > 1 ? (
                    <>
                      {/* Two prices side by side */}
                      <div className="flex items-stretch justify-center gap-1.5 sm:gap-2">
                        {prop.variants.map((variant) => (
                          <div
                            key={variant.label}
                            className="flex-1 bg-gradient-to-b from-[#fef08a] via-[#facc15] to-[#ca8a04] px-1.5 py-1 sm:px-2 sm:py-1.5 rounded-xl shadow-md border border-white/30 text-center"
                          >
                            <span className="block text-[7.5px] sm:text-[9px] font-bold uppercase tracking-wide text-[#032215]/70 leading-none mb-0.5">
                              {variant.label}
                            </span>
                            <span className="text-[11px] sm:text-[14px] md:text-[16px] font-black text-[#032215] tracking-tight block leading-none whitespace-nowrap">
                              {variant.price}
                            </span>
                          </div>
                        ))}
                      </div>

                      {isActive && (
                        <>
                          <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                            {prop.variants.map((variant, vIdx) => (
                              <a
                                key={variant.label}
                                href={buildVariantLocationWhatsAppUrl(prop, variant)}
                                target="_blank"
                                rel="noopener noreferrer"
                                data-direct-wpp="true"
                                onClick={(e) => e.stopPropagation()}
                                className="py-1 px-1 rounded-lg bg-[#053d24]/80 hover:bg-[#074e2e] border border-[#d4af37]/40 text-[#facc15] font-bold text-[8px] sm:text-[10px] flex items-center justify-center gap-0.5 transition-colors text-center leading-tight"
                              >
                                <MapPin className="w-3 h-3 flex-shrink-0" />
                                <span>LOCALIZAÇÃO {vIdx + 1}</span>
                              </a>
                            ))}
                          </div>
                          <a
                            href={prop.catalogUrl}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              onSelectProperty(prop);
                            }}
                            className="mt-1.5 w-full px-2 py-1.5 bg-[#053d24] hover:bg-[#074e2e] border border-[#10b981]/60 text-white font-bold text-[9.5px] sm:text-xs rounded-full shadow-md flex items-center justify-center gap-0.5 transition-all cursor-pointer whitespace-nowrap"
                          >
                            <span>Ver detalhes</span>
                            <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#facc15]" />
                          </a>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                        {/* Golden Price Pill Box */}
                        <div
                          className={`bg-gradient-to-b from-[#fef08a] via-[#facc15] to-[#ca8a04] px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl shadow-md border border-white/30 text-center ${
                            isActive ? 'flex-1' : 'w-full'
                          }`}
                        >
                          <span className="text-[12px] sm:text-[16px] md:text-[18px] font-black text-[#032215] tracking-tight block leading-none whitespace-nowrap">
                            {prop.price}
                          </span>
                        </div>

                        {/* Ver Detalhes Subfolder Link on Active Center Card */}
                        {isActive && (
                          <a
                            href={prop.catalogUrl}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              onSelectProperty(prop);
                            }}
                            className="px-2 py-1.5 sm:px-3 sm:py-2 bg-[#053d24] hover:bg-[#074e2e] border border-[#10b981]/60 text-white font-bold text-[9.5px] sm:text-xs rounded-full shadow-md flex items-center gap-0.5 transition-all flex-shrink-0 cursor-pointer whitespace-nowrap"
                          >
                            <span>Ver detalhes</span>
                            <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#facc15]" />
                          </a>
                        )}
                      </div>

                      {isActive && (
                        <a
                          href={buildLocationWhatsAppUrl(prop)}
                          target="_blank"
                          rel="noopener noreferrer"
                          data-direct-wpp="true"
                          onClick={(e) => e.stopPropagation()}
                          className="mt-1.5 w-full py-1 px-2 rounded-lg bg-[#053d24]/80 hover:bg-[#074e2e] border border-[#d4af37]/40 text-[#facc15] font-bold text-[9.5px] sm:text-[11px] flex items-center justify-center gap-1 transition-colors"
                        >
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span>SOLICITAR LOCALIZAÇÃO</span>
                        </a>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center items-center gap-2 mt-3">
          {properties.map((_, idx) => (
            <button
              key={idx}
              onClick={() => scrollToIndex(idx)}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                idx === activeIndex
                  ? 'w-3 h-3 bg-[#d4af37] scale-110'
                  : 'w-2.5 h-2.5 bg-slate-300 hover:bg-slate-400'
              }`}
              aria-label={`Ir para terreno ${idx + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
};
