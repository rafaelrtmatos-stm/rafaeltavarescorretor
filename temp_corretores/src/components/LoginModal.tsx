import React, { useState } from 'react';
import { X, Lock, Mail, Shield, AlertCircle, ArrowRight } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (token: string, user: any) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao fazer login.');
      }
      localStorage.setItem('rt_token', data.token);
      onLoginSuccess(data.token, data.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050504]/90 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-[#0c0a08] border border-[#26221c] rounded-lg w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-5 border-b border-[#26221c]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-[#CBA747]/10 text-[#CBA747] flex items-center justify-center border border-[#CBA747]/30">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#F5F0E6]">Acesso Restrito</h3>
              <p className="text-xs text-[#77736B]">Central de Materiais • Corretores</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#77736B] hover:text-[#F5F0E6] p-1.5 rounded-md hover:bg-[#14120f] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-md flex items-center gap-2.5 text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#77736B] uppercase tracking-wider">E-mail Profissional</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-[#77736B]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@imobiliaria.com"
                className="w-full bg-[#050504] border border-[#26221c] rounded-md pl-10 pr-3 py-2 text-[#F5F0E6] placeholder-[#77736B] focus:outline-none focus:border-[#CBA747] transition-colors text-xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#77736B] uppercase tracking-wider">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[#77736B]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#050504] border border-[#26221c] rounded-md pl-10 pr-3 py-2 text-[#F5F0E6] placeholder-[#77736B] focus:outline-none focus:border-[#CBA747] transition-colors text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-md bg-gradient-to-r from-[#CBA747] to-[#E8D8A0] text-[#050504] font-bold text-xs shadow-md shadow-[#CBA747]/20 hover:from-[#d8b552] hover:to-[#f2e2b2] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar na Central'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
