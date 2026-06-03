// Buscar token do servidor Vercel (salvo como env var)
async function initToken() {
  if (localStorage.getItem(TK)) return; // já tem local
  try {
    const senha = localStorage.getItem('admin_pass_rt') || prompt('Senha do Admin para carregar configurações:');
    if (!senha) return;
    const res = await fetch('/api/token?senha=' + encodeURIComponent(senha));
    if (res.ok) {
      const d = await res.json();
      if (d.token) {
        localStorage.setItem(TK, d.token);
        localStorage.setItem('admin_pass_rt', senha);
        console.log('✅ Token carregado do servidor');
      }
    }
  } catch(e) {
    console.warn('Endpoint de token não disponível');
  }
}

// ── SAVE ENGINE — GitHub API ──
const GITHUB_REPO = 'rafaelrtmatos-stm/rafaeltavarescorretor';
const GITHUB_FILE = 'site_data.json';
const TK = 'gh_rt_tok';

function getToken(){
  return localStorage.getItem(TK) || sessionStorage.getItem(TK) || null;
}

async function loadSiteData(){
  try{
    const r = await fetch('/'+GITHUB_FILE+'?_='+Date.now());
    return await r.json();
  }catch(e){ return null; }
}

async function saveSiteData(data){
  const token = getToken();
  if(!token){
    showTokenModal();
    return false;
  }
  try{
    const shaR = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE}`,
      {headers:{Authorization:`token ${token}`,Accept:'application/vnd.github.v3+json'}}
    );
    const shaD = await shaR.json();
    if(!shaD.sha){ alert('Erro: token inválido ou expirado. Reconfigure na aba Token GitHub.'); localStorage.removeItem(TK); return false; }

    const content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))));
    const commitR = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE}`,
      {method:'PUT',headers:{Authorization:`token ${token}`,Accept:'application/vnd.github.v3+json','Content-Type':'application/json'},
       body:JSON.stringify({message:'Admin: '+new Date().toLocaleString('pt-BR'),content,sha:shaD.sha})}
    );
    if(commitR.ok){ return true; }
    const err = await commitR.json();
    if(err.message && err.message.includes('Bad credentials')){ localStorage.removeItem(TK); showTokenModal(); }
    else alert('Erro ao salvar: '+(err.message||'desconhecido'));
    return false;
  }catch(e){ alert('Erro de conexão: '+e.message); return false; }
}

function showTokenModal(){
  var existing = document.getElementById('modal-token-gh');
  if(existing){ existing.style.display='flex'; return; }
  var m = document.createElement('div');
  m.id='modal-token-gh';
  m.style.cssText='position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.92);display:flex;align-items:center;justify-content:center;padding:20px';
  m.innerHTML=`
    <div style="background:#0A0A0A;border:1px solid rgba(201,168,76,0.35);border-radius:16px;padding:28px;max-width:420px;width:100%">
      <div style="font-family:'Cormorant Garamond',serif;font-size:20px;font-weight:700;color:#C9A84C;margin-bottom:6px">🔑 Token GitHub</div>
      <p style="font-size:12px;color:rgba(242,237,228,0.5);margin-bottom:16px;line-height:1.6">Para salvar em qualquer dispositivo, configure o token GitHub uma única vez. Ele fica salvo no navegador desse dispositivo.</p>
      <input id="modal-token-input" type="password" placeholder="ghp_..." style="width:100%;padding:12px;background:#111;border:1px solid rgba(201,168,76,0.25);border-radius:8px;color:#F2EDE4;font-size:13px;margin-bottom:10px;box-sizing:border-box">
      <label style="display:flex;align-items:center;gap:8px;font-size:12px;color:rgba(242,237,228,0.4);margin-bottom:14px;cursor:pointer">
        <input type="checkbox" id="modal-show-tok" onchange="document.getElementById('modal-token-input').type=this.checked?'text':'password'"> Mostrar token
      </label>
      <div style="display:flex;gap:10px">
        <button onclick="salvarTokenModal()" style="flex:1;background:#C9A84C;color:#000;border:none;padding:12px;border-radius:8px;font-weight:700;font-size:13px;cursor:pointer">Salvar token</button>
        <button onclick="document.getElementById('modal-token-gh').style.display='none'" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:#F2EDE4;padding:12px 16px;border-radius:8px;font-size:13px;cursor:pointer">Cancelar</button>
      </div>
    </div>`;
  document.body.appendChild(m);
}

function salvarTokenModal(){
  var v = document.getElementById('modal-token-input').value.trim();
  if(!v || !v.startsWith('ghp_')){ alert('Token inválido. Deve começar com ghp_'); return; }
  localStorage.setItem(TK, v);
  document.getElementById('modal-token-gh').style.display='none';
  if(typeof toast==='function') toast('✅ Token salvo! Tente salvar novamente.');
}
