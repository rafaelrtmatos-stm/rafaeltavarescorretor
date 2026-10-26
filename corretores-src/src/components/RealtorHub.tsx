import { API } from '../api';
import React, { useState, useEffect } from 'react';
import { Search, MapPin, ImageIcon, Video, FileText, Eye, Sparkles } from 'lucide-react';
import { Property, User } from '../types';
import { PropertyDetailModal } from './PropertyDetailModal';

interface RealtorHubProps {
  user: User;
}

export const RealtorHub: React.FC<RealtorHubProps> = ({ user }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('rt_token');
      const res = await fetch(`${API}/properties`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setProperties(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredProperties = properties.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.location.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 bg-[#050504] text-[#F5F0E6] animate-in fade-in duration-300">
      
      {/* Welcome Banner */}
      <div className="bg-[#0c0a08] border border-[#26221c] rounded-lg p-6 relative overflow-hidden shadow-2xl">
        <div className="absolute right-0 top-0 w-80 h-80 bg-[#CBA747]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#14120f] text-[#CBA747] font-bold text-[10px] uppercase tracking-wider border border-[#CBA747]/30">
              <Sparkles className="w-3 h-3 text-[#CBA747]" /> Central de Materiais • Equipe de Corretores
            </div>
            <h1 className="text-2xl font-black text-[#F5F0E6]">Olá, {user.name}</h1>
            <p className="text-[#77736B] text-xs max-w-xl">
              Selecione um empreendimento abaixo para consultar todas as fotos, vídeos, preços, localização, lista de documentos e sugestões de respostas.
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#77736B]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar empreendimento ou localização..."
            className="w-full bg-[#0c0a08] border border-[#26221c] rounded-md pl-10 pr-3 py-2 text-[#F5F0E6] placeholder-[#77736B] text-xs focus:outline-none focus:border-[#CBA747] transition-colors shadow-inner"
          />
        </div>
        <div className="text-xs text-[#77736B] font-medium">
          Mostrando <span className="text-[#CBA747] font-bold">{filteredProperties.length}</span> empreendimentos
        </div>
      </div>

      {/* Properties Grid */}
      {loading ? (
        <div className="text-center py-16 text-[#77736B] text-xs">Carregando empreendimentos...</div>
      ) : filteredProperties.length === 0 ? (
        <div className="text-center py-16 bg-[#0c0a08] rounded-lg border border-[#26221c]">
          <p className="text-[#77736B] text-xs">Nenhum empreendimento encontrado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProperties.map(property => (
            <div
              key={property.id}
              className="bg-[#0c0a08] border border-[#26221c] rounded-lg overflow-hidden shadow-xl hover:border-[#CBA747]/50 transition-all duration-300 flex flex-col group"
            >
              <div className="relative h-48 w-full overflow-hidden">
                <img
                  src={property.coverImage}
                  alt={property.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050504] via-[#050504]/20 to-transparent"></div>
                <span className="absolute top-3 left-3 bg-[#14120f]/90 backdrop-blur-md px-2.5 py-0.5 rounded-md text-[10px] font-bold text-[#CBA747] border border-[#CBA747]/30">
                  Cadastrado
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3.5">
                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-[#F5F0E6] group-hover:text-[#CBA747] transition-colors">
                    {property.title}
                  </h3>
                  <p className="text-xs text-[#77736B] flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#CBA747] shrink-0" /> {property.location}
                  </p>
                  <p className="text-xs text-[#77736B] line-clamp-2 mt-1">{property.description}</p>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#26221c] text-center">
                  <div className="bg-[#14120f] p-2 rounded-md border border-[#26221c]">
                    <div className="flex items-center justify-center text-[#CBA747] mb-1">
                      <ImageIcon className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-xs font-bold text-[#F5F0E6]">{property.photos.length}</div>
                    <div className="text-[9px] text-[#77736B]">Fotos</div>
                  </div>
                  <div className="bg-[#14120f] p-2 rounded-md border border-[#26221c]">
                    <div className="flex items-center justify-center text-[#CBA747] mb-1">
                      <Video className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-xs font-bold text-[#F5F0E6]">{property.videos.length}</div>
                    <div className="text-[9px] text-[#77736B]">Vídeos</div>
                  </div>
                  <div className="bg-[#14120f] p-2 rounded-md border border-[#26221c]">
                    <div className="flex items-center justify-center text-[#CBA747] mb-1">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-xs font-bold text-[#F5F0E6]">{property.documents.length}</div>
                    <div className="text-[9px] text-[#77736B]">Docs</div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedProperty(property)}
                  className="w-full py-2.5 rounded-md bg-[#CBA747] hover:bg-[#d8b552] text-[#050504] font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" /> Acessar Empreendimento
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Property Detail Modal */}
      {selectedProperty && (
        <PropertyDetailModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
        />
      )}
    </div>
  );
};
