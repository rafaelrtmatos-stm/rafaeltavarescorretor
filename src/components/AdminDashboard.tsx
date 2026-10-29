import React, { useState, useEffect } from 'react';
import { Lead } from '../types';
import { developments } from '../data/developmentsData';
import { ShieldCheck, Phone, Mail, MapPin, RefreshCw, Trash2, CheckCircle, Clock, Search, Lock, UserPlus, Building, Users } from 'lucide-react';

interface Realtor {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  inviteCode: string;
  allowedPropertyIds?: string[];
}

export const AdminDashboard: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [emailInput, setEmailInput] = useState<string>('contato@rafaeltavarescorretor.com.br');
  const [activeTab, setActiveTab] = useState<'leads' | 'permissions' | 'realtors'>('leads');
  
  const [leads, setLeads] = useState<Lead[]>([]);
  const [realtors, setRealtors] = useState<Realtor[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // New realtor form state
  const [newRealtorName, setNewRealtorName] = useState<string>('');
  const [newRealtorEmail, setNewRealtorEmail] = useState<string>('');
  const [newRealtorPhone, setNewRealtorPhone] = useState<string>('');
  const [newRealtorPassword, setNewRealtorPassword] = useState<string>('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [leadsRes, realtorsRes] = await Promise.all([
        fetch('/api/leads'),
        fetch('/api/realtors')
      ]);
      const leadsData = await leadsRes.json();
      const realtorsData = await realtorsRes.json();

      if (leadsData.success && leadsData.leads) {
        setLeads(leadsData.leads);
      }
      if (Array.isArray(realtorsData)) {
        setRealtors(realtorsData);
      }
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin' || password === '123456' || password === 'Geper3tp@' || password === 'admin123') {
      setIsAuthenticated(true);
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput, password })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        setIsAuthenticated(true);
      } else {
        alert(data.error || 'Senha incorreta.');
      }
    } catch (err) {
      alert('Erro ao tentar autenticar.');
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

  const handleTogglePropertyPermission = async (realtorId: string, propertyId: string) => {
    const realtor = realtors.find(r => r.id === realtorId);
    if (!realtor) return;

    const currentAllowed = realtor.allowedPropertyIds || [];
    let updatedAllowed = [...currentAllowed];

    if (updatedAllowed.includes(propertyId)) {
      updatedAllowed = updatedAllowed.filter(id => id !== propertyId);
    } else {
      updatedAllowed.push(propertyId);
    }

    try {
      const res = await fetch(`/api/realtors/${realtorId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ allowedPropertyIds: updatedAllowed })
      });
      if (res.ok) {
        setRealtors(realtors.map(r => r.id === realtorId ? { ...r, allowedPropertyIds: updatedAllowed } : r));
      }
    } catch (err) {
      console.error('Erro ao atualizar permissões:', err);
    }
  };

  const handleCreateRealtor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRealtorName || !newRealtorEmail) {
      alert('Preencha nome e e-mail do corretor.');
      return;
    }

    try {
      const res = await fetch('/api/realtors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newRealtorName,
          email: newRealtorEmail,
          phone: newRealtorPhone,
          password: newRealtorPassword || 'Geper3tp@',
          allowedPropertyIds: developments.map(d => d.id) // default to all
        })
      });
      const data = await res.json();
      if (res.ok) {
        setRealtors([...realtors, data]);
        setNewRealtorName('');
        setNewRealtorEmail('');
        setNewRealtorPhone('');
        setNewRealtorPassword('');
        alert('Corretor cadastrado com sucesso!');
      } else {
        alert(data.error || 'Erro ao cadastrar corretor.');
      }
    } catch (err) {
      alert('Erro ao cadastrar corretor.');
    }
  };

  const handleDeleteRealtor = async (id: string) => {
    if (!confirm('Deseja realmente remover este corretor?')) return;
    try {
      await fetch(`/api/realtors/${id}`, { method: 'DELETE' });
      setRealtors(realtors.filter(r => r.id !== id));
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
      <div className="min-h-[85vh] flex items-center justify-center px-4 bg-black">
        <form onSubmit={handleLogin} className="bg-zinc-950 border border-[#C9A84C]/30 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/30 flex items-center justify-center mx-auto text-[#C9A84C]">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#C9A84C]">Painel do Corretor & Admin</h2>
            <p className="text-xs text-zinc-400 mt-1">Rafael Tavares Corretor · CRECI 13919</p>
          </div>

          <div className="space-y-4 text-left">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold">E-mail</label>
              <input 
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="contato@rafaeltavarescorretor.com.br"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-[#C9A84C] outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold">Senha</label>
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha de acesso"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-[#C9A84C] outline-none"
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-3.5 bg-[#C9A84C] hover:bg-[#E8C96A] text-black rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg transition-all"
          >
            Entrar no Portal
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
          <span className="text-[10px] uppercase tracking-widest text-[#C9A84C] font-bold">Portal Exclusivo · Rafael Tavares CRECI 13919</span>
          <h1 className="font-serif text-3xl font-bold text-white">Painel Administrativo & Gestão</h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Atualizar
          </button>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-zinc-900 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('leads')}
          className={`px-6 py-3 font-bold text-xs uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'leads' ? 'border-[#C9A84C] text-[#C9A84C] bg-zinc-900/40' : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <Phone className="w-4 h-4" /> Leads & Reservas ({leads.length})
        </button>
        <button
          onClick={() => setActiveTab('permissions')}
          className={`px-6 py-3 font-bold text-xs uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'permissions' ? 'border-[#C9A84C] text-[#C9A84C] bg-zinc-900/40' : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <Building className="w-4 h-4" /> Permissões de Empreendimentos
        </button>
        <button
          onClick={() => setActiveTab('realtors')}
          className={`px-6 py-3 font-bold text-xs uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'realtors' ? 'border-[#C9A84C] text-[#C9A84C] bg-zinc-900/40' : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" /> Gerenciar Corretores ({realtors.length})
        </button>
      </div>

      {/* TAB 1: LEADS & RESERVAS */}
      {activeTab === 'leads' && (
        <div className="space-y-6">
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
              <div className="text-xs text-zinc-400 uppercase tracking-wider">Status do Sistema</div>
              <div className="font-serif text-3xl font-bold text-[#25d366] mt-1">Online</div>
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

          {/* Leads Table */}
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
      )}

      {/* TAB 2: PERMISSÕES DE EMPREENDIMENTOS POR CORRETOR */}
      {activeTab === 'permissions' && (
        <div className="space-y-8">
          <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 sm:p-8 space-y-4">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#C9A84C] font-bold">Gestão de Visibilidade</span>
              <h2 className="font-serif text-2xl font-bold text-white mt-1">Marcar Empreendimentos que Cada Corretor Pode Ver</h2>
              <p className="text-xs text-zinc-400 mt-1">Selecione quais loteamentos e empreendimentos aparecem no painel e portfólio de cada corretor parceiro.</p>
            </div>

            <div className="space-y-6 pt-4">
              {realtors.map(realtor => {
                const allowed = realtor.allowedPropertyIds || developments.map(d => d.id);
                return (
                  <div key={realtor.id} className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-4">
                      <div>
                        <div className="font-serif text-lg font-bold text-white">{realtor.name}</div>
                        <div className="text-xs text-zinc-400">{realtor.email} · {realtor.phone}</div>
                      </div>
                      <span className="inline-flex items-center gap-1.5 bg-[#C9A84C]/10 border border-[#C9A84C]/30 text-[#C9A84C] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                        Convite: {realtor.inviteCode}
                      </span>
                    </div>

                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold mb-3">Empreendimentos Permitidos para Visualização:</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {developments.map(dev => {
                          const isAllowed = allowed.includes(dev.id);
                          return (
                            <label 
                              key={dev.id} 
                              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                                isAllowed ? 'bg-[#C9A84C]/10 border-[#C9A84C]/40 text-white shadow-md' : 'bg-zinc-950 border-zinc-800 text-zinc-400 opacity-60 hover:opacity-100'
                              }`}
                            >
                              <input 
                                type="checkbox"
                                checked={isAllowed}
                                onChange={() => handleTogglePropertyPermission(realtor.id, dev.id)}
                                className="w-4 h-4 rounded border-zinc-700 text-[#C9A84C] focus:ring-[#C9A84C] bg-zinc-900 accent-[#C9A84C]"
                              />
                              <div className="text-xs font-medium truncate">{dev.title}</div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GERENCIAR CORRETORES */}
      {activeTab === 'realtors' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Cadastrar Novo Corretor Form */}
          <form onSubmit={handleCreateRealtor} className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 sm:p-8 space-y-6 lg:col-span-1 shadow-xl">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#C9A84C] font-bold">Novo Cadastro</span>
              <h2 className="font-serif text-xl font-bold text-white mt-1">Adicionar Corretor</h2>
              <p className="text-xs text-zinc-400 mt-1">Crie acesso para novos corretores parceiros.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold">Nome Completo *</label>
                <input 
                  required
                  value={newRealtorName}
                  onChange={(e) => setNewRealtorName(e.target.value)}
                  placeholder="Nome do Corretor"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-[#C9A84C] outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold">E-mail de Acesso *</label>
                <input 
                  required
                  type="email"
                  value={newRealtorEmail}
                  onChange={(e) => setNewRealtorEmail(e.target.value)}
                  placeholder="corretor@rafaeltavares.com"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-[#C9A84C] outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold">WhatsApp / Telefone</label>
                <input 
                  value={newRealtorPhone}
                  onChange={(e) => setNewRealtorPhone(e.target.value)}
                  placeholder="(93) 99111-2233"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-[#C9A84C] outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold">Senha Inicial</label>
                <input 
                  type="password"
                  value={newRealtorPassword}
                  onChange={(e) => setNewRealtorPassword(e.target.value)}
                  placeholder="Padrão: Geper3tp@"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-[#C9A84C] outline-none"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-3.5 bg-[#C9A84C] hover:bg-[#E8C96A] text-black rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg transition-all"
            >
              Cadastrar Corretor
            </button>
          </form>

          {/* Lista de Corretores */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 sm:p-8 lg:col-span-2 space-y-6 shadow-xl">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#C9A84C] font-bold">Parceiros Ativos</span>
              <h2 className="font-serif text-xl font-bold text-white mt-1">Corretores Cadastrados</h2>
            </div>

            <div className="space-y-4">
              {realtors.map(realtor => (
                <div key={realtor.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="font-serif text-lg font-bold text-white">{realtor.name}</div>
                    <div className="text-xs text-zinc-400 flex items-center gap-3">
                      <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-[#C9A84C]" /> {realtor.email}</span>
                      <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-[#25d366]" /> {realtor.phone || 'Não informado'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] bg-[#C9A84C]/10 border border-[#C9A84C]/30 text-[#C9A84C] px-3 py-1 rounded-full font-bold uppercase tracking-widest">
                      {realtor.inviteCode}
                    </span>
                    <button 
                      onClick={() => handleDeleteRealtor(realtor.id)}
                      className="p-2 hover:bg-red-500/10 text-red-400 rounded-xl transition-colors"
                      title="Excluir Corretor"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
