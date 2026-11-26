// Export statico per GitHub Pages: il sito vive sotto /trackerlife (solo in produzione).
const basePath = process.env.NODE_ENV === 'production' ? '/trackerlife' : '';
export default {
  output: 'export',
  basePath,
  env: { NEXT_PUBLIC_BASE: basePath }, // usato per manifest, service worker e icone (file in public/, non prefissati da Next)
};
