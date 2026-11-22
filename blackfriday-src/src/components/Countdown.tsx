import React, { useEffect, useState } from 'react';
import { Flame } from 'lucide-react';

// Fim da oferta: 25/11/2026 às 23:59:59 (Santarém, UTC-3). Depois disso,
// prorroga automaticamente de 5 em 5 dias (30/11, 05/12, 10/12...).
const FIRST_DEADLINE = Date.UTC(2026, 10, 26, 2, 59, 59);
const EXTENSION_MS = 5 * 24 * 60 * 60 * 1000;

function getDeadline(now: number): { deadline: number; extended: boolean } {
  if (now <= FIRST_DEADLINE) return { deadline: FIRST_DEADLINE, extended: false };
  const steps = Math.ceil((now - FIRST_DEADLINE) / EXTENSION_MS);
  return { deadline: FIRST_DEADLINE + steps * EXTENSION_MS, extended: true };
}

const pad = (n: number) => String(n).padStart(2, '0');

export const Countdown: React.FC = () => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const { deadline, extended } = getDeadline(now);
  const diff = Math.max(0, deadline - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  // Data exibida no horário de Santarém (UTC-3)
  const end = new Date(deadline - 3 * 3600000);
  const endLabel = `${pad(end.getUTCDate())}/${pad(end.getUTCMonth() + 1)}`;

  const Box: React.FC<{ v: string; l: string }> = ({ v, l }) => (
    <div className="flex flex-col items-center leading-none">
      <span className="bg-black/70 border border-[#facc15]/60 text-[#facc15] font-black text-sm sm:text-base tabular-nums rounded-md px-1.5 py-1 min-w-[30px] text-center">{v}</span>
      <span className="text-[8px] uppercase tracking-wide text-white/80 mt-0.5">{l}</span>
    </div>
  );

  return (
    <div className="w-full bg-gradient-to-r from-red-700 via-red-600 to-red-700 text-white px-3 py-1.5" role="timer" aria-live="off">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 sm:gap-4">
        <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-black uppercase leading-tight text-right">
          <Flame className="w-4 h-4 text-[#facc15] flex-shrink-0" />
          <span>{extended ? 'Prorrogado!' : 'Black Friday'} <span className="block sm:inline text-white/90 font-bold">termina {endLabel}</span></span>
        </div>
        <div className="flex items-center gap-1">
          <Box v={pad(d)} l="dias" />
          <Box v={pad(h)} l="hrs" />
          <Box v={pad(m)} l="min" />
          <Box v={pad(s)} l="seg" />
        </div>
      </div>
    </div>
  );
};
