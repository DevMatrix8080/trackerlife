// Export statico per GitHub Pages: il sito vive sotto /trackerlife (solo in produzione).
export default {
  output: 'export',
  basePath: process.env.NODE_ENV === 'production' ? '/trackerlife' : '',
};
