import React, { useState, useEffect } from 'react';
import { Building2, Users, Plus, Edit, Trash2, Shield, Mail, Phone, CheckCircle, Clock, X, AlertTriangle, Save, FolderPlus, MessageSquare, FileText } from 'lucide-react';
import { Property, Realtor, ResponseSuggestion, DocumentInfoItem, PriceItem, User } from '../types';
import { ANSWER_TOPICS } from '../answerTopics';

interface AdminPanelProps {
  user: User;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'properties' | 'suggestions' | 'realtors'>('properties');
  const [properties, setProperties] = useState<Property[]>([]);
  const [suggestions, setSuggestions] = useState<ResponseSuggestion[]>([]);
  const [realtors, setRealtors] = useState<Realtor[]>([]);
  const [loading, setLoading] = useState(true);

  // Property modal state
  const [showPropModal, setShowPropModal] = useState(false);
  const [editingProp, setEditingProp] = useState<Property | null>(null);
  const [propForm, setPropForm] = useState({
    title: '',
    description: '',
    location: '',
    mapLink: '',
    coverImage: '',
    status: 'published' as 'published' | 'draft' | 'archived',
    prices: [{ plan: '', entry: '', installments: '', total: '', notes: '' }] as PriceItem[],
    photosText: '',
    videosText: '',
    docs: [] as { title: string; text: string }[],
    answers: {} as Record<string, string>
  });

  // Suggestion modal state
  const [showSuggModal, setShowSuggModal] = useState(false);
  const [editingSugg, setEditingSugg] = useState<ResponseSuggestion | null>(null);
  const [suggForm, setSuggForm] = useState({ category: 'Primeiro contato', title: '', content: '' });

