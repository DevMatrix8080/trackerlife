// Dopo il build: inserisce in ogni pagina una Content-Security-Policy con gli hash SHA-256 degli script inline.
// GitHub Pages non permette header HTTP personalizzati, quindi la CSP viaggia in un <meta>.
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const pages = d => readdirSync(d).flatMap(f => {
  const p = join(d, f);
  return statSync(p).isDirectory() ? pages(p) : p.endsWith('.html') ? [p] : [];
});

for (const file of pages('out')) {
  let html = readFileSync(file, 'utf8');
  const hashes = new Set(
    [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)]
      .map(m => `'sha256-${createHash('sha256').update(m[1]).digest('base64')}'`),
  );
  const csp = [
    "default-src 'self'",
    `script-src 'self' ${[...hashes].join(' ')}`,
    "style-src 'self' 'unsafe-inline'", // gli style="" di React richiedono unsafe-inline (solo stili, mai script)
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self' https://*.supabase.co",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'self'",
  ].join('; ');
  html = html.replace('<head>', `<head><meta http-equiv="Content-Security-Policy" content="${csp}"><meta name="referrer" content="no-referrer">`);
  writeFileSync(file, html);
  console.log(`CSP ok: ${file} (${hashes.size} script inline)`);
}
