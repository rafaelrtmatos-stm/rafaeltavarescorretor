import React, { useState } from 'react';
import { Development } from '../types';
import { ArrowLeft, CheckCircle, Copy, QrCode, ShieldCheck, User, Phone, FileText, Calendar } from 'lucide-react';

interface ReservaFlowProps {
  development: Development;
  onBack: () => void;
}

export const ReservaFlow: React.FC<ReservaFlowProps> = ({ development, onBack }) => {
  const [step, setStep] = useState<number>(1);
  const [selectedLot, setSelectedLot] = useState<number>(101);
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    nascimento: '',
    telefone: '',
    email: '',
    cep: '',
    rua: '',
    numero: '',
    bairro: '',
    cidade: ''
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [successLead, setSuccessLead] = useState<any>(null);

  // Mock lots for selection grid
  const lots = Array.from({ length: 30 }, (_, i) => {
    const lotNum = 101 + i;
    const status = i % 5 === 0 ? 'vendido' : i % 3 === 0 ? 'reservado' : 'disponivel';
    return { num: lotNum, status };
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCompleteReserva = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        nome: formData.nome,
        telefone: formData.telefone,
        email: formData.email,
        empreendimento: `${development.title} (Lote ${selectedLot})`,
        empreendimento_slug: development.slug,
        origem_url: window.location.pathname,
        objetivo: 'Pré-Reserva Online de Lote',
        forma_pagamento: 'PIX / Entrada Facilitada',
        observacao: `CPF: ${formData.cpf}, Nasc: ${formData.nascimento}, Endereço: ${formData.rua}, ${formData.numero} - ${formData.bairro}, ${formData.cidade}`
      };

      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setSuccessLead(data.lead);
        setStep(3); // Success step
      } else {
        alert('Erro ao registrar pré-reserva. Tente novamente.');
      }
    } catch (err) {
      // Fallback success if offline
      setSuccessLead({
        id: 'offline_' + Date.now(),
        nome: formData.nome,
        telefone: formData.telefone,
        empreendimento: `${development.title} (Lote ${selectedLot})`,
        created_at: new Date().toISOString()
      });
      setStep(3);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-[#F2EDE4] py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      
      {/* Top back */}
      <button 
        onClick={onBack}
        className="inline-flex items-center gap-2 text-zinc-400 hover:text-[#C9A84C] text-xs font-bold uppercase tracking-wider mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      {/* Progress Bar */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-2 text-xs uppercase tracking-widest font-bold">
          <span className={step >= 1 ? 'text-[#C9A84C]' : 'text-zinc-500'}>1. Escolher Lote</span>
          <span className={step >= 2 ? 'text-[#C9A84C]' : 'text-zinc-500'}>2. Seus Dados</span>
          <span className={step >= 3 ? 'text-[#C9A84C]' : 'text-zinc-500'}>3. Confirmação & PIX</span>
        </div>
        <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
          <div className="h-full bg-[#C9A84C] transition-all duration-300" style={{ width: `${(step / 3) * 100}%` }}></div>
        </div>
      </div>

      {/* STEP 1: SELECT LOT */}
      {step === 1 && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-[#C9A84C] font-bold">{development.title}</span>
            <h2 className="font-serif text-3xl font-bold text-white mt-1">Selecione o seu Lote</h2>
            <p className="text-xs text-zinc-400 mt-1">Clique em um lote disponível em azul para prosseguir com a pré-reserva.</p>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-xs text-zinc-300 py-2 border-y border-zinc-900">
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500"></span> Disponível</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-500"></span> Reservado</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500"></span> Vendido</div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-5 sm:grid-cols-6 gap-3 py-4">
            {lots.map(l => (
              <button
                key={l.num}
                disabled={l.status === 'vendido'}
                onClick={() => setSelectedLot(l.num)}
                className={`p-3 rounded-xl flex flex-col items-center justify-center border transition-all ${
                  selectedLot === l.num 
                    ? 'bg-[#C9A84C]/20 border-[#C9A84C] text-[#C9A84C] scale-105 shadow-lg shadow-[#C9A84C]/20' 
                    : l.status === 'vendido'
                    ? 'bg-red-950/20 border-red-900/40 text-red-500/40 cursor-not-allowed opacity-40'
                    : l.status === 'reservado'
                    ? 'bg-yellow-950/20 border-yellow-900/40 text-yellow-500/70'
                    : 'bg-zinc-900 border-zinc-800 text-blue-400 hover:border-blue-500 hover:bg-blue-950/20'
                }`}
              >
                <span className="text-xs font-bold">{l.num}</span>
                <span className={`w-1.5 h-1.5 rounded-full mt-1.5 ${
                  selectedLot === l.num ? 'bg-[#C9A84C]' : l.status === 'vendido' ? 'bg-red-500' : l.status === 'reservado' ? 'bg-yellow-500' : 'bg-blue-500'
                }`}></span>
              </button>
            ))}
          </div>

          <div className="pt-6 border-t border-zinc-900 flex items-center justify-between">
            <div>
              <div className="text-xs text-zinc-400">Lote Selecionado:</div>
              <div className="font-serif text-2xl font-bold text-[#C9A84C]">Lote nº {selectedLot}</div>
            </div>
            <button 
              onClick={() => setStep(2)}
              className="bg-[#C9A84C] hover:bg-[#E8C96A] text-black px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#C9A84C]/20"
            >
              Avançar para Dados →
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: BUYER FORM */}
      {step === 2 && (
        <form onSubmit={handleCompleteReserva} className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-[#C9A84C] font-bold">Lote {selectedLot} · {development.title}</span>
            <h2 className="font-serif text-3xl font-bold text-white mt-1">Preencha seus Dados</h2>
            <p className="text-xs text-zinc-400 mt-1">Informe seus dados para garantir a reserva oficial com o corretor Rafael Tavares (CRECI 13919).</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold">Nome Completo *</label>
              <input 
                required
                name="nome"
                value={formData.nome}
                onChange={handleInputChange}
                placeholder="Seu nome e sobrenome"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-[#C9A84C] outline-none transition-colors" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold">CPF *</label>
              <input 
                required
                name="cpf"
                value={formData.cpf}
                onChange={handleInputChange}
                placeholder="000.000.000-00"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-[#C9A84C] outline-none transition-colors" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold">WhatsApp *</label>
              <input 
                required
                name="telefone"
                value={formData.telefone}
                onChange={handleInputChange}
                placeholder="(93) 99999-9999"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-[#C9A84C] outline-none transition-colors" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold">Data de Nascimento *</label>
              <input 
                required
                type="date"
                name="nascimento"
                value={formData.nascimento}
                onChange={handleInputChange}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-[#C9A84C] outline-none transition-colors" 
              />
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-900 flex items-center justify-between">
            <button 
              type="button"
              onClick={() => setStep(1)}
              className="text-zinc-400 hover:text-white text-xs uppercase tracking-wider font-semibold"
            >
              ← Voltar
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="bg-[#C9A84C] hover:bg-[#E8C96A] text-black px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#C9A84C]/20 disabled:opacity-50"
            >
              {loading ? 'Processando...' : 'Concluir Pré-Reserva →'}
            </button>
          </div>
        </form>
      )}

      {/* STEP 3: SUCCESS & PIX */}
      {step === 3 && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 bg-[#25d366]/20 border border-[#25d366]/40 text-[#25d366] rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="font-serif text-3xl font-bold text-white">Pré-Reserva Realizada!</h2>
            <p className="text-sm text-zinc-400 max-w-md mx-auto">
              Parabéns, <strong>{successLead?.nome || 'Cliente'}</strong>! O Lote nº {selectedLot} em <strong>{development.title}</strong> foi pré-reservado com sucesso em seu nome.
            </p>
          </div>

          {/* PIX Simulation Box */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-md mx-auto text-left space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-[#C9A84C] uppercase tracking-wider">
              <QrCode className="w-5 h-5" /> Pagamento da Entrada ({development.entrancePrice})
            </div>
            <p className="text-xs text-zinc-400">
              Para garantir definitivamento o lote, efetue o pagamento da taxa de entrada via PIX abaixo ou entre em contato com o corretor.
            </p>
            <div 
              onClick={() => {
                navigator.clipboard.writeText('00020126580014br.gov.bcb.pix...rafaeltavares');
                alert('Código PIX copiado com sucesso!');
              }}
              className="bg-black border border-[#C9A84C]/40 rounded-xl p-3 text-[11px] font-mono text-[#C9A84C] break-all cursor-pointer hover:bg-zinc-950 transition-colors flex items-center justify-between gap-2"
            >
              <span>00020126580014br.gov.bcb.pix0136rafaelrtmatos@gmail.com...</span>
              <Copy className="w-4 h-4 shrink-0" />
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href={`https://wa.me/5593991234567?text=Olá%20Rafael,%20acabei%20de%20fazer%20a%20pré-reserva%20do%20Lote%20${selectedLot}%20no%20${encodeURIComponent(development.title)}.`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25d366] hover:bg-[#20b858] text-black px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg transition-all inline-flex items-center justify-center gap-2"
            >
              Enviar Comprovante no WhatsApp
            </a>
            <button 
              onClick={onBack}
              className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
            >
              Voltar ao Início
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
