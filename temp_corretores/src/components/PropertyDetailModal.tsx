import React, { useState, useEffect, useRef } from 'react';
import { X, MapPin, Calendar, FileText, ImageIcon, Video, Download, CheckSquare, Square, ExternalLink, Tag, Copy, Check, CheckCircle2, XCircle, ArrowLeft, MessageSquare, ChevronLeft, ChevronRight, Play, Pause, List, Grid } from 'lucide-react';
import { Property, DocumentInfoItem, ResponseSuggestion } from '../types';

interface PropertyDetailModalProps {
  property: Property | null;
  onClose: () => void;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({ property, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'media' | 'prices' | 'location' | 'documents' | 'suggestions'>('overview');
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<ResponseSuggestion[]>([]);
  
  // Viewer states (Stacked Modal)
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState('');

  // Drag / Swipe states for smooth gallery navigation
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Requirement 1: Freeze background scroll completely while modal is open
  useEffect(() => {
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      window.scrollTo(0, scrollY);
    };
  }, []);

  useEffect(() => {
    if (property) {
      loadSuggestions();
    }
  }, [property]);

  const loadSuggestions = async () => {
    try {
      const token = localStorage.getItem('rt_token');
      const res = await fetch('/api/suggestions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setSuggestions(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!property) return null;

  const allMedia = [
    ...property.photos.map(url => ({ type: 'photo' as const, url })),
    ...property.videos.map(url => ({ type: 'video' as const, url }))
  ];

  const toggleSelectMedia = (url: string) => {
    setSelectedMedia(prev =>
      prev.includes(url) ? prev.filter(item => item !== url) : [...prev, url]
    );
  };

  const handleDownloadSingle = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      window.open(url, '_blank');
    }
  };

  const downloadSelected = async () => {
    if (selectedMedia.length === 0) return;
    setDownloadingAll(true);
    setDownloadProgress(`Baixando ${selectedMedia.length} arquivos...`);

    for (let i = 0; i < selectedMedia.length; i++) {
      const url = selectedMedia[i];
      const filename = `${property.title.replace(/[^a-zA-Z0-9]/g, '_')}_arquivo_${i + 1}.${url.includes('mp4') ? 'mp4' : 'jpg'}`;
      await handleDownloadSingle(url, filename);
      await new Promise(res => setTimeout(res, 500));
    }

    setDownloadingAll(false);
    setDownloadProgress('');
  };

  const downloadAllFiles = async () => {
    setDownloadingAll(true);
    setDownloadProgress(`Iniciando download de ${allMedia.length} arquivos...`);

    for (let i = 0; i < allMedia.length; i++) {
      const item = allMedia[i];
      const filename = `${property.title.replace(/[^a-zA-Z0-9]/g, '_')}_${item.type}_${i + 1}.${item.type === 'video' ? 'mp4' : 'jpg'}`;
      setDownloadProgress(`Baixando ${i + 1} de ${allMedia.length}...`);
      await handleDownloadSingle(item.url, filename);
      await new Promise(res => setTimeout(res, 600));
    }

    setDownloadingAll(false);
    setDownloadProgress('');
  };

  const openViewer = (index: number) => {
    setViewerIndex(index);
    setViewerOpen(true);
  };

  // Touch / Mouse Swipe Handlers for Fluid Gallery Navigation
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    setTouchStartX(clientX);
    setIsDragging(true);
    setDragOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (touchStartX === null || !isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const currentOffset = clientX - touchStartX;
    setDragOffset(currentOffset);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const threshold = 70; // minimum swipe distance
    if (dragOffset < -threshold && viewerIndex < allMedia.length - 1) {
      setViewerIndex(prev => prev + 1);
    } else if (dragOffset > threshold && viewerIndex > 0) {
      setViewerIndex(prev => prev - 1);
    }
    setDragOffset(0);
    setTouchStartX(null);
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050504]/90 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      <div className="bg-[#0c0a08] border border-[#26221c] rounded-lg w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        
        {/* Top bar with back button */}
        <div className="bg-[#14120f] px-5 py-3 border-b border-[#26221c] flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#050504] hover:bg-[#1a1713] text-[#CBA747] text-xs font-semibold border border-[#CBA747]/30 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Voltar aos empreendimentos
          </button>
          <div className="text-xs text-[#77736B] font-medium hidden sm:block">
            Central de Materiais • {property.title}
          </div>
          <button
            onClick={onClose}
            className="text-[#77736B] hover:text-[#F5F0E6] p-1.5 rounded-md hover:bg-[#050504] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Header Banner */}
        <div className="relative h-40 sm:h-48 w-full shrink-0">
          <img src={property.coverImage} alt={property.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0a08] via-[#0c0a08]/50 to-transparent"></div>

          <div className="absolute bottom-4 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-md bg-[#CBA747] text-[#050504] font-bold text-[10px] uppercase tracking-wider">
                  Verificado
                </span>
                <span className="text-xs text-[#77736B] flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#CBA747]" /> Atualizado em {new Date(property.updatedAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#F5F0E6]">{property.title}</h2>
              <p className="text-xs text-[#77736B] flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-[#CBA747] shrink-0" /> {property.location}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#26221c] bg-[#050504]/60 px-5 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'overview' ? 'border-[#CBA747] text-[#CBA747]' : 'border-transparent text-[#77736B] hover:text-[#F5F0E6]'}`}
          >
            Visão Geral
          </button>
          <button
            onClick={() => setActiveTab('media')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'media' ? 'border-[#CBA747] text-[#CBA747]' : 'border-transparent text-[#77736B] hover:text-[#F5F0E6]'}`}
          >
            Fotos e Vídeos ({allMedia.length})
          </button>
          <button
            onClick={() => setActiveTab('prices')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'prices' ? 'border-[#CBA747] text-[#CBA747]' : 'border-transparent text-[#77736B] hover:text-[#F5F0E6]'}`}
          >
            Preços ({property.prices.length})
          </button>
          <button
            onClick={() => setActiveTab('location')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'location' ? 'border-[#CBA747] text-[#CBA747]' : 'border-transparent text-[#77736B] hover:text-[#F5F0E6]'}`}
          >
            Localização
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'documents' ? 'border-[#CBA747] text-[#CBA747]' : 'border-transparent text-[#77736B] hover:text-[#F5F0E6]'}`}
          >
            Lista de Documentos ({property.documents.length})
          </button>
          <button
            onClick={() => setActiveTab('suggestions')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'suggestions' ? 'border-[#CBA747] text-[#CBA747]' : 'border-transparent text-[#77736B] hover:text-[#F5F0E6]'}`}
          >
            Sugestões de Respostas ({suggestions.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5 bg-[#0c0a08]">
          {activeTab === 'overview' && (
            <div className="space-y-5">
              <div className="bg-[#050504] p-5 rounded-lg border border-[#26221c]">
                <h3 className="text-sm font-bold text-[#F5F0E6] mb-1.5">Sobre o Empreendimento</h3>
                <p className="text-[#77736B] leading-relaxed text-xs">{property.description}</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div onClick={() => setActiveTab('media')} className="bg-[#14120f]/40 hover:bg-[#14120f] border border-[#26221c] p-3.5 rounded-lg cursor-pointer text-center">
                  <ImageIcon className="w-4 h-4 text-[#CBA747] mx-auto mb-1.5" />
                  <div className="text-lg font-bold text-[#F5F0E6]">{property.photos.length}</div>
                  <div className="text-[10px] text-[#77736B]">Fotos</div>
                </div>
                <div onClick={() => setActiveTab('media')} className="bg-[#14120f]/40 hover:bg-[#14120f] border border-[#26221c] p-3.5 rounded-lg cursor-pointer text-center">
                  <Video className="w-4 h-4 text-[#CBA747] mx-auto mb-1.5" />
                  <div className="text-lg font-bold text-[#F5F0E6]">{property.videos.length}</div>
                  <div className="text-[10px] text-[#77736B]">Vídeos</div>
                </div>
                <div onClick={() => setActiveTab('prices')} className="bg-[#14120f]/40 hover:bg-[#14120f] border border-[#26221c] p-3.5 rounded-lg cursor-pointer text-center">
                  <Tag className="w-4 h-4 text-[#CBA747] mx-auto mb-1.5" />
                  <div className="text-lg font-bold text-[#F5F0E6]">{property.prices.length}</div>
                  <div className="text-[10px] text-[#77736B]">Preços</div>
                </div>
                <div onClick={() => setActiveTab('documents')} className="bg-[#14120f]/40 hover:bg-[#14120f] border border-[#26221c] p-3.5 rounded-lg cursor-pointer text-center">
                  <FileText className="w-4 h-4 text-[#CBA747] mx-auto mb-1.5" />
                  <div className="text-lg font-bold text-[#F5F0E6]">{property.documents.length}</div>
                  <div className="text-[10px] text-[#77736B]">Documentos</div>
                </div>
                <div onClick={() => setActiveTab('suggestions')} className="bg-[#14120f]/40 hover:bg-[#14120f] border border-[#26221c] p-3.5 rounded-lg cursor-pointer text-center">
                  <MessageSquare className="w-4 h-4 text-[#CBA747] mx-auto mb-1.5" />
                  <div className="text-lg font-bold text-[#F5F0E6]">{suggestions.length}</div>
                  <div className="text-[10px] text-[#77736B]">Respostas</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'media' && (
            <div className="space-y-5">
              {/* Batch Actions Bar (NO ZIP) */}
              <div className="bg-[#14120f] border border-[#CBA747]/30 p-5 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-[#F5F0E6]">Gerenciamento de Fotos e Vídeos</h4>
                  <p className="text-xs text-[#77736B]">Baixe arquivos individualmente ou clique em "Baixar todos" para iniciar o download de todos os arquivos separadamente.</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {selectedMedia.length > 0 && (
                    <button
                      onClick={downloadSelected}
                      disabled={downloadingAll}
                      className="px-3 py-2 rounded-md bg-[#14120f] hover:bg-[#1a1713] text-[#CBA747] text-xs font-semibold border border-[#CBA747]/40 disabled:opacity-50"
                    >
                      Baixar Selecionados ({selectedMedia.length})
                    </button>
                  )}
                  <button
                    onClick={downloadAllFiles}
                    disabled={downloadingAll || allMedia.length === 0}
                    className="px-4 py-2 rounded-md bg-[#CBA747] hover:bg-[#d8b552] text-[#050504] text-xs font-bold shadow-sm disabled:opacity-50"
                  >
                    {downloadingAll ? downloadProgress : 'Baixar Todos (Separados)'}
                  </button>
                </div>
              </div>

              {allMedia.length === 0 ? (
                <p className="text-center py-8 text-xs text-[#77736B]">Nenhum arquivo de foto ou vídeo cadastrado.</p>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#77736B] uppercase">Lista de Arquivos ({allMedia.length})</span>
                    <span className="text-xs text-[#77736B]">Clique na miniatura para abrir no visualizador grande</span>
                  </div>

                  {/* Mode 2 — Lista de arquivos */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {allMedia.map((item, idx) => {
                      const isSelected = selectedMedia.includes(item.url);
                      return (
                        <div
                          key={idx}
                          className={`bg-[#050504] border rounded-md p-3 flex items-center justify-between gap-3 transition-colors ${isSelected ? 'border-[#CBA747] bg-[#CBA747]/5' : 'border-[#26221c]'}`}
                        >
                          <div className="flex items-center gap-2.5 overflow-hidden cursor-pointer" onClick={() => openViewer(idx)}>
                            <img src={item.url} alt={`Mídia ${idx + 1}`} className="w-12 h-12 rounded-md object-cover shrink-0 border border-[#26221c]" />
                            <div className="overflow-hidden">
                              <div className="text-xs font-semibold text-[#F5F0E6] truncate">{item.type === 'photo' ? `Foto #${idx + 1}` : `Vídeo #${idx + 1}`}</div>
                              <div className="text-[10px] text-[#77736B] uppercase">{item.type === 'photo' ? 'Imagem JPG' : 'Vídeo MP4'}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => toggleSelectMedia(item.url)}
                              className="p-1.5 rounded-md bg-[#14120f] text-[#F5F0E6] border border-[#26221c]"
                            >
                              {isSelected ? <CheckSquare className="w-3.5 h-3.5 text-[#CBA747]" /> : <Square className="w-3.5 h-3.5 text-[#77736B]" />}
                            </button>
                            <button
                              onClick={() => handleDownloadSingle(item.url, `${property.title}_${item.type}_${idx + 1}.${item.type === 'video' ? 'mp4' : 'jpg'}`)}
                              className="p-1.5 rounded-md bg-[#CBA747] text-[#050504] font-bold"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'prices' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#F5F0E6]">Tabelas de Preços e Condições Comerciais</h3>
                  <p className="text-xs text-[#77736B]">Atualizado em {new Date(property.updatedAt).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>

              {property.prices.length === 0 ? (
                <p className="text-xs text-[#77736B]">Nenhum preço cadastrado.</p>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {property.prices.map((p, idx) => {
                    const priceText = `Empreendimento: ${property.title}\nPlano: ${p.plan}\nEntrada: ${p.entry}\nParcelamento: ${p.installments}\nValor Total: ${p.total}\nObs: ${p.notes}`;
                    return (
                      <div key={idx} className="bg-[#050504] border border-[#26221c] p-5 rounded-lg space-y-3">
                        <div className="flex items-center justify-between border-b border-[#26221c] pb-2.5">
                          <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-[#CBA747]" />
                            <h4 className="text-sm font-bold text-[#F5F0E6]">{p.plan}</h4>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <span className="px-2.5 py-0.5 bg-[#CBA747]/10 text-[#CBA747] rounded-md text-xs font-bold border border-[#CBA747]/30">
                              Total: {p.total}
                            </span>
                            <button
                              onClick={() => copyText(priceText, `price-${idx}`)}
                              className="px-2.5 py-1 rounded-md bg-[#14120f] hover:bg-[#1a1713] text-[#CBA747] text-xs font-semibold flex items-center gap-1 border border-[#CBA747]/30 transition-colors"
                            >
                              {copiedId === `price-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              {copiedId === `price-${idx}` ? 'Copiado!' : 'Copiar'}
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                          <div className="bg-[#14120f] p-3 rounded-md border border-[#26221c]">
                            <div className="text-[10px] text-[#77736B] uppercase">Sinal / Entrada</div>
                            <div className="text-sm font-bold text-[#F5F0E6] mt-0.5">{p.entry}</div>
                          </div>
                          <div className="bg-[#14120f] p-3 rounded-md border border-[#26221c]">
                            <div className="text-[10px] text-[#77736B] uppercase">Parcelamento</div>
                            <div className="text-sm font-bold text-[#F5F0E6] mt-0.5">{p.installments}</div>
                          </div>
                          <div className="bg-[#14120f] p-3 rounded-md border border-[#26221c]">
                            <div className="text-[10px] text-[#77736B] uppercase">Condições & Observações</div>
                            <div className="text-xs font-medium text-[#77736B] mt-0.5">{p.notes}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'location' && (
            <div className="space-y-5">
              <div className="bg-[#050504] border border-[#26221c] p-5 rounded-lg space-y-3">
                <h3 className="text-base font-bold text-[#F5F0E6]">Localização do Empreendimento</h3>
                <p className="text-xs text-[#77736B] flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#CBA747] shrink-0" /> {property.location}
                </p>
                <div className="pt-1">
                  <a
                    href={property.mapLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#CBA747] hover:bg-[#d8b552] text-[#050504] font-bold text-xs shadow-sm transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Abrir no Google Maps
                  </a>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-[#F5F0E6]">Lista Informativa de Documentos</h3>
                <p className="text-xs text-[#77736B]">Relação oficial de certidões, matrículas e documentos cadastrados para este empreendimento.</p>
              </div>

              {property.documents.length === 0 ? (
                <p className="text-xs text-[#77736B]">Nenhum documento cadastrado na lista.</p>
              ) : (
                <div className="space-y-2.5">
                  {property.documents.map((doc: DocumentInfoItem) => (
                    <div key={doc.id} className="bg-[#050504] border border-[#26221c] p-3.5 rounded-lg flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-md bg-[#CBA747]/10 text-[#CBA747] flex items-center justify-center border border-[#CBA747]/30 shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#F5F0E6]">{doc.name}</div>
                          <div className="text-[10px] text-[#77736B]">{doc.description}</div>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {doc.available ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" /> Disponível
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-red-500/10 text-red-400 text-[10px] font-bold border border-red-500/20">
                            <XCircle className="w-3 h-3" /> Em Emissão
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'suggestions' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-[#F5F0E6]">Sugestões de Respostas para Clientes</h3>
                <p className="text-xs text-[#77736B]">Copie e adapte as mensagens para o atendimento aos clientes.</p>
              </div>

              {suggestions.length === 0 ? (
                <p className="text-xs text-[#77736B]">Nenhuma sugestão cadastrada.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {suggestions.map(s => (
                    <div key={s.id} className="bg-[#050504] border border-[#26221c] p-4 rounded-lg space-y-2.5 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase bg-[#CBA747]/10 text-[#CBA747] border border-[#CBA747]/30">
                            {s.category}
                          </span>
                          <button
                            onClick={() => copyText(s.content, `sugg-${s.id}`)}
                            className="px-2.5 py-1 rounded-md bg-[#14120f] hover:bg-[#1a1713] text-[#CBA747] text-xs font-semibold flex items-center gap-1 border border-[#CBA747]/30 transition-colors"
                          >
                            {copiedId === `sugg-${s.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            {copiedId === `sugg-${s.id}` ? 'Copiado!' : 'Copiar'}
                          </button>
                        </div>
                        <h4 className="text-sm font-bold text-[#F5F0E6]">{s.title}</h4>
                        <p className="text-xs text-[#77736B] leading-relaxed">"{s.content}"</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Mode 1 — Visualizador Grande com Navegação Fluida por Arraste Lateral (Swipe & Snap) */}
      {viewerOpen && allMedia[viewerIndex] && (
        <div 
          className="fixed inset-0 z-60 flex items-center justify-center bg-[#050504]/95 backdrop-blur-lg p-4 select-none"
        >
          <div className="relative w-full max-w-4xl bg-[#0c0a08] border border-[#26221c] rounded-lg overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-3 bg-[#14120f] border-b border-[#26221c]">
              <span className="text-xs font-semibold text-[#CBA747]">
                Visualizador • {viewerIndex + 1} de {allMedia.length} ({allMedia[viewerIndex].type === 'photo' ? 'Foto' : 'Vídeo'})
              </span>
              <button
                onClick={() => setViewerOpen(false)}
                className="text-[#77736B] hover:text-[#F5F0E6] p-1.5 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div 
              className="relative p-5 flex items-center justify-center bg-[#050504] min-h-[380px] overflow-hidden cursor-grab active:cursor-grabbing"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleTouchStart}
              onMouseMove={handleTouchMove}
              onMouseUp={handleTouchEnd}
            >
              <div 
                className="w-full flex items-center justify-center transition-transform duration-300 ease-out"
                style={{ transform: `translateX(${dragOffset}px)` }}
              >
                {allMedia[viewerIndex].type === 'photo' ? (
                  <img
                    src={allMedia[viewerIndex].url}
                    alt={`Visualização ${viewerIndex + 1}`}
                    className="max-h-[60vh] object-contain rounded-md pointer-events-none"
                  />
                ) : (
                  <video
                    ref={videoRef}
                    controls
                    autoPlay
                    className="max-h-[60vh] w-full rounded-md object-contain bg-black pointer-events-auto"
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                  >
                    <source src={allMedia[viewerIndex].url} type="video/mp4" />
                    Seu navegador não suporta vídeos.
                  </video>
                )}
              </div>

              {/* Navigation arrows */}
              {viewerIndex > 0 && (
                <button
                  onClick={(e) => { e.stopPropagation(); setViewerIndex(prev => prev - 1); }}
                  className="absolute left-3 p-2.5 rounded-full bg-[#14120f]/90 text-[#F5F0E6] hover:bg-[#CBA747] hover:text-[#050504] transition-colors border border-[#26221c] z-10"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              {viewerIndex < allMedia.length - 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); setViewerIndex(prev => prev + 1); }}
                  className="absolute right-3 p-2.5 rounded-full bg-[#14120f]/90 text-[#F5F0E6] hover:bg-[#CBA747] hover:text-[#050504] transition-colors border border-[#26221c] z-10"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="px-5 py-3 bg-[#14120f] border-t border-[#26221c] flex items-center justify-between">
              <span className="text-xs text-[#77736B] truncate max-w-xs">Arraste para os lados ou use as setas</span>
              <button
                onClick={() => handleDownloadSingle(allMedia[viewerIndex].url, `${property.title}_${allMedia[viewerIndex].type}_${viewerIndex + 1}.${allMedia[viewerIndex].type === 'video' ? 'mp4' : 'jpg'}`)}
                className="px-4 py-2 rounded-md bg-[#CBA747] hover:bg-[#d8b552] text-[#050504] font-bold text-xs flex items-center gap-1.5 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" /> Baixar arquivo atual
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
