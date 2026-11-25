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
      if (rafScroll.current !== null) window.cancelAnimationFrame(rafScroll.current);
      if (scrollTimeoutRef.current) {
        window.clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [safeInitial]);

  const rafScroll = useRef<number | null>(null);
  const handleScroll = () => {
    if (rafScroll.current !== null) return;
    rafScroll.current = window.requestAnimationFrame(() => {
      rafScroll.current = null;
      updateActiveFromScroll();
    });
  };

  const updateActiveFromScroll = () => {
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
          className="absolute left-1.5 sm:left-4 top-[44%] -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 bg-[#032215]/90 hover:bg-[#032215] text-[#d4af37] rounded-full flex items-center justify-center shadow-lg transition-all border border-[#d4af37]/60 cursor-pointer"
          aria-label="Anterior"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <button
          onClick={() => scrollToIndex(activeIndex + 1)}
          className="absolute right-1.5 sm:right-4 top-[44%] -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 bg-[#032215]/90 hover:bg-[#032215] text-[#d4af37] rounded-full flex items-center justify-center shadow-lg transition-all border border-[#d4af37]/60 cursor-pointer"
          aria-label="Próximo"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Carousel Scroll Container */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-0 overflow-x-auto snap-x snap-mandatory scrollbar-none py-6 px-[calc(50%-150px)] sm:px-[calc(50%-160px)] md:px-[calc(50%-180px)] items-center justify-start touch-pan-x"
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
                className={`flex-shrink-0 w-[300px] sm:w-[320px] md:w-[360px] snap-center transition-[transform,opacity,margin] duration-300 will-change-transform cursor-pointer rounded-2xl overflow-hidden bg-[#032215] border-2 transform ${
                  isActive
                    ? 'cristal-card border-[#f6dd7a] scale-105 z-20 opacity-100 mx-1 sm:mx-2'
                    : 'cristal-card-lado border-[#1b583c]/70 scale-[0.8] opacity-95 hover:opacity-100 z-10 -mx-6 sm:-mx-7'
                }`}
              >
                {/* Card Top Image */}
                <div className="cristal-foto relative h-[210px] sm:h-[225px] md:h-[250px] overflow-hidden bg-slate-900">
                  <div
                    className="absolute inset-0 bg-cover bg-center transform hover:scale-105 transition-transform duration-500"
                    style={{
                      backgroundImage: `url('${prop.thumb || prop.image}')`,
                      filter: 'brightness(1.25) saturate(1.45) contrast(1.08)',
                    }}
                  ></div>
                  <div
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(to top, #032215 0%, rgba(3,34,21,0.55) 16%, rgba(3,34,21,0) 40%)' }}
                  ></div>

                  {/* Black Friday Red Diagonal Ribbon */}
                  {prop.badge && (
                    <div className="absolute top-[11px] -left-[36px] sm:top-[14px] sm:-left-[40px] w-[132px] sm:w-[156px] bg-gradient-to-r from-red-700 via-red-600 to-red-700 text-white font-black uppercase py-1 transform -rotate-45 shadow-lg border-y border-red-400/70 text-center leading-none">
                      <span className="block text-[9px] sm:text-[11px] tracking-wider">OFERTA</span>
                      <span className="block text-[6.5px] sm:text-[8px] text-[#fef08a] tracking-wide mt-[1px]">BLACK FRIDAY</span>
                    </div>
                  )}

                  {/* Centered Location & Title over bottom gradient */}
                  <div className="absolute bottom-1.5 inset-x-2 flex items-center justify-center gap-1">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[#facc15] flex-shrink-0" />
                    <span className="text-white text-[16px] sm:text-[17px] md:text-[19px] font-extrabold leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] text-center line-clamp-2">
                      {prop.title}
                    </span>
                  </div>
                </div>

                {/* Card Bottom Price & Action Area */}
                <div className="px-3 pb-3 pt-2 sm:px-4 sm:pb-4 bg-gradient-to-b from-[#032215] to-[#01140b]">
                  {prop.variants && prop.variants.length > 1 ? (
                    <>
                      {/* Two prices side by side */}
                      <div className="flex items-stretch justify-center gap-1.5 sm:gap-2">
                        {prop.variants.map((variant) => (
                          <div
                            key={variant.label}
                            className="flex-1 cristal cristal-ouro px-2 py-1.5 sm:px-2.5 sm:py-2 rounded-xl text-center"
                          >
                            <span className="block text-[9px] sm:text-[10px] font-bold uppercase tracking-wide text-[#032215]/70 leading-none mb-0.5">
                              {variant.label}
                            </span>
                            <span className="text-[15px] sm:text-[16px] md:text-[18px] font-black text-[#032215] tracking-tight block leading-none whitespace-nowrap">
                              {variant.price}
                            </span>
                          </div>
                        ))}
                      </div>

                      {isActive && (
                        <>
                          <div className="mt-2 grid grid-cols-2 gap-2">
                            {prop.variants.map((variant, vIdx) => (
                              <a
                                key={variant.label}
                                href={buildVariantLocationWhatsAppUrl(prop, variant)}
                                target="_blank"
                                rel="noopener noreferrer"
                                data-direct-wpp="true"
                                onClick={(e) => e.stopPropagation()}
                                className="cristal cristal-verde py-1.5 px-1 rounded-lg text-[#fde047] font-bold text-[10px] sm:text-[11px] flex items-center justify-center gap-0.5 transition-colors text-center leading-tight"
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
                            className="cristal cristal-verde mt-2 w-full px-3 py-2 text-white font-bold text-[12px] sm:text-sm rounded-full flex items-center justify-center gap-1 transition-all cursor-pointer whitespace-nowrap"
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
                          className={`cristal cristal-ouro px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-center ${
                            isActive ? 'flex-1' : 'w-full'
                          }`}
                        >
                          <span className="text-[20px] sm:text-[21px] md:text-[23px] font-black text-[#032215] tracking-tight block leading-none whitespace-nowrap">
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
                            className="cristal cristal-verde px-3 py-2 sm:px-3.5 sm:py-2.5 text-white font-bold text-[12px] sm:text-sm rounded-full flex items-center gap-1 transition-all flex-shrink-0 cursor-pointer whitespace-nowrap"
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
                          className="cristal cristal-verde mt-2 w-full py-2 px-2 rounded-lg text-[#fde047] font-bold text-[12px] sm:text-[13px] flex items-center justify-center gap-1 transition-colors"
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
