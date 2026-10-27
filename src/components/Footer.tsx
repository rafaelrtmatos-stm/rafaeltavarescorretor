import React from 'react';
import { ShieldCheck, MapPin, Phone, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0A0A0A] border-t border-[#C9A84C]/20 text-zinc-400 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        <div>
          <div className="font-serif text-2xl font-bold text-[#C9A84C] mb-3">
            Rafael Tavares
          </div>
          <p className="text-xs tracking-wider text-zinc-400 uppercase mb-4 flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-[#C9A84C]" /> Corretor de Imóveis · CRECI 13919
          </p>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Especialista em loteamentos, terrenos e empreendimentos imobiliários de alta valorização em Santarém, Alenquer, Monte Alegre e região do Baixo Amazonas.
          </p>
        </div>

        <div>
          <div className="text-sm font-bold text-zinc-200 tracking-wider uppercase mb-4">
            Regiões Atendidas
          </div>
          <ul className="space-y-2 text-sm text-zinc-400">
            <li>📍 Santarém (Bairro Mararu, Cucurunã, Espírito Santo, Pajuçara, Santa Maria, São Braz)</li>
            <li>📍 Alenquer (Jardim Alenquer · Estrada da Praia de Uruxi)</li>
            <li>📍 Monte Alegre (Loteamento Jussaramia)</li>
          </ul>
        </div>

        <div>
          <div className="text-sm font-bold text-zinc-200 tracking-wider uppercase mb-4">
            Contato & Atendimento
          </div>
          <ul className="space-y-3 text-sm text-zinc-400">
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#C9A84C]" /> (93) 99123-4567
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#C9A84C]" /> contato@rafaeltavarescorretor.com.br
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#C9A84C] shrink-0 mt-1" /> Santarém, Pará · Brasil
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-zinc-900 text-center text-xs text-zinc-400">
        © {new Date().getFullYear()} Rafael Tavares Corretor — CRECI 13919. Todos os direitos reservados.
      </div>
    </footer>
  );
};