  // Realtor modal state
  const [showRelModal, setShowRelModal] = useState(false);
  const [relForm, setRelForm] = useState({ name: '', email: '', phone: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const token = localStorage.getItem('rt_token');
    try {
      const [propRes, suggRes, relRes] = await Promise.all([
        fetch('/api/properties', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/suggestions', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/realtors', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      if (propRes.ok) setProperties(await propRes.json());
      if (suggRes.ok) setSuggestions(await suggRes.json());
      if (relRes.ok) setRealtors(await relRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const [uploading, setUploading] = useState('');

  const addLines = (text: string, urls: string[]) => [text.trim(), ...urls].filter(Boolean).join('\n');

  const handleUploadMedia = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const token = localStorage.getItem('rt_token');
    const photos: string[] = [];
    const videos: string[] = [];
    const errors: string[] = [];
    const list = Array.from(files);
    for (let i = 0; i < list.length; i++) {
      const f = list[i];
      setUploading(`Enviando ${i + 1} de ${list.length}: ${f.name}`);
      try {
        if (!/^(image|video)\//.test(f.type)) throw new Error('não é foto nem vídeo');
        if (f.size > 50 * 1024 * 1024) throw new Error('acima de 50 MB');
        const r = await fetch('/api/media/sign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ filename: f.name, contentType: f.type })
        });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(j.error || 'falha ao preparar o envio');
        const up = await fetch(j.uploadUrl, { method: 'PUT', headers: { 'Content-Type': f.type }, body: f });
        if (!up.ok) throw new Error('falha no envio');
        (f.type.startsWith('video/') ? videos : photos).push(j.publicUrl);
      } catch (err: any) {
        errors.push(`${f.name}: ${err.message || 'erro'}`);
      }
    }
    setPropForm(prev => ({
      ...prev,
      photosText: addLines(prev.photosText, photos),
      videosText: addLines(prev.videosText, videos),
      coverImage: prev.coverImage || photos[0] || ''
    }));
    setUploading('');
    if (errors.length) alert('Alguns arquivos não foram enviados:\n' + errors.join('\n'));
  };

  const removeLine = (field: 'photosText' | 'videosText', url: string) => {
    setPropForm(prev => ({ ...prev, [field]: prev[field].split('\n').filter(l => l.trim() && l.trim() !== url).join('\n') }));
  };

  const handleSaveProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('rt_token');
    
    const parsedDocs: DocumentInfoItem[] = propForm.docs
      .filter(d => d.title.trim() || d.text.trim())
      .map((d, idx) => ({ id: 'doc-' + Date.now() + '-' + idx, name: d.title.trim() || 'Documento', description: d.text, available: true }));

    const payload = {
      title: propForm.title,
      description: propForm.description,
      location: propForm.location,
      mapLink: propForm.mapLink || 'https://maps.google.com',
      coverImage: propForm.coverImage || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      status: propForm.status,
      prices: propForm.prices.filter(p => [p.plan, p.entry, p.installments, p.total, p.notes].some(v => (v || '').trim() !== '')),
      photos: propForm.photosText ? propForm.photosText.split('\n').filter(Boolean) : [
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'
      ],
      videos: propForm.videosText ? propForm.videosText.split('\n').filter(Boolean) : [
        'https://www.w3schools.com/html/mov_bbb.mp4'
      ],
      documents: parsedDocs,
      answers: Object.fromEntries(
        Object.entries(propForm.answers).filter(([, v]) => String(v).trim() !== '')
      )
    };

    try {
      const url = editingProp ? `/api/properties/${editingProp.id}` : '/api/properties';
      const method = editingProp ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowPropModal(false);
        setEditingProp(null);
        loadData();
      }
    } catch (err) {
      alert('Erro ao salvar empreendimento.');
    }
  };

  const handleDeleteProperty = async (id: string) => {
    if (!confirm('Deseja excluir este empreendimento e seus arquivos associados?')) return;
    const token = localStorage.getItem('rt_token');
    const res = await fetch(`/api/properties/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) loadData();
  };

  const handleSaveSuggestion = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('rt_token');
    try {
      const url = editingSugg ? `/api/suggestions/${editingSugg.id}` : '/api/suggestions';
      const method = editingSugg ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(suggForm)
      });
      if (res.ok) {
        setShowSuggModal(false);
        setEditingSugg(null);
        loadData();
      }
    } catch (e) {
      alert('Erro ao salvar sugestão.');
    }
  };

  const handleDeleteSuggestion = async (id: string) => {
    if (!confirm('Excluir esta sugestão de resposta?')) return;
    const token = localStorage.getItem('rt_token');
    const res = await fetch(`/api/suggestions/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) loadData();
  };

  const handleInviteRealtor = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const token = localStorage.getItem('rt_token');
    try {
      const res = await fetch('/api/realtors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(relForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao cadastrar corretor.');
      setShowRelModal(false);
      setRelForm({ name: '', email: '', phone: '' });
      loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteRealtor = async (id: string) => {
    if (!confirm('Remover o acesso deste corretor?')) return;
    const token = localStorage.getItem('rt_token');
    const res = await fetch(`/api/realtors/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) loadData();
  };

  const openEditProperty = (p: Property) => {
    setEditingProp(p);
    setPropForm({
      title: p.title,
      description: p.description,
      location: p.location,
      mapLink: p.mapLink,
      coverImage: p.coverImage,
      status: p.status,
      prices: p.prices && p.prices.length ? p.prices.map(x => ({ ...x })) : [{ plan: '', entry: '', installments: '', total: '', notes: '' }],
      photosText: p.photos.join('\n'),
      videosText: p.videos.join('\n'),
      docs: (p.documents || []).map(d => ({ title: d.name, text: d.description })),
      answers: p.answers || {}
    });
    setShowPropModal(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 bg-[#050504] text-[#F5F0E6] animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0c0a08] border border-[#26221c] p-6 rounded-lg shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-md bg-[#CBA747]/10 text-[#CBA747] flex items-center justify-center border border-[#CBA747]/30">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#F5F0E6]">Painel Administrativo</h1>
            <p className="text-[#77736B] text-xs">Gerenciamento institucional de empreendimentos e equipe de corretores.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveTab('properties')}
            className={`px-3.5 py-2 rounded-md font-semibold text-xs transition-all whitespace-nowrap ${
              activeTab === 'properties' ? 'bg-[#CBA747] text-[#050504] shadow-sm' : 'bg-[#14120f] text-[#77736B] hover:text-[#F5F0E6] border border-[#26221c]'
            }`}
          >
            Gerenciar Empreendimentos
          </button>
          <button
            onClick={() => setActiveTab('suggestions')}
            className={`px-3.5 py-2 rounded-md font-semibold text-xs transition-all whitespace-nowrap ${
              activeTab === 'suggestions' ? 'bg-[#CBA747] text-[#050504] shadow-sm' : 'bg-[#14120f] text-[#77736B] hover:text-[#F5F0E6] border border-[#26221c]'
            }`}
          >
            Sugestões de Respostas
          </button>
          <button
            onClick={() => setActiveTab('realtors')}
            className={`px-3.5 py-2 rounded-md font-semibold text-xs transition-all whitespace-nowrap ${
              activeTab === 'realtors' ? 'bg-[#CBA747] text-[#050504] shadow-sm' : 'bg-[#14120f] text-[#77736B] hover:text-[#F5F0E6] border border-[#26221c]'
            }`}
          >
            Corretores
          </button>
        </div>
      </div>

      {/* Tab: Properties */}
      {activeTab === 'properties' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#F5F0E6]">Empreendimentos ({properties.length})</h2>
            <button
              onClick={() => {
                setEditingProp(null);
                setPropForm({
                  title: '',
                  description: '',
                  location: '',
                  mapLink: '',
                  coverImage: '',
                  status: 'published',
                  prices: [{ plan: '', entry: '', installments: '', total: '', notes: '' }] as PriceItem[],
                  photosText: '',
                  videosText: '',
                  docs: [] as { title: string; text: string }[],
                  answers: {}
                });
                setShowPropModal(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#CBA747] hover:bg-[#d8b552] text-[#050504] font-bold text-xs shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" /> + Novo empreendimento
            </button>
          </div>

          <div className="bg-[#0c0a08] border border-[#26221c] rounded-lg overflow-hidden shadow-xl">
            {loading ? (
              <div className="p-8 text-center text-[#77736B] text-xs">Carregando...</div>
            ) : properties.length === 0 ? (
              <div className="p-8 text-center text-[#77736B] text-xs">Nenhum empreendimento cadastrado.</div>
            ) : (
              <div className="divide-y divide-[#26221c]">
                {properties.map(p => (
                  <div key={p.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-[#14120f]/40 transition-colors">
                    <div className="flex items-center gap-3.5">
                      <img src={p.coverImage} alt={p.title} className="w-14 h-14 rounded-md object-cover shrink-0 border border-[#26221c]" />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-[#F5F0E6]">{p.title}</h3>
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase ${
                            p.status === 'published' ? 'bg-[#CBA747]/10 text-[#CBA747] border border-[#CBA747]/30' : 'bg-[#77736B]/10 text-[#77736B] border border-[#77736B]/30'
                          }`}>
                            {p.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#77736B] mt-0.5">{p.location}</p>
                        <div className="flex items-center gap-3 text-[11px] text-[#77736B] mt-1.5">
                          <span>{p.photos.length} fotos</span>
                          <span>•</span>
                          <span>{p.videos.length} vídeos</span>
                          <span>•</span>
                          <span>{p.documents.length} docs</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-auto">
                      <button
                        onClick={() => openEditProperty(p)}
                        className="px-3 py-1.5 rounded-md bg-[#14120f] hover:bg-[#1a1713] text-[#F5F0E6] font-medium text-xs flex items-center gap-1 transition-colors border border-[#26221c]"
                      >
                        <Edit className="w-3.5 h-3.5 text-[#CBA747]" /> Editar
                      </button>
                      <button
                        onClick={() => handleDeleteProperty(p.id)}
                        className="px-3 py-1.5 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium text-xs flex items-center gap-1 transition-colors border border-red-500/20"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Suggestions */}
      {activeTab === 'suggestions' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#F5F0E6]">Sugestões de Respostas ({suggestions.length})</h2>
              <p className="text-xs text-[#77736B]">Cadastre e organize respostas prontas para o atendimento.</p>
            </div>
            <button
              onClick={() => {
                setEditingSugg(null);
                setSuggForm({ category: 'Primeiro contato', title: '', content: '' });
                setShowSuggModal(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#CBA747] hover:bg-[#d8b552] text-[#050504] font-bold text-xs shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" /> Nova Sugestão
            </button>
          </div>

          <div className="bg-[#0c0a08] border border-[#26221c] rounded-lg overflow-hidden shadow-xl">
            {suggestions.length === 0 ? (
              <div className="p-8 text-center text-[#77736B] text-xs">Nenhuma sugestão cadastrada.</div>
            ) : (
              <div className="divide-y divide-[#26221c]">
                {suggestions.map(s => (
                  <div key={s.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-[#14120f]/40 transition-colors">
                    <div className="space-y-1 max-w-2xl">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase bg-[#CBA747]/10 text-[#CBA747] border border-[#CBA747]/30">
                          {s.category}
                        </span>
                        <h3 className="text-sm font-bold text-[#F5F0E6]">{s.title}</h3>
                      </div>
                      <p className="text-xs text-[#77736B] line-clamp-2">{s.content}</p>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-auto">
                      <button
                        onClick={() => {
                          setEditingSugg(s);
                          setSuggForm({ category: s.category, title: s.title, content: s.content });
                          setShowSuggModal(true);
                        }}
                        className="px-3 py-1.5 rounded-md bg-[#14120f] hover:bg-[#1a1713] text-[#F5F0E6] font-medium text-xs flex items-center gap-1 border border-[#26221c]"
                      >
                        <Edit className="w-3.5 h-3.5 text-[#CBA747]" /> Editar
                      </button>
                      <button
                        onClick={() => handleDeleteSuggestion(s.id)}
                        className="px-3 py-1.5 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium text-xs flex items-center gap-1 border border-red-500/20"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Realtors */}
      {activeTab === 'realtors' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#F5F0E6]">Corretores ({realtors.length})</h2>
              <p className="text-xs text-[#77736B]">Gerencie o acesso institucional dos corretores parceiros.</p>
            </div>
            <button
              onClick={() => setShowRelModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#CBA747] hover:bg-[#d8b552] text-[#050504] font-bold text-xs shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" /> Convidar Corretor
            </button>
          </div>

          <div className="bg-[#0c0a08] border border-[#26221c] rounded-lg overflow-hidden shadow-xl">
            {realtors.length === 0 ? (
              <div className="p-8 text-center text-[#77736B] text-xs">Nenhum corretor cadastrado.</div>
            ) : (
              <div className="divide-y divide-[#26221c]">
                {realtors.map(r => (
                  <div key={r.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-[#14120f]/40 transition-colors">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-md bg-[#CBA747]/10 text-[#CBA747] flex items-center justify-center font-bold text-sm border border-[#CBA747]/30">
                        {r.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-[#F5F0E6]">{r.name}</h3>
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase bg-[#CBA747]/10 text-[#CBA747] border border-[#CBA747]/30">
                            Ativo
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-[#77736B] mt-0.5">
                          <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-[#CBA747]" /> {r.email}</span>
                          <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-[#CBA747]" /> {r.phone || 'Não informado'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-auto">
                      <button
                        onClick={() => handleDeleteRealtor(r.id)}
                        className="px-3 py-1.5 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium text-xs flex items-center gap-1 border border-red-500/20"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Revogar Acesso
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Property Modal */}
      {showPropModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050504]/90 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-[#0c0a08] border border-[#26221c] rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-5 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#26221c] pb-3">
              <h3 className="text-base font-bold text-[#F5F0E6]">{editingProp ? 'Editar Empreendimento' : 'Novo Empreendimento'}</h3>
              <button onClick={() => setShowPropModal(false)} className="text-[#77736B] hover:text-[#F5F0E6] p-1.5">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProperty} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-[#77736B] uppercase">Título</label>
                  <input
                    type="text"
                    required
                    value={propForm.title}
                    onChange={e => setPropForm({...propForm, title: e.target.value})}
                    placeholder="Ex: Reserva Tapajós"
                    className="w-full bg-[#050504] border border-[#26221c] rounded-md px-3 py-2 text-[#F5F0E6] text-xs focus:outline-none focus:border-[#CBA747]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-[#77736B] uppercase">Status</label>
                  <select
                    value={propForm.status}
                    onChange={e => setPropForm({...propForm, status: e.target.value as any})}
                    className="w-full bg-[#050504] border border-[#26221c] rounded-md px-3 py-2 text-[#F5F0E6] text-xs focus:outline-none focus:border-[#CBA747]"
                  >
                    <option value="published">Publicado</option>
                    <option value="draft">Rascunho</option>
                    <option value="archived">Arquivado</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-[#77736B] uppercase">Descrição</label>
                <textarea
                  rows={2}
                  required
                  value={propForm.description}
                  onChange={e => setPropForm({...propForm, description: e.target.value})}
                  placeholder="Detalhes e diferenciais..."
                  className="w-full bg-[#050504] border border-[#26221c] rounded-md px-3 py-2 text-[#F5F0E6] text-xs focus:outline-none focus:border-[#CBA747]"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-[#77736B] uppercase">Localização</label>
                  <input
                    type="text"
                    required
                    value={propForm.location}
                    onChange={e => setPropForm({...propForm, location: e.target.value})}
                    placeholder="Av. Tapajós, Santarém - PA"
                    className="w-full bg-[#050504] border border-[#26221c] rounded-md px-3 py-2 text-[#F5F0E6] text-xs focus:outline-none focus:border-[#CBA747]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-[#77736B] uppercase">Foto de Capa (URL)</label>
                  <input
                    type="text"
                    value={propForm.coverImage}
                    onChange={e => setPropForm({...propForm, coverImage: e.target.value})}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-[#050504] border border-[#26221c] rounded-md px-3 py-2 text-[#F5F0E6] text-xs focus:outline-none focus:border-[#CBA747]"
                  />
                </div>
              </div>

              <div className="border-t border-[#26221c] pt-3.5 space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-[#CBA747]">Tabela de preços</h4>
                  <p className="text-[10px] text-[#77736B]">Cada linha é um plano. Escreva do jeito que quiser e adicione quantas linhas precisar.</p>
                </div>
                {propForm.prices.map((row, i) => (
                  <div key={i} className="bg-[#050504] border border-[#26221c] rounded-md p-3 space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input type="text" value={row.plan} onChange={e => setPropForm({...propForm, prices: propForm.prices.map((r, j) => j === i ? {...r, plan: e.target.value} : r)})} placeholder="Plano (ex.: Lote até 200 m², 180x)" className="w-full bg-[#050504] border border-[#26221c] rounded-md px-2.5 py-2 text-[#F5F0E6] text-xs focus:outline-none focus:border-[#CBA747]" />
                      <input type="text" value={row.entry} onChange={e => setPropForm({...propForm, prices: propForm.prices.map((r, j) => j === i ? {...r, entry: e.target.value} : r)})} placeholder="Entrada (ex.: R$ 600,00)" className="w-full bg-[#050504] border border-[#26221c] rounded-md px-2.5 py-2 text-[#F5F0E6] text-xs focus:outline-none focus:border-[#CBA747]" />
                      <input type="text" value={row.installments} onChange={e => setPropForm({...propForm, prices: propForm.prices.map((r, j) => j === i ? {...r, installments: e.target.value} : r)})} placeholder="Parcelas (ex.: 180x a partir de R$ 255,56)" className="w-full bg-[#050504] border border-[#26221c] rounded-md px-2.5 py-2 text-[#F5F0E6] text-xs focus:outline-none focus:border-[#CBA747]" />
                      <input type="text" value={row.total} onChange={e => setPropForm({...propForm, prices: propForm.prices.map((r, j) => j === i ? {...r, total: e.target.value} : r)})} placeholder="Valor do lote (ex.: R$ 83.590,00)" className="w-full bg-[#050504] border border-[#26221c] rounded-md px-2.5 py-2 text-[#F5F0E6] text-xs focus:outline-none focus:border-[#CBA747]" />
                    </div>
                    <textarea rows={2} value={row.notes} onChange={e => setPropForm({...propForm, prices: propForm.prices.map((r, j) => j === i ? {...r, notes: e.target.value} : r)})} placeholder="Observações escritas (reajuste anual, condições...)" className="w-full bg-[#050504] border border-[#26221c] rounded-md px-2.5 py-2 text-[#F5F0E6] text-xs focus:outline-none focus:border-[#CBA747]"></textarea>
                    <button type="button" onClick={() => setPropForm({...propForm, prices: propForm.prices.filter((_, j) => j !== i)})} className="text-[10px] font-semibold text-red-400 hover:text-red-300">Remover linha</button>
                  </div>
                ))}
                <button type="button" onClick={() => setPropForm({...propForm, prices: [...propForm.prices, { plan: '', entry: '', installments: '', total: '', notes: '' }]})} className="px-3 py-1.5 rounded-md bg-[#14120f] hover:bg-[#1a1713] text-[#CBA747] text-xs font-semibold border border-[#CBA747]/30">+ Adicionar linha</button>
              </div>

              <div className="border-t border-[#26221c] pt-3.5 space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-[#CBA747]">Fotos e vídeos</h4>
                  <p className="text-[10px] text-[#77736B]">Envie do celular ou do computador (até 50 MB cada). Fotos e vídeos são separados automaticamente.</p>
                </div>
                <label className="flex items-center justify-center gap-2 px-3 py-3 rounded-md bg-[#14120f] hover:bg-[#1a1713] text-[#CBA747] text-xs font-semibold border border-dashed border-[#CBA747]/40 cursor-pointer">
                  {uploading || '+ Subir fotos ou vídeos'}
                  <input type="file" accept="image/*,video/*" multiple disabled={!!uploading} className="hidden" onChange={e => { handleUploadMedia(e.target.files); e.target.value = ''; }} />
                </label>

                {propForm.photosText.split('\n').filter(l => l.trim()).length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {propForm.photosText.split('\n').filter(l => l.trim()).map(url => (
                      <div key={url} className="relative aspect-square rounded-md overflow-hidden border border-[#26221c] bg-[#050504]">
                        <img src={url.trim()} alt="" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeLine('photosText', url.trim())} className="absolute top-1 right-1 w-5 h-5 rounded bg-black/70 text-white text-[10px] font-bold">✕</button>
                        <button type="button" onClick={() => setPropForm({...propForm, coverImage: url.trim()})} className={`absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold ${propForm.coverImage === url.trim() ? 'bg-[#CBA747] text-[#050504]' : 'bg-black/70 text-white'}`}>{propForm.coverImage === url.trim() ? 'Capa' : 'Usar como capa'}</button>
                      </div>
                    ))}
                  </div>
                )}

                {propForm.videosText.split('\n').filter(l => l.trim()).length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {propForm.videosText.split('\n').filter(l => l.trim()).map(url => (
                      <div key={url} className="relative aspect-square rounded-md overflow-hidden border border-[#26221c] bg-[#050504]">
                        <video src={url.trim()} preload="metadata" muted className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-white text-[9px] font-bold">Vídeo</span>
                        <button type="button" onClick={() => removeLine('videosText', url.trim())} className="absolute top-1 right-1 w-5 h-5 rounded bg-black/70 text-white text-[10px] font-bold">✕</button>
                      </div>
                    ))}
                  </div>
                )}

                <details className="text-[10px] text-[#77736B]">
                  <summary className="cursor-pointer">Colar links em vez de enviar arquivos</summary>
                  <div className="space-y-2 pt-2">
                    <textarea rows={2} value={propForm.photosText} onChange={e => setPropForm({...propForm, photosText: e.target.value})} placeholder="Fotos: uma URL por linha" className="w-full bg-[#050504] border border-[#26221c] rounded-md p-2.5 text-[#F5F0E6] font-mono text-xs focus:outline-none focus:border-[#CBA747]"></textarea>
                    <textarea rows={2} value={propForm.videosText} onChange={e => setPropForm({...propForm, videosText: e.target.value})} placeholder="Vídeos: uma URL por linha" className="w-full bg-[#050504] border border-[#26221c] rounded-md p-2.5 text-[#F5F0E6] font-mono text-xs focus:outline-none focus:border-[#CBA747]"></textarea>
                  </div>
                </details>
              </div>

              <div className="border-t border-[#26221c] pt-3.5 space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-[#CBA747]">Documentos (por capítulos)</h4>
                  <p className="text-[10px] text-[#77736B]">Escreva o que existe de documento, um capítulo por assunto (ex.: Matrícula, Contrato, Escritura). O corretor vê cada capítulo com o botão Copiar.</p>
                </div>
                {propForm.docs.map((d, i) => (
                  <div key={i} className="bg-[#050504] border border-[#26221c] rounded-md p-3 space-y-2">
                    <input type="text" value={d.title} onChange={e => setPropForm({...propForm, docs: propForm.docs.map((x, j) => j === i ? {...x, title: e.target.value} : x)})} placeholder="Título do capítulo (ex.: Matrícula e registro)" className="w-full bg-[#050504] border border-[#26221c] rounded-md px-2.5 py-2 text-[#F5F0E6] text-xs focus:outline-none focus:border-[#CBA747]" />
                    <textarea rows={3} value={d.text} onChange={e => setPropForm({...propForm, docs: propForm.docs.map((x, j) => j === i ? {...x, text: e.target.value} : x)})} placeholder="O que o empreendimento tem sobre este assunto..." className="w-full bg-[#050504] border border-[#26221c] rounded-md px-2.5 py-2 text-[#F5F0E6] text-xs focus:outline-none focus:border-[#CBA747]"></textarea>
                    <button type="button" onClick={() => setPropForm({...propForm, docs: propForm.docs.filter((_, j) => j !== i)})} className="text-[10px] font-semibold text-red-400 hover:text-red-300">Remover capítulo</button>
                  </div>
                ))}
                <button type="button" onClick={() => setPropForm({...propForm, docs: [...propForm.docs, { title: '', text: '' }]})} className="px-3 py-1.5 rounded-md bg-[#14120f] hover:bg-[#1a1713] text-[#CBA747] text-xs font-semibold border border-[#CBA747]/30">+ Adicionar capítulo</button>
              </div>

              <div className="border-t border-[#26221c] pt-3.5 space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-[#CBA747]">Respostas para clientes (texto para copiar)</h4>
                  <p className="text-[10px] text-[#77736B]">Preencha só o que quiser. O corretor vê cada área com o botão Copiar.</p>
                </div>
                {ANSWER_TOPICS.map(t => (
                  <div key={t.key} className="space-y-1">
                    <label className="text-[10px] font-semibold text-[#77736B] uppercase">{t.label}</label>
                    <textarea
                      rows={3}
                      value={propForm.answers[t.key] || ''}
                      onChange={e => setPropForm({...propForm, answers: {...propForm.answers, [t.key]: e.target.value}})}
                      placeholder={t.hint}
                      className="w-full bg-[#050504] border border-[#26221c] rounded-md p-2.5 text-[#F5F0E6] text-xs focus:outline-none focus:border-[#CBA747]"
                    ></textarea>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2.5 pt-3.5 border-t border-[#26221c]">
                <button
                  type="button"
                  onClick={() => setShowPropModal(false)}
                  className="px-4 py-2 rounded-md bg-[#14120f] text-[#F5F0E6] text-xs font-semibold hover:bg-[#1a1713] border border-[#26221c]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-[#CBA747] text-[#050504] text-xs font-bold hover:bg-[#d8b552] flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" /> Salvar Empreendimento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Suggestion Modal */}
      {showSuggModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050504]/90 backdrop-blur-sm p-4">
          <div className="bg-[#0c0a08] border border-[#26221c] rounded-lg w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#26221c] pb-3">
              <h3 className="text-base font-bold text-[#F5F0E6]">{editingSugg ? 'Editar Sugestão' : 'Nova Sugestão'}</h3>
              <button onClick={() => setShowSuggModal(false)} className="text-[#77736B] hover:text-[#F5F0E6] p-1.5">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSuggestion} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-[#77736B] uppercase">Categoria</label>
                <select
                  value={suggForm.category}
                  onChange={e => setSuggForm({...suggForm, category: e.target.value})}
                  className="w-full bg-[#050504] border border-[#26221c] rounded-md px-3 py-2 text-[#F5F0E6] text-xs focus:outline-none focus:border-[#CBA747]"
                >
                  <option value="Primeiro contato">Primeiro contato</option>
                  <option value="Informações sobre o empreendimento">Informações sobre o empreendimento</option>
                  <option value="Preços e formas de pagamento">Preços e formas de pagamento</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-[#77736B] uppercase">Título / Assunto</label>
                <input
                  type="text"
                  required
                  value={suggForm.title}
                  onChange={e => setSuggForm({...suggForm, title: e.target.value})}
                  placeholder="Ex: Abordagem inicial WhatsApp"
                  className="w-full bg-[#050504] border border-[#26221c] rounded-md px-3 py-2 text-[#F5F0E6] text-xs focus:outline-none focus:border-[#CBA747]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-[#77736B] uppercase">Texto da Resposta</label>
                <textarea
                  rows={3}
                  required
                  value={suggForm.content}
                  onChange={e => setSuggForm({...suggForm, content: e.target.value})}
                  placeholder="Digite o texto de apoio..."
                  className="w-full bg-[#050504] border border-[#26221c] rounded-md p-2.5 text-[#F5F0E6] text-xs focus:outline-none focus:border-[#CBA747]"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#26221c]">
                <button
                  type="button"
                  onClick={() => setShowSuggModal(false)}
                  className="px-4 py-2 rounded-md bg-[#14120f] text-[#F5F0E6] text-xs font-semibold hover:bg-[#1a1713] border border-[#26221c]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-[#CBA747] text-[#050504] text-xs font-bold hover:bg-[#d8b552] flex items-center gap-1.5 shadow-sm"
                >
                  Salvar Sugestão
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Realtor Invite Modal */}
      {showRelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050504]/90 backdrop-blur-sm p-4">
          <div className="bg-[#0c0a08] border border-[#26221c] rounded-lg w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#26221c] pb-3">
              <h3 className="text-base font-bold text-[#F5F0E6]">Convidar Corretor</h3>
              <button onClick={() => setShowRelModal(false)} className="text-[#77736B] hover:text-[#F5F0E6] p-1.5">
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-md text-red-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            <form onSubmit={handleInviteRealtor} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-[#77736B] uppercase">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={relForm.name}
                  onChange={e => setRelForm({...relForm, name: e.target.value})}
                  placeholder="Nome do Corretor"
                  className="w-full bg-[#050504] border border-[#26221c] rounded-md px-3 py-2 text-[#F5F0E6] text-xs focus:outline-none focus:border-[#CBA747]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-[#77736B] uppercase">E-mail</label>
                <input
                  type="email"
                  required
                  value={relForm.email}
                  onChange={e => setRelForm({...relForm, email: e.target.value})}
                  placeholder="corretor@imobiliaria.com"
                  className="w-full bg-[#050504] border border-[#26221c] rounded-md px-3 py-2 text-[#F5F0E6] text-xs focus:outline-none focus:border-[#CBA747]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-[#77736B] uppercase">Telefone / WhatsApp</label>
                <input
                  type="text"
                  value={relForm.phone}
                  onChange={e => setRelForm({...relForm, phone: e.target.value})}
                  placeholder="(93) 99999-9999"
                  className="w-full bg-[#050504] border border-[#26221c] rounded-md px-3 py-2 text-[#F5F0E6] text-xs focus:outline-none focus:border-[#CBA747]"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#26221c]">
                <button
                  type="button"
                  onClick={() => setShowRelModal(false)}
                  className="px-4 py-2 rounded-md bg-[#14120f] text-[#F5F0E6] text-xs font-semibold hover:bg-[#1a1713] border border-[#26221c]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-[#CBA747] text-[#050504] text-xs font-bold hover:bg-[#d8b552] flex items-center gap-1.5 shadow-sm"
                >
                  Enviar Convite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
