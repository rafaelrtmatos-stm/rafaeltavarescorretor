import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { RealtorHub } from './components/RealtorHub';
import { AdminPanel } from './components/AdminPanel';
import { LoginModal } from './components/LoginModal';
import { User } from './types';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'hub' | 'admin'>('hub');
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loadingSession, setLoadingSession] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('rt_token');
    const devUser: User = { userId: 'dev-user', email: 'corretor@rafaeltavares.com', role: 'admin', name: 'Corretor / Admin (Modo Dev)' };

    if (token) {
      fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => {
          if (res.ok) return res.json();
          throw new Error('Sessão inválida');
        })
        .then(data => {
          setUser(data.user);
        })
        .catch(() => {
          setUser(devUser);
        })
        .finally(() => {
          setLoadingSession(false);
        });
    } else {
      setUser(null);
      setLoginModalOpen(true);
      setLoadingSession(false);
    }
  }, []);

  const handleLoginSuccess = (token: string, userData: User) => {
    setUser(userData);
    setCurrentView('hub');
    setLoginModalOpen(false);
  };

  const handleLogout = async () => {
    localStorage.removeItem('rt_token');
    setUser(null);
    setLoginModalOpen(true);
  };

  if (loadingSession) {
    return (
      <div className="min-h-screen bg-[#050504] flex items-center justify-center text-[#F5F0E6]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#CBA747] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-[#77736B]">Carregando Central de Materiais...</p>
        </div>
      </div>
    );
  }

  // If user is not logged in, show secure login prompt requiring password
  if (!user) {
    return (
      <div className="min-h-screen bg-[#050504] text-[#F5F0E6] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#0c0a08] border border-[#26221c] p-8 rounded-3xl shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#CBA747]/10 text-[#CBA747] flex items-center justify-center mx-auto border border-[#CBA747]/30">
            <span className="text-2xl font-black">RT</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-[#F5F0E6]">Central de Corretores</h1>
            <p className="text-xs text-[#77736B] uppercase tracking-widest font-bold">Rafael Tavares Corretor • Acesso Restrito</p>
          </div>
          <p className="text-xs text-[#77736B] bg-[#14120f] p-3.5 rounded-2xl border border-[#26221c]">
            Insira sua senha de administrador para acessar o portal de materiais e empreendimentos.
          </p>
          <button
            onClick={() => setLoginModalOpen(true)}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-[#CBA747] to-[#E8D8A0] text-[#050504] font-extrabold text-sm shadow-xl shadow-[#CBA747]/25 hover:from-[#d8b552] hover:to-[#f2e2b2] transition-all"
          >
            Fazer Login com Senha Admin
          </button>
        </div>
        <LoginModal
          isOpen={loginModalOpen}
          onClose={() => { if (user) setLoginModalOpen(false); }}
          onLoginSuccess={handleLoginSuccess}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050504] text-[#F5F0E6] flex flex-col font-sans selection:bg-[#CBA747] selection:text-[#050504]">
      <Navbar
        user={user}
        onOpenLogin={() => setLoginModalOpen(true)}
        onLogout={handleLogout}
        currentView={currentView}
        onChangeView={setCurrentView}
      />

      <main className="flex-1">
        {currentView === 'hub' && (
          <RealtorHub user={user} />
        )}

        {currentView === 'admin' && (
          <AdminPanel user={user} />
        )}
      </main>

      <footer className="bg-[#0c0a08] border-t border-[#26221c] py-8 text-center text-xs text-[#77736B] space-y-2">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#F5F0E6]">Rafael Tavares</span>
            <span>• Central de Materiais dos Corretores</span>
          </div>
          <div>
            Ferramenta Interna de Consulta • Modo de Desenvolvimento Temporário Ativo
          </div>
        </div>
      </footer>

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
