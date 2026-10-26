// Todas as chamadas de API do app passam por aqui (/corretores/api/...)
export const API = '/corretores/api';

// Se o servidor responder 401 (sessão expirada ou acesso removido),
// limpa o token e avisa o App para voltar à tela de login.
const originalFetch = window.fetch.bind(window);
window.fetch = async (...args: Parameters<typeof fetch>) => {
  const res = await originalFetch(...args);
  const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request).url;
  if (res.status === 401 && url.startsWith(API) && !url.startsWith(`${API}/auth/login`)) {
    localStorage.removeItem('rt_token');
    window.dispatchEvent(new Event('rt-unauthorized'));
  }
  return res;
};
