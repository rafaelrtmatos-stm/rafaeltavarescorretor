import React, { useState } from 'react';
import { developments } from '../data/developmentsData';
import { Development } from '../types';
import { ShieldCheck, ArrowRight, MapPin, CheckCircle, Sparkles } from 'lucide-react';

interface HomeProps {
  onSelectDevelopment: (slug: string) => void;
  onOpenRentals: () => void;
}

export const Home: React.FC<HomeProps> = ({ onSelectDevelopment, onOpenRentals }) => {
  const [selectedCity, setSelectedCity] = useState<string>('todos');

  const filteredDevs = selectedCity === 'todos' 
    ? developments 
    : developments.filter(d => d.city.toLowerCase() === selectedCity.toLowerCase());

  return (
    <div className="min-h-screen bg-black text-[#F2EDE4]">
      
      {/* HERO SECTION */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-4 py-20 overflow-hidden">
        {/* Background Map / Image Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/imagens/mararu-hero-loteamento.jpg" 
            alt="Rafael Tavares Corretor" 
            className="w-full h-full object-cover filter brightness-[0.35] scale-105 animate-pulse" 
            style={{ animationDuration: '10s' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#C9A84C]/40 bg-[#C9A84C]/10 text-[#C9A84C] text-xs font-semibold tracking-widest uppercase">
            <span className="w-2 h-2 rounded-full bg-[#C9A84C] animate-ping"></span>
            Lançamentos Oficiais · Santarém, Alenquer e Monte Alegre
          </div>

          <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-white leading-[1.05]">
            Realize o sonho do <span className="text-[#C9A84C] italic">terreno próprio</span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-300 max-w-2xl mx-auto font-light leading-relaxed">
            Lotes selecionados com entrada facilitada e parcelas que cabem no seu bolso. Atendimento direto com <strong>Rafael Tavares · CRECI 13919</strong>.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <a 
              href="#empreendimentos" 
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#B8902A] via-[#E8C96A] to-[#B8902A] text-black px-8 py-4 rounded-full font-bold text-xs uppercase tracking-widest shadow-xl shadow-[#C9A84C]/20 hover:scale-105 transition-all"
            >
              Ver Empreendimentos <ArrowRight className="w-4 h-4" />
            </a>
            <button 
              onClick={onOpenRentals}
              className="inline-flex items-center gap-2 bg-zinc-900/80 hover:bg-zinc-800 border border-[#C9A84C]/40 text-[#C9A84C] px-8 py-4 rounded-full font-bold text-xs uppercase tracking-widest transition-all"
            >
              Ver Imóveis para Alugar
            </button>
          </div>
        </div>
      </section>

      {/* STATS BAND */}
      <section className="bg-zinc-950 border-y border-[#C9A84C]/20 py-10 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="font-serif text-3xl sm:text-4xl font-bold text-[#C9A84C]">R$ 500</div>
            <div className="text-[10px] uppercase tracking-widest text-zinc-400 mt-1">Entrada a partir de</div>
          </div>
          <div>
            <div className="font-serif text-3xl sm:text-4xl font-bold text-[#C9A84C]">80x a 120x</div>
            <div className="text-[10px] uppercase tracking-widest text-zinc-400 mt-1">Parcelas Fixas</div>
          </div>
          <div>
            <div className="font-serif text-3xl sm:text-4xl font-bold text-[#C9A84C]">CRECI 13919</div>
            <div className="text-[10px] uppercase tracking-widest text-zinc-400 mt-1">Registro Profissional</div>
          </div>
          <div>
            <div className="font-serif text-3xl sm:text-4xl font-bold text-[#C9A84C]">100%</div>
            <div className="text-[10px] uppercase tracking-widest text-zinc-400 mt-1">Segurança Jurídica</div>
          </div>
        </div>
      </section>

      {/* DEVELOPMENTS PORTFOLIO */}
      <section id="empreendimentos" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="text-xs uppercase tracking-[0.3em] text-[#C9A84C] font-bold">Portfólio de Oportunidades</div>
          <h2 className="font-serif text-4xl sm:text-5xl font-bold text-white">
            Escolha seu <span className="text-[#C9A84C] italic">Loteamento</span>
          </h2>
          <p className="text-sm text-zinc-400">
            Filtre por cidade e encontre o lote ideal para construir ou investir com total segurança.
          </p>

          {/* City Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            {['todos', 'Santarém', 'Alenquer', 'Monte Alegre'].map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                  selectedCity === city 
                    ? 'bg-[#C9A84C] text-black shadow-lg shadow-[#C9A84C]/20' 
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-[#C9A84C]/50'
                }`}
              >
                {city === 'todos' ? 'Todas as Cidades' : city}
              </button>
            ))}
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredDevs.map((dev) => (
            <div 
              key={dev.id}
              onClick={() => onSelectDevelopment(dev.slug)}
              className="group bg-zinc-950 border border-zinc-800 hover:border-[#C9A84C]/60 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1.5 shadow-2xl flex flex-col"
            >
              <div className="relative h-60 overflow-hidden bg-zinc-900">
                <img 
                  src={dev.heroImage} 
                  alt={dev.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent"></div>
                <span className="absolute top-4 left-4 bg-black/80 backdrop-blur-md border border-[#C9A84C]/40 text-[#C9A84C] text-[10px] uppercase font-bold tracking-wider px-3 py-1.5 rounded-lg">
                  {dev.badge}
                </span>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="text-[11px] text-[#C9A84C] tracking-widest uppercase font-semibold flex items-center gap-1 mb-1">
                    <MapPin className="w-3.5 h-3.5" /> {dev.city} · Pará
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-white group-hover:text-[#C9A84C] transition-colors">
                    {dev.title}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                    {dev.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-zinc-900 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-zinc-400 uppercase tracking-wider">Entrada a partir de</div>
                    <div className="font-serif text-xl font-bold text-[#C9A84C]">{dev.entrancePrice}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-zinc-400 uppercase tracking-wider">Parcelas</div>
                    <div className="font-semibold text-sm text-white">{dev.installmentPrice}</div>
                  </div>
                </div>

                <button 
                  className="w-full mt-2 py-3 bg-[#C9A84C]/10 hover:bg-[#C9A84C] text-[#C9A84C] hover:text-black rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                >
                  Ver Tabela e Mapa <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WHY CHOOSE RAFAEL TAVARES */}
      <section className="bg-zinc-950 py-24 border-t border-[#C9A84C]/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="text-xs uppercase tracking-[0.3em] text-[#C9A84C] font-bold">Referência no Pará</div>
            <h2 className="font-serif text-4xl font-bold text-white leading-tight">
              Segurança, Transparência e <span className="text-[#C9A84C] italic">Experiência</span>
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              O corretor <strong>Rafael Tavares (CRECI 13919)</strong> atua com excelência no mercado imobiliário de Santarém e região, oferecendo suporte completo desde a escolha do melhor lote até a assinatura do contrato e entrega.
            </p>
            <ul className="space-y-3 text-sm text-zinc-300">
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-[#C9A84C] shrink-0" /> Loteamentos com documentação regularizada
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-[#C9A84C] shrink-0" /> Parcelamentos flexíveis direto com a imobiliária
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-[#C9A84C] shrink-0" /> Atendimento ágil e personalizado via WhatsApp
              </li>
            </ul>
          </div>

          <div className="relative bg-zinc-900 border border-[#C9A84C]/30 rounded-3xl p-8 shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#C9A84C]/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="font-serif text-2xl font-bold text-[#C9A84C] mb-2">Atendimento Direto</div>
            <p className="text-sm text-zinc-400 mb-6">
              Fale agora mesmo com o corretor responsável e tire suas dúvidas sobre qualquer empreendimento.
            </p>
            <a 
              href="https://wa.me/5593991234567?text=Olá%20Rafael,%20gostaria%20de%20conversar%20sobre%20lotes%20em%20Santarém." 
              target="_blank" 
              rel="noopener noreferrer"
              className="block w-full py-4 text-center bg-[#25d366] hover:bg-[#20b858] text-black font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg transition-all"
            >
              Chamar no WhatsApp (93) 99123-4567
            </a>
          </div>
        </div>
      </section>

    </div>
  );
};
