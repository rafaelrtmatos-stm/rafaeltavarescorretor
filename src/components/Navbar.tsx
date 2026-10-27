import React from 'react';
import { Home, Building2, Key, ShieldCheck, Phone, Menu, X } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: string, param?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setCurrentView }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-[#C9A84C]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand */}
        <button 
          onClick={() => setCurrentView('home')}
          className="flex items-center gap-3 text-left group"
        >
          <div className="w-11 h-11 rounded-xl bg-[#C9A84C]/10 border border-[#C9A84C]/30 flex items-center justify-center text-[#C9A84C] font-serif font-bold text-xl group-hover:border-[#C9A84C] transition-all">
            RT
          </div>
          <div>
            <div className="font-serif text-lg font-bold text-[#C9A84C] tracking-wide">
              Rafael Tavares
            </div>
            <div className="text-[10px] text-zinc-400 uppercase tracking-widest flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-[#C9A84C]" /> CRECI 13919 · Santarém PA
            </div>
          </div>
        </button>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8">
          <button 
            onClick={() => setCurrentView('home')} 
            className={`text-sm tracking-wide transition-colors ${currentView === 'home' ? 'text-[#C9A84C] font-semibold' : 'text-zinc-300 hover:text-[#C9A84C]'}`}
          >
            Início
          </button>
          <button 
            onClick={() => setCurrentView('rentals')} 
            className={`text-sm tracking-wide transition-colors ${currentView === 'rentals' ? 'text-[#C9A84C] font-semibold' : 'text-zinc-300 hover:text-[#C9A84C]'}`}
          >
            Aluguéis
          </button>
          <button 
            onClick={() => setCurrentView('admin')} 
            className={`text-sm tracking-wide transition-colors ${currentView === 'admin' ? 'text-[#C9A84C] font-semibold' : 'text-zinc-300 hover:text-[#C9A84C]'}`}
          >
            Painel Gestão
          </button>
        </nav>

        {/* Action button */}
        <div className="hidden sm:flex items-center gap-4">
          <a 
            href="https://wa.me/5593991234567?text=Olá%20Rafael,%20gostaria%20de%20falar%20sobre%20imóveis." 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#C9A84C] hover:bg-[#E8C96A] text-black px-5 py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all shadow-lg shadow-[#C9A84C]/20"
          >
            <Phone className="w-4 h-4" /> WhatsApp
          </a>
        </div>

        {/* Mobile Hamburger */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-[#C9A84C]"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-zinc-950 border-b border-zinc-800 px-6 py-6 space-y-4">
          <button 
            onClick={() => { setCurrentView('home'); setMobileMenuOpen(false); }}
            className="block w-full text-left py-2 text-sm text-zinc-200 hover:text-[#C9A84C]"
          >
            🏠 Início & Empreendimentos
          </button>
          <button 
            onClick={() => { setCurrentView('rentals'); setMobileMenuOpen(false); }}
            className="block w-full text-left py-2 text-sm text-zinc-200 hover:text-[#C9A84C]"
          >
            🔑 Aluguéis de Imóveis
          </button>
          <button 
            onClick={() => { setCurrentView('admin'); setMobileMenuOpen(false); }}
            className="block w-full text-left py-2 text-sm text-zinc-200 hover:text-[#C9A84C]"
          >
            ⚙️ Painel de Gestão (Admin)
          </button>
          <div className="pt-2">
            <a 
              href="https://wa.me/5593991234567?text=Olá%20Rafael,%20gostaria%20de%20falar%20sobre%20imóveis." 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-[#C9A84C] text-black w-full py-3 rounded-lg text-xs font-bold uppercase tracking-wider"
            >
              <Phone className="w-4 h-4" /> Falar no WhatsApp
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
