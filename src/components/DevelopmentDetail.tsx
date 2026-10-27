import React from 'react';
import { Development } from '../types';
import { ArrowLeft, MapPin, CheckCircle, Phone, Share2, Calendar, ShieldCheck } from 'lucide-react';

interface DevelopmentDetailProps {
  development: Development;
  onBack: () => void;
  onStartReserva: (slug: string) => void;
}

export const DevelopmentDetail: React.FC<DevelopmentDetailProps> = ({ development, onBack, onStartReserva }) => {
  const [activeMediaIndex, setActiveMediaIndex] = React.useState(0);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: development.title,
        text: development.description,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado para a área de transferência!');
    }
  };

  return (
    <div className="min-h-screen bg-black text-[#F2EDE4]">
      {/* Top back bar */}
      <div className="bg-zinc-950 border-b border-zinc-900 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button 
            onClick={onBack}
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-[#C9A84C] text-xs font-bold uppercase tracking-wider transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar ao Início
          </button>
          <button 
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 text-[#C9A84C] border border-[#C9A84C]/40 hover:bg-[#C9A84C]/10 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all"
          >
            <Share2 className="w-3.5 h-3.5" /> Compartilhar
          </button>
        </div>
      </div>

      {/* Hero Header */}
      <section className="relative py-16 px-4 bg-gradient-to-b from-zinc-950 to-black border-b border-zinc-900">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-[#C9A84C]/10 border border-[#C9A84C]/30 text-[#C9A84C] px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest">
            {development.badge}
          </div>
          <h1 className="font-serif text-4xl sm:text-6xl font-bold text-white">
            {development.title}
          </h1>
          <p className="text-sm text-[#C9A84C] uppercase tracking-widest flex items-center justify-center gap-1">
            <MapPin className="w-4 h-4" /> {development.location}
          </p>
          <p className="text-sm sm:text-base text-zinc-300 max-w-2xl mx-auto font-light leading-relaxed pt-2">
            {development.description}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-6">
            <button 
              onClick={() => onStartReserva(development.slug)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#B8902A] via-[#E8C96A] to-[#B8902A] text-black px-8 py-4 rounded-full font-bold text-xs uppercase tracking-widest shadow-xl shadow-[#C9A84C]/20 hover:scale-105 transition-all"
            >
              <Calendar className="w-4 h-4" /> Pré-Reserva Online de Lote
            </button>
            <a 
              href={`https://wa.me/5593991234567?text=${encodeURIComponent(development.whatsappMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25d366]/10 hover:bg-[#25d366] border border-[#25d366]/40 text-[#25d366] hover:text-black px-8 py-4 rounded-full font-bold text-xs uppercase tracking-widest transition-all"
            >
              <Phone className="w-4 h-4" /> Falar no WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* STATS BAND */}
      <section className="bg-zinc-950/80 border-b border-zinc-900 py-6 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-zinc-400">Entrada Mínima</div>
            <div className="font-serif text-2xl font-bold text-[#C9A84C] mt-1">{development.entrancePrice}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-zinc-400">Parcelas a partir de</div>
            <div className="font-serif text-2xl font-bold text-[#C9A84C] mt-1">{development.installmentPrice}</div>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <div className="text-[10px] uppercase tracking-widest text-zinc-400">Total de Lotes</div>
            <div className="font-serif text-2xl font-bold text-[#C9A84C] mt-1">{development.totalLots} Lotes</div>
          </div>
        </div>
      </section>

      {/* GALLERY & MEDIA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <div className="text-xs uppercase tracking-[0.3em] text-[#C9A84C] font-bold">Registro Real</div>
          <h2 className="font-serif text-3xl font-bold text-white">Galeria de <span className="text-[#C9A84C] italic">Fotos</span></h2>
        </div>

        {/* Main Preview */}
        <div className="relative rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 aspect-video max-h-[500px] mb-4 shadow-2xl">
          <img 
            src={development.gallery[activeMediaIndex] || development.heroImage} 
            alt={development.title} 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Thumbnails */}
        {development.gallery.length > 1 && (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {development.gallery.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveMediaIndex(idx)}
                className={`relative rounded-xl overflow-hidden w-28 h-20 shrink-0 border-2 transition-all ${
                  activeMediaIndex === idx ? 'border-[#C9A84C] scale-105' : 'border-zinc-800 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </section>

      {/* PRICING TABLE & FEATURES */}
      <section className="bg-zinc-950 py-20 px-4 sm:px-6 lg:px-8 border-t border-zinc-900">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* Features */}
          <div className="space-y-6">
            <div className="text-xs uppercase tracking-[0.3em] text-[#C9A84C] font-bold">Diferenciais</div>
            <h2 className="font-serif text-3xl font-bold text-white">Por que investir aqui?</h2>
            <ul className="space-y-4">
              {development.features.map((feat, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-zinc-300">
                  <CheckCircle className="w-5 h-5 text-[#C9A84C] shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>

            <div className="pt-4">
              <div className="p-5 rounded-2xl bg-[#C9A84C]/10 border border-[#C9A84C]/30 text-xs text-zinc-300 space-y-2">
                <div className="font-bold text-[#C9A84C] uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> Compra Segura CRECI 13919
                </div>
                <p>
                  Atendimento oficial com o corretor Rafael Tavares. Sem intermediários ocultos e com total segurança jurídica.
                </p>
              </div>
            </div>
          </div>

          {/* Pricing Plans */}
          <div className="space-y-6">
            <div className="text-xs uppercase tracking-[0.3em] text-[#C9A84C] font-bold">Tabela de Preços</div>
            <h2 className="font-serif text-3xl font-bold text-white">Valores & Condições</h2>

            <div className="space-y-4">
              {development.pricingPlans.map((plan, i) => (
                <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4 shadow-xl">
                  <div className="font-serif text-xl font-bold text-white">{plan.title}</div>
                  <div className="grid grid-cols-2 gap-4 py-3 border-y border-zinc-800">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-zinc-400">Valor Total</div>
                      <div className="text-lg font-bold text-[#C9A84C]">{plan.total}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-zinc-400">Entrada</div>
                      <div className="text-lg font-bold text-white">{plan.entrance}</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-zinc-400">Parcelamento</div>
                    <div className="text-sm font-semibold text-zinc-200 mt-0.5">{plan.installment}</div>
                  </div>
                  
                  <button 
                    onClick={() => onStartReserva(development.slug)}
                    className="w-full py-3 bg-[#C9A84C] hover:bg-[#E8C96A] text-black rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
                  >
                    Garantir Este Lote Agora
                  </button>
                </div>
              ))}
            </div>

          </div>

        </div>
      </section>

    </div>
  );
};
