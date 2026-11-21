import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Tag } from 'lucide-react';
import { Property } from '../data/properties';

interface PropertyCarouselProps {
  properties: Property[];
  onSelectProperty: (property: Property) => void;
}

export const PropertyCarousel: React.FC<PropertyCarouselProps> = ({ properties, onSelectProperty }) => {
  const [activeIndex, setActiveIndex] = useState<number>(1); // Default center on index 1 (Ponte Alta)
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToIndex = (index: number) => {
    if (index < 0 || index >= properties.length) return;
    setActiveIndex(index);
    if (scrollRef.current) {
      const container = scrollRef.current;
      const card = container.children[index] as HTMLElement;
      if (card) {
        container.scrollTo({
          left: card.offsetLeft - container.clientWidth / 2 + card.clientWidth / 2,
          behavior: 'smooth'
        });
      }
    }
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
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
    <section className="bg-white py-8 px-4 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative">
        
        {/* Navigation Arrows */}
        <button
          onClick={() => scrollToIndex(activeIndex - 1)}
          disabled={activeIndex === 0}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-[#032215]/90 hover:bg-[#032215] text-[#d4af37] rounded-full flex items-center justify-center shadow-lg backdrop-blur-md disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-[#d4af37]/50"
          aria-label="Anterior"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={() => scrollToIndex(activeIndex + 1)}
          disabled={activeIndex === properties.length - 1}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-[#032215]/90 hover:bg-[#032215] text-[#d4af37] rounded-full flex items-center justify-center shadow-lg backdrop-blur-md disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-[#d4af37]/50"
          aria-label="Próximo"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Carousel Scroll Container */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-none py-8 px-6 sm:px-16 items-center justify-start md:justify-center"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {properties.map((prop, idx) => {
            const isActive = idx === activeIndex;
            return (
              <div
                key={prop.id}
                onClick={() => {
                  scrollToIndex(idx);
                  onSelectProperty(prop);
                }}
                className={`flex-shrink-0 snap-center transition-all duration-500 cursor-pointer rounded-3xl overflow-hidden shadow-2xl bg-[#032215] border-2 transform ${
                  isActive
                    ? 'w-[300px] sm:w-[360px] md:w-[400px] border-[#d4af37] scale-105 shadow-[0_20px_50px_rgba(212,175,55,0.4)] z-20 opacity-100'
                    : 'w-[240px] sm:w-[280px] md:w-[310px] border-[#1b583c]/60 scale-90 opacity-70 hover:opacity-90 z-10'
                }`}
              >
                {/* Card Top Image */}
                <div className={`relative overflow-hidden bg-slate-900 transition-all duration-500 ${isActive ? 'h-56 sm:h-64 md:h-72' : 'h-44 sm:h-50 md:h-56'}`}>
                  <div
                    className="absolute inset-0 bg-cover bg-center transform hover:scale-105 transition-transform duration-500"
                    style={{
                      backgroundImage: `url('${prop.image}')`,
                    }}
                  ></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#032215] via-transparent to-black/20"></div>

                  {/* Black Friday Ribbon Banner on Active Card */}
                  {prop.badge && (
                    <div className="absolute top-4 -left-12 bg-red-600 text-white font-black text-[11px] tracking-wider uppercase py-1.5 px-14 transform -rotate-45 shadow-2xl border border-red-400">
                      {prop.badge}
                    </div>
                  )}

                  {/* Location badge on image */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-[#032215]/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-[#d4af37]/60 shadow-md">
                    <MapPin className="w-4 h-4 text-[#d4af37]" />
                    <span className="text-white text-xs sm:text-sm font-semibold">{prop.title}</span>
                  </div>
                </div>

                {/* Card Bottom Price & Action Area matching exact reference */}
                <div className="p-4 sm:p-5 bg-gradient-to-b from-[#032215] to-[#01140b] flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-3">
                    {/* Golden Price Pill Box */}
                    <div className="bg-gradient-to-r from-[#fef08a] via-[#facc15] to-[#ca8a04] px-4 py-2 rounded-2xl shadow-lg border border-white/25 flex-grow text-center">
                      <span className="text-lg sm:text-2xl font-black text-[#032215] tracking-tight block">
                        {prop.price}
                      </span>
                    </div>

                    {/* Ver Detalhes Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectProperty(prop);
                      }}
                      className="px-4 py-3 bg-[#053d24] hover:bg-[#074e2e] border border-[#10b981]/50 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md flex items-center gap-1 transition-all flex-shrink-0"
                    >
                      <span>Ver detalhes</span>
                      <ChevronRight className="w-4 h-4 text-[#facc15]" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center items-center gap-2 mt-4">
          {properties.map((_, idx) => (
            <button
              key={idx}
              onClick={() => scrollToIndex(idx)}
              className={`transition-all duration-300 rounded-full ${
                idx === activeIndex
                  ? 'w-7 h-3 bg-[#d4af37]'
                  : 'w-3 h-3 bg-slate-300 hover:bg-slate-400'
              }`}
              aria-label={`Ir para terreno ${idx + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
};
