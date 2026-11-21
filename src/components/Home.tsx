import React, { useState } from 'react';
import { developments } from '../data/developmentsData';
import { MapPin, ArrowRight, ShieldCheck, CheckCircle2, Phone, TrendingUp, Users, Gem, ChevronLeft, ChevronRight } from 'lucide-react';

interface HomeProps {
  onSelectDevelopment: (slug: string) => void;
  onOpenRentals: () => void;
}

export const Home: React.FC<HomeProps> = ({ onSelectDevelopment, onOpenRentals }) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const promoCards = [
    { title: 'Ponte Alta', price: 'R$ 3.000', image: '/imagens/mararu-hero-loteamento.jpg', badge: 'OFERTA BLACK FRIDAY', slug: 'bela-vista-mararu' },
    { title: 'São Francisco do Carapanari', price: 'R$ 3.500', image: '/imagens/bela-vista-mararu-hero-v2.jpg', badge: 'DESTAQUE', slug: 'cucuruna' },
    { title: 'Campo Novo', price: 'R$ 11.000', image: '/imagens/cucuruna-foto4.jpg', badge: '', slug: 'alenquer' },
    { title: 'Mararu Ville', price: 'R$ 600', image: '/imagens/mararu-hero-rafael.jpg', badge: 'LANÇAMENTO', slug: 'mararu' },
    { title: 'Bela Vista do Mararu', price: 'R$ 46.600', image: '/imagens/bela-vista-mararu-capa.jpg', badge: '', slug: 'bela-vista-mararu' },
    { title: 'Jardim Alenquer', price: 'R$ 16.500', image: '/imagens/alenquer-obra-7.jpeg', badge: 'NOVO', slug: 'alenquer' },
    { title: 'Cucurunã (Vitória Régia)', price: 'R$ 25.500', image: '/imagens/cucuruna-foto2.jpg', badge: '', slug: 'cucuruna' },
    { title: 'Pajuçara', price: 'R$ 12.000', image: '/imagens/pajuca-foto1.jpeg', badge: '', slug: 'mararu' },
    { title: 'Santa Maria', price: 'R$ 14.500', image: '/imagens/santa-maria-obra-1.jpeg', badge: '', slug: 'bela-vista-mararu' },
    { title: 'Espírito Santo', price: 'R$ 18.000', image: '/imagens/espirito-santo-hero.jpg', badge: '', slug: 'cucuruna' },
    { title: 'Monte Alegre (Jussaramia)', price: 'R$ 15.000', image: '/imagens/monte-alegre-hero.jpg', badge: '', slug: 'alenquer' }
  ];

  const handlePrev = () => {
    setCurrentIndex(prev => (prev === 0 ? promoCards.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev === promoCards.length - 1 ? 0 : prev + 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX;
    if (diff > 40) {
      handlePrev();
    } else if (diff < -40) {
      handleNext();
    }
    setTouchStartX(null);
  };

  const leftIndex = (currentIndex - 1 + promoCards.length) % promoCards.length;
  const centerIndex = currentIndex;
  const rightIndex = (currentIndex + 1) % promoCards.length;

  return (
    <div className="min-h-screen bg-black text-[#F2EDE4] font-sans selection:bg-[#C9A84C] selection:text-black">
      
      {/* HERO BANNER SECTION (100% width, flush against header, bottom gradient to #002719) */}
      <section className="relative w-full bg-[#002719] pt-0 mt-0">
        <div className="relative w-full overflow-hidden m-0 p-0">
          <img 
            src="/imagens/black-friday-banner-v2.png?v=2" 
            alt="Black Friday dos Terrenos 2026 - Rafael Tavares" 
            className="w-full h-auto object-cover block m-0 p-0"
          />
          {/* Degradê inferior de transparente para #002719 */}
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#002719] via-[#002719]/60 to-transparent pointer-events-none"></div>
          <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md border border-[#C9A84C]/50 px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-[11px] font-bold text-[#C9A84C] z-20">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C9A84C]" /> CRECI 13919 · Rafael Tavares
          </div>
        </div>
      </section>

      {/* EXPLORE AS OPORTUNIDADES (Carrossel com 3 terrenos visíveis: centro maior, laterais visíveis, 11 terrenos, setas sempre visíveis, touch swipe) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
            Explore as <span className="text-[#C9A84C] italic">Oportunidades</span>
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            Arraste para o lado ou use as setas para ver todos os {promoCards.length} terrenos em promoção!
          </p>
        </div>

        {/* 3-Card Carousel Container with Touch & Always Visible Arrows */}
        <div 
          className="relative flex items-center justify-center gap-3 sm:gap-6 py-6"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          
          {/* Navigation Arrows - Always Visible */}
          <button 
            onClick={handlePrev}
            className="absolute left-1 sm:left-2 z-50 w-12 h-12 rounded-full bg-zinc-900 border-2 border-[#C9A84C] text-[#C9A84C] flex items-center justify-center hover:bg-[#C9A84C] hover:text-black transition-all shadow-2xl cursor-pointer"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-7 h-7" />
          </button>

          <button 
            onClick={handleNext}
            className="absolute right-1 sm:right-2 z-50 w-12 h-12 rounded-full bg-zinc-900 border-2 border-[#C9A84C] text-[#C9A84C] flex items-center justify-center hover:bg-[#C9A84C] hover:text-black transition-all shadow-2xl cursor-pointer"
            aria-label="Próximo"
          >
            <ChevronRight className="w-7 h-7" />
          </button>

          {/* Left Neighbor Card (Smaller, partially visible) */}
          <div 
            onClick={handlePrev}
            className="flex flex-col w-[140px] sm:w-[220px] md:w-[260px] bg-zinc-950/80 rounded-2xl overflow-hidden border border-zinc-800/80 shadow-lg opacity-60 scale-90 cursor-pointer hover:opacity-85 transition-all duration-300 shrink-0"
          >
            <div className="relative h-28 sm:h-36 w-full bg-zinc-900 overflow-hidden">
              <img src={promoCards[leftIndex].image} alt={promoCards[leftIndex].title} className="w-full h-full object-cover" />
            </div>
            <div className="p-3 sm:p-4 space-y-1 sm:space-y-2">
              <div className="text-[10px] sm:text-[11px] text-[#C9A84C] font-semibold flex items-center gap-1 truncate">
                <MapPin className="w-3 h-3 shrink-0" /> {promoCards[leftIndex].title}
              </div>
              <div className="font-serif text-sm sm:text-lg font-bold text-zinc-300">
                {promoCards[leftIndex].price}
              </div>
            </div>
          </div>

          {/* Center Active Card (Larger, prominent with gold border & badge) */}
          <div className="relative flex flex-col w-[260px] sm:w-[380px] bg-zinc-950 rounded-2xl overflow-hidden border-2 border-[#C9A84C] shadow-[0_20px_50px_rgba(201,168,76,0.25)] z-30 scale-100 transition-all duration-300 shrink-0">
            {promoCards[centerIndex].badge && (
              <div className="absolute -top-1 left-4 z-40 bg-red-600 text-white text-[10px] sm:text-[11px] font-black uppercase px-3 sm:px-4 py-1.5 tracking-wider rotate-[-2deg] shadow-lg rounded-b-md">
                {promoCards[centerIndex].badge}
              </div>
            )}

            <div className="relative h-44 sm:h-56 w-full bg-zinc-900 overflow-hidden">
              <img src={promoCards[centerIndex].image} alt={promoCards[centerIndex].title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
            </div>

            <div className="p-4 sm:p-5 space-y-3 sm:space-y-4">
              <div className="flex items-center gap-1.5 text-xs text-[#C9A84C] font-bold uppercase tracking-wider">
                <MapPin className="w-4 h-4" /> {promoCards[centerIndex].title}
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <div className="text-[10px] text-zinc-400 uppercase tracking-widest">A partir de</div>
                  <div className="font-serif text-2xl sm:text-3xl font-bold text-[#C9A84C]">{promoCards[centerIndex].price}</div>
                </div>
                <button 
                  onClick={() => onSelectDevelopment(promoCards[centerIndex].slug)}
                  className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-[#C9A84C] to-[#E8C96A] hover:opacity-90 text-black text-[11px] sm:text-xs font-bold rounded-xl transition-all shadow-lg"
                >
                  Ver detalhes <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Neighbor Card (Smaller, partially visible) */}
          <div 
            onClick={handleNext}
            className="flex flex-col w-[140px] sm:w-[220px] md:w-[260px] bg-zinc-950/80 rounded-2xl overflow-hidden border border-zinc-800/80 shadow-lg opacity-60 scale-90 cursor-pointer hover:opacity-85 transition-all duration-300 shrink-0"
          >
            <div className="relative h-28 sm:h-36 w-full bg-zinc-900 overflow-hidden">
              <img src={promoCards[rightIndex].image} alt={promoCards[rightIndex].title} className="w-full h-full object-cover" />
            </div>
            <div className="p-3 sm:p-4 space-y-1 sm:space-y-2">
              <div className="text-[10px] sm:text-[11px] text-[#C9A84C] font-semibold flex items-center gap-1 truncate">
                <MapPin className="w-3 h-3 shrink-0" /> {promoCards[rightIndex].title}
              </div>
              <div className="font-serif text-sm sm:text-lg font-bold text-zinc-300">
                {promoCards[rightIndex].price}
              </div>
            </div>
          </div>

        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center items-center gap-1.5 sm:gap-2 mt-8 flex-wrap max-w-xl mx-auto">
          {promoCards.map((_, idx) => (
            <button 
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all ${idx === currentIndex ? 'w-6 sm:w-8 bg-[#C9A84C]' : 'w-2 bg-zinc-800 hover:bg-zinc-700'}`}
              aria-label={`Ir para terreno ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* PORTFOLIO DE LOTEAMENTOS COMPLETOS */}
      <section id="empreendimentos" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-zinc-900">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="text-xs uppercase tracking-[0.3em] text-[#C9A84C] font-bold">Portfólio Completo</div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
            Nossos <span className="text-[#C9A84C] italic">Loteamentos</span>
          </h2>
          <p className="text-xs text-zinc-400">
            Clique em qualquer empreendimento abaixo para acessar plantas, vídeos e tabelas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {developments.map((dev) => (
            <div 
              key={dev.id}
              onClick={() => onSelectDevelopment(dev.slug)}
              className="bg-zinc-950 border border-zinc-800 hover:border-[#C9A84C] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 shadow-xl flex flex-col group"
            >
              <div className="relative h-48 overflow-hidden bg-zinc-900">
                <img src={dev.heroImage} alt={dev.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                <span className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-bold text-[#C9A84C] border border-[#C9A84C]/30">
                  {dev.badge}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="text-[10px] text-[#C9A84C] uppercase tracking-wider mb-1">{dev.city} · Pará</div>
                  <h3 className="font-serif text-xl font-bold text-white group-hover:text-[#C9A84C] transition-colors">{dev.title}</h3>
                  <p className="text-xs text-zinc-400 line-clamp-2 mt-1">{dev.description}</p>
                </div>

                <div className="pt-3 border-t border-zinc-900 flex items-center justify-between">
                  <div>
                    <div className="text-[9px] text-zinc-400 uppercase">Entrada</div>
                    <div className="font-serif text-lg font-bold text-[#C9A84C]">{dev.entrancePrice}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] text-zinc-400 uppercase">Parcela</div>
                    <div className="font-bold text-xs text-white">{dev.installmentPrice}</div>
                  </div>
                </div>

                <button className="w-full py-2 bg-[#C9A84C]/10 hover:bg-[#C9A84C] text-[#C9A84C] hover:text-black rounded-lg font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5">
                  Ver Detalhes e Mapa <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MAIS DO QUE UM TERRENO, É O INÍCIO DO SEU PATRIMÔNIO */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-zinc-950 border-t border-[#C9A84C]/20">
        <div className="max-w-6xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="font-serif text-4xl sm:text-5xl font-bold text-white leading-tight">
              Mais do que um terreno, é o início do <span className="text-[#C9A84C] italic">seu patrimônio.</span>
            </h2>
            <p className="text-sm text-zinc-300 leading-relaxed">
              Um espaço para construir sua casa, criar sua família e realizar grandes sonhos com segurança e valorização garantida.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="bg-zinc-900/80 border border-[#C9A84C]/30 p-4 rounded-xl flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#C9A84C] shrink-0" />
                <span className="text-xs font-bold text-white">Qualidade de vida</span>
              </div>
              <div className="bg-zinc-900/80 border border-[#C9A84C]/30 p-4 rounded-xl flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-[#C9A84C] shrink-0" />
                <span className="text-xs font-bold text-white">Potencial de valorização</span>
              </div>
              <div className="bg-zinc-900/80 border border-[#C9A84C]/30 p-4 rounded-xl flex items-center gap-3">
                <Users className="w-5 h-5 text-[#C9A84C] shrink-0" />
                <span className="text-xs font-bold text-white">Segurança para sua família</span>
              </div>
              <div className="bg-zinc-900/80 border border-[#C9A84C]/30 p-4 rounded-xl flex items-center gap-3">
                <Gem className="w-5 h-5 text-[#C9A84C] shrink-0" />
                <span className="text-xs font-bold text-white">Investimento inteligente</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#121c0e] to-zinc-950 border border-[#C9A84C]/50 rounded-3xl p-8 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 bg-[#C9A84C]/10 border border-[#C9A84C]/40 rounded-full flex items-center justify-center mx-auto text-[#C9A84C]">
              <Phone className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="font-serif text-2xl font-bold text-white">Atendimento Imediato</h3>
              <p className="text-xs text-zinc-300">
                Fale diretamente com Rafael Tavares e garanta as melhores condições de Black Friday.
              </p>
            </div>
            <a 
              href="https://wa.me/5593992332012?text=Olá%20Rafael,%20quero%20escolher%20meu%20terreno%20com%20as%20condições%20de%20Black%20Friday!"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 w-full py-3.5 bg-gradient-to-r from-[#25d366] to-[#20b858] hover:from-[#20b858] hover:to-[#199947] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-xl transition-all"
            >
              <Phone className="w-5 h-5" /> QUERO ESCOLHER MEU TERRENO <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

    </div>
  );
};
