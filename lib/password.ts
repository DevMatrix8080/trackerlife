export const PW_MIN = 10;

/** Requisiti per creare un account. Il login non li applica (non blocca chi ha già una password). */
export const pwChecks = (pw: string) => [
  { ok: pw.length >= PW_MIN, label: `Almeno ${PW_MIN} caratteri` },
  { ok: /[a-z]/.test(pw) && /[A-Z]/.test(pw), label: 'Maiuscole e minuscole' },
  { ok: /\d/.test(pw), label: 'Un numero' },
  { ok: /[^A-Za-z0-9]/.test(pw), label: 'Un simbolo (! ? # ...)' },
];

/** Valida se: lunga e almeno 3 requisiti su 4 (una frase lunga basta anche senza simboli). */
export const pwStrong = (pw: string) => {
  const c = pwChecks(pw);
  return c[0].ok && c.filter(x => x.ok).length >= 3 && !/^(.)\1+$/.test(pw);
};

/** 0-4: usato dalla barra. */
export const pwScore = (pw: string) => {
  const c = pwChecks(pw).filter(x => x.ok).length;
  return pw.length >= 16 && c >= 3 ? 4 : c;
};
