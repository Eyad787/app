// بيقرا app.json ويضيف مسار الموقع لما نبني نسخة الويب لـ GitHub Pages
// (مثلاً EXPO_BASE_URL=/app علشان الموقع شغال على username.github.io/app/)
module.exports = ({ config }) => ({
  ...config,
  experiments: {
    ...config.experiments,
    ...(process.env.EXPO_BASE_URL ? { baseUrl: process.env.EXPO_BASE_URL } : {}),
  },
});
