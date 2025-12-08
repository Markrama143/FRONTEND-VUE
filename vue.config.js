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
    
    // Set the host for the Vue development server to 0.0.0.0
    host: '0.0.0.0', 
    port: 8080,

    // --- FIXED: API Proxy target must use the external host IP ---
    proxy: {
      '^/api': {
        target: 'http://192.168.68.102:8000', // FIX: Using your specific network IP
        changeOrigin: true,
        logLevel: 'debug'
      }
    }
  }
})