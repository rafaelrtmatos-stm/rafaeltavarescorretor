import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    base: "/blackfriday/",
    plugins: [
      react(),
      tailwindcss(),
      // Copies src/assets into dist/ so root-relative URLs like
      // "/src/assets/images/..." (e.g. generate_image output) still resolve
      // in production builds. Do not remove.
      {
        name: 'copy-unbundled-src-assets',
        apply: 'build',
        closeBundle(error?: Error): void {
          if (error) {
            return;
          }
          const distDir = path.resolve(__dirname, 'dist');
          const srcAssets = path.resolve(__dirname, 'src/assets');
          const distAssets = path.resolve(distDir, 'src/assets');
          if (fs.existsSync(distDir) && fs.existsSync(srcAssets)) {
            fs.cpSync(srcAssets, distAssets, {recursive: true, force: true});
          }

          const indexHtmlPath = path.resolve(distDir, 'index.html');
          const propsPath = path.resolve(__dirname, 'src/data/properties.ts');
          if (fs.existsSync(indexHtmlPath) && fs.existsSync(propsPath)) {
            const baseHtml = fs.readFileSync(indexHtmlPath, 'utf-8');
            const propsSource = fs.readFileSync(propsPath, 'utf-8');
            const itemRegex = /\{\s*id:\s*'([^']+)'[\s\S]*?slug:\s*'([^']+)'[\s\S]*?title:\s*'([^']+)'[\s\S]*?location:\s*'([^']+)'[\s\S]*?price:\s*'([^']+)'[\s\S]*?description:\s*'([^']+)'/g;
            let match: RegExpExecArray | null;
            while ((match = itemRegex.exec(propsSource)) !== null) {
              const [, , slug, title, location, price, description] = match;
              const pageTitle = `${title} — ${price} | Black Friday Rafael Tavares`;
              const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
              const subHtml = baseHtml
                .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(pageTitle)}</title>`)
                .replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${esc(location + ' — ' + description)}" />`)
                .replace(/<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${esc(pageTitle)}" />`)
                .replace(/<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${esc(location + ' — ' + description)}" />`);
              const subDir = path.resolve(distDir, slug);
              fs.mkdirSync(subDir, {recursive: true});
              fs.writeFileSync(path.resolve(subDir, 'index.html'), subHtml, 'utf-8');
              // Old shared links keep working (Santa Maria 1 and 2 are now one card).
              const legacyAliases: Record<string, string[]> = { 'santa-maria': ['santa-maria-1', 'santa-maria-2'] };
              for (const alias of legacyAliases[slug] || []) {
                const aliasDir = path.resolve(distDir, alias);
                fs.mkdirSync(aliasDir, {recursive: true});
                fs.writeFileSync(path.resolve(aliasDir, 'index.html'), subHtml, 'utf-8');
              }
            }
          }
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
