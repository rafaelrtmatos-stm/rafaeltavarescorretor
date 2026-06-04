# AGENTS.md — REGRAS OBRIGATÓRIAS

> Leia este arquivo antes de qualquer ação. Siga à risca.

---

## O QUE É ESTE PROJETO

Site HTML estático puro. Sem framework, sem bundler, sem Node.js.

**Como rodar:** `node serve.js` (porta 5000 — confirme se está livre antes)

**Deploy:** Vercel estático — o `vercel.json` já está configurado.

---

## ❌ NUNCA FAÇA

- Criar `package.json`, `pnpm-lock.yaml`, `yarn.lock`, `tsconfig.json`, `vite.config.*`, `.npmrc`, `replit.md`, `build.mjs`
- Criar pastas `src/`, `artifacts/`, `lib/`, `scripts/`, `node_modules/`
- Converter HTML para React, TypeScript ou qualquer framework
- Rodar `npm install`, `pnpm install` ou qualquer gerenciador de pacotes
- Alterar o comando de run
- Editar `artifact.toml` diretamente

---

## 🔒 ARQUIVOS PROTEGIDOS — NÃO TOQUE

```
index.html
admin/index.html
admin/save.js
mararu/index.html
mararu/reserva/index.html
terrenos/index.html
site_data.json
vercel.json
.replit
```

---

## ✅ PERMITIDO

- Ler arquivos para entender o código
- Alterar **somente** o que o usuário pedir explicitamente
- Mostrar prévia das alterações antes de aplicar

---

## 📁 ESTRUTURA (não alterar)

```
/
├── index.html                  → Site principal
├── admin/
│   ├── index.html              → Painel administrativo
│   └── save.js                 → Script de salvamento
├── mararu/
│   ├── index.html              → Página do empreendimento Maraú
│   └── reserva/
│       └── index.html          → Formulário de reserva
├── terrenos/
│   └── index.html              → Página de terrenos
├── site_data.json              → Configurações do site
├── vercel.json                 → Configuração de deploy
├── serve.js                    → Servidor local
├── logo-rt.png                 → Logo
└── favicon.ico                 → Ícone
```

---

## ⚠️ ATENÇÃO

- `python3` não está disponível — use `node serve.js`
- Não use a porta 5000 se já estiver ocupada
- `artifact.toml` requer fluxo específico do Replit para edição

---

## 🛑 SE ALGO QUEBRAR

Pare. Não tente corrigir sozinho criando arquivos novos. Pergunte ao usuário.

---

## 🤝 COMUNICAÇÃO

- Fale **somente em português**
- Use frases curtas e diretas
- Mostre sempre uma prévia antes de aplicar qualquer alteração
- Aguarde confirmação do usuário antes de agir
