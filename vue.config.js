const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  // FIX: This must be an array to avoid the 'transpileDependencies.map is not a function' error.
  transpileDependencies: [],
  
  devServer: {
    // This allows the WebSocket (HMR) to connect via any allowed host (fixes connection errors on network IPs)
    client: {
      webSocketURL: 'auto://0.0.0.0:0/ws',
    },
    // Allows external devices/emulators to connect
    allowedHosts: 'all', 
    
    // Binds the server to all network interfaces
    host: '0.0.0.0', 
    port: 8080,

    // API Proxy Configuration
    proxy: {
      '^/api': {
        target: 'http://172.20.10.2:8000', 
        changeOrigin: true,
        logLevel: 'debug'
      }
    }
  }
})