import React, { useState, useEffect } from 'react';
import { Lead } from '../types';
import { ShieldCheck, Phone, Mail, MapPin, RefreshCw, Trash2, CheckCircle, Clock, Search, Lock } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/leads');
      const data = await res.json();
      if (data.success && data.leads) {
        setLeads(data.leads);
      }
    } catch (err) {
      console.error('Erro ao buscar leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchLeads();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Quick admin password check (or default 'admin' / '1234')
    if (password === 'admin' || password === '123456' || password === 'rafael123') {
      setIsAuthenticated(true);
    } else {
      alert('Senha incorreta. (Dica: tente admin ou 123456)');
    }
  };

  const updateLeadStatus = async (id: string, newStatus: string) => {
    try {
      await fetch(`/api/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      setLeads(leads.map(l => l.id === id ? { ...l, status: newStatus } : l));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteLead = async (id: string) => {
    if (!confirm('Deseja realmente excluir este lead?')) return;
    try {
      await fetch(`/api/leads/${id}`, { method: 'DELETE' });
      setLeads(leads.filter(l => l.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredLeads = leads.filter(l => 
    l.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.telefone.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.empreendimento.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 bg-black">
        <form onSubmit={handleLogin} className="bg-zinc-950 border border-[#C9A84C]/30 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/30 flex items-center justify-center mx-auto text-[#C9A84C]">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#C9A84C]">Painel de Gestão</h2>
            <p className="text-xs text-zinc-400 mt-1">Rafael Tavares Corretor · CRECI 13919</p>
          </div>

          <div className="space-y-2 text-left">
            <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold">Senha de Acesso</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite a senha (ex: admin)"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-[#C9A84C] outline-none"
            />
          </div>

          <button 
            type="submit"
            className="w-full py-3.5 bg-[#C9A84C] hover:bg-[#E8C96A] text-black rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg transition-all"
          >
            Entrar no Painel
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-[#F2EDE4] py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-900 pb-6">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-[#C9A84C] font-bold">Painel Administrativo</span>
          <h1 className="font-serif text-3xl font-bold text-white">Gestão de Leads & Reservas</h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchLeads}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Atualizar
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6">
          <div className="text-xs text-zinc-400 uppercase tracking-wider">Total de Leads</div>
          <div className="font-serif text-3xl font-bold text-[#C9A84C] mt-1">{leads.length}</div>
        </div>
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6">
          <div className="text-xs text-zinc-400 uppercase tracking-wider">Novos Hoje</div>
          <div className="font-serif text-3xl font-bold text-blue-400 mt-1">
            {leads.filter(l => new Date(l.created_at).toDateString() === new Date().toDateString()).length}
          </div>
        </div>
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6">
          <div className="text-xs text-zinc-400 uppercase tracking-wider">Status Ativo</div>
          <div className="font-serif text-3xl font-bold text-[#25d366] mt-1">Sincronizado</div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-3.5 w-4 h-4 text-zinc-500" />
        <input 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar por nome, telefone ou empreendimento..."
          className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-12 pr-4 py-3 text-sm text-white focus:border-[#C9A84C] outline-none"
        />
      </div>

      {/* Leads Table / Cards */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-900 text-[10px] uppercase tracking-widest text-zinc-400 bg-zinc-900/40">
                <th className="p-4">Cliente</th>
                <th className="p-4">Contato</th>
                <th className="p-4">Empreendimento</th>
                <th className="p-4">Data / Hora</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 text-sm">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-zinc-500">
                    Nenhum lead encontrado.
                  </td>
                </tr>
              ) : (
                filteredLeads.map(lead => (
                  <tr key={lead.id} className="hover:bg-zinc-900/30 transition-colors">
                    <td className="p-4 font-medium text-white">
                      {lead.nome}
                      {lead.objetivo && <div className="text-[11px] text-[#C9A84C]">{lead.objetivo}</div>}
                    </td>
                    <td className="p-4 text-zinc-300">
                      <a href={`https://wa.me/55${lead.telefone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-[#25d366] flex items-center gap-1.5 font-medium">
                        <Phone className="w-3.5 h-3.5 text-[#25d366]" /> {lead.telefone}
                      </a>
                      {lead.email && <div className="text-xs text-zinc-500">{lead.email}</div>}
                    </td>
                    <td className="p-4 text-zinc-300 font-medium">
                      {lead.empreendimento}
                    </td>
                    <td className="p-4 text-xs text-zinc-500">
                      {new Date(lead.created_at).toLocaleString('pt-BR')}
                    </td>
                    <td className="p-4">
                      <select 
                        value={lead.status || 'Novo'}
                        onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                        className="bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 rounded-lg px-2.5 py-1.5 outline-none focus:border-[#C9A84C]"
                      >
                        <option value="Novo">Novo</option>
                        <option value="Em Contato">Em Contato</option>
                        <option value="Reservado">Reservado</option>
                        <option value="Convertido">Convertido</option>
                        <option value="Arquivado">Arquivado</option>
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => deleteLead(lead.id)}
                        className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors"
                        title="Excluir Lead"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
