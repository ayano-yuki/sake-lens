export default {
  server: {
    proxy: {
      '/ollama': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
}
