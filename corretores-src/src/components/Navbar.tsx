import React, { useState, useRef } from 'react';
import { Building2, LogOut, User as UserIcon, Menu, X, Settings } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  user: User | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  currentView: 'hub' | 'admin';
  onChangeView: (view: 'hub' | 'admin') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onOpenLogin,
  onLogout,
  currentView,
  onChangeView
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<any>(null);

  const handleLogoClick = () => {
    clickCountRef.current += 1;
    
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }

    clickTimerRef.current = setTimeout(() => {
      clickCountRef.current = 0;
    }, 600);

    if (clickCountRef.current >= 3) {
      clickCountRef.current = 0;
      if (user && user.role === 'admin') {
        onChangeView('admin');
      } else {
        alert('Acesso restrito ao painel administrativo.');
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#050504] text-[#F5F0E6] shadow-2xl border-b border-[#26221c]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo with 3-click discreet admin access */}
        <div 
          onClick={handleLogoClick}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
          title="Central de Materiais • Clique 3 vezes na logo para acessar o painel administrativo"
        >
          <div className="w-10 h-10 rounded-md bg-gradient-to-tr from-[#CBA747] to-[#E8D8A0] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <Building2 className="w-5 h-5 text-[#050504] font-bold" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-[#F5F0E6]">
              Central de Materiais
            </span>
            <span className="block text-[10px] font-medium text-[#CBA747] uppercase tracking-widest">
              Portal Institucional • Corretores
            </span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4">
          <button 
            onClick={() => onChangeView('hub')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${currentView === 'hub' ? 'bg-[#14120f] text-[#CBA747] border border-[#CBA747]/30' : 'text-[#77736B] hover:text-[#F5F0E6]'}`}
          >
            Empreendimentos & Materiais
          </button>

          {currentView === 'admin' && (
            <button
              onClick={() => onChangeView('hub')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-[#CBA747] text-[#050504] shadow-sm"
            >
              Voltar à Central
            </button>
          )}

          {user && (
            <div className="flex items-center gap-3 pl-3 border-l border-[#26221c]">
              <div className="flex items-center gap-2.5 bg-[#14120f] px-3 py-1.5 rounded-md border border-[#26221c]">
                <div className="w-7 h-7 rounded-md bg-[#CBA747]/20 text-[#CBA747] flex items-center justify-center font-bold text-xs">
                  {user.name.charAt(0)}
                </div>
                <div className="text-left hidden lg:block">
                  <div className="text-xs font-semibold text-[#F5F0E6] truncate max-w-[100px]">{user.name}</div>
                  <div className="text-[9px] text-[#CBA747]">{user.role === 'admin' ? 'Administrador' : 'Corretor Autorizado'}</div>
                </div>
                <button
                  onClick={onLogout}
                  title="Sair"
                  className="text-[#77736B] hover:text-red-400 transition-colors p-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={() => onChangeView(currentView === 'hub' ? 'admin' : 'hub')}
            className="px-2.5 py-1 rounded-md bg-[#CBA747] text-[#050504] text-xs font-bold"
          >
            {currentView === 'hub' ? 'Painel' : 'Central'}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-[#77736B] hover:text-[#F5F0E6]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#050504] border-t border-[#26221c] px-4 py-4 space-y-3">
          <button
            onClick={() => { onChangeView('hub'); setMobileMenuOpen(false); }}
            className="block w-full text-left py-1.5 text-sm text-[#F5F0E6] font-medium"
          >
            Empreendimentos & Materiais
          </button>
          {user && (
            <div className="pt-3 border-t border-[#26221c] flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-[#F5F0E6]">{user.name}</div>
                <div className="text-[10px] text-[#CBA747]">Corretor Autorizado</div>
              </div>
              <button
                onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                className="flex items-center gap-1 text-red-400 text-xs font-medium"
              >
                <LogOut className="w-3.5 h-3.5" /> Sair
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
