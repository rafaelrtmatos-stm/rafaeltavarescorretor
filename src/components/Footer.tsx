import React from 'react';
import { ShieldCheck, MapPin, Phone, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0A0A0A] border-t border-[#C9A84C]/20 text-zinc-400 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#C9A84C]/10 border border-[#C9A84C]/40 flex items-center justify-center text-[#C9A84C] font-serif font-bold text-2xl shadow-lg">
            RT
          </div>
          <div>
            <div className="font-serif text-xl font-bold text-white tracking-wide">
              RAFAEL TAVARES
            </div>
            <div className="text-[11px] text-[#C9A84C] font-bold uppercase tracking-widest">
              Corretor de Imóveis · CRECI 13919
            </div>
          </div>
        </div>

        <div>
          <div className="text-sm font-bold text-zinc-200 tracking-wider uppercase mb-4">
            Regiões Atendidas
          </div>
          <ul className="space-y-2 text-sm text-zinc-400">
            <li>📍 Santarém, Alenquer, Monte Alegre e Região</li>
          </ul>
        </div>

        <div>
          <div className="text-sm font-bold text-zinc-200 tracking-wider uppercase mb-4">
            Atendimento Direto
          </div>
          <a 
            href="https://wa.me/5593992332012"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 text-lg font-bold text-white hover:text-[#C9A84C] transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-[#25d366]/20 border border-[#25d366]/50 flex items-center justify-center text-[#25d366]">
              <Phone className="w-5 h-5" />
            </div>
            (93) 99233-2012
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-zinc-900 text-center text-xs text-zinc-500">
        © {new Date().getFullYear()} Rafael Tavares Corretor — CRECI 13919. Todos os direitos reservados.
      </div>
    </footer>
  );
};
