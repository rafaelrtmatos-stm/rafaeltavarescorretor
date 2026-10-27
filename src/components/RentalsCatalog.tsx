import React, { useState } from 'react';
import { rentalProperties } from '../data/developmentsData';
import { Home, Phone, MapPin, Building2, Store } from 'lucide-react';

export const RentalsCatalog: React.FC = () => {
  const [filter, setFilter] = useState<string>('todos');

  const filteredRentals = filter === 'todos' 
    ? rentalProperties 
    : filter === 'disponivel'
    ? rentalProperties.filter(r => r.status === 'disponivel')
    : rentalProperties.filter(r => r.type === filter);

  return (
    <div className="min-h-screen bg-black text-[#F2EDE4] py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#C9A84C]/30 bg-[#C9A84C]/10 text-[#C9A84C] text-xs font-semibold tracking-widest uppercase">
          <Building2 className="w-4 h-4" /> Aluguéis de Imóveis
        </div>
        <h1 className="font-serif text-4xl sm:text-6xl font-bold text-white">
          Casas e Imóveis para <span className="text-[#C9A84C] italic">Alugar</span>
        </h1>
        <p className="text-sm text-zinc-400">
          Encontre o imóvel ideal em Santarém e região. Localizações verificadas, contato direto com o corretor Rafael Tavares (CRECI 13919).
        </p>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'casa', label: '🏠 Casa' },
            { id: 'apto', label: '🏢 Apartamento' },
            { id: 'comercial', label: '🏪 Comercial' },
            { id: 'disponivel', label: '✅ Disponíveis' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                filter === f.id 
                  ? 'bg-[#C9A84C] text-black shadow-lg shadow-[#C9A84C]/20' 
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-[#C9A84C]/50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredRentals.map(rental => (
          <div 
            key={rental.id}
            className="bg-zinc-950 border border-zinc-800 hover:border-[#C9A84C]/60 rounded-2xl overflow-hidden shadow-2xl flex flex-col transition-all duration-300"
          >
            <div className="relative h-48 bg-zinc-900 flex items-center justify-center border-b border-zinc-900">
              <div className="text-center space-y-2 p-6 text-zinc-500">
                <Building2 className="w-12 h-12 mx-auto opacity-30" />
                <span className="text-xs uppercase tracking-wider block">Imóvel Verificado</span>
              </div>
              <span className={`absolute top-4 left-4 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                rental.status === 'disponivel' 
                  ? 'bg-[#25d366]/20 text-[#25d366] border border-[#25d366]/40' 
                  : 'bg-red-500/20 text-red-400 border border-red-500/40'
              }`}>
                {rental.status === 'disponivel' ? '● Disponível' : 'Alugado'}
              </span>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <div className="text-[11px] text-[#C9A84C] tracking-widest uppercase font-semibold mb-1">
                  {rental.bairro}
                </div>
                <h3 className="font-serif text-xl font-bold text-white mb-3">
                  {rental.title}
                </h3>

                <div className="flex flex-wrap gap-2 mb-4">
                  {rental.specs.map((spec, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300">
                      {spec}
                    </span>
                  ))}
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-3xl font-bold text-[#C9A84C]">{rental.price}</span>
                  <span className="text-xs text-zinc-400">/mês</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-zinc-900">
                <a 
                  href={`https://wa.me/5593991234567?text=Olá%20Rafael,%20tenho%20interesse%20no%20imóvel:%20${encodeURIComponent(rental.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 py-2.5 bg-[#25d366] hover:bg-[#20b858] text-black rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
                >
                  <Phone className="w-3.5 h-3.5" /> Tenho Interesse
                </a>
                <a 
                  href={rental.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-[#C9A84C] rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
                >
                  <MapPin className="w-3.5 h-3.5" /> Ver no Mapa
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
