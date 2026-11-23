// AES-256-GCM nel browser. La chiave deriva dalla passphrase (PBKDF2) e non lascia mai il dispositivo.
const b64 = (u: Uint8Array) => btoa(Array.from(u, c => String.fromCharCode(c)).join(''));
const unb64 = (s: string) => Uint8Array.from(atob(s), c => c.charCodeAt(0));

export const newSalt = () => b64(crypto.getRandomValues(new Uint8Array(16)));

export async function deriveKey(pass: string, salt: string) {
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(pass), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: unb64(salt) as BufferSource, iterations: 600000, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}

/** iv (12 byte casuali) + testo cifrato, in base64. */
export async function encrypt(key: CryptoKey, data: Uint8Array) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data as BufferSource));
  const out = new Uint8Array(12 + ct.length);
  out.set(iv); out.set(ct, 12);
  return b64(out);
}

/** Lancia se la chiave è sbagliata o il dato è alterato (GCM autentica). */
export async function decrypt(key: CryptoKey, s: string) {
  const u = unb64(s);
  return new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: u.slice(0, 12) }, key, u.slice(12)));
}
