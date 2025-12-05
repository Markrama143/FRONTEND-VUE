const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    // This allows the WebSocket to connect via any allowed host
    // It prevents the "WebSocket connection failed" error when running on network IPs
    client: {
      webSocketURL: 'auto://0.0.0.0:0/ws',
    },
    // Allows your emulator/phone to connect to the dev server
    allowedHosts: 'all', 
    // --- ADDED: API Proxy ---
    // This tells Vue: "If a request starts with /api, send it to Laravel at port 8000"
    // This fixes CORS issues and IP address confusion.
    proxy: {
      '^/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        logLevel: 'debug'
      }
    }
  }
})