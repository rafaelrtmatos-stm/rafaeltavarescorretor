import React, { useState } from 'react';
import { X, CreditCard, Flame } from 'lucide-react';
import { brl, installmentsFor, parsePrice } from '../data/cardRates';

interface CardSimulatorProps {
  title: string;
  price: string;
  onClose: () => void;
}

export const CardSimulator: React.FC<CardSimulatorProps> = ({ title, price, onClose }) => {
  const value = parsePrice(price);
  const fullPrice = value * 3;
  const rows = installmentsFor(value);
  const [n, setN] = useState(12);
  const cur = rows[n - 1];
  const saving = fullPrice - cur.total;

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 flex items-end sm:items-center justify-center" role="dialog" aria-modal="true" aria-label="Simulação no cartão" onClick={onClose}>
      <div className="relative w-full sm:max-w-md max-h-[92vh] overflow-y-auto bg-[#032215] border-t-4 sm:border-4 border-[#d4af37] rounded-t-3xl sm:rounded-3xl text-white" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 bg-[#032215] px-4 py-3 border-b border-[#12412b]">
          <div className="flex items-center gap-2 min-w-0">
            <CreditCard className="w-5 h-5 text-[#facc15] flex-shrink-0" />
            <div className="min-w-0">
              <div className="font-black leading-tight">Parcelar no cartão</div>
              <div className="text-xs text-[#d4af37] truncate">{title}</div>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar" className="w-9 h-9 rounded-full bg-white/10 border border-white/25 flex items-center justify-center cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="text-center bg-gradient-to-b from-[#fde68a] to-[#eab308] text-[#032215] rounded-2xl py-3">
            <div className="text-xs font-bold">Valor do terreno à vista</div>
            <div className="text-3xl font-black">{brl(value)}</div>
          </div>

          <div className="bg-[#07331f] border border-[#d4af37]/40 rounded-2xl p-4 text-center">
            <div className="text-xs text-slate-300">Em {n}x de</div>
            <div className="text-4xl font-black text-[#facc15]">{brl(cur.parcel)}</div>
            <div className="inline-flex items-center gap-1 mt-3 bg-red-600 text-white text-xs font-black px-3 py-1.5 rounded-full">
              <Flame className="w-3.5 h-3.5" /> Mesmo parcelando, você economiza {brl(saving)}
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden border border-[#12412b]">
            <div className="grid grid-cols-2 bg-[#0a4a2b] text-xs font-bold text-[#d4af37] px-4 py-2">
              <span>Parcelas</span><span className="text-right">Valor da parcela</span>
            </div>
            {rows.map((r) => (
              <button
                key={r.n}
                type="button"
                onClick={() => setN(r.n)}
                className={`w-full grid grid-cols-2 px-4 py-2.5 text-left cursor-pointer border-t border-[#12412b] ${
                  r.n === n ? 'bg-[#facc15] text-[#032215] font-black' : r.n % 2 ? 'bg-[#052b1b]' : 'bg-[#07331f]'
                }`}
              >
                <span className="font-bold">{r.n}x</span>
                <span className="text-right font-bold tabular-nums">{brl(r.parcel)}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>Valores simulados, sujeitos à confirmação na maquininha.</span>
            <span className="flex-shrink-0 ml-2 opacity-80">Mercado Pago</span>
          </div>
        </div>
      </div>
    </div>
  );
};
