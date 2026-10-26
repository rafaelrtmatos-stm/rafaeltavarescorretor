import { API } from './api';
import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { RealtorHub } from './components/RealtorHub';
import { AdminPanel } from './components/AdminPanel';
import { LoginModal } from './components/LoginModal';
import { User } from './types';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'hub' | 'admin'>('hub');
  const [loadingSession, setLoadingSession] = useState(true);

  // Ao abrir: valida o token salvo. Sem token válido, mostra a tela de login.
  useEffect(() => {
    const token = localStorage.getItem('rt_token');
    if (!token) {
      setLoadingSession(false);
      return;
    }
    fetch(`${API}/auth/me`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Sessão inválida');
      })
      .then(data => setUser(data.user))
      .catch(() => {
        localStorage.removeItem('rt_token');
        setUser(null);
      })
      .finally(() => setLoadingSession(false));
  }, []);

  // Sessão expirada ou acesso removido durante o uso: volta ao login
  useEffect(() => {
    const onUnauthorized = () => {
      setUser(null);
      setCurrentView('hub');
    };
    window.addEventListener('rt-unauthorized', onUnauthorized);
    return () => window.removeEventListener('rt-unauthorized', onUnauthorized);
  }, []);

  const handleLoginSuccess = (_token: string, userData: User) => {
    setUser(userData);
    setCurrentView('hub');
  };

  const handleLogout = () => {
    localStorage.removeItem('rt_token');
    setUser(null);
    setCurrentView('hub');
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

  // Sem login não há acesso a nada
  if (!user) {
    return (
      <div className="min-h-screen bg-[#050504] text-[#F5F0E6]">
        <LoginModal
          isOpen
          required
          onClose={() => {}}
          onLoginSuccess={handleLoginSuccess}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050504] text-[#F5F0E6] flex flex-col font-sans selection:bg-[#CBA747] selection:text-[#050504]">
      <Navbar
        user={user}
        onOpenLogin={() => {}}
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
            Ferramenta Interna de Consulta • Acesso Restrito
          </div>
        </div>
      </footer>

    </div>
  );
}
