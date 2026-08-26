const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;
const ROOT = path.resolve(__dirname);

app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Redirects from vercel.json
app.use((req, res, next) => {
  const url = req.path;
  if (url === '/pajuca' || url.startsWith('/pajuca/')) {
    const rest = url.replace(/^\/pajuca\/?/, '');
    return res.redirect(301, '/pajucara/' + (rest ? rest : ''));
  }
  if (url === '/sao-bras' || url.startsWith('/sao-bras/')) {
    const rest = url.replace(/^\/sao-bras\/?/, '');
    return res.redirect(301, '/sao-braz/' + (rest ? rest : ''));
  }
  next();
});

// Admin save endpoint helper (saves to local site_data.json if needed)
app.post('/api/save-site-data', (req, res) => {
  try {
    const data = req.body;
    fs.writeFileSync(path.join(ROOT, 'site_data.json'), JSON.stringify(data, null, 2), 'utf-8');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve static files
app.use(express.static(ROOT, {
  extensions: ['html', 'htm'],
  index: 'index.html',
}));

// Fallback for subdirectories without trailing slash or missing .html extension
app.get('*', (req, res, next) => {
  const requestedPath = path.join(ROOT, req.path);
  if (fs.existsSync(requestedPath)) {
    if (fs.statSync(requestedPath).isDirectory()) {
      const indexPath = path.join(requestedPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        return res.sendFile(indexPath);
      }
    }
  }
  const htmlPath = requestedPath + '.html';
  if (fs.existsSync(htmlPath)) {
    return res.sendFile(htmlPath);
  }
  
  const rootIndex = path.join(ROOT, 'index.html');
  if (fs.existsSync(rootIndex)) {
    return res.sendFile(rootIndex);
  }
  res.status(404).send('Not Found');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando em http://0.0.0.0:${PORT}`);
});
