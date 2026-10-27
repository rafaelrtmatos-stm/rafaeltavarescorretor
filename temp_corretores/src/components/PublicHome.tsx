import React, { useState, useEffect } from 'react';
import { Building2, ShieldCheck, Award, MapPin, ArrowRight, ExternalLink, CheckCircle2, FileText, Sparkles } from 'lucide-react';
import { Property } from '../types';

interface PublicHomeProps {
  onOpenLogin: () => void;
  onViewHub: () => void;
  isLoggedIn: boolean;
}

export const PublicHome: React.FC<PublicHomeProps> = ({ onOpenLogin, onViewHub, isLoggedIn }) => {
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    fetch('/api/properties')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setProperties(data.slice(0, 3));
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-24 pb-24 bg-[#050504] text-[#F5F0E6] animate-in fade-in duration-300">
      
      {/* Hero Section */}
      <section className="relative bg-[#050504] text-[#F5F0E6] overflow-hidden py-24 sm:py-32 border-b border-[#26221c]">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#CBA747_1px,transparent_1px)] [background-size:32px_32px]"></div>
        <div className="absolute right-0 top-1/4 w-[500px] h-[500px] bg-[#CBA747]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#14120f] text-[#CBA747] font-bold text-xs uppercase tracking-wider border border-[#CBA747]/30">
              <Award className="w-4 h-4 text-[#CBA747]" /> CRECI-PA • Excelência Imobiliária
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight text-[#F5F0E6]">
              Encontre o Imóvel dos Seus Sonhos em <span className="bg-gradient-to-r from-[#CBA747] to-[#E8D8A0] bg-clip-text text-transparent">Santarém e Região</span>
            </h1>

            <p className="text-lg text-[#77736B] leading-relaxed">
              Atuação especializada em lançamentos de alto padrão, condomínios fechados, lotes exclusivos e investimentos com alta valorização imobiliária.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <button
                onClick={isLoggedIn ? onViewHub : onOpenLogin}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#CBA747] to-[#E8D8A0] text-[#050504] font-extrabold text-base shadow-xl shadow-[#CBA747]/20 hover:from-[#d8b552] hover:to-[#f2e2b2] transition-all flex items-center justify-center gap-3"
              >
                {isLoggedIn ? 'Acessar Central de Materiais' : 'Portal Exclusivo para Corretores'}
                <ArrowRight className="w-5 h-5" />
              </button>
              <a
                href="#empreendimentos"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#14120f] hover:bg-[#1a1713] text-[#F5F0E6] font-bold text-base border border-[#26221c] transition-all text-center"
              >
                Ver Empreendimentos
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section id="empreendimentos" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-xs font-bold text-[#CBA747] uppercase tracking-widest">Portfólio em Destaque</h2>
          <h3 className="text-3xl font-black text-[#F5F0E6]">Principais Empreendimentos</h3>
          <p className="text-[#77736B] text-sm">Conheça nossos lançamentos e oportunidades imperdíveis de investimento.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map(p => (
            <div key={p.id} className="bg-[#0c0a08] border border-[#26221c] rounded-3xl overflow-hidden shadow-xl hover:border-[#CBA747]/50 transition-all group flex flex-col">
              <div className="relative h-64 overflow-hidden">
                <img src={p.coverImage} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050504] via-[#050504]/20 to-transparent"></div>
                <span className="absolute top-4 left-4 bg-[#CBA747] text-[#050504] px-3 py-1 rounded-full text-xs font-bold shadow-md">
                  Lançamento
                </span>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h4 className="text-xl font-bold text-[#F5F0E6] group-hover:text-[#CBA747] transition-colors">{p.title}</h4>
                  <p className="text-xs text-[#77736B] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#CBA747] shrink-0" /> {p.location}
                  </p>
                  <p className="text-xs text-[#77736B] line-clamp-2">{p.description}</p>
                </div>

                <button
                  onClick={isLoggedIn ? onViewHub : onOpenLogin}
                  className="w-full py-3 rounded-xl bg-[#14120f] hover:bg-[#1a1713] text-[#CBA747] border border-[#CBA747]/30 font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  Ver Detalhes e Materiais <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* About Rafael Tavares */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#0c0a08] border border-[#26221c] rounded-3xl p-8 sm:p-12 shadow-2xl flex flex-col md:flex-row items-center gap-10">
          <div className="w-32 h-32 sm:w-48 sm:h-48 rounded-full bg-gradient-to-tr from-[#CBA747] to-[#E8D8A0] p-1 shrink-0 shadow-2xl">
            <div className="w-full h-full rounded-full bg-[#050504] flex items-center justify-center font-black text-4xl text-[#CBA747]">
              RT
            </div>
          </div>
          <div className="space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#14120f] text-[#CBA747] font-bold text-xs uppercase border border-[#CBA747]/30">
              Corretor Master
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-[#F5F0E6]">Rafael Tavares</h3>
            <p className="text-[#77736B] text-sm leading-relaxed">
              Com anos de experiência no mercado imobiliário de Santarém e região, Rafael Tavares destaca-se pela seriedade, conhecimento profundo de mercado e parceria sólida com corretores credenciados. A Central de Materiais foi desenvolvida para garantir agilidade, suporte e máxima conversão nas vendas.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2 text-xs text-[#77736B]">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-[#CBA747]" /> CRECI-PA Credenciado</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#CBA747]" /> Atendimento Exclusivo</span>
              <span className="flex items-center gap-1.5"><Award className="w-4 h-4 text-[#CBA747]" /> Especialista em Lançamentos</span>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
